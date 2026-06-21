/* ═══════════════════════════════════════════════════════
   FRANKLIN & SARAH — 3D SCROLL INVITATION — script.js
   ═══════════════════════════════════════════════════════ */

/* ── Always start from top on every load / reload ── */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

(function () {
  'use strict';

  /* ── CONFIG ── */
  const WEDDING = new Date('2026-12-28T10:00:00+05:30');

  /* ── ELEMENTS ── */
  const cover      = document.getElementById('cover');
  const sealBtn    = document.getElementById('seal-btn');
  const page       = document.getElementById('page');
  const petalCvs   = document.getElementById('petal-canvas');
  const musicPill  = document.getElementById('music-pill');
  const musicBtn   = document.getElementById('music-btn');
  const bgMusic    = document.getElementById('bg-music');
  const icoPlay    = musicBtn.querySelector('.ico-play');
  const icoPause   = musicBtn.querySelector('.ico-pause');

  /* ══════════════════════════════════════════════════
     1. COVER OPEN
     ══════════════════════════════════════════════════ */
  function openCover() {
    try {
      // Animate seal
      const sealBody = sealBtn ? sealBtn.querySelector('.seal-body') : null;
      if (sealBody) {
        sealBody.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        sealBody.style.transform  = 'scale(0) rotate(30deg)';
        sealBody.style.opacity    = '0';
      }

      // Start playing audio immediately (silently) to comply with browser/iOS audio user-interaction requirements
      if (bgMusic) {
        bgMusic.volume = 0;
        try {
          const playPromise = bgMusic.play();
          if (playPromise !== undefined && typeof playPromise.then === 'function') {
            playPromise.then(function () {
              setMusicState(true);
            }).catch(function (err) {
              console.log("Direct play activation blocked or failed:", err);
            });
          } else {
            // Fallback for older browsers where play() doesn't return a Promise
            setMusicState(true);
          }
        } catch (e) {
          console.log("Audio play invocation threw an error:", e);
        }
      }
    } catch (err) {
      console.log("Error in openCover animation setup:", err);
    }

    setTimeout(function () {
      if (cover) cover.classList.add('exit');
    }, 350);

    setTimeout(function () {
      if (cover) cover.style.display = 'none';
      if (page) page.classList.add('visible');
      if (musicPill) {
        musicPill.classList.remove('hidden');
        musicPill.classList.add('visible');
      }

      // Rings fly in
      const ringsWrap = page ? page.querySelector('.rings-svg') : null;
      if (ringsWrap) ringsWrap.parentElement.classList.add('rings-open');

      // Trigger hero elements
      if (page) {
        page.querySelectorAll('#s-hero .fade3d').forEach(function (el, i) {
          const d = parseFloat(el.dataset.delay || 0);
          setTimeout(function () { el.classList.add('in'); }, d * 1000);
        });
      }

      // Start observer
      startObserver();

      // Countdown
      updateCountdown();
      setInterval(updateCountdown, 1000);

      // Fade the music volume up to 0.45 over a few milliseconds
      if (bgMusic) {
        let vol = 0;
        const fadeInterval = setInterval(function () {
          vol += 0.05;
          if (vol >= 0.45) {
            bgMusic.volume = 0.45;
            clearInterval(fadeInterval);
          } else {
            bgMusic.volume = vol;
          }
        }, 50);
      }

    }, 1500);
  }

  sealBtn.addEventListener('click', openCover);
  sealBtn.addEventListener('touchend', function (e) { e.preventDefault(); openCover(); });

  /* ══════════════════════════════════════════════════
     2. ROSE PETAL CANVAS
     ══════════════════════════════════════════════════ */
  const pctx  = petalCvs.getContext('2d');
  let   petals = [];
  const N = 30;

  function resizePetal() {
    petalCvs.width  = window.innerWidth;
    petalCvs.height = window.innerHeight;
  }

  function mkPetal(startY) {
    // Mix of 60% cream/white petals, 20% gold petals/sparkles, and 20% soft sage green leaves
    const r = Math.random();
    let hue, sat, lgt;
    if (r < 0.6) {
      // Warm white/cream
      hue = 35 + Math.random() * 10;
      sat = 10 + Math.random() * 15;
      lgt = 85 + Math.random() * 10;
    } else if (r < 0.8) {
      // Elegant gold
      hue = 40 + Math.random() * 10;
      sat = 45 + Math.random() * 20;
      lgt = 65 + Math.random() * 15;
    } else {
      // Sage green leaf
      hue = 95 + Math.random() * 25;
      sat = 15 + Math.random() * 15;
      lgt = 52 + Math.random() * 12;
    }
    return {
      x:    Math.random() * petalCvs.width,
      y:    startY !== undefined ? startY : -(10 + Math.random() * 60),
      rx:   5 + Math.random() * 8,    // x radius
      ry:   8 + Math.random() * 13,   // y radius (taller = petal shape)
      vx:   (Math.random() - 0.5) * 0.9,
      vy:   0.5 + Math.random() * 1.4,
      rot:  Math.random() * Math.PI * 2,
      rspd: (Math.random() - 0.5) * 0.05,
      sway: Math.random() * Math.PI * 2,
      swayS:0.01 + Math.random() * 0.018,
      swayA:0.4  + Math.random() * 1.0,
      a:    0.2 + Math.random() * 0.35,
      hue:  hue,
      sat:  sat,
      lgt:  lgt,
    };
  }

  function initPetals() {
    petals = [];
    for (let i = 0; i < N; i++) petals.push(mkPetal(Math.random() * petalCvs.height));
  }

  function drawPetals() {
    pctx.clearRect(0, 0, petalCvs.width, petalCvs.height);
    petals.forEach(function (p, i) {
      p.sway += p.swayS;
      p.x    += p.vx + Math.sin(p.sway) * p.swayA;
      p.y    += p.vy;
      p.rot  += p.rspd;
      if (p.y > petalCvs.height + 20) petals[i] = mkPetal();

      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.rot);
      pctx.globalAlpha = p.a;
      pctx.fillStyle = 'hsl(' + p.hue + ',' + p.sat + '%,' + p.lgt + '%)';
      pctx.beginPath();
      pctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    });
    requestAnimationFrame(drawPetals);
  }

  resizePetal(); initPetals(); drawPetals();
  window.addEventListener('resize', function () { resizePetal(); initPetals(); });

  /* ══════════════════════════════════════════════════
     3. HERO PARALLAX (scroll-driven depth layers)
     ══════════════════════════════════════════════════ */
  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // Parallax layers
    const layers = document.querySelectorAll('.hero-layer[data-parallax]');
    layers.forEach(function (layer) {
      const speed = parseFloat(layer.dataset.parallax);
      layer.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
    });

    // Union rings interlock
    handleUnionRings(scrollY);
  });

  /* ══════════════════════════════════════════════════
     4. 3D SCROLL REVEAL OBSERVER
     ══════════════════════════════════════════════════ */
  function startObserver() {
    // card3d, slide3d-left, slide3d-right, flip3d, tilt3d selectors
    const selectors = '.card3d, .slide3d-left, .slide3d-right, .flip3d, .tilt3d';
    const targets   = document.querySelectorAll(selectors);

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const el      = entry.target;
        const delay   = parseFloat(el.dataset.delay || 0) * 1000;

        setTimeout(function () {
          el.classList.add('in');
        }, delay);

        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { obs.observe(el); });

    // Photo tilt on mouse move
    initPhotoTilt();

    // Scratch card
    initScratch();

    // Gallery lightbox
    initLightbox();
  }

  /* ══════════════════════════════════════════════════
     5. INTERACTIVE 3D PHOTO TILT ON CURSOR
     ══════════════════════════════════════════════════ */
  function initPhotoTilt() {
    document.querySelectorAll('.sp-photo-tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);
        el.style.transform = 'perspective(700px) rotateY(' + (dx * -8) + 'deg) rotateX(' + (dy * 5) + 'deg)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform  = 'perspective(700px) rotateY(0) rotateX(0)';
      });
    });
  }

  /* ══════════════════════════════════════════════════
     6. SCRATCH CARD
     ══════════════════════════════════════════════════ */
  function initScratch() {
    const canvas  = document.getElementById('scratch-c');
    const wrapper = canvas ? canvas.parentElement : null;
    if (!canvas || !wrapper) return;

    const sc = canvas.getContext('2d');
    let isDown = false, done = false;

    function resize() {
      const r = wrapper.getBoundingClientRect();
      canvas.width  = r.width;
      canvas.height = r.height;
      drawLayer();
    }

    function drawLayer() {
      // Elegant gold/bronze metallic gradient cover
      const g = sc.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0,    '#2b2520'); // dark warm bronze
      g.addColorStop(0.3,  '#9c7c38'); // antique gold
      g.addColorStop(0.6,  '#d4bc87'); // champagne
      g.addColorStop(0.8,  '#bfa265'); // gold-l
      g.addColorStop(1,    '#2b2520');
      sc.fillStyle = g;
      sc.fillRect(0, 0, canvas.width, canvas.height);

      // Diagonal texture lines
      sc.save();
      sc.strokeStyle = 'rgba(212,168,67,0.18)'; // champagne gold diagonal lines
      sc.lineWidth   = 0.7;
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 12) {
        sc.beginPath();
        sc.moveTo(i, 0);
        sc.lineTo(i + canvas.height, canvas.height);
        sc.stroke();
      }
      sc.restore();

      // Gold wax-seal circle
      sc.save();
      sc.beginPath();
      sc.arc(canvas.width / 2, canvas.height / 2 - 28, 26, 0, Math.PI * 2);
      sc.strokeStyle = 'rgba(212,168,67,0.7)';
      sc.lineWidth = 1.5;
      sc.setLineDash([5, 5]);
      sc.stroke();
      sc.setLineDash([]);
      sc.fillStyle = 'rgba(163,128,59,0.7)'; // translucent gold
      sc.fill();
      sc.restore();

      // Label
      sc.save();
      sc.textAlign = 'center';
      sc.fillStyle = 'rgba(255,255,255,0.72)'; // bright cream/white on gold
      sc.font = '600 10.5px Raleway, sans-serif';
      sc.fillText('✦   SCRATCH TO REVEAL   ✦', canvas.width / 2, canvas.height / 2 + 22);
      sc.restore();
    }

    function getXY(e) {
      const r = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    }

    function scratch(pos) {
      sc.globalCompositeOperation = 'destination-out';
      sc.beginPath();
      sc.arc(pos.x, pos.y, 32, 0, Math.PI * 2);
      sc.fill();
      if (!done) checkReveal();
    }

    function checkReveal() {
      const d = sc.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] < 100) cleared++;
      if (cleared / (canvas.width * canvas.height) > 0.5) {
        done = true;
        canvas.style.opacity = '0';
        const tip = document.getElementById('scratch-tip');
        if (tip) tip.innerHTML = '🎉 Save the Date — 28 December 2026!';
        celebrate();

        // Smoothly scroll to the Groom & Bride details section after a short delay
        setTimeout(function () {
          const storySection = document.getElementById('s-story');
          if (storySection) {
            storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1800);
      }
    }

    canvas.addEventListener('mousedown',  function (e) { isDown = true; scratch(getXY(e)); });
    canvas.addEventListener('mousemove',  function (e) { if (isDown) scratch(getXY(e)); });
    canvas.addEventListener('mouseup',    function ()  { isDown = false; });
    canvas.addEventListener('mouseleave', function ()  { isDown = false; });
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); isDown = true; scratch(getXY(e)); }, { passive: false });
    canvas.addEventListener('touchmove',  function (e) { e.preventDefault(); if (isDown) scratch(getXY(e)); }, { passive: false });
    canvas.addEventListener('touchend',   function ()  { isDown = false; });

    setTimeout(resize, 100);
  }

  /* ══════════════════════════════════════════════════
     7. CONFETTI CELEBRATION
     ══════════════════════════════════════════════════ */
  function celebrate() {
    const clrs = ['#a3803b','#bfa265','#d4bc87','#6e7d69','#8fa08b','#ffffff','#faf7ee'];
    for (let i = 0; i < 60; i++) {
      setTimeout(function () {
        const el   = document.createElement('div');
        const size = 4 + Math.random() * 8;
        const isHeart = Math.random() > 0.7;
        el.textContent = isHeart ? '❤' : '';
        el.style.cssText = [
          'position:fixed','pointer-events:none','z-index:9999',
          isHeart ? 'font-size:14px' : ('width:' + size + 'px;height:' + size + 'px'),
          isHeart ? '' : 'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px'),
          isHeart ? '' : 'background:' + clrs[~~(Math.random() * clrs.length)],
          'left:' + (20 + Math.random() * 60) + 'vw',
          'top:45vh',
          'transition:all 2s cubic-bezier(0.1,0.8,0.3,1)',
          'opacity:1'
        ].join(';');
        document.body.appendChild(el);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.left      = (5 + Math.random() * 90) + 'vw';
            el.style.top       = (5 + Math.random() * 90) + 'vh';
            el.style.opacity   = '0';
            el.style.transform = 'rotate(' + ~~(Math.random() * 400) + 'deg) scale(0.2)';
          });
        });
        setTimeout(function () { el.remove(); }, 2200);
      }, i * 40);
    }
  }

  /* ══════════════════════════════════════════════════
     8. COUNTDOWN
     ══════════════════════════════════════════════════ */
  function pad(n, w) { return String(n).padStart(w || 2, '0'); }

  function updateCountdown() {
    const diff = WEDDING - new Date();
    if (diff <= 0) return;
    const days = Math.floor(diff / 864e5);
    const hrs  = Math.floor((diff % 864e5) / 36e5);
    const mins = Math.floor((diff % 36e5)  / 6e4);
    const secs = Math.floor((diff % 6e4)   / 1e3);
    flipVal('cd-d', pad(days, 3));
    flipVal('cd-h', pad(hrs));
    flipVal('cd-m', pad(mins));
    flipVal('cd-s', pad(secs));
  }

  function flipVal(id, val) {
    const el = document.getElementById(id);
    if (!el || el.textContent === val) return;
    el.style.transform = 'translateY(-100%) perspective(400px) rotateX(45deg)';
    el.style.opacity   = '0';
    el.style.transition= 'none';
    setTimeout(function () {
      el.textContent   = val;
      el.style.transition = 'transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease';
      el.style.transform  = 'translateY(0) perspective(400px) rotateX(0)';
      el.style.opacity    = '1';
    }, 100);
  }

  /* ══════════════════════════════════════════════════
     9. UNION RINGS SCROLL INTERLOCK
     ══════════════════════════════════════════════════ */
  let ringsLocked = false;

  function handleUnionRings(scrollY) {
    const section = document.getElementById('s-union');
    if (!section) return;

    const rect     = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));

    const leftRing  = document.getElementById('url');
    const rightRing = document.getElementById('urr');
    if (!leftRing || !rightRing) return;

    // Move from 60px apart → 0
    const shift = (1 - progress) * 62;
    leftRing.style.transform  = 'translateX(-' + shift.toFixed(1) + 'px)';
    rightRing.style.transform = 'translateX('  + shift.toFixed(1) + 'px)';

    if (progress > 0.55 && !ringsLocked) {
      ringsLocked = true;
      document.getElementById('union-spark').classList.add('lit');
      document.getElementById('union-msg').classList.add('revealed');
    }
  }

  /* ══════════════════════════════════════════════════
     10. GALLERY LIGHTBOX
     ══════════════════════════════════════════════════ */
  function initLightbox() {
    const lb    = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const close = document.getElementById('lb-close');

    document.querySelectorAll('.gal-item').forEach(function (item) {
      item.addEventListener('click', function () {
        const img = item.querySelector('img');
        if (img && img.naturalWidth > 0) {
          lbImg.src = item.dataset.src;
          lb.classList.add('open');
        }
      });
    });

    close.addEventListener('click', function () { lb.classList.remove('open'); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  }

  /* ══════════════════════════════════════════════════
     11. MUSIC
     ══════════════════════════════════════════════════ */
  let isPlaying = false;

  function tryPlay() {
    bgMusic.volume = 0.45;
    try {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          setMusicState(true);
        }).catch(function () {
          setMusicState(false);
        });
      } else {
        setMusicState(true);
      }
    } catch (e) {
      console.log("tryPlay invocation threw an error:", e);
      setMusicState(false);
    }
  }

  function setMusicState(state) {
    isPlaying       = state;
    icoPlay.style.display  = state ? 'none'  : 'block';
    icoPause.style.display = state ? 'block' : 'none';
  }

  musicBtn.addEventListener('click', function () {
    if (isPlaying) { bgMusic.pause(); setMusicState(false); }
    else           { bgMusic.play();  setMusicState(true);  }
  });

  /* ══════════════════════════════════════════════════
     12. GALLERY ITEM 3D TILT ON CURSOR
     ══════════════════════════════════════════════════ */
  document.querySelectorAll('.gal-item').forEach(function (item) {
    item.addEventListener('mousemove', function (e) {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const y = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      /* Gentle tilt only — no translateZ (breaks masonry columns) */
      item.style.transform = 'rotateX(' + (y * -3) + 'deg) rotateY(' + (x * 4) + 'deg) scale(1.02)';
      item.style.boxShadow = '0 20px 50px rgba(192,20,60,0.18)';
    });
    item.addEventListener('mouseleave', function () {
      item.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.6s ease';
      item.style.transform  = 'rotateX(0) rotateY(0) scale(1)';
      item.style.boxShadow  = '';
    });
  });

  /* ══════════════════════════════════════════════════
     13. RSVP SECTION
     ══════════════════════════════════════════════════ */
  (function initRSVP() {
    // PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL HERE:
    var GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzS27Zu-L8ugLGM-HUxgmmZLN3bt_NSQZ4ATvMx--NRpIPWbb27uOAQMgalLaC-2lyc/exec";

    var form         = document.getElementById('rsvp-form');
    var nameInput    = document.getElementById('rsvp-name');
    var phoneInput   = document.getElementById('rsvp-phone');
    var msgInput     = document.getElementById('rsvp-msg');
    var submitBtn    = document.getElementById('rsvp-submit');
    var attendYes    = document.getElementById('attend-yes');
    var attendNo     = document.getElementById('attend-no');
    var eventsWrap   = document.getElementById('rsvp-events-wrap');
    var errorEl      = document.getElementById('rsvp-error');

    // Reject popup
    var rejectPopup  = document.getElementById('rsvp-popup');
    var rejectClose  = document.getElementById('rsvp-popup-close');
    var rejectName   = document.getElementById('rsvp-popup-name');

    // Accept popup
    var acceptPopup  = document.getElementById('rsvp-accept-popup');
    var acceptClose  = document.getElementById('rsvp-accept-close');
    var acceptName   = document.getElementById('rsvp-accept-name');

    if (!form) return;

    /* ── Show/hide events grid based on attendance choice ── */
    function handleAttendanceChange() {
      if (attendYes.checked) {
        eventsWrap.classList.add('open');
      } else {
        eventsWrap.classList.remove('open');
      }
    }

    attendYes.addEventListener('change', handleAttendanceChange);
    attendNo.addEventListener('change', handleAttendanceChange);

    /* ── Open / close popups ── */
    function openPopup(el) {
      el.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closePopup(el) {
      el.classList.remove('open');
      document.body.style.overflow = '';
    }

    rejectClose.addEventListener('click', function () { closePopup(rejectPopup); });
    acceptClose.addEventListener('click', function () { closePopup(acceptPopup); });

    // Close on backdrop click
    rejectPopup.addEventListener('click', function (e) { if (e.target === rejectPopup) closePopup(rejectPopup); });
    acceptPopup.addEventListener('click', function (e) { if (e.target === acceptPopup) closePopup(acceptPopup); });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePopup(rejectPopup);
        closePopup(acceptPopup);
      }
    });

    /* ── Form submit ── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.textContent = '';

      var name = nameInput.value.trim();
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var message = msgInput ? msgInput.value.trim() : '';
      var attending = document.querySelector('input[name="attending"]:checked');

      // Validation
      if (!name) {
        errorEl.textContent = '✦ Please enter your name to continue.';
        nameInput.focus();
        nameInput.style.borderColor = '#d63e72';
        return;
      }
      nameInput.style.borderColor = '';

      if (!attending) {
        errorEl.textContent = '✦ Please let us know if you will be attending.';
        return;
      }

      var isAttending = attending.value === 'yes';
      var checkedEvents = [];

      if (isAttending) {
        var eventCheckboxes = form.querySelectorAll('input[name="events"]:checked');
        if (eventCheckboxes.length === 0) {
          errorEl.textContent = '✦ Please select at least one event you will attend.';
          return;
        }
        eventCheckboxes.forEach(function (cb) {
          checkedEvents.push(cb.value);
        });
      }

      // Show loading state
      var originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Saving RSVP... 💌';
      submitBtn.style.opacity = '0.7';

      var payload = {
        name: name,
        phone: phone,
        attending: attending.value,
        events: checkedEvents,
        message: message
      };

      // Clean up interface and display popup
      function handlePostSubmit() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.style.opacity = '';

        if (isAttending) {
          acceptName.textContent = '— ' + name + ' —';
          openPopup(acceptPopup);
          celebrate();
        } else {
          rejectName.textContent = '— ' + name + ' —';
          openPopup(rejectPopup);
          spawnRejectHearts();
        }

        form.reset();
        eventsWrap.classList.remove('open');
      }

      if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'YOUR_APP_SCRIPT_URL_HERE') {
        var submitted = false;
        // 5s timeout fallback
        var timeoutId = setTimeout(function () {
          if (!submitted) {
            submitted = true;
            console.warn('RSVP sheet submission timed out. Proceeding optimistically.');
            handlePostSubmit();
          }
        }, 5000);

        fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function () {
          if (!submitted) {
            submitted = true;
            clearTimeout(timeoutId);
            handlePostSubmit();
          }
        })
        .catch(function (err) {
          console.error('Error submitting RSVP:', err);
          if (!submitted) {
            submitted = true;
            clearTimeout(timeoutId);
            handlePostSubmit();
          }
        });
      } else {
        console.log('Google Sheet URL not configured yet. Payload:', payload);
        setTimeout(handlePostSubmit, 800);
      }
    });


    /* ── Broken hearts on decline ── */
    function spawnRejectHearts() {
      var symbols = ['💔', '🥺', '😢', '✉️'];
      for (var i = 0; i < 12; i++) {
        (function (idx) {
          setTimeout(function () {
            var el = document.createElement('div');
            el.textContent = symbols[idx % symbols.length];
            el.style.cssText = [
              'position:fixed', 'pointer-events:none', 'z-index:9999',
              'font-size:' + (18 + Math.random() * 16) + 'px',
              'left:' + (20 + Math.random() * 60) + 'vw',
              'top:60vh',
              'transition:all 2s cubic-bezier(0.1,0.8,0.3,1)',
              'opacity:1'
            ].join(';');
            document.body.appendChild(el);
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                el.style.left    = (10 + Math.random() * 80) + 'vw';
                el.style.top     = (15 + Math.random() * 50) + 'vh';
                el.style.opacity = '0';
                el.style.transform = 'scale(0.3) rotate(' + (Math.random() * 60 - 30) + 'deg)';
              });
            });
            setTimeout(function () { el.remove(); }, 2200);
          }, idx * 120);
        })(i);
      }
    }

  })(); // end initRSVP

})();

