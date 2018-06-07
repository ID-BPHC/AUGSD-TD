(function() {
  "use strict";

  var filesToCache = [
    "/stylesheets/dashboard.css",
    "/stylesheets/icon.css",
    "/stylesheets/indexstyle.css",
    "/stylesheets/material-alerts.css",
    "/stylesheets/select.css",
    "/stylesheets/style.css",
    "/scripts/jquery-3.2.1.slim.js",
    "/scripts/jquery.validate.min.js",
    "/scripts/material-alerts.js",
    "/scripts/material.min.js",
    "/scripts/select.js"
  ];

  var staticCacheName = "instruction-division-v2";

  self.addEventListener("install", function(event) {
    console.log("Attempting to install service worker and cache static assets");
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll(filesToCache);
      })
    );
  });

  self.addEventListener("fetch", function(event) {
    console.log("Fetch event for ", event.request.url);
    event.respondWith(
      caches
        .match(event.request)
        .then(function(response) {
          if (response) {
            console.log("Found ", event.request.url, " in cache");
            return response;
          }
          console.log("Network request for ", event.request.url);
          return fetch(event.request).then(function(response) {
            if (response.status === 404) {
              console.log("Error 404");
            }
            return caches.open(staticCacheName).then(function(cache) {
              if (event.request.url.indexOf("test") < 0) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            });
          });
        })
        .catch(function(error) {
          console.log("Error, ", error);
        })
    );
  });

  self.addEventListener("activate", function(event) {
    console.log("Activating new service worker...");

    var cacheWhitelist = [staticCacheName];

    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
})();

//- if ('serviceWorker' in navigator) {
//- navigator.serviceWorker.register('sw.js')
//- 	.then(function(registration) {
//- 	console.log('Service Worker registration successful with scope: ',
//- 	registration.scope);
//- 	})
//- 	.catch(function(err) {
//- 	console.log('Service Worker registration failed: ', err);
//- 	});
//- }
