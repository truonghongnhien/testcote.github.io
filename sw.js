self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());

});


self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  var request = event.request;
  console.log('SW: fetch', url);

    console.log(event.request.headers.get('range'));
  if (/\.mp4$/.test(url)) {
    url = 'https://ws.hdv.fun/0/s0/LOWk9tF9CmgYmdwf5coN-lwthoifTkzwKyA3KwqJjgzxK21N9DBBr_STfHMuheQchAoTqHs3GWC1as0iitni5fxWYIgddQQp66OI-I6VnoxU0umHymkhKZnguEaXOU2JwpLIWkT6T1QOWQ6I7jRyPFLplthq33vfPSxt3vYNhgRCT1kfk3gK09gx15Zztj3Vu7djQcsxtr2TJCCjzpKfgdMb5Bq4_DnVT5hCCugZ7y-uDe1FKPM4FZz2BrJ2TbOXhKhR16Dv5VP-0_RCSZ6BFg==';
    url='https://webtorrent.io/torrents/Sintel/Sintel.mp4'
    var options = {
      method: 'GET',      
      headers:event.request.headers
    };
 //   if(event.request.headers.get('range')){
//    options.headers=new Headers({'range': event.request.headers.get('range')});
//      event.request.headers
//    }
    console.log(options)
    event.respondWith(fetch(url, options));
    return;
  }
  else{
    console.log('proxy forward!!!!');
        event.respondWith(fetch(request));
        return;
  }
});

