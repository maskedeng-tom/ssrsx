/*
  eslint no-undef: 0
*/
//var require;
//var ssrsxOptions;
//
var ssrsxEventLoaderInitialized = false;
function ssrsxEventLoaderInitializer(){
  if(ssrsxEventLoaderInitialized){
    return;
  }
  ssrsxEventLoaderInitialized = true;
  //
  //console.log('Initialize ssrsx client', cause);
  require.config(ssrsxOptions.requireJsConfig);
  //
  function checkWs(hotReloadWait){
    const loc = location.hostname;
    const sock = new WebSocket('ws://' + loc + ':' + ssrsxOptions.hotReload);
    sock.addEventListener('open', function(){
      location.reload(true);
    });
    sock.addEventListener('error', function(){
      var ms = hotReloadWait + ssrsxOptions.hotReloadWaitInclement;
      if(ms >= ssrsxOptions.hotReloadWaitMax){
        ms = ssrsxOptions.hotReloadWaitMax;
      }
      console.log('Hot reload wait', ms, 'msec.');
      setTimeout(function(){
        checkWs(ms);
      }, ms);
    });
  }
  //
  function addEvent(target, ev, mod, f){
    if(!target){return;}
    require([mod], function(funcs) {
      if(!funcs[f]){
        console.log('%cNo event handler%c :', 'background-color:red;color:white','color:initial', mod, f);
      }
      target.addEventListener(ev, function(e){
        funcs[f](e);
      });
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
    console.log('Hot reload. port =', ssrsxOptions.hotReload);
    sock.addEventListener('close', function(){
      setTimeout(function(){
        checkWs(ssrsxOptions.hotReloadWait);
      }, ssrsxOptions.hotReloadWait);
    });
  }
  //
}
function ssrsxStart(){
  addEventListener('load', function(){
    ssrsxEventLoaderInitializer();
  });
  addEventListener('readystatechange', function(){
    ssrsxEventLoaderInitializer();
  });
  requestAnimationFrame(function(){
    ssrsxEventLoaderInitializer();
  });
}
ssrsxStart();