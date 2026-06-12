const IMAGE_BACKEND = "r2"; 

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Upload-Secret, x-upload-secret",
  "Access-Control-Max-Age":       "86400",
};

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json", ...CORS },
  });
const err = (m, s = 400) => json({ error: m }, s);
const noAuth = () =>
  err("Unauthorized — invalid or missing upload secret", 401);

// ── POST /upload-image ────────────────────────────────────────────────────────
async function handleUploadImage(request, env) {
  const secret = request.headers.get("X-Upload-Secret");
  if (!env.UPLOAD_SECRET || secret !== env.UPLOAD_SECRET) return noAuth();

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return err("Request must be multipart/form-data");
  }

  const imageFile = formData.get("image");
  const uid = (formData.get("uid") || "unknown").replace(/[^a-zA-Z0-9_-]/g, "");
  const nameHint = formData.get("name") || "";

  if (!imageFile || typeof imageFile === "string")
    return err("No image file. Send the file as field 'image'");

  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowed.includes(imageFile.type))
    return err(
      `File type not allowed: ${imageFile.type}. Use JPG, PNG, or WebP.`,
    );

  const bytes = await imageFile.arrayBuffer();
  if (bytes.byteLength > 5 * 1024 * 1024)
    return err(
      `File too large (${(bytes.byteLength / 1024 / 1024).toFixed(1)}MB). Max 5MB.`,
    );

  const ext = imageFile.type.split("/")[1].replace("jpeg", "jpg");
  const slug = nameHint
    ? nameHint
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 30)
    : "voucher";
  const key = `vouchers/${uid}/${Date.now()}-${slug}.${ext}`;

  return IMAGE_BACKEND === "r2"
    ? handleR2Upload(bytes, key, imageFile.type, env, request)
    : handleCFImagesUpload(bytes, imageFile.type, ext, uid, env);
}

async function handleR2Upload(bytes, key, contentType, env, request) {
  if (!env.VOUCHER_IMAGES)
    return err(
      "R2 bucket not bound. Add [[r2_buckets]] in wrangler.toml — binding = 'VOUCHER_IMAGES'",
    );

  await env.VOUCHER_IMAGES.put(key, bytes, {
    httpMetadata: { contentType, cacheControl: "public, max-age=31536000" },
    customMetadata: { uploadedAt: new Date().toISOString() },
  });

  const origin = new URL(request.url).origin;
  const imageUrl = `${origin}/images/${encodeURIComponent(key)}`;

  return json({
    success: true,
    url: imageUrl,
    key,
    bucket: "r2",
    sizeMB: +(bytes.byteLength / 1024 / 1024).toFixed(2),
  });
}

