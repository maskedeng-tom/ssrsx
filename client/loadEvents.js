var require;
var events;
addEventListener('load', function load(){
  function addEvent(target, ev, mod, f){
    if(!target){return;}
    require([mod], function(funcs) {
      target.addEventListener(ev, function(e){funcs[f](e);});
    });
  }
  for(var i = 0; i < events.length; i++){
    var event = events[i];
    var target = document.querySelectorAll('[' + event.target + ']')[0];
    addEvent(target, event.event, event.module, event.f);
  }
});
