self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  console.log('SW: fetch', url);
    for (const pair of event.request.headers.entries()) {
    console.log(pair[0]+ ': '+ pair[1]);
  }
  if (/\.mp4$/.test(url)) {
    url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
    var options = {
      credentials: 'include',
      headers:event.request.headers,
      mode: 'no-cors'
    };
    event.respondWith(fetch(url, options));
  }
});