async function handleCFImagesUpload(bytes, contentType, ext, uid, env) {
  if (!env.CF_IMAGES_TOKEN || !env.CF_ACCOUNT_ID)
    return err("CF_IMAGES_TOKEN and CF_ACCOUNT_ID secrets not set");

  const form = new FormData();
  form.append(
    "file",
    new Blob([bytes], { type: contentType }),
    `voucher.${ext}`,
  );
  form.append(
    "metadata",
    JSON.stringify({ uid, uploadedAt: new Date().toISOString() }),
  );
  form.append("requireSignedURLs", "false");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CF_IMAGES_TOKEN}` },
      body: form,
    },
  );
  const data = await res.json();
  if (!data.success)
    return err("CF Images failed: " + JSON.stringify(data.errors), 500);

  return json({
    success: true,
    url: data.result.variants[0],
    cfId: data.result.id,
    bucket: "cf_images",
  });
}

// ── GET /images/:key ──────────────────────────────────────────────────────────
async function handleServeImage(key, env) {
  if (!env.VOUCHER_IMAGES) return err("R2 bucket not bound", 500);

  const object = await env.VOUCHER_IMAGES.get(decodeURIComponent(key));
  if (!object) return new Response("Image not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000",
      ETag: object.httpEtag || "",
      ...CORS,
    },
  });
}

// ── DELETE /images/:key ───────────────────────────────────────────────────────
async function handleDeleteImage(key, request, env) {
  const secret = request.headers.get("X-Upload-Secret");
  if (!env.UPLOAD_SECRET || secret !== env.UPLOAD_SECRET) return noAuth();
  if (!env.VOUCHER_IMAGES) return err("R2 bucket not bound", 500);

  await env.VOUCHER_IMAGES.delete(decodeURIComponent(key));
  return json({ success: true, deleted: key });
}
// ── GET /places-search?query=spas+Harare+Zimbabwe ─────────────────────────────
async function handlePlacesSearch(request, env) {

  // Auth check — same secret your React app already uses
  const secret = request.headers.get("X-Upload-Secret");
  if (!env.UPLOAD_SECRET || secret !== env.UPLOAD_SECRET) return noAuth();

  if (!env.GOOGLE_PLACES_KEY)
    return err("GOOGLE_PLACES_KEY secret not set — run: wrangler secret put GOOGLE_PLACES_KEY");

  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  if (!query) return err("Missing ?query= parameter");

  try {
    // Step 1 — Text Search: get up to 20 place_ids matching the query
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}` +
      `&key=${env.GOOGLE_PLACES_KEY}`
    );
    const searchData = await searchRes.json();

    if (searchData.status === "REQUEST_DENIED")
      return err("Google Places API key rejected — check the key and make sure Places API is enabled");

    if (searchData.status === "ZERO_RESULTS" || !searchData.results?.length)
      return json({ results: [] });

    // Step 2 — Place Details: fetch phone number for each result (max 15)
    const results = await Promise.all(
      searchData.results.slice(0, 15).map(async (place) => {
        try {
          const detailRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json` +
            `?place_id=${place.place_id}` +
            `&fields=name,formatted_phone_number,international_phone_number,` +
            `formatted_address,rating,user_ratings_total,place_id,website,` +
            `opening_hours,business_status` +
            `&key=${env.GOOGLE_PLACES_KEY}`
          );
          const detail = await detailRes.json();
          // Merge base result with detail fields
          return {
            place_id:                place.place_id,
            name:                    detail.result?.name                    || place.name,
            formatted_address:       detail.result?.formatted_address       || place.formatted_address,
            formatted_phone_number:  detail.result?.formatted_phone_number  || null,
            international_phone_number: detail.result?.international_phone_number || null,
            rating:                  detail.result?.rating                  || place.rating || null,
            user_ratings_total:      detail.result?.user_ratings_total      || place.user_ratings_total || 0,
            website:                 detail.result?.website                 || null,
            business_status:         detail.result?.business_status         || place.business_status || null,
            open_now:                detail.result?.opening_hours?.open_now ?? null,
          };
        } catch {
          // If detail call fails, return base result without phone
          return {
            place_id:               place.place_id,
            name:                   place.name,
            formatted_address:      place.formatted_address,
            formatted_phone_number: null,
            rating:                 place.rating || null,
            user_ratings_total:     place.user_ratings_total || 0,
            website:                null,
          };
        }
      })
    );

    return json({ results, total: searchData.results.length });

  } catch (e) {
    console.error("Places search error:", e);
    return err("Places search failed: " + e.message, 500);
  }
}
// ── Firebase helpers ──────────────────────────────────────────────────────────
async function getFirebaseToken(env) {
  const privateKey = atob(env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      iss: env.FIREBASE_CLIENT_EMAIL,
      sub: env.FIREBASE_CLIENT_EMAIL,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/datastore",
    }),
  );
  const keyData = await crypto.subtle.importKey(
    "pkcs8",
    pemToAB(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    keyData,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  const jwt = `${header}.${payload}.${ab64(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token } = await res.json();
  return access_token;
}
const pemToAB = (pem) => {
  const b = atob(pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, ""));
  return Uint8Array.from(b, (c) => c.charCodeAt(0)).buffer;
};
const ab64 = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

async function fsReq(env, method, path, body = null) {
  const token = await getFirebaseToken(env);
  const base = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
function fsToObj(doc) {
  if (!doc?.fields) return null;
  const o = { id: doc.name?.split("/").pop() };
  for (const [k, v] of Object.entries(doc.fields)) {
    if (v.stringValue !== undefined) o[k] = v.stringValue;
    else if (v.integerValue !== undefined) o[k] = parseInt(v.integerValue);
    else if (v.doubleValue !== undefined) o[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) o[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) o[k] = v.timestampValue;
    else if (v.nullValue !== undefined) o[k] = null;
  }
  return o;
}
function toFs(obj) {
  const f = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") f[k] = { stringValue: v };
    else if (typeof v === "number") f[k] = { doubleValue: v };
    else if (typeof v === "boolean") f[k] = { booleanValue: v };
    else if (v === null) f[k] = { nullValue: null };
  }
  return f;
}

// ── Twilio WhatsApp ───────────────────────────────────────────────────────────
async function sendWA(env, to, msg) {
  const toWA = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,
      },
      body: new URLSearchParams({
        From: env.TWILIO_WHATSAPP_FROM,
        To: toWA,
        Body: msg,
      }),
    },
  );
  const d = await res.json();
  if (!res.ok) throw new Error(`Twilio: ${d.message}`);
  return d;
}

