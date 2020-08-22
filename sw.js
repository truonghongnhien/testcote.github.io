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

      client.postMessage("SW : '"+msg+"'", [msg_chan.port2]);
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
}





self.addEventListener('install', () => {
  logx('Handling install event. Resources to prefetch:');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  logx("activate");
  event.waitUntil(self.clients.claim());

});
self.addEventListener('message', function(event){
  console.log("SW Received Message: " + event.data);
  // event.ports[0].postMessage("SW Says 'Hello back!'");
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
    event.respondWith(fetch(url, options));
    return;
  }
  else{
    console.log('proxy forward!!!!');
        event.respondWith(fetch(request));
        return;
  }
});

