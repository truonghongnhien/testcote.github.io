self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  console.log('SW: fetch', url);
  console.log(event);
  if (/\.mp4$/.test(url)) {
    url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
    var options = {
      credentials: 'include',
      mode: 'no-cors'
    };
    event.respondWith(fetch(url, options));
  }
});