function waMsg({
  recipientName,
  buyerName,
  productName,
  amount,
  code,
  note,
  qrUrl,
  imageUrl,
}) {
  return [
    `🎁 *You've received a GiftVault Voucher!*`,
    ``,
    `Hi ${recipientName || "there"} 👋`,
    `*${buyerName}* has gifted you:`,
    ``,
    `✦ *${productName}*`,
    `💰 Value: *R${Number(amount).toFixed(2)}*`,
    ``,
    `Your voucher code:`,
    `*${code}*`,
    ``,
    ...(note ? [`📝 "${note}"`, ``] : []),
    ...(imageUrl ? [`🖼️ ${imageUrl}`, ``] : []),
    `Show this code (or QR) when redeeming.`,
    ``,
    `📲 QR: ${qrUrl}`,
    ``,
    `_Powered by VoucherHub ZA_`,
  ].join("\n");
}

// ── Voucher routes ────────────────────────────────────────────────────────────
async function handleCreateVoucher(request, env) {
  const b = await request.json();
  const {
    voucherId,
    code,
    amount,
    productName,
    buyerName,
    buyerEmail,
    recipientName,
    recipientPhone,
    note,
    imageUrl,
  } = b;

  if (!code || !amount || !recipientPhone)
    return err("Missing required fields");

  const qrData = JSON.stringify({
    code,
    amount,
    product: productName,
    valid: true,
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  let waStatus = "pending";
  try {
    await sendWA(
      env,
      recipientPhone,
      waMsg({
        recipientName,
        buyerName,
        productName,
        amount,
        code,
        note,
        qrUrl,
        imageUrl,
      }),
    );
    waStatus = "delivered";
  } catch (e) {
    console.error("WA error:", e.message);
    waStatus = "failed: " + e.message;
  }

  if (voucherId) {
    try {
      await fsReq(
        env,
        "PATCH",
        `vouchers/${voucherId}?updateMask.fieldPaths=waStatus&updateMask.fieldPaths=qrUrl`,
        { fields: toFs({ waStatus, qrUrl }) },
      );
    } catch (e) {
      console.error("FS update:", e);
    }
  }

  return json({ success: true, code, qrUrl, waStatus });
}

async function handlePaymentWebhook(request, env) {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await request.text());
    const data = Object.fromEntries(params.entries());
    if (data.payment_status !== "COMPLETE")
      return json({ received: true, action: "ignored" });

    const code = data.item_name?.match(/VCH-[A-Z0-9]+/)?.[0];
    if (!code) return err("No voucher code in payment");

    const res = await fsReq(
      env,
      "GET",
      `vouchers?orderBy=code&startAt=${code}&endAt=${code}\uf8ff`,
    );
    if (res.documents?.length) {
      const vDoc = res.documents[0];
      const v = fsToObj(vDoc);
      const vId = vDoc.name.split("/").pop();
      await fsReq(
        env,
        "PATCH",
        `vouchers/${vId}?updateMask.fieldPaths=status&updateMask.fieldPaths=payRef`,
        {
          fields: toFs({
            status: "active",
            payRef: data.pf_payment_id || "payfast",
          }),
        },
      );
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify({ code: v.code, amount: v.amount, valid: true }))}`;
      await sendWA(
        env,
        v.recipientPhone,
        waMsg({
          recipientName: v.recipientName,
          buyerName: v.buyerName,
          productName: v.productName,
          amount: v.amount,
          code: v.code,
          note: v.note,
          qrUrl,
          imageUrl: v.imageUrl || "",
        }),
      );
    }
    return new Response("OK", { status: 200 });
  } else {
    let event;
    try {
      event = JSON.parse(await request.text());
    } catch {
      return err("Invalid JSON");
    }
    if (
      !["checkout.session.completed", "payment_intent.succeeded"].includes(
        event.type,
      )
    )
      return json({ received: true, action: "ignored" });

    const m = event.data?.object?.metadata || {};
    if (m.voucherId) {
      await fsReq(
        env,
        "PATCH",
        `vouchers/${m.voucherId}?updateMask.fieldPaths=status&updateMask.fieldPaths=payRef`,
        {
          fields: toFs({
            status: "active",
            payRef: event.data?.object?.id || "stripe",
          }),
        },
      );
    }
    if (m.recipientPhone && m.code) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify({ code: m.code, amount: m.amount, valid: true }))}`;
      await sendWA(env, m.recipientPhone, waMsg({ ...m, qrUrl }));
    }
    return json({ received: true });
  }
}

