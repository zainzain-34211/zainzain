// Small enhancement only: keep the FAQ tidy on wide screens (progressive enhancement — content works without JS).
document.querySelectorAll('.faq details').forEach(function(d){
  d.addEventListener('toggle', function(){
    if(d.open){ document.querySelectorAll('.faq details').forEach(function(o){ if(o!==d) o.removeAttribute('open'); }); }
  });
});
