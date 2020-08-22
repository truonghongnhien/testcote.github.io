self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  console.log('SW: fetch', url);
    console.log(event.request.headers.get('range'));
  if (/\.mp4$/.test(url)) {
    url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
    var options = {
      credentials: 'include',
      headers:new Headers({'range': event.request.headers.get('range')}),
      mode: 'no-cors'
    };
    console.log(options)
    event.respondWith(fetch(url, options));
  }
});
