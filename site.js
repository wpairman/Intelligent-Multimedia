(function(){
  var year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  var menuBtn = document.getElementById('menuBtn');
  var panel = document.getElementById('mobilePanel');
  if(menuBtn && panel){
    menuBtn.addEventListener('click', function(){
      var open = panel.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        panel.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var wall = document.getElementById('tileWall');
  if(wall){
    var cols = 12, rows = 7;
    for(var i = 0; i < cols * rows; i++){
      var tile = document.createElement('div');
      tile.className = 'tile' + (Math.random() < 0.08 ? ' amber' : '');
      if(reduceMotion){
        tile.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
      } else {
        tile.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
        tile.style.animationDuration = (4 + Math.random() * 5).toFixed(2) + 's';
      }
      wall.appendChild(tile);
    }
  }

  var orbit = document.getElementById('heroOrbit');
  var ring = document.getElementById('heroRing');
  if(orbit && ring){
    var shots = ring.querySelectorAll('.hero-shot');
    var count = shots.length;
    if(!count){
      /* skip */
    } else if(reduceMotion){
      orbit.classList.add('is-static');
    } else {
      var angle = 0;
      var last = performance.now();
      var paused = false;
      var degPerMs = 360 / 16000;
      function radiusPx(){
        var rem = parseFloat(getComputedStyle(orbit).getPropertyValue('--ring-r')) || 12;
        var root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return rem * root;
      }
      var radius = radiusPx();
      window.addEventListener('resize', function(){ radius = radiusPx(); });
      orbit.addEventListener('mouseenter', function(){ paused = true; });
      orbit.addEventListener('mouseleave', function(){ paused = false; });
      orbit.addEventListener('focusin', function(){ paused = true; });
      orbit.addEventListener('focusout', function(){ paused = false; });
      function frame(now){
        var dt = Math.min(40, now - last);
        last = now;
        if(!paused) angle -= dt * degPerMs;
        ring.style.transform = 'rotateY(' + angle + 'deg)';
        for(var i = 0; i < count; i++){
          var world = (i * 360 / count + angle) * Math.PI / 180;
          var facing = Math.cos(world);
          var pop = Math.pow(Math.max(0, facing), 1.55);
          shots[i].style.transform =
            'rotateY(' + (i * 360 / count) + 'deg) translateZ(' + radius + 'px) scale(' + (1 + pop * 0.55) + ') translateZ(' + (pop * 56) + 'px)';
          shots[i].style.zIndex = String(Math.round(30 + facing * 30));
          shots[i].style.filter = 'brightness(' + (0.42 + pop * 0.7).toFixed(2) + ')';
          shots[i].style.opacity = String(0.4 + pop * 0.6);
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }

  var navLinks = document.querySelectorAll('nav.links a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function(a){
    return document.querySelector(a.getAttribute('href'));
  });
  if(navLinks.length && 'IntersectionObserver' in window){
    var navObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = '#' + entry.target.id;
          navLinks.forEach(function(a){
            a.classList.toggle('active', a.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function(s){ if(s) navObserver.observe(s); });
  }

  function formatCount(value, target){
    return target >= 1000000
      ? (value / 1000000).toFixed(value < target ? 2 : 1) + 'M'
      : Math.round(value).toLocaleString('en-US');
  }

  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduceMotion){
      el.textContent = (target >= 1000000 ? (target/1000000) + 'M' : target.toLocaleString('en-US'));
      el.innerHTML += '<span class="suffix">' + suffix + '</span>';
      return;
    }
    var duration = 1600, start = null;
    function step(ts){
      if(start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.innerHTML = formatCount(value, target) + '<span class="suffix">' + (progress >= 1 ? suffix : '') + '</span>';
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.num[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    var countObserver = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function(c){ countObserver.observe(c); });
  } else {
    counters.forEach(animateCount);
  }
})();
