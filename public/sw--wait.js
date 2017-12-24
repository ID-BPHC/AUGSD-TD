var CACHE_NAME = "instruction-division",
    urlsToCache = ["/", "/stylesheets/blog.css", "/stylesheets/dashboard.css", "/stylesheets/icon.css", "/stylesheets/indexstyle.css", "/stylesheets/material-alerts.css", "/stylesheets/material.indigo-pink.min.css", "/stylesheets/select.css", "/stylesheets/style.css", "/scripts/jquery-3.2.1.slim.js", "/scripts/jquery.validate.js", "/scripts/material-alerts.js", "/scripts/material.min.js", "/scripts/select.js"];
self.addEventListener("install", function(s) {
    s.waitUntil(caches.open(CACHE_NAME).then(function(s) {
        return console.log("Opened cache"), s.addAll(urlsToCache)
    }))
}), self.addEventListener("fetch", function(s) {
    s.respondWith(caches.match(s.request).then(function(e) {
        if (e) return e;
        var t = s.request.clone();
        return fetch(t).then(function(e) {
            if (!e || 200 !== e.status || "basic" !== e.type) return e;
            var t = e.clone();
            return caches.open(CACHE_NAME).then(function(e) {
                e.put(s.request, t)
            }), e
        })
    }))
});