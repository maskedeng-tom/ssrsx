var require;
var ssrsxOptions;
//
var ssrsxEventLoaderInitialized = false;
function ssrsxEventLoaderInitializer(){
  if(ssrsxEventLoaderInitialized){
    return;
  }
  ssrsxEventLoaderInitialized = true;
  //
  //console.log('Initialize ssrsx client');
  require.config(ssrsxOptions.requireJsConfig);
  //
  function addEvent(target, ev, mod, f){
    if(!target){return;}
    require([mod], function(funcs) {
      if(!funcs[f]){
        console.log('%cNo event handler%c :', 'background-color:red;color:white','color:initial', mod, f);
      }
      target.addEventListener(ev, function(e){funcs[f](e);});
    });
  }
  //
  for(var i = 0; i < ssrsxOptions.events.length; i++){
    var event = ssrsxOptions.events[i];
    var target = document.querySelectorAll('[data-ssrsx-event="' + event.target + '"]')[0];
    addEvent(target, event.event, event.module, event.f);
  }
  //
  if(ssrsxOptions.hotReload){
    const loc = location.hostname;
    const sock = new WebSocket('ws://' + loc + ':' + ssrsxOptions.hotReload);
    console.log('Wait for Hot reload !!', sock);
    sock.addEventListener('close', e => {e; setTimeout(() => {location.reload();}, ssrsxOptions.hotReloadWait);});
  }
  //
}
addEventListener('load', function load(){
  ssrsxEventLoaderInitializer();
});
addEventListener('readystatechange', function load(){
  ssrsxEventLoaderInitializer();
});