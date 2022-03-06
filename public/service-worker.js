// Global constants
const APP_PREFIX = 'BudgetTracket-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// Files that we wish to include in the cache
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js"
  ];

// Adding an event listener on the 'self' object
self.addEventListener('install', function (e) {
    // Instructing the function to wait until the work is completed, before moving on the from the installation phase
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
        })
    )
});

// Adding an event listener on the 'self' object
// This will execute when service worker takes control of a the page
self.addEventListener('activate', function(e) {
  // Instructing the function to wait until the work is completed, before moving on the from the activation phase
    e.waitUntil(
      // Returning all cache names under the URL
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        // Clearing cache
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });

  // An event listener for a fetch event to intercept
  // Checking to see if the request was stored in cache or not
  self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
      caches.match(e.request).then(function (request) {
        if (request) { // if cache is available, respond with cache
          console.log('responding with cache : ' + e.request.url)
          return request
        } else {       // if there are no cache, try fetching request
          console.log('file is not cached, fetching : ' + e.request.url)
          return fetch(e.request)
        }
  
        // You can omit if/else for console.log & put one line below like this too.
        // return request || fetch(e.request)
      })
    )
  });