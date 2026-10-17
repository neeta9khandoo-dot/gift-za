const IMAGE_BACKEND = "r2"; 
const PAYNOW_INITIATE_URL = "https://www.paynow.co.zw/interface/initiatetransaction";
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Upload-Secret, x-upload-secret",
  "Access-Control-Max-Age":       "86400",
};
export const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)])
    .join("");
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


async function paynowHash(values, integrationKey) {
  const base = values.join("") + integrationKey;
  const data = new TextEncoder().encode(base);
  const digest = await crypto.subtle.digest("SHA-512", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function parsePaynowResponse(text) {
  const out = {};
  for (const pair of text.split("&")) {
    const [k, v] = pair.split("=");
    if (!k) continue;
    out[decodeURIComponent(k).toLowerCase()] = decodeURIComponent((v || "").replace(/\+/g, " "));
  }
  return out;
}

async function handlePaynowCreate(request, env) {
  if (!env.PAYNOW_INTEGRATION_ID || !env.PAYNOW_INTEGRATION_KEY)
    return err("Paynow secrets not set. Run: wrangler secret put PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY", 500);
 
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Body must be JSON");
  }
 
  const {
    reference,       
    amount,          
    buyerEmail,
    buyerName,
    recipientPhone,
    recipientName,
    note,
    voucherName,
    voucherId,
  } = body;
 
  if (!reference || !amount || !buyerEmail || !recipientPhone)
    return err("Missing required fields: reference, amount, buyerEmail, recipientPhone");
 
  const origin = new URL(request.url).origin;
 
  const fields = {
    id: env.PAYNOW_INTEGRATION_ID,
    reference: String(reference),
    amount: Number(amount).toFixed(2),
    additionalinfo: voucherName || "AfriVoucher purchase",
    returnurl: `${origin}/paynow/return?ref=${encodeURIComponent(reference)}`,
    resulturl: `${origin}/paynow/result`,
    authemail: buyerEmail,
    status: "Message",
  };
 
  // Hash is generated over the values in this exact field order
  const order = ["id", "reference", "amount", "additionalinfo", "returnurl", "resulturl", "authemail", "status"];
  const hash = await paynowHash(order.map((k) => fields[k]), env.PAYNOW_INTEGRATION_KEY);
 
  const form = new URLSearchParams({ ...fields, hash });
 
  const res = await fetch(PAYNOW_INITIATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const text = await res.text();
  const parsed = parsePaynowResponse(text);
 
  if (parsed.status?.toLowerCase() !== "ok") {
    console.error("Paynow initiate failed:", text);
    return err("Paynow rejected the request: " + (parsed.error || text), 502);
  }

  try {
    await fsReq(env, "PATCH", `pending_payments/${encodeURIComponent(reference)}`, {
      fields: toFs({
        reference: String(reference),
        amount: Number(amount),
        buyerEmail,
        buyerName: buyerName || "",
        recipientPhone,
        recipientName: recipientName || "",
        note: note || "",
        voucherName: voucherName || "",
        voucherId: voucherId || "",
        pollUrl: parsed.pollurl || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("Could not save pending payment:", e.message);
  }
 
  return json({
    success: true,
    browserUrl: parsed.browserurl,
    pollUrl: parsed.pollurl,
    reference,
  });
}
 
// ── POST /paynow/result ──────────────────────────────────────────────────
// Paynow calls this SERVER-TO-SERVER when the payment status changes.
// This is where you actually confirm payment and deliver the voucher —
// never trust the browser redirect alone for that.
async function handlePaynowResult(request, env) {
  const ct = request.headers.get("content-type") || "";
  let fields;
  if (ct.includes("application/x-www-form-urlencoded")) {
    fields = Object.fromEntries(new URLSearchParams(await request.text()));
  } else {
    // Some setups send JSON; handle both defensively
    try {
      fields = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }
  }
 
  const receivedHash = (fields.hash || fields.Hash || "").toUpperCase();
  // Validate hash: same rule — concatenate every value EXCEPT hash itself,
  // in the order they were sent, append integration key, SHA-512, uppercase.
  const orderedValues = Object.entries(fields)
    .filter(([k]) => k.toLowerCase() !== "hash")
    .map(([, v]) => v);
  const expectedHash = await paynowHash(orderedValues, env.PAYNOW_INTEGRATION_KEY);
 
  if (expectedHash !== receivedHash) {
    console.error("Paynow result hash mismatch — possible spoofed request");
    return new Response("Invalid hash", { status: 400 });
  }
 
  const reference = fields.reference;
  const status = (fields.status || "").toLowerCase();
 
  if (!reference) return new Response("Missing reference", { status: 400 });
 
  if (status === "paid" || status === "awaiting delivery" || status === "delivered") {
    try {
      const pendingRes = await fsReq(env, "GET", `pending_payments/${encodeURIComponent(reference)}`);
      const order = fsToObj(pendingRes);
      if (order) {
        const code = genCode();
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          JSON.stringify({ code, amount: order.amount, valid: true }),
        )}`;
 
        // Record the sale
        await fsReq(env, "POST", "sold_vouchers", {
          fields: toFs({
            code,
            name: order.voucherName || "Voucher",
            price: order.amount,
            buyerEmail: order.buyerEmail,
            buyerName: order.buyerName || "",
            recipientPhone: order.recipientPhone,
            recipientName: order.recipientName || "",
            note: order.note || "",
            voucherId: order.voucherId || "",
            status: "delivered",
            paynowReference: reference,
            createdAt: new Date().toISOString(),
          }),
        });
 
        // Deliver via WhatsApp using the helpers already in your worker
        try {
          await sendWA(
            env,
            order.recipientPhone,
            waMsg({
              recipientName: order.recipientName,
              buyerName: order.buyerName,
              productName: order.voucherName,
              amount: order.amount,
              code,
              note: order.note,
              qrUrl,
            }),
          );
        } catch (e) {
          console.error("WhatsApp delivery failed:", e.message);
        }
 
        // Mark pending payment resolved
        await fsReq(
          env,
          "PATCH",
          `pending_payments/${encodeURIComponent(reference)}?updateMask.fieldPaths=status`,
          { fields: toFs({ status: "completed" }) },
        );
      }
    } catch (e) {
      console.error("Error finalising Paynow order:", e.message);
    }
  }
 
  // Paynow doesn't need a specific body back, just a 200
  return new Response("OK", { status: 200 });
}
 
// ── GET /paynow/return ────────────────────────────────────────────────
// The buyer's browser lands here after paying (or cancelling). Redirect
// them back into your React app's success/orders page.
async function handlePaynowReturn(request, env) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") || "";
  const appUrl = env.APP_URL || "https://afrivoucher.com";
  return Response.redirect(`${appUrl}/orders?paynow_ref=${encodeURIComponent(ref)}`, 302);
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
         if (method === "POST" && pathname === "/paynow/create")
       return handlePaynowCreate(request, env);
     if (method === "POST" && pathname === "/paynow/result")
       return handlePaynowResult(request, env);
     if (method === "GET" && pathname === "/paynow/return")
       return handlePaynowReturn(request, env);
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

