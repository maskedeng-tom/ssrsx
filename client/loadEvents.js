var require;
var events;
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
  for(var i = 0; i < events.length; i++){
    var event = events[i];
    var target = document.querySelectorAll('[data-ssrsx-event="' + event.target + '"]')[0];
    addEvent(target, event.event, event.module, event.f);
  }
});
