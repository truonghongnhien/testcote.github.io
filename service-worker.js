/*
 Copyright 2014 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// While overkill for this specific sample in which there is only one cache,
// this is one best practice that can be followed in general to keep track of
// multiple caches used by a given service worker, and keep them all versioned.
// It maps a shorthand identifier for a cache to a specific, versioned cache name.

// Note that since global state is discarded in between service worker restarts, these
// variables will be reinitialized each time the service worker handles an event, and you
// should not attempt to change their values inside an event handler. (Treat them as constants.)

// If at any point you want to force pages that use this service worker to start using a fresh
// cache, then increment the CACHE_VERSION value. It will kick off the service worker update
// flow and the old cache(s) will be purged as part of the activate event handler when the
// updated service worker is activated.
var CACHE_VERSION = 33;
var CURRENT_CACHES = {
  prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

var globalLog = self.globalLog;

function send_message_to_client(client, msg){
  return new Promise(function(resolve, reject){
      var msg_chan = new MessageChannel();

      msg_chan.port1.onmessage = function(event){
          if(event.data.error){
              reject(event.data.error);
          }else{
              resolve(event.data);
          }
      };

      client.postMessage("SW "+CACHE_VERSION+": '"+msg+"'", [msg_chan.port2]);
  });
}

function send_message_to_all_clients(msg){
  clients.matchAll().then(clients => {
      clients.forEach(client => {
          send_message_to_client(client, msg).then(m => console.log("SW Received Message: "+m));
      })
  })
}


function logx(arg1,arg2,arg3,arg4,arg5){
  console.log(arg1,arg2,arg3,arg4,arg5);
  
  send_message_to_all_clients(arg1+" "+(arg2||"")+" "+(arg3||"")+" "+(arg4||"")+" "+(arg5||"")+" ");
  // globalLog.push(arg1);
  // var pElement = window.document.createElement('p');
  // pElement.textContent=arg1;
  // if (arg2 !== undefined )pElement.textContent+=", "+arg2;
  // if (arg3 !== undefined )pElement.textContent+=", "+arg3;
  // if (arg4 !== undefined )pElement.textContent+=", "+arg4;
  // var swlog=window.document.getElementById('swlog');
  // if (swlog){
  //   swlog.appendChild(pElement);
  // }
  
}

self.addEventListener('install', function(event) {
  var urlsToPrefetch = [
    './',
    'index.js',
    'static/poster.jpg',
    // The videos are stored remotely with CORS enabled.
    'static/mov_bbb.mp4',
    'service-worker.js'
  ];

  // All of these logging statements should be visible via the "Inspect" interface
  // for the relevant SW accessed via chrome://serviceworker-internals
  logx('Handling install event. Resources to prefetch:', urlsToPrefetch);

  self.skipWaiting();

  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
      return cache.addAll(urlsToPrefetch);
    })
  );
});

self.addEventListener('message', function(event){
  console.log("SW Received Message: " + event.data);
  // event.ports[0].postMessage("SW Says 'Hello back!'");
});

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // While there is only one cache in this example, the same logic will handle the case where
  // there are multiple versioned caches.
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  logx("activate")

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            logx('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
        );
    })
    );
});

self.addEventListener('fetch', function(event) {
  
  headersLog = [];
  for (var pair of event.request.headers.entries()) {
    console.log(pair[0]+ ': '+ pair[1]);
    headersLog.push(pair[0]+ ': '+ pair[1])
 }
 logx('Handling fetch event for', event.request.url, JSON.stringify(headersLog));

  if (event.request.headers.get('range')) {
    logx('Range request for', event.request.url);
    var rangeHeader=event.request.headers.get('range');
    var rangeMatch =rangeHeader.match(/^bytes\=(\d+)\-(\d+)?/)
    var pos =Number(rangeMatch[1]);
    var pos2=rangeMatch[2];
    if (pos2) { pos2=Number(pos2); }
    
    logx('Range request for '+ event.request.url,'Range: '+rangeHeader, "Parsed as: "+pos+"-"+pos2);
    event.respondWith(
      caches.open(CURRENT_CACHES.prefetch)
      .then(function(cache) {
        return cache.match(event.request.url);
      }).then(function(res) {
        if (!res) {
          logx("Not found in cache - doing fetch")
          return fetch(event.request)
          .then(res => {
            logx("Fetch done - returning response ",res)
            return res.arrayBuffer();
          });
        }
        logx("FOUND in cache - doing fetch")
        return res.arrayBuffer();
      }).then(function(ab) {
        logx("Response procssing")
        let responseHeaders=  {
          status: 206,
          statusText: 'Partial Content',
          headers: [
            ['Content-Type', 'video/mp4'],
            ['Content-Range', 'bytes ' + pos + '-' + 
            (pos2||(ab.byteLength - 1)) + '/' + ab.byteLength]]
        };
        
        logx("Response: ",JSON.stringify(responseHeaders))
        var abSliced={};
        if (pos2>0){
          abSliced=ab.slice(pos,pos2+1);
        }else{
          abSliced=ab.slice(pos);
        }
        
        logx("Response length: ",abSliced.byteLength)
        return new Response(
          abSliced,responseHeaders
        );
      }));
  } else {
    logx('Non-range request for', event.request.url);
    event.respondWith(
    // caches.match() will look for a cache entry in all of the caches available to the service worker.
    // It's an alternative to first opening a specific named cache and then matching on that.
    caches.match(event.request).then(function(response) {
      if (response) {
        logx('Found response in cache:', response);
        return response;
      }
      logx('No response found in cache. About to fetch from network...');
      // event.request will always have the proper mode set ('cors, 'no-cors', etc.) so we don't
      // have to hardcode 'no-cors' like we do when fetch()ing in the install handler.
      return fetch(event.request).then(function(response) {
        logx('Response from network is:', response);

        return response;
      }).catch(function(error) {
        // This catch() will handle exceptions thrown from the fetch() operation.
        // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
        // It will return a normal response object that has the appropriate error code set.
        console.error('Fetching failed:', error);

        throw error;
      });
    })
    );
  }
});

