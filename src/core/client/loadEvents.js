var require;
var ssrsxOptions;
//
var ssrsxEventLoaderInitialized = false;
function ssrsxEventLoaderInitializer(cause){
  if(ssrsxEventLoaderInitialized){
    return;
  }
  ssrsxEventLoaderInitialized = true;
  //
  console.log('Initialize ssrsx client', cause);
  require.config(ssrsxOptions.requireJsConfig);
  //
  function addEvent(target, ev, mod, f){
    console.log('======================', target, event);
    if(!target){return;}
    require([mod], function(funcs) {
      if(!funcs[f]){
        console.log('%cNo event handler%c :', 'background-color:red;color:white','color:initial', mod, f);
      }
      target.addEventListener(ev, function(e){
        console.log('======================', ev);
        funcs[f](e);
      });
    });
  }
  //
  console.log('======================', ssrsxOptions.events);
  //
  for(var i = 0; i < ssrsxOptions.events.length; i++){
    var event = ssrsxOptions.events[i];
    var target = document.querySelectorAll('[data-ssrsx-event="' + event.target + '"]')[0];
    if(!target){
      console.log('UNDEFINED!!!!!!!!!!!', event.target);
    }
    addEvent(target, event.event, event.module, event.f);
  }
  //
  if(ssrsxOptions.hotReload){
    const loc = location.hostname;
    const sock = new WebSocket('ws://' + loc + ':' + ssrsxOptions.hotReload);
    console.log('Hot reload. port =', ssrsxOptions.hotReload);
    sock.addEventListener('close', e => {e; setTimeout(() => {location.reload(true);}, ssrsxOptions.hotReloadWait);});
  }
  //
}
function ssrsxStart(){
  addEventListener('load', function(){
    ssrsxEventLoaderInitializer('load');
  });
  addEventListener('readystatechange', function(){
    ssrsxEventLoaderInitializer('readyStateChange');
  });
  requestAnimationFrame(function(){
    ssrsxEventLoaderInitializer('requestAnimationFrame');
  });
}
ssrsxStart();