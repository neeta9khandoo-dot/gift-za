const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes shimmer{0%{background-position:-700px 0}100%{background-position:700px 0}}
.skeleton{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg2) 50%,var(--bg3) 75%);background-size:700px 100%;animation:shimmer 1.4s infinite linear;border-radius:6px}
.skel-card{background:#fff;border-radius:var(--r2);overflow:hidden;border:1px solid var(--border);width:220px;min-width:220px;flex-shrink:0}
.skel-img{height:160px;width:100%}
.skel-body{padding:12px;display:flex;flex-direction:column;gap:8px}
.skel-line{height:12px;border-radius:4px}
.skel-line.short{width:55%}
.skel-line.med{width:75%}
.skel-line.full{width:100%}
.skel-footer{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.skel-price{height:20px;width:60px;border-radius:4px}
.skel-btn{height:28px;width:56px;border-radius:6px}
.skel-grid-card{width:auto;min-width:auto}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green-primary:#1A7A3C;--green-dark:#145f2e;--green-bright:#22a64f;
  --green-soft:#e8f5ee;--green-glow:rgba(26,122,60,.15);
  --red:#1A7A3C;--red2:#145f2e;--red3:#22a64f;
  --black:#111111;--dark:#222222;--mid:#555555;--muted:#888888;
  --border:#e5e5e5;--border2:#d0d0d0;--bg:#ffffff;--bg2:#f5f5f5;--bg3:#eeeeee;
  --cream:#fafafa;--text:#111111;--sub:#555555;--green:#1a9e56;
  --sans:'Inter',system-ui,sans-serif;
  --r:8px;--r2:12px;--max:1280px;
  --sh1:0 1px 4px rgba(0,0,0,.08);--sh2:0 4px 16px rgba(0,0,0,.1);
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{background:var(--bg2);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.5;overflow-x:hidden}
img{display:block;width:100%;object-fit:cover}
a{text-decoration:none;color:inherit}
button{font-family:var(--sans);cursor:pointer}
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;           
  padding: 0 24px;
  box-sizing: border-box;
}
  .card-grid,
.voucher-grid,
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
}
.announce{background:var(--red);color:#fff;padding:0 20px;font-size:.78rem;font-weight:600;letter-spacing:.2px;display:flex;align-items:center;justify-content:center;gap:8px;height:36px}
.announce strong{font-weight:800}
.store-page,
.page-wrap,
main {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.nav{background:#fff;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}
.nav-logo{font-family:var(--sans);font-size:1.4rem;font-weight:800;color:var(--red);letter-spacing:-1px;white-space:nowrap;flex-shrink:0;background:none;border:none;cursor:pointer;display:flex;align-items:center}
.nav-logo span{color:var(--black)}
.nav-address-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--cream);font-size:.84rem;font-weight:600;color:var(--black);cursor:pointer;white-space:nowrap;transition:border-color .2s;flex-shrink:0}
.nav-address-btn:hover{border-color:var(--red)}
.nav-address-btn .nav-addr-pin{color:var(--red);font-size:1rem}
.nav-search{flex:1;background:#fff;border:1.5px solid var(--border2);border-radius:var(--r);display:flex;align-items:center;gap:8px;padding:0 14px;height:42px;transition:border-color .2s}
.nav-search:focus-within{border-color:var(--red);box-shadow:0 0 0 3px rgba(26,122,60,.08)}
.nav-search input{flex:1;border:none;outline:none;background:transparent;font-family:var(--sans);font-size:.88rem;color:var(--text)}
.nav-search input::placeholder{color:var(--muted)}
.nav-search-icon{color:var(--muted);flex-shrink:0}
.nav-links{display:flex;align-items:center;gap:2px;margin-left:auto}
.nav-link{padding:7px 12px;border-radius:var(--r);font-size:.82rem;font-weight:500;color:var(--sub);transition:all .15s;white-space:nowrap;border:none;background:none;cursor:pointer}
.nav-link:hover{background:var(--bg2);color:var(--black)}
.nav-link.active{color:var(--red);font-weight:700}
.nav-cta{background:var(--red);color:#fff;padding:9px 18px;border-radius:var(--r);font-size:.82rem;font-weight:700;border:none;transition:all .18s;white-space:nowrap;flex-shrink:0;cursor:pointer}
.nav-cta:hover{background:var(--red2);transform:translateY(-1px)}
.nav-user{position:relative;display:flex;align-items:center;flex-shrink:0}
.nav-user-btn{display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:40px;border:1.5px solid var(--border2);background:transparent;cursor:pointer;transition:all .2s}
.nav-user-btn:hover{border-color:var(--red);background:rgba(227,0,27,.04)}
.nav-user-name{font-size:.82rem;font-weight:600;color:var(--black);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav-chevron{color:var(--muted);transition:transform .2s;flex-shrink:0}
.nav-chevron.open{transform:rotate(180deg)}
.nav-dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:210px;background:#fff;border:1px solid var(--border2);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity .18s,transform .18s;z-index:200}
.nav-dropdown.open{opacity:1;pointer-events:all;transform:translateY(0)}
.nav-dropdown-header{padding:14px 16px 10px;border-bottom:1px solid var(--border)}
.nav-dropdown-name{font-size:.88rem;font-weight:700;color:var(--black)}
.nav-dropdown-email{font-size:.76rem;color:var(--muted);margin-top:2px}
.nav-dropdown-section{padding:6px 0}
.nav-dropdown-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 16px;background:none;border:none;cursor:pointer;font-family:var(--sans);font-size:.83rem;color:var(--text);text-align:left;transition:background .15s}
.nav-dropdown-item:hover{background:var(--bg2)}
.nav-dropdown-divider{height:1px;background:var(--border)}
.nav-dropdown-item.danger{color:var(--red)}
.hero{background:#fff;border-bottom:1px solid var(--border);padding:0}
.cats-section{background:#fff;border-bottom:1px solid var(--border);padding:0;position:sticky;top:64px;z-index:90}
.cats-scroll{display:flex;gap:0;padding:0 20px;overflow-x:auto;scrollbar-width:none;max-width:var(--max);margin:0 auto}
.cats-scroll::-webkit-scrollbar{display:none}
.cat-pill{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 18px;border-bottom:3px solid transparent;font-size:.78rem;font-weight:600;color:var(--sub);white-space:nowrap;cursor:pointer;transition:all .15s;flex-shrink:0;background:none;border-top:none;border-left:none;border-right:none}
.cat-pill-emoji{font-size:1.3rem}
.cat-pill:hover{color:var(--black)}
.cat-pill.active{color:var(--red);border-bottom-color:var(--red)}
.section{padding:28px 0}
.section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:0 20px}
.section-title{font-size:1.05rem;font-weight:700;color:var(--black);letter-spacing:-.2px}
.section-sub{color:var(--muted);font-size:.8rem;margin-top:2px}
.see-all{font-size:.8rem;font-weight:700;color:var(--red);border:none;background:transparent;cursor:pointer;display:flex;align-items:center;gap:3px;white-space:nowrap}
.see-all:hover{text-decoration:underline}
.hscroll-row{display:flex;gap:14px;padding:0 20px;overflow-x:auto;scrollbar-width:none}
.hscroll-row::-webkit-scrollbar{display:none}
.card{background:#fff;border-radius:16px;overflow:hidden;border:none;cursor:pointer;transition:box-shadow .22s,transform .18s;display:flex;flex-direction:column;width:200px;min-width:200px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.07)}
.card:hover{box-shadow:0 8px 28px rgba(0,0,0,.13);transform:translateY(-3px)}
.card-img{position:relative;overflow:hidden;height:150px;background:var(--bg2);flex-shrink:0}
.card-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.card:hover .card-img img{transform:scale(1.05)}
.card-img-placeholder{height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--bg2)}
.card-badge-row{position:absolute;top:10px;left:10px;display:flex;gap:4px}
.cbadge{font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 9px;border-radius:20px;backdrop-filter:blur(6px)}
.cbadge-pop{background:rgba(26,122,60,.85);color:#fff}
.cbadge-sale{background:rgba(17,17,17,.75);color:#fff}
.cbadge-music{background:rgba(88,57,180,.85);color:#fff}
.cbadge-events{background:rgba(180,57,120,.85);color:#fff}
.cbadge-trad{background:rgba(139,90,30,.85);color:#fff}
.cbadge-florist{background:rgba(180,57,140,.85);color:#fff}
.card-body{padding:12px 14px 14px;flex:1;display:flex;flex-direction:column;gap:0}
.card-cat{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--muted);margin-bottom:4px}
.card-name{font-size:.88rem;font-weight:700;line-height:1.35;color:var(--black);margin-bottom:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-partner{font-size:.68rem;color:var(--muted);margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-footer{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:8px}
.card-price-val{font-size:1.05rem;font-weight:800;color:var(--black);letter-spacing:-.5px;line-height:1}
.card-price-val small{font-size:.62rem;font-weight:700;margin-right:1px;vertical-align:top;margin-top:1px;display:inline-block;color:var(--muted)}
.card-rating{display:flex;align-items:center;gap:3px;font-size:.68rem;font-weight:600;color:var(--sub);margin-top:3px}
.star{color:#f59e0b}
.card-add-btn{background:var(--red);color:#fff;border:none;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;line-height:1;cursor:pointer;transition:background .15s,transform .15s;flex-shrink:0;padding:0}
.card-add-btn:hover{background:var(--red2);transform:scale(1.1)}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:0 20px}
.cards-grid .card{width:auto;min-width:auto}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .25s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal-overlay.open .modal-sheet{transform:translateY(0)}
.modal-sheet{background:#fff;border-radius:16px 16px 0 0;width:100%;max-width:880px;max-height:92vh;overflow-y:auto;transform:translateY(60px);transition:transform .3s cubic-bezier(.34,1.1,.64,1)}
.modal-inner{display:grid;grid-template-columns:1fr 380px;min-height:550px}
.modal-gallery{position:relative;border-radius:16px 0 0 0;overflow:hidden}
.modal-gallery img{height:100%;object-fit:cover;min-height:400px}
.modal-gallery-badge{position:absolute;top:16px;left:16px;background:var(--red);color:#fff;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 10px;border-radius:4px}
.modal-close{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;color:var(--black);transition:all .18s}
.modal-close:hover{background:#fff;transform:rotate(90deg)}
.modal-body{padding:28px;overflow-y:auto;display:flex;flex-direction:column}
.modal-cat{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px}
.modal-title{font-size:1.5rem;font-weight:800;line-height:1.15;color:var(--black);margin-bottom:8px;letter-spacing:-.3px}
.modal-partner{display:flex;align-items:center;gap:6px;margin-bottom:14px;color:var(--sub);font-size:.8rem}
.modal-partner-badge{background:rgba(26,158,86,.1);color:var(--green);font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:4px}
.modal-desc{font-size:.85rem;color:var(--sub);line-height:1.7;margin-bottom:18px}
.modal-includes h4{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:8px}
.modal-includes-list{display:flex;flex-direction:column;gap:5px;margin-bottom:20px}
.mi-row{display:flex;align-items:center;gap:7px;font-size:.82rem;color:var(--text)}
.mi-check{color:var(--green);font-size:.72rem;flex-shrink:0}
.modal-sep{height:1px;background:var(--border);margin:0 -28px 18px}
.modal-price-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.modal-price-lbl{font-size:.75rem;color:var(--muted)}
.modal-price-val{font-size:1.8rem;font-weight:800;color:var(--black);letter-spacing:-.5px}
.modal-buy-btn{width:100%;padding:14px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:1rem;font-weight:800;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;letter-spacing:-.2px}
.modal-buy-btn:hover{background:var(--red2);transform:translateY(-1px)}
.modal-secondary-btn{width:100%;padding:10px;background:transparent;border:1.5px solid var(--border2);border-radius:8px;color:var(--sub);font-size:.83rem;font-weight:600;cursor:pointer;transition:all .18s}
.modal-secondary-btn:hover{border-color:var(--red);color:var(--red)}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;opacity:0;pointer-events:none;transition:opacity .22s;backdrop-filter:blur(2px)}
.drawer-overlay.open{opacity:1;pointer-events:all}
.drawer-overlay.open .drawer{transform:translateX(0)}
.drawer{position:absolute;right:0;top:0;bottom:0;width:100%;max-width:460px;background:#fff;box-shadow:-4px 0 32px rgba(0,0,0,.12);transform:translateX(100%);transition:transform .3s cubic-bezier(.34,1,.64,1);display:flex;flex-direction:column;overflow-y:auto}
.drawer-header{padding:20px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1}
.drawer-title{font-size:1.1rem;font-weight:800;color:var(--black);letter-spacing:-.3px}
.drawer-close{background:var(--bg2);border:1px solid var(--border);border-radius:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.85rem;color:var(--sub);transition:all .15s}
.df-field{margin-bottom:10px}
.df-field label{font-size:.68rem;font-weight:700;color:var(--sub);display:block;margin-bottom:4px}
.df-field input,.df-field textarea{width:100%;padding:10px 12px;background:#fff;border:1.5px solid var(--border2);border-radius:7px;font-family:var(--sans);font-size:.86rem;color:var(--text);outline:none;transition:border-color .15s}
.df-field input:focus,.df-field textarea:focus{border-color:var(--red)}
.df-field textarea{resize:none;height:64px;font-size:.8rem}
.checkout-btn{width:100%;padding:14px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.98rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s}
.checkout-btn:hover{background:var(--red2);transform:translateY(-1px)}
.checkout-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.auth-page{min-height:80vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:var(--bg2)}
.auth-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:36px 32px;width:100%;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,.08)}
.auth-logo{font-family:var(--sans);font-size:1.4rem;font-weight:800;color:var(--red);text-align:center;margin-bottom:4px;letter-spacing:-.5px}
.auth-logo span{color:var(--black)}
.auth-tagline{text-align:center;color:var(--muted);font-size:.8rem;margin-bottom:22px}
.auth-tabs{display:flex;background:var(--bg2);border-radius:8px;padding:3px;gap:3px;margin-bottom:22px}
.auth-tab{flex:1;padding:8px;border-radius:6px;border:none;background:transparent;font-family:var(--sans);font-size:.82rem;font-weight:600;color:var(--sub);cursor:pointer;transition:all .18s}
.auth-tab.active{background:#fff;color:var(--black);box-shadow:0 1px 4px rgba(0,0,0,.08)}
.auth-field{margin-bottom:12px}
.auth-field label{display:block;font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:5px}
.auth-field input{width:100%;padding:11px 12px;border:1.5px solid var(--border2);border-radius:7px;font-family:var(--sans);font-size:.88rem;color:var(--text);outline:none;transition:border-color .15s;background:#fff}
.auth-field input:focus{border-color:var(--red)}
.auth-btn{width:100%;padding:13px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.95rem;font-weight:800;cursor:pointer;transition:all .18s;margin-top:4px;letter-spacing:-.2px}
.auth-btn:hover:not(:disabled){background:var(--red2);transform:translateY(-1px)}
.auth-btn:disabled{opacity:.45;cursor:not-allowed}
.auth-error{font-size:.75rem;color:var(--red);margin-top:5px;min-height:16px}
.auth-badge{display:block;text-align:center;width:fit-content;margin:0 auto 16px;background:rgba(26,158,86,.08);border:1px solid rgba(26,158,86,.15);color:var(--green);font-size:.7rem;font-weight:700;padding:4px 12px;border-radius:16px}
.admin-input{width:100%;padding:10px 12px;border:1.5px solid var(--border2);border-radius:7px;font-family:var(--sans);font-size:.86rem;color:var(--text);outline:none;transition:border-color .15s;background:#fff}
.admin-input:focus{border-color:var(--red)}
footer{background:var(--black);color:rgba(255,255,255,.55);padding:48px 0 24px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px}
.footer-brand{font-family:var(--sans);font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:10px;letter-spacing:-.5px}
.footer-brand span{color:var(--red)}
.footer-tagline{font-size:.8rem;line-height:1.7;margin-bottom:18px;max-width:260px}
.footer-socials{display:flex;gap:7px}
.social-btn{width:32px;height:32px;border-radius:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:.85rem;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.5);text-decoration:none}
.social-btn:hover{background:rgba(255,255,255,.15);color:#fff}
.footer-col h4{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;margin-bottom:14px}
.footer-links{display:flex;flex-direction:column;gap:8px;color:#fff}
.footer-link{font-size:.8rem;cursor:pointer;transition:color .15s}
.footer-link:hover{color:#fff}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.footer-legal{font-size:.72rem}
.footer-payments{display:flex;align-items:center;gap:7px}
.pay-badge{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:3px 9px;font-size:.68px;font-weight:600;color:rgba(255,255,255,.4)}
.nav-avatar{width:36px;height:36px;border-radius:50%;background:var(--red);color:#fff;font-weight:800;font-size:.78rem;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:300;background:#fff;border-top:1.5px solid var(--border);padding:8px 0 max(12px,env(safe-area-inset-bottom));box-shadow:0 -2px 12px rgba(0,0,0,.08)}
.bottom-nav-inner{display:grid;grid-template-columns:repeat(4,1fr);max-width:480px;margin:0 auto;padding:0 6px;gap:0}
.bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 4px;border:none;background:none;cursor:pointer;border-radius:8px;color:var(--muted);transition:color .15s;position:relative;-webkit-tap-highlight-color:transparent}
.bn-item.active{color:var(--red)}
.bn-pill{width:40px;height:28px;border-radius:12px;display:flex;align-items:center;justify-content:center;transition:background .15s}
.bn-item.active .bn-pill{background:rgba(26,122,60,.08)}
.bn-item.active .bn-pill svg{stroke:var(--red)}
.bn-label{font-size:.58rem;font-weight:700;letter-spacing:.2px;line-height:1}
.bn-badge{position:absolute;top:3px;right:calc(50% - 22px);width:7px;height:7px;border-radius:50%;background:var(--red);border:2px solid #fff}
.scroll-top{position:fixed;bottom:calc(80px + env(safe-area-inset-bottom));left:16px;width:38px;height:38px;border-radius:50%;background:var(--black);color:#fff;border:none;font-size:.9rem;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .25s,transform .18s;z-index:400;box-shadow:var(--sh2)}
.scroll-top.show{opacity:1;pointer-events:all}
.scroll-top:hover{transform:translateY(-2px)}
@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.spin-anim{animation:spin .7s linear infinite}
.avs-page{background:#f5f5f5;min-height:100vh}
.avs-greeting{background:#fff;padding:18px 20px 14px;border-bottom:1px solid #ececec}
.avs-greeting h2{font-size:1.3rem;font-weight:700;color:#111;margin-bottom:2px;letter-spacing:-.3px}
.avs-greeting p{font-size:.78rem;color:#888}
.avs-greeting strong{color:var(--green-primary)}
.avs-section{padding:18px 0 6px}
.avs-section-head{display:flex;justify-content:space-between;align-items:center;padding:0 16px;margin-bottom:12px}
.avs-section-title{font-size:.95rem;font-weight:700;color:#111;letter-spacing:-.15px}
.avs-hscroll{display:flex;gap:10px;padding:0 16px 6px;overflow-x:auto;scrollbar-width:none}
.avs-hscroll::-webkit-scrollbar{display:none}
.avs-promo-card{  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 220px;        /* set one explicit height on the CARD */
  flex-shrink: 0;       /* stop it collapsing in the hscroll row */
  width: 280px; box-shadow:0 2px 10px rgba(0,0,0,.09);transition:transform .2s,box-shadow .2s}
.avs-promo-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.14)}
.avs-promo-img {
  position: absolute;   /* stretch to fill the entire card */
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.avs-promo-img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;    /* fills without distorting */
}
.avs-promo-overlay {
  position: absolute;   /* sit on top of image at the bottom */
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 70%, transparent 100%);
  color: #fff;
  z-index: 2;
}
.avs-promo-tag{font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.75);margin-bottom:2px}
.avs-promo-name{font-size:.82rem;font-weight:700;color:#fff;line-height:1.25}
.avs-promo-price{font-size:.7rem;color:rgba(255,255,255,.65);margin-top:2px}
/* ── Category circle scroll row ── */
.avs-cat-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 6px 4px 10px;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.avs-cat-scroll::-webkit-scrollbar { display: none; }

.avs-cat-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  width: 90px;
}

/* The big round image circle — like Checkers */
.avs-cat-circle-inner {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border, #e5e5e5);
  box-shadow: 0 3px 12px rgba(0,0,0,0.10);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  background: var(--cream2, #f0ebe0);
}
.avs-cat-circle-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.avs-cat-circle:hover .avs-cat-circle-inner {
  border-color: var(--forest, #1a2e1f);
  box-shadow: 0 6px 20px rgba(26,46,31,0.22);
  transform: translateY(-3px);
}

.avs-cat-circle:hover .avs-cat-circle-inner img {
  transform: scale(1.08);
}

.avs-cat-circle-name {
  font-size: .72rem;
  font-weight: 700;
  color: var(--text, #222);
  text-align: center;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* Navigation dots */
.avs-cat-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.avs-cat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}

.avs-cat-dot.active {
  width: 22px;
  border-radius: 4px;
  background: var(--forest, #1a2e1f);
}
.avs-promo-arrow{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.88);border:none;display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#111;cursor:pointer;font-weight:700}
.avs-feature-strip{background:#fff;border-radius:14px;margin:14px 16px 0;padding:14px 16px;display:flex;flex-direction:column;gap:12px;border:1px solid #ececec}
.avs-feature-header{display:flex;align-items:center;gap:12px}
.avs-feature-icon{width:42px;height:42px;border-radius:10px;background:#e8f5ee;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
.avs-feature-title{font-size:.9rem;font-weight:700;color:#111;margin-bottom:2px}
.avs-feature-sub{font-size:.72rem;color:#888;line-height:1.4}
.avs-pills{display:flex;gap:7px;flex-wrap:wrap}
.avs-pill{display:inline-flex;align-items:center;gap:5px;background:#f5f5f5;border:1.5px solid #e5e5e5;border-radius:20px;padding:6px 12px;font-size:.72rem;font-weight:600;color:#333;cursor:pointer;white-space:nowrap;transition:border-color .15s,background .15s}
.avs-pill:hover{border-color:var(--green-primary);background:#e8f5ee;color:var(--green-primary)}
.avs-pill-icon{font-size:.95rem}
.avs-cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px}
.avs-cat-tile{background:#fff;border-radius:100px;padding:12px 6px;text-align:center;cursor:pointer;border:1.5px solid #ececec;transition:border-color .15s,background .15s}
.avs-cat-tile:hover{border-color:var(--green-primary);background:#f0faf4}
.avs-cat-emoji{font-size:1.6rem;margin-bottom:5px}
.avs-cat-name{font-size:.67rem;font-weight:600;color:#333;line-height:1.25}
.avs-deal-card{flex-shrink:0;width:155px;background:#fff;border-radius:12px;overflow:hidden;cursor:pointer;border:1.5px solid #ececec;transition:border-color .18s,transform .18s}
.avs-deal-card:hover{border-color:var(--green-primary);transform:translateY(-2px)}
.avs-deal-img {
  position: relative;        /* needed for absolute img + badge */
  height: 110px;
  overflow: hidden;
  border-radius: 10px 10px 0 0;
  background: var(--cream2, #f0ebe0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avs-deal-img img {
  display: block;
  transition: transform 0.35s ease;
}

.avs-deal-card:hover .avs-deal-img img {
  transform: scale(1.06);
}

.avs-off-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #e53e3e;
  color: white;
  font-size: .65rem;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 5px;
  z-index: 2;
  letter-spacing: 0.02em;
}
.avs-off-badge{position:absolute;top:8px;left:8px;background:var(--green-primary);color:#fff;font-size:.58rem;font-weight:800;padding:3px 7px;border-radius:4px}
.avs-deal-body{padding:9px 10px 11px}
.avs-deal-name{font-size:.72rem;font-weight:600;color:#111;line-height:1.3;margin-bottom:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.avs-price-row{display:flex;align-items:baseline;gap:5px}
.avs-price-now{font-size:.92rem;font-weight:800;color:var(--green-primary)}
.avs-price-was{font-size:.68rem;color:#bbb;text-decoration:line-through}
.avs-stock-bar{height:3px;background:#ececec;border-radius:2px;margin-top:7px;overflow:hidden}
.avs-stock-fill{height:100%;background:var(--green-primary);border-radius:2px}
.avs-stock-lbl{font-size:.58rem;color:#aaa;margin-top:3px;font-weight:600}
.avs-trust-item{flex-shrink:0;background:#fff;border-radius:10px;padding:9px 13px;display:flex;align-items:center;gap:7px;border:1.5px solid #ececec;white-space:nowrap}
.avs-trust-icon{font-size:1.1rem}
.avs-trust-text{font-size:.7rem;font-weight:600;color:#333}
.avs-voucher-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px}
.avs-v-card{background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #ececec;cursor:pointer;transition:border-color .18s,transform .18s}
.avs-v-card:hover{border-color:var(--green-primary);transform:translateY(-2px)}
.avs-v-img {
  position: relative;
  width: 100%;
  height: 160px;        
  overflow: hidden;
  border-radius: 10px 10px 0 0;
  background: var(--cream2, #f0ebe0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avs-v-img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;        
  object-position: center;  
  transition: transform 0.35s ease;
}
  .avs-v-card:hover .avs-v-img img {
  transform: scale(1.05);   /* subtle zoom on hover */
}
.avs-v-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  font-size: .62rem;
  font-weight: 700;
  color: white;
  padding: 3px 8px;
  border-radius: 5px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.avs-v-body{padding:9px 10px 11px}
.avs-v-name{font-size:.75rem;font-weight:600;color:#111;margin-bottom:2px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.avs-v-loc{font-size:.65rem;color:#aaa;margin-bottom:7px}
.avs-v-foot{display:flex;justify-content:space-between;align-items:center}
.avs-v-price{font-size:.88rem;font-weight:800;color:#111;letter-spacing:-.3px}
.avs-v-add{width:28px;height:28px;border-radius:50%;background:var(--green-primary);color:#fff;border:none;display:flex;align-items:center;justify-content:center;font-size:1.1rem;cursor:pointer;transition:background .15s,transform .15s;flex-shrink:0}
.avs-v-add:hover{background:var(--green-dark);transform:scale(1.1)}
.avs-occ-scroll{display:flex;gap:8px;padding:0 16px 4px;overflow-x:auto;scrollbar-width:none}
.avs-occ-scroll::-webkit-scrollbar{display:none}
.avs-occ{flex-shrink:0;background:#fff;border:1.5px solid #ececec;border-radius:12px;padding:12px 10px;text-align:center;cursor:pointer;width:88px;transition:border-color .15s,background .15s}
.avs-occ:hover{border-color:var(--green-primary);background:#f0faf4}
.avs-occ-icon{font-size:1.4rem;margin-bottom:5px;display:flex;justify-content:center;color:var(--green-primary)}
.avs-occ-name{font-size:.65rem;font-weight:700;color:#333;line-height:1.2}
.flash-deals-section{background:#fff;border-bottom:1px solid var(--border);padding:0 0 28px}
.flash-header{display:flex;align-items:center;justify-content:space-between;padding:22px 20px 16px;max-width:var(--max);margin:0 auto}
.flash-label{display:flex;align-items:center;gap:10px}
.flash-fire{font-size:1.1rem;animation:flicker 1.2s ease-in-out infinite alternate}
@keyframes flicker{from{filter:brightness(1)}to{filter:brightness(1.35) drop-shadow(0 0 4px #ff6b00)}}
.flash-title{font-size:1rem;font-weight:800;color:var(--black);letter-spacing:-.2px}
.flash-countdown{display:flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:var(--muted)}
.flash-timer-block{background:var(--black);color:#fff;padding:4px 8px;border-radius:5px;font-size:.75rem;font-weight:800;min-width:28px;text-align:center;font-variant-numeric:tabular-nums}
.flash-colon{color:var(--red);font-weight:800;font-size:.9rem;margin-top:-2px}
.flash-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}
.flash-row::-webkit-scrollbar{display:none}
.flash-deal-card{flex-shrink:0;width:180px;background:#fff;border:1.5px solid var(--border);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .22s;position:relative}
.flash-deal-card:hover{border-color:var(--red);box-shadow:0 6px 24px rgba(26,122,60,.1);transform:translateY(-3px)}
.flash-deal-img{height:120px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:2.8rem;position:relative}
.flash-deal-img img{width:100%;height:100%;object-fit:cover}
.flash-off-badge{position:absolute;top:8px;left:8px;background:var(--red);color:#fff;font-size:.6rem;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:.3px}
.flash-deal-body{padding:10px 12px 12px}
.flash-deal-name{font-size:.78rem;font-weight:700;color:var(--black);line-height:1.3;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.flash-price-row{display:flex;align-items:baseline;gap:6px}
.flash-price-now{font-size:1rem;font-weight:800;color:var(--red);letter-spacing:-.3px}
.flash-price-was{font-size:.72rem;color:var(--muted);text-decoration:line-through}
.flash-stock-bar{height:3px;background:var(--bg2);border-radius:2px;margin-top:8px;overflow:hidden}
.flash-stock-fill{height:100%;background:linear-gradient(90deg,var(--red),#ff6b35);border-radius:2px;transition:width .3s}
.flash-stock-lbl{font-size:.58rem;color:var(--muted);margin-top:4px;font-weight:600}
.hero-v2 {
  width: 100%;
  padding: 0;
}
.hero-v2-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0a0a0a 0%,#1a0505 50%,#0a0a0a 100%)}
.hero-v2-pattern{position:absolute;inset:0;background-image:radial-gradient(circle at 20% 50%,rgba(26,122,60,.12) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(26,122,60,.08) 0%,transparent 40%)}
.hero-v2-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  align-items: center;
  gap: 40px;
}
.hero-v2-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(26,122,60,.15);border:1px solid rgba(26,122,60,.3);border-radius:50px;padding:5px 13px;font-size:.68rem;font-weight:700;color:#ff6b6b;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px}
.hero-v2-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:#ff4040;animation:pulse-dot 1.4s ease-in-out infinite}
@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
.hero-v2-title{font-size:clamp(2rem,4.5vw,3.2rem);font-weight:800;color:#fff;line-height:1.05;letter-spacing:-.5px;margin-bottom:12px}
.hero-v2-title em{font-style:normal;color:var(--red)}
.hero-v2-sub{font-size:.9rem;color:rgba(255,255,255,.55);line-height:1.65;margin-bottom:24px;max-width:520px}
.hero-v2-search{display:flex;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);border-radius:10px;overflow:hidden;max-width:560px;backdrop-filter:blur(8px);transition:border-color .2s}
.hero-v2-search:focus-within{border-color:rgba(227,0,27,.5);background:rgba(255,255,255,.12)}
.hero-v2-search input{flex:1;background:none;border:none;outline:none;padding:14px 16px;color:#fff;font-family:var(--sans);font-size:.9rem}
.hero-v2-search input::placeholder{color:rgba(255,255,255,.35)}
.hero-v2-search-btn{background:var(--red);border:none;padding:0 22px;color:#fff;font-weight:800;font-size:.85rem;font-family:var(--sans);cursor:pointer;display:flex;align-items:center;gap:7px;white-space:nowrap;transition:background .15s}
.hero-v2-search-btn:hover{background:var(--red2)}
.hero-v2-trust{display:flex;gap:20px;margin-top:18px;flex-wrap:wrap}
.hero-v2-trust-item{display:flex;align-items:center;gap:6px;font-size:.72rem;color:rgba(255,255,255,.45);font-weight:500}
.hero-v2-trust-item strong{color:rgba(255,255,255,.75)}
.hero-v2-stats{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
.hero-stat-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(12px);border-radius:12px;padding:14px 18px;text-align:center;min-width:120px;transition:background .2s}
.hero-stat-card:hover{background:rgba(255,255,255,.1)}
.hero-stat-val{font-size:1.5rem;font-weight:800;color:#fff;letter-spacing:-.5px;line-height:1;margin-bottom:3px}
.hero-stat-lbl{font-size:.6rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;font-weight:600}
.hero-ticker{background:var(--red);position:relative;z-index:2;overflow:hidden;height:38px;display:flex;align-items:center}
.hero-ticker-track{display:flex;gap:0;animation:ticker-scroll 35s linear infinite;white-space:nowrap}
@keyframes ticker-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.hero-ticker-item{display:flex;align-items:center;gap:8px;padding:0 24px;font-size:.72rem;font-weight:700;color:#fff;white-space:nowrap}
.hero-ticker-sep{color:rgba(255,255,255,.4);margin:0 4px}
.promo-strip{position:relative;overflow:hidden;background:#fff;border-bottom:1px solid var(--border)}
.promo-strip-track{display:flex;transition:transform .55s cubic-bezier(.4,0,.2,1);will-change:transform}
.promo-slide{min-width:100%;display:grid;grid-template-columns:1fr 1fr;min-height:320px;cursor:pointer}
.promo-slide-left{display:flex;flex-direction:column;justify-content:center;padding:44px 48px;position:relative;overflow:hidden}
.promo-slide-left::before{content:'';position:absolute;right:-60px;top:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none}
.promo-slide-right{position:relative;overflow:hidden}
.promo-slide-right img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.promo-slide:hover .promo-slide-right img{transform:scale(1.04)}
.promo-eyebrow{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;opacity:.75}
.promo-headline{font-size:clamp(1.6rem,3.5vw,2.6rem);font-weight:800;line-height:1.1;letter-spacing:-.5px;margin-bottom:10px}
.promo-sub{font-size:.88rem;line-height:1.65;margin-bottom:22px;opacity:.75;max-width:360px}
.promo-cta-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.promo-btn-primary{display:inline-flex;align-items:center;gap:7px;padding:12px 22px;border-radius:8px;font-family:var(--sans);font-size:.85rem;font-weight:800;cursor:pointer;border:none;transition:all .18s;background:#fff;letter-spacing:-.1px}
.promo-btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.15)}
.promo-btn-ghost{font-size:.82rem;font-weight:700;cursor:pointer;border:none;background:none;opacity:.7;transition:opacity .15s;font-family:var(--sans);text-decoration:underline;text-underline-offset:3px}
.promo-btn-ghost:hover{opacity:1}
.promo-price-badge{position:absolute;top:20px;right:20px;background:var(--red);color:#fff;padding:8px 14px;border-radius:50px;font-size:.72rem;font-weight:800;box-shadow:0 4px 16px rgba(26,122,60,.35);z-index:2;white-space:nowrap}
.promo-dots{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:10}
.promo-dot{width:7px;height:7px;border-radius:50%;border:none;background:rgba(0,0,0,.2);cursor:pointer;padding:0;transition:all .2s}
.promo-dot.active{background:var(--red);width:22px;border-radius:4px}
.promo-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,.92);box-shadow:0 2px 12px rgba(0,0,0,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;color:var(--black);transition:all .18s}
.promo-arrow:hover{background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.18);transform:translateY(-50%) scale(1.08)}
.promo-arrow.prev{left:14px}
.promo-arrow.next{right:14px}
.promo-progress{position:absolute;bottom:0;left:0;height:3px;background:var(--red);border-radius:0 2px 2px 0;transition:width linear;z-index:10}
.newsletter{background:var(--bg2);border-top:1px solid var(--border);padding:40px 0;text-align:center}
.newsletter h2{font-size:1.3rem;font-weight:800;color:var(--black);margin-bottom:6px;letter-spacing:-.3px}
.newsletter p{color:var(--sub);font-size:.85rem;margin-bottom:20px}
.nl-form{display:flex;max-width:400px;margin:0 auto;overflow:hidden;border-radius:8px;box-shadow:var(--sh1);border:1.5px solid var(--border2)}
.nl-form input{flex:1;padding:12px 16px;border:none;outline:none;font-family:var(--sans);font-size:.88rem;color:var(--text);background:#fff}
.nl-btn{background:var(--red);color:#fff;border:none;padding:0 20px;font-family:var(--sans);font-weight:700;font-size:.82rem;cursor:pointer;transition:background .15s;white-space:nowrap}
.nl-btn:hover{background:var(--red2)}
@media(max-width:1024px){.footer-grid{grid-template-columns:1fr 1fr;gap:28px}.modal-inner{grid-template-columns:1fr}}
@media(max-width:768px){
  .nav-inner{display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding:0 14px;height:56px;gap:10px}
  .nav-logo{grid-column:1;font-size:1.1rem}
  .nav-address-btn,.nav-search,.nav-links,.nav-cta,.nav-user{display:none}
  .nav-hamburger{grid-column:3;display:flex;margin-left:0}
  .mobile-menu{top:56px}
  .cats-section{top:56px}
  .promo-slide{grid-template-columns:1fr;min-height:auto}
  .promo-slide-right{height:200px}
  .promo-slide-left{padding:28px 20px}
  .promo-arrow{display:none}
  .hero-v2-inner{grid-template-columns:1fr}
  .hero-v2-stats{flex-direction:row;flex-wrap:wrap}
  .hero-stat-card{min-width:100px;padding:10px 14px}
}
  @media (max-width: 1024px) {
  .card-grid,
  .voucher-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
/* ── Page wrapper: full width, centered content ── */
.avs-page {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

/* ── Every section: full width ── */
.avs-section {
  width: 100%;
  margin-bottom: 32px;
}

/* ── Section header: title + sort control ── */
.avs-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  width: 100%;
}

/* ── THE MAIN FIX: voucher grid balanced & centered ── */
.avs-voucher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
}

/* ── Voucher card: uniform, no drift ── */
.avs-v-card {
  width: 100%;
  box-sizing: border-box;
}

/* ── Category grid: 4 per row, centered ── */
.avs-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

/* ── Horizontal scroll rows (promos, deals) ── */
.avs-hscroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  width: 100%;
}
.avs-hscroll::-webkit-scrollbar { display: none; }

/* ── Category filter pill bar ── */
.cats-section {
  width: 100%;
  background: var(--cream, #f5f0e8);
  border-bottom: 1px solid var(--border, #e5e5e5);
  padding: 10px 0;
}
.cats-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 24px;
  scrollbar-width: none;
  max-width: 1280px;
  margin: 0 auto;
}
.cats-scroll::-webkit-scrollbar { display: none; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .avs-voucher-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .avs-cat-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .avs-page {
    padding: 0 16px;
  }
  .avs-voucher-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .avs-cat-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}

@media (max-width: 400px) {
  .avs-voucher-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
@media (max-width: 640px) {
  .container,
  .nav-inner,
  .flash-row {
    padding: 0 16px;
  }
  .card-grid,
  .voucher-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .hero-v2-inner {
    flex-direction: column;
    padding: 32px 16px;
  }
}
@media(max-width:600px){
  .cards-grid{grid-template-columns:1fr 1fr;gap:10px;padding:0 14px}
  .card{width:auto;min-width:auto}
  .card-img{height:120px}
  .avs-cat-grid{grid-template-columns:repeat(4,1fr);gap:6px}
  .avs-voucher-grid{grid-template-columns:1fr 1fr;gap:8px}
  .hero-v2-stats{display:none}
  .bottom-nav{display:block}
  body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}
  footer{padding-bottom:calc(60px + env(safe-area-inset-bottom))}
  .footer-grid{grid-template-columns:1fr}
  .nl-form{flex-direction:column;border-radius:10px}
}
.nav-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:7px;flex-shrink:0;margin-left:auto}
.nav-hamburger span{display:block;width:20px;height:2px;background:var(--black);border-radius:2px;transition:transform .22s,opacity .22s}
.nav-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav-hamburger.open span:nth-child(2){opacity:0}
.nav-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mobile-menu{display:none;position:absolute;top:64px;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:8px 12px 12px;flex-direction:column;gap:2px;z-index:99;box-shadow:0 8px 24px rgba(0,0,0,.1)}
.mobile-menu.open{display:flex}
.mobile-menu-link{padding:11px 14px;border-radius:7px;font-size:.88rem;font-weight:600;color:var(--sub);cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:background .15s,color .15s}
.mobile-menu-link:hover,.mobile-menu-link.active{background:var(--bg2);color:var(--black)}
.mobile-menu-divider{height:1px;background:var(--border);margin:7px 0}
.mobile-menu-cta{margin-top:3px;padding:12px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.88rem;font-weight:800;cursor:pointer;text-align:center;width:100%}
.mobile-user-header{display:flex;align-items:center;gap:10px;padding:10px 14px 6px}
.mobile-user-name{font-size:.85rem;font-weight:700;color:var(--black)}
.mobile-user-email{font-size:.72rem;color:var(--muted);margin-top:1px}
`;

export default CSS;
