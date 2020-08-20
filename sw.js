self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  console.log('SW: fetch', url);
  if (/\.mp4$/.test(url)) {
    url = 'https://vjs.zencdn.net/v/oceans.mp4';
    var options = {
      credentials: 'include',
      mode: 'no-cors'
    };
    event.respondWith(fetch(url, options));
  }
});
