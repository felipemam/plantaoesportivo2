(function(){
  'use strict';
  var toggle=document.querySelector('.pew-menu-toggle');
  var nav=document.getElementById('pew-navigation');
  if(toggle && nav){
    var header=document.querySelector('.pew-header');
    var pending=false;
    function updateMenuPosition(){
      if(!header || !nav.classList.contains('is-open'))return;
      var bottom=Math.max(0,Math.round(header.getBoundingClientRect().bottom));
      document.documentElement.style.setProperty('--pew-mobile-menu-top',bottom+'px');
    }
    function queueMenuPosition(){
      if(pending || !nav.classList.contains('is-open'))return;
      pending=true;
      window.requestAnimationFrame(function(){
        pending=false;
        updateMenuPosition();
      });
    }
    function closeMenu(){
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    }
    toggle.addEventListener('click',function(){
      var isOpen=nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded',isOpen?'true':'false');
      if(isOpen)updateMenuPosition();
    });
    nav.addEventListener('click',function(event){
      if(event.target.closest('a') && window.innerWidth<=720)closeMenu();
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape' && nav.classList.contains('is-open')){
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener('resize',queueMenuPosition);
    window.addEventListener('scroll',queueMenuPosition,{passive:true});
  }
  var hero=document.querySelector('[data-pew-hero]');
  if(!hero)return;
  var slides=Array.prototype.slice.call(hero.querySelectorAll('.pew-hero-slide'));
  if(slides.length<2)return;
  var index=0;
  function render(next){
    slides[index].hidden=true;
    slides[index].classList.remove('is-active');
    index=(next+slides.length)%slides.length;
    slides[index].hidden=false;
    slides[index].classList.add('is-active');
  }
  var prev=hero.querySelector('[data-pew-prev]');
  var next=hero.querySelector('[data-pew-next]');
  if(prev)prev.addEventListener('click',function(){render(index-1);});
  if(next)next.addEventListener('click',function(){render(index+1);});
  var timer=null;
  function start(){if(timer===null)timer=window.setInterval(function(){render(index+1);},7000);}
  function stop(){if(timer!==null){window.clearInterval(timer);timer=null;}}
  hero.addEventListener('mouseenter',stop);
  hero.addEventListener('mouseleave',start);
  hero.addEventListener('focusin',stop);
  hero.addEventListener('focusout',function(e){if(!hero.contains(e.relatedTarget))start();});
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)start();
})();
