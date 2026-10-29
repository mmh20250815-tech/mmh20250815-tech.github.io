var V = "hb-fcd5588de7";
var ASSETS = ["hb.css?v=fcd5588de7", "hb3d.js?v=fcd5588de7", "hb.js?v=fcd5588de7"];
var PAGES = ["hb.html", "index.html"];
var SOFT = ["cfg.js"];
var LAZY = ["hbpdf.js", "hbcmap.js"];
var BASE = self.registration.scope;
function u(p) { return new URL(p, BASE).href; }
function put(req, r) { try { var cp = r.clone(); caches.open(V).then(function (c) { return c.put(req, cp); }).catch(function () {}); } catch (e) {} }
function withTimeout(p, ms) { return new Promise(function (ok, bad) { var t = setTimeout(function () { bad(new Error("timeout")); }, ms); p.then(function (r) { clearTimeout(t); ok(r); }, function (e) { clearTimeout(t); bad(e); }); }); }
function fromCache(req, alt) { return caches.open(V).then(function (c) { return c.match(req, { ignoreSearch: true }).then(function (r) { if (r) return r; return alt ? c.match(u(alt)) : null; }); }); }
function netFirst(req, ms, alt) {
  return withTimeout(fetch(req), ms).then(function (r) { if (r && r.ok) put(req, r); return r; }).catch(function () { return fromCache(req, alt).then(function (r) { return r || Response.error(); }); });
}
function cacheFirst(req) {
  return fromCache(req).then(function (r) { if (r) return r; return fetch(req).then(function (x) { if (x && x.ok) put(req, x); return x; }); });
}
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(ASSETS.concat(PAGES, SOFT).map(function (p) { return c.add(u(p)).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf("hb-") === 0 && k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = req.url.split("#")[0];
  if (url.indexOf(BASE) !== 0) return;
  var r = url.slice(BASE.length), name = r.split("?")[0];
  if (req.mode === "navigate") {
    if (name === "hb.html" || name === "index.html") e.respondWith(netFirst(req, 4000));
    else if (name === "") e.respondWith(netFirst(req, 4000, "index.html"));
    return;
  }
  if (ASSETS.indexOf(r) >= 0 || LAZY.indexOf(name) >= 0) { e.respondWith(cacheFirst(req)); return; }
  if (SOFT.indexOf(name) >= 0) { e.respondWith(netFirst(req, 3000)); return; }
});