async function handleRedeem(request, env) {
  const { code } = await request.json();
  if (!code) return err("Code required");

  const res = await fsReq(env, "GET", "vouchers");
  const match = (res.documents || [])
    .map(fsToObj)
    .find((v) => v?.code === code.toUpperCase());

  if (!match) return json({ valid: false, reason: "Voucher not found" });
  if (match.status === "used")
    return json({ valid: false, reason: "Already redeemed" });
  if (match.status === "pending")
    return json({ valid: false, reason: "Payment pending" });

  await fsReq(
    env,
    "PATCH",
    `vouchers/${match.id}?updateMask.fieldPaths=status&updateMask.fieldPaths=usedAt`,
    {
      fields: {
        status: { stringValue: "used" },
        usedAt: { timestampValue: new Date().toISOString() },
      },
    },
  );
  return json({ valid: true, voucher: match });
}

async function handleVoucherLookup(code, env) {
  const res = await fsReq(env, "GET", "vouchers");
  const match = (res.documents || [])
    .map(fsToObj)
    .find((v) => v?.code === code.toUpperCase());
  if (!match) return json({ found: false }, 404);
  return json({
    found: true,
    code: match.code,
    product: match.productName,
    status: match.status,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
const handler = {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const method = request.method;

    if (method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS });

    try {
      if (method === "POST" && pathname === "/upload-image")
        return handleUploadImage(request, env);
      if (method === "GET" && pathname.startsWith("/images/"))
        return handleServeImage(pathname.slice(8), env);
      if (method === "DELETE" && pathname.startsWith("/images/"))
        return handleDeleteImage(pathname.slice(8), request, env);
      if (method === "POST" && pathname === "/create-voucher")
        return handleCreateVoucher(request, env);
      if (method === "POST" && pathname === "/payment-webhook")
        return handlePaymentWebhook(request, env);
      if (method === "POST" && pathname === "/redeem")
        return handleRedeem(request, env);
      if (method === "GET" && pathname.startsWith("/voucher/"))
        return handleVoucherLookup(pathname.split("/voucher/")[1], env);
      if (method === "GET" && pathname === "/places-search")
  return handlePlacesSearch(request, env);

if (method === "GET" && pathname === "/health")
  return json({
    ok: true,
    routes: [
      "POST /upload-image",
      "GET /images/:key",
      "DELETE /images/:key",
      "POST /create-voucher",
      "POST /payment-webhook",
      "POST /redeem",
      "GET /voucher/:code",
      "GET /places-search?query=spas+Harare",
    ],
  });

      return json({ error: "Not found" }, 404);
    } catch (e) {
      console.error("Worker error:", e);
      return json({ error: "Internal error", detail: e.message }, 500);
    }
  },
};

export default handler;

/*
══════════════════════════════════════════════════════════
wrangler.toml — full config with R2 binding
══════════════════════════════════════════════════════════

name = "voucher-worker"
main = "index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[r2_buckets]]
binding     = "VOUCHER_IMAGES"
bucket_name = "voucher-images"

[vars]
APP_ENV = "production"

══════════════════════════════════════════════════════════
Create the R2 bucket (run once):
  wrangler r2 bucket create voucher-images

Set all secrets (run each once):
  wrangler secret put UPLOAD_SECRET         ← make up a strong password
  wrangler secret put TWILIO_ACCOUNT_SID
  wrangler secret put TWILIO_AUTH_TOKEN
  wrangler secret put TWILIO_WHATSAPP_FROM
  wrangler secret put FIREBASE_PROJECT_ID
  wrangler secret put FIREBASE_CLIENT_EMAIL
  wrangler secret put FIREBASE_PRIVATE_KEY
  wrangler secret put PAYFAST_PASSPHRASE
  wrangler secret put CF_IMAGES_TOKEN       (only for cf_images backend)
  wrangler secret put CF_ACCOUNT_ID         (only for cf_images backend)

Deploy:
  wrangler deploy
══════════════════════════════════════════════════════════
*/
