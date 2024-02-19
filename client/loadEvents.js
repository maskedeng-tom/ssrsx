var require;
var ssrsxEvents;
var ssrsxHotReload;
var ssrsxHotReloadWait;
addEventListener('load', function load(){
  function addEvent(target, ev, mod, f){
    if(!target){return;}
    require([mod], function(funcs) {
      if(!funcs[f]){
        console.log('%cNo event handler%c :', 'background-color:red;color:white','color:initial', mod, f);
      }
      target.addEventListener(ev, function(e){funcs[f](e);});
    });
  }
  for(var i = 0; i < ssrsxEvents.length; i++){
    var event = ssrsxEvents[i];
    var target = document.querySelectorAll('[data-ssrsx-event="' + event.target + '"]')[0];
    addEvent(target, event.event, event.module, event.f);
  }
  if(ssrsxHotReload){
    const loc = location.hostname;
    const sock = new WebSocket('ws://' + loc + ':' + ssrsxHotReload);
    sock.addEventListener('close', e => {e; setTimeout(() => {location.reload();}, ssrsxHotReloadWait);});
  }
});
