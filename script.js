/**
 * Nature Green Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : '';
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');

    // If useCurtain is false, skip the curtain entirely
    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      initFallingLeaves();
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;

    btn.addEventListener('click', () => {
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        curtain.classList.add('is-hidden');
        initFallingLeaves();
      }, 1400);
    });

    document.body.classList.add('no-scroll');
  }

  /* ═══════════════════════════════════════════
     Falling Leaves Animation
     ═══════════════════════════════════════════ */

  function initFallingLeaves() {
    const canvas = $('#leafCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    const leaves = [];
    const LEAF_COUNT = 20;

    // Leaf color palette: green and golden tones
    const leafColors = [
      { fill: 'rgba(139, 158, 126, 0.6)', stroke: 'rgba(74, 94, 59, 0.3)' },   // sage green
      { fill: 'rgba(74, 94, 59, 0.5)', stroke: 'rgba(58, 75, 46, 0.3)' },       // forest green
      { fill: 'rgba(168, 184, 158, 0.5)', stroke: 'rgba(139, 158, 126, 0.3)' },  // light sage
      { fill: 'rgba(180, 165, 120, 0.5)', stroke: 'rgba(139, 115, 85, 0.3)' },   // golden
      { fill: 'rgba(160, 175, 130, 0.5)', stroke: 'rgba(100, 120, 70, 0.3)' },   // yellow-green
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Leaf {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height * -1 : -30;
        this.size = 10 + Math.random() * 14;
        this.speedY = 0.4 + Math.random() * 0.8;
        this.speedX = -0.2 + Math.random() * 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.025;
        this.oscillateAmp = 25 + Math.random() * 35;
        this.oscillateSpeed = 0.008 + Math.random() * 0.015;
        this.oscillateOffset = Math.random() * Math.PI * 2;
        this.opacity = 0.15 + Math.random() * 0.35;
        this.t = 0;
        this.colorSet = leafColors[Math.floor(Math.random() * leafColors.length)];
        this.leafType = Math.floor(Math.random() * 3); // 3 leaf shape variants
      }

      update() {
        this.t++;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.t * this.oscillateSpeed + this.oscillateOffset) * 0.4;
        this.rotation += this.rotSpeed;
        if (this.y > height + 30) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        const s = this.size;

        if (this.leafType === 0) {
          // Oval leaf
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.5);
          ctx.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.5, s * 0.4, 0, s * 0.5);
          ctx.bezierCurveTo(-s * 0.5, s * 0.4, -s * 0.5, -s * 0.4, 0, -s * 0.5);
          ctx.fillStyle = this.colorSet.fill;
          ctx.fill();
          // Vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.45);
          ctx.lineTo(0, s * 0.45);
          ctx.strokeStyle = this.colorSet.stroke;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (this.leafType === 1) {
          // Pointed leaf
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.6);
          ctx.bezierCurveTo(s * 0.4, -s * 0.2, s * 0.35, s * 0.3, 0, s * 0.6);
          ctx.bezierCurveTo(-s * 0.35, s * 0.3, -s * 0.4, -s * 0.2, 0, -s * 0.6);
          ctx.fillStyle = this.colorSet.fill;
          ctx.fill();
          // Vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.5);
          ctx.lineTo(0, s * 0.5);
          ctx.strokeStyle = this.colorSet.stroke;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else {
          // Round leaf
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 0.35, s * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = this.colorSet.fill;
          ctx.fill();
          // Vein
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.4);
          ctx.lineTo(0, s * 0.4);
          ctx.moveTo(0, -s * 0.1);
          ctx.lineTo(s * 0.2, -s * 0.25);
          ctx.moveTo(0, 0.1);
          ctx.lineTo(-s * 0.2, -s * 0.05);
          ctx.strokeStyle = this.colorSet.stroke;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < LEAF_COUNT; i++) {
      leaves.push(new Leaf());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      leaves.forEach(l => {
        l.update();
        l.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    $('#heroPhoto').src = 'images/hero/1.jpg';
    $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    $('#heroDate').textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    $('#heroVenue').textContent = CONFIG.wedding.venue;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;

      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '0';
        $('#countMinutes').textContent = '0';
        $('#countSeconds').textContent = '0';
        labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $('#countDays').textContent = days;
      $('#countHours').textContent = String(hours).padStart(2, '0');
      $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    $('#greetingTitle').textContent = CONFIG.greeting.title;
    $('#greetingContent').textContent = CONFIG.greeting.content;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentLine(father, mother, fatherDeceased, motherDeceased) {
      const fd = fatherDeceased ? ' deceased' : '';
      const md = motherDeceased ? ' deceased' : '';
      return `<span class="${fd}">${father}</span> · <span class="${md}">${mother}</span>`;
    }

    const parentsHTML = `
      <div class="parent-row">
        ${parentLine(g.father, g.mother, g.fatherDeceased, g.motherDeceased)}
        <span class="parent-dot">●</span>
        의 아들 <span class="child-name">${g.name}</span>
      </div>
      <div class="parent-row">
        ${parentLine(b.father, b.mother, b.fatherDeceased, b.motherDeceased)}
        <span class="parent-dot">●</span>
        의 딸 <span class="child-name">${b.name}</span>
      </div>
    `;

    $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();

    const grid = $('#calendarGrid');

    // Header
    // 월 표기는 영어 대신 '2027년 1월' 형식으로 표시
    grid.innerHTML = `<div class="calendar__header">${year}년 ${month + 1}월</div>`;

    // Weekdays
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    // Days
    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === weddingDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    $('#googleCalBtn').href = gcalUrl;

    // ICS download (Apple Calendar)
    $('#icsDownloadBtn').addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//Invitation//KO',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        'DESCRIPTION:결혼식에 초대합니다.',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding.ics';
      a.click();
      URL.revokeObjectURL(url);
      showToast('캘린더 파일이 다운로드됩니다');
    });
  }

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    const container = $('#storyPhotos');
    const placeholder = container.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story__photo-item animate-item';
      div.setAttribute('data-animate', 'fade-up');
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openPhotoModal(storyImages, i));
      container.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    const placeholder = grid.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery__item animate-item';
      div.setAttribute('data-animate', 'scale-in');
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openPhotoModal(galleryImages, i));
      grid.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();
    $('#photoModal').classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function closePhotoModal() {
    $('#photoModal').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function showModalImage() {
    const img = $('#modalImg');
    img.src = modalImages[modalIndex];
    $('#modalCounter').textContent = `${modalIndex + 1} / ${modalImages.length}`;

    $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    $('#modalClose').addEventListener('click', closePhotoModal);
    $('#modalPrev').addEventListener('click', () => modalNavigate(-1));
    $('#modalNext').addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'modalContainer') {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    // Swipe support
    const container = $('#modalContainer');

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);  // swipe left -> next
    } else {
      modalNavigate(-1); // swipe right -> prev
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    $('#locationMapImg').src = 'images/location/1.jpg';
    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Nature Green 교통 안내 (오시는 길 다음 섹션)
     별도 HTML/CSS 파일 수정 없이 자동 생성됩니다.
     ═══════════════════════════════════════════ */

  function initTransportGuide() {
    if ($('#transportGuide')) return;
    const map = $('#locationMapImg');
    if (!map) return;

    const style = document.createElement('style');
    style.id = 'transportGuideStyles';
    style.textContent = `
      #transportGuide {
        box-sizing: border-box;
        padding: 70px 18px 76px;
        background: #faf9f4;
        color: #354734;
        text-align: center;
        font-family: 'Noto Serif KR', 'Nanum Myeongjo', Georgia, serif;
      }
      #transportGuide *, #transportGuide *::before, #transportGuide *::after { box-sizing: border-box; }
      #transportGuide .tg-title { font-size: 27px; font-weight: 600; letter-spacing: .12em; margin: 0 0 8px; color: #324632; }
      #transportGuide .tg-subtitle { font: 11px Georgia, serif; letter-spacing: .38em; color: #968057; margin-bottom: 28px; }
      #transportGuide .tg-list { max-width: 520px; margin: auto; display: grid; gap: 13px; text-align: left; }
      #transportGuide .tg-card { border: 1px solid #d8d3be; border-radius: 14px; background: rgba(255,255,255,.58); padding: 22px 18px; box-shadow: 0 3px 15px rgba(39,57,35,.035); }
      #transportGuide .tg-cardhead { display: flex; align-items: center; gap: 12px; margin-bottom: 17px; padding-bottom: 13px; border-bottom: 1px solid #e5e1d4; }
      #transportGuide .tg-icon { display: grid; place-items: center; width: 37px; height: 37px; border: 1px solid #d4d1bb; border-radius: 50%; background: #eef0e5; color: #526b4a; flex-shrink: 0; }
      #transportGuide .tg-icon svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 1.7; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      #transportGuide .tg-label { font-size: 17px; font-weight: 700; color: #344a37; }
      #transportGuide .tg-en { display: block; font: 9px Georgia, serif; letter-spacing: .19em; color: #a58a55; margin-top: 3px; }
      #transportGuide .tg-content { color: #555a52; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; line-height: 1.85; overflow-wrap: anywhere; }
      #transportGuide .tg-content p { margin: 0 0 10px; }
      #transportGuide .tg-content p:last-child { margin-bottom: 0; }
      #transportGuide .tg-content strong { color: #334934; font-weight: 600; }
      #transportGuide .tg-small { color: #7c8075; font-size: 12px; }
      #transportGuide .tg-divider { border: 0; border-top: 1px solid #e7e3d8; margin: 14px 0; }
      #transportGuide .tg-schedule { display: grid; gap: 9px; margin-top: 13px; }
      #transportGuide .tg-stop { display: grid; grid-template-columns: 49px 1fr; gap: 10px; align-items: baseline; }
      #transportGuide .tg-time { color: #506e4b; font-weight: 600; font-variant-numeric: tabular-nums; }
      @media (max-width: 360px) {
        #transportGuide { padding-inline: 13px; }
        #transportGuide .tg-card { padding: 19px 14px; }
        #transportGuide .tg-content { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);

    const icons = {
      subway: '<path d="M6 17V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v11M6 17h12M8 21l2-4m6 4-2-4M8 8h8M9 13h1m4 0h1"/>',
      bus: '<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 10h14M8 22l1-3m7 3-1-3M9 15h1m4 0h1"/>',
      shuttle: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M3 11h18M7 6v5m10-5v5M7 21l1-3m9 3-1-3"/>',
      car: '<path d="M5 11l2-5h10l2 5M4 11h16a2 2 0 0 1 2 2v4H2v-4a2 2 0 0 1 2-2ZM5 17v3h3v-3m8 0v3h3v-3M6 14h2m8 0h2"/>'
    };
    const icon = (type) => `<span class="tg-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[type]}</svg></span>`;
    const card = (type, title, en, body) => `
      <article class="tg-card">
        <div class="tg-cardhead">${icon(type)}<div><div class="tg-label">${title}</div><span class="tg-en">${en}</span></div></div>
        <div class="tg-content">${body}</div>
      </article>`;

    const section = document.createElement('section');
    section.id = 'transportGuide';
    section.setAttribute('aria-label', '교통 안내');
    section.innerHTML = `
      <h2 class="tg-title">교통 안내</h2>
      <div class="tg-subtitle">TRANSPORT GUIDE</div>
      <div class="tg-list">
        ${card('subway','지하철','SUBWAY',`
          <p><strong>1호선 구로역 하차 → 1번 출구 방향</strong><br>NC백화점(구 AK플라자) 방면 연결통로 이용 → 신구로자이 리치몰(구 나인스에비뉴) 1층</p>
          <p class="tg-small">신도림역(2호선) : 신도림역 환승 → 1호선 구로역 (수원, 인천 방향)<br>가산디지털단지역(7호선) : 가산디지털단지역 환승<br> → 1호선 구로역 (의정부, 청량리 방향)</p>`)}
        ${card('bus','버스','BUS',`
          <p><strong>구로역·NC신구로점 또는 구로역·나인스에비뉴 정류장 하차</strong></p>
          <p>지선버스(초록): 5615, 5626, 5630, 5712, 5714, 6512, 6613<br>간선버스(파랑): 503, 571<br>공항버스: 6003<br>마을버스: 구로09, 구로13</p>`)}
        ${card('shuttle','전세버스 (제천-서울)','SHUTTLE BUS',`
          <div class="tg-schedule">
            <div class="tg-stop"><span class="tg-time">08:00</span><span>그린코아루아파트 정문 출발</span></div>
            <div class="tg-stop"><span class="tg-time">08:05</span><span>제천경찰서 앞 경유</span></div>
            <div class="tg-stop"><span class="tg-time">10:30</span><span>예식장 도착</span></div>
            <div class="tg-stop"><span class="tg-time">13:30</span><span>예식장 출발</span></div>
            <div class="tg-stop"><span class="tg-time">15:30</span><span>제천 도착</span></div>
          </div>`)}
        ${card('car','자가용','CAR',`
          <p><strong>내비게이션: ‘더에끌라프리베’</strong><br>또는 ‘서울시 구로구 구로동 501’ 검색</p>
          <p>서울시 구로구 구로중앙로 134<br>신구로자이 리치몰(구 나인스에비뉴) 1층</p>
          <p>본 건물 지하 주차장 이용 시 <strong>2시간 무료</strong></p>
          <hr class="tg-divider">
          <p class="tg-small">서해안고속도로: 일직분기점에서 서부간선도로 성산대교 방향으로 진입 → 영등포역/구로역 방면 → 구로역에서 구로구청/고대구로병원 방면 우회전 후 약 300m</p>
          <p class="tg-small">경인고속도로: 신월IC 지하차도 옆길로 직진 → 경인고속도로 목동사거리에서 목동역 방향 우회전 → 구로역 방면 직진 → 구로역에서 구로구청/고대구로병원 방향으로 직진 후 우회전</p>`)}
      </div>
    `;

    // 지도가 포함된 기존 오시는 길 섹션 다음에 배치합니다.
    const locationSection = map.closest('section') || map.closest('.section');
    if (locationSection && locationSection.parentNode) {
      locationSection.insertAdjacentElement('afterend', section);
    } else {
      const address = $('#locationAddress');
      const anchor = (address && address.parentElement) || map.parentElement;
      anchor.insertAdjacentElement('afterend', section);
    }
  }

  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    // 신랑측 및 신부측 어머니 계좌만 화면에서 제외 (CONFIG 데이터는 보존)
    accounts.filter((acc) => {
      const role = String(acc.role || '').replace(/\s+/g, '');
      return !(/어머니|모친|(^|[()\[\]·:：-])모($|[()\[\]·:：-])|^모$/.test(role));
    }).forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ''}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ''}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    // Copy account delegates
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');

    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Observe initial static items
    $$('.animate-item').forEach((el) => observer.observe(el));

    // Re-observe after dynamic content is added (MutationObserver)
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('animate-item')) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.animate-item').forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    // Show loading placeholders while detecting images
    showLoadingPlaceholders();

    // Init sections that don't depend on image detection
    initPhotoModal();
    initLocation();
    initTransportGuide();
    initAccounts();
    initFooter();
    initScrollAnimations();

    // Set story text immediately (photos load async)
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    // Auto-detect story and gallery images in parallel
    const [storyImages, galleryImages] = await Promise.all([
      loadImagesFromFolder('story'),
      loadImagesFromFolder('gallery')
    ]);

    // Render sections with discovered images
    initStory(storyImages);
    initGallery(galleryImages);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();