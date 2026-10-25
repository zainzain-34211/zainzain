// Infinitum Boxing — SEO page 1 enhancements (progressive: all content works with JS off).
(function(){
  'use strict';

  // Mark JS availability so CSS can arm the reveal animation without hiding content from no-JS visitors.
  document.documentElement.classList.add('js');

  // 1) FAQ: keep one answer open at a time on wide screens (tidy accordion behaviour).
  var details = document.querySelectorAll('.faq details');
  details.forEach(function(d){
    d.addEventListener('toggle', function(){
      if(d.open){
        details.forEach(function(o){ if(o !== d) o.removeAttribute('open'); });
      }
    });
  });

  // 2) Scroll reveal for sections (IntersectionObserver; falls back to showing everything).
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  // 3) Header shadow once the page is scrolled.
  var header = document.querySelector('header.site');
  if(header){
    var onScroll = function(){
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
