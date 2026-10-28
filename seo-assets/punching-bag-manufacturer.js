// Infinitum Boxing — SEO page 5 (Punching Bag Manufacturer), 2026-10-28.
// Minimal progressive enhancement: the page is fully readable with JS off.
(function(){
  'use strict';
  // FAQ: keep one answer open at a time on wide screens.
  var items = document.querySelectorAll('.faq5 details');
  items.forEach(function(d){
    d.addEventListener('toggle', function(){
      if(d.open && window.innerWidth > 820){
        items.forEach(function(o){ if(o !== d) o.removeAttribute('open'); });
      }
    });
  });
  // Header shadow once scrolled.
  var header = document.querySelector('header.top');
  if(header){
    var onScroll = function(){ header.style.boxShadow = window.scrollY > 8 ? '0 8px 24px rgba(36,28,17,.08)' : 'none'; };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
