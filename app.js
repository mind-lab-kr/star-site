// ===================== 배경 효과 =====================
function initTwinkle() {
  const layer = document.getElementById('twinkle-layer');
  if (!layer) return;
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.style.cssText = `
      position:absolute;
      width:${Math.random()*3+1}px;
      height:${Math.random()*3+1}px;
      background:#fff;
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      opacity:${Math.random()*0.7+0.3};
      animation:twinkle ${Math.random()*3+2}s infinite alternate;
    `;
    layer.appendChild(s);
  }
}

function initShootingStar() {
  const canvas = document.getElementById('shooting-star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  const stars = [];
  function spawnStar() {
    stars.push({ x: Math.random()*canvas.width, y: 0, len: Math.random()*150+80, speed: Math.random()*6+4, angle: Math.PI/4, alpha: 1 });
  }
  setInterval(spawnStar, 2500);
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s, i) => {
      s.x += Math.cos(s.angle)*s.speed;
      s.y += Math.sin(s.angle)*s.speed;
      s.alpha -= 0.012;
      if (s.alpha <= 0) { stars.splice(i, 1); return; }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle)*s.len, s.y - Math.sin(s.angle)*s.len);
      ctx.stroke();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===================== 홈 페이지 =====================
function initHome() {
  initTwinkle();
  initShootingStar();

  const monthSel = document.getElementById('month-select');
  const daySel = document.getElementById('day-select');
  const btn = document.getElementById('check-btn');
  const signListEl = document.getElementById('sign-list');

  // 월 옵션
  if (monthSel) {
    for (let m = 1; m <= 12; m++) {
      const op = document.createElement('option');
      op.value = m; op.textContent = m + '월';
      monthSel.appendChild(op);
    }
  }
  // 일 옵션
  function updateDays() {
    if (!daySel) return;
    const m = parseInt(monthSel?.value || 1);
    const days = [31,29,31,30,31,30,31,31,30,31,30,31][m-1] || 31;
    daySel.innerHTML = '';
    for (let d = 1; d <= days; d++) {
      const op = document.createElement('option');
      op.value = d; op.textContent = d + '일';
      daySel.appendChild(op);
    }
  }
  if (monthSel) { monthSel.addEventListener('change', updateDays); updateDays(); }

  // 별자리 그리드
  if (signListEl) {
    signListEl.className = 'sign-grid';
    ZODIAC_ORDER.forEach(key => {
      const z = ZODIAC[key];
      const a = document.createElement('a');
      a.href = `result.html?sign=${key}`;
      a.className = 'sign-card';
      a.innerHTML = `
        <span class="sign-symbol">${z.symbol}</span>
        <span class="sign-name">${z.name}</span>
        <span class="sign-date">${z.dateRange}</span>
      `;
      signListEl.appendChild(a);
    });
  }

  // 날짜로 별자리 찾기 버튼
  if (btn) {
    btn.addEventListener('click', () => {
      const m = parseInt(monthSel?.value || 0);
      const d = parseInt(daySel?.value || 0);
      if (!m || !d) return;
      const key = getZodiacKeyByDate(m, d);
      if (key) window.location.href = `result.html?sign=${key}`;
    });
  }
}

// ===================== 결과 페이지 =====================
const TOTAL_SLIDES = 6;
const COUPANG_SLIDE = 3;
let currentSlide = 1;
let fortuneUnlocked = false;

function initResult() {
  initTwinkle();
  initShootingStar();

  const params = new URLSearchParams(window.location.search);
  const key = params.get('sign');
  if (!key || !ZODIAC[key]) {
    window.location.href = 'index.html';
    return;
  }

  const z = ZODIAC[key];

  // 기본 정보
  document.getElementById('result-symbol').textContent = z.symbol;
  document.getElementById('result-name').textContent = z.name;
  document.getElementById('result-date').textContent = z.dateRange;

  const elEl = document.getElementById('result-element');
  if (elEl) elEl.textContent = z.element || '';
  const plEl = document.getElementById('result-planet');
  if (plEl) plEl.textContent = z.planet || '';

  // 특성 뱃지 (traits는 {icon, title, desc} 객체 배열)
  const traitsEl = document.getElementById('result-traits');
  if (traitsEl && z.traits) {
    traitsEl.innerHTML = z.traits.map(t => {
      if (typeof t === 'object') return `<span class="trait-badge">${t.icon || ''} ${t.title || ''}</span>`;
      return `<span class="trait-badge">${t}</span>`;
    }).join('');
  }

  // 별자리 설명 (있으면 표시)
  const descEl = document.getElementById('result-description');
  if (descEl && z.description) descEl.textContent = z.description;

  // ⭐ 능력치 바
  renderStatBars(z);

  // 수호 아이템
  const stoneEl = document.getElementById('result-stone');
  const colorEl = document.getElementById('result-color');
  const animalEl = document.getElementById('result-animal');
  const luckyEl = document.getElementById('result-lucky');
  if (stoneEl) stoneEl.textContent = z.guardianStone || '';
  if (colorEl) colorEl.textContent = z.guardianColor || '';
  if (animalEl) animalEl.textContent = z.guardianAnimal || '';
  if (luckyEl) {
    const luckyNums = z.luckyNumbers || (z.luckyNumber !== undefined ? [z.luckyNumber] : []);
    luckyEl.textContent = luckyNums.join(', ');
  }

  initSlideNav(key, z);
}

// ===================== 능력치 바 렌더 =====================
function renderStatBars(z) {
  if (!z.stats) return;
  const statMap = {
    leadership: ['stat-bar-leadership', 'stat-val-leadership'],
    sensitivity: ['stat-bar-sensitivity', 'stat-val-sensitivity'],
    activity:    ['stat-bar-activity',    'stat-val-activity'],
    creativity:  ['stat-bar-creativity',  'stat-val-creativity'],
    sociability: ['stat-bar-sociability', 'stat-val-sociability'],
  };
  Object.entries(statMap).forEach(([statKey, [barId, valId]]) => {
    const bar = document.getElementById(barId);
    if (bar) bar.style.width = '0%';
  });
  setTimeout(() => {
    Object.entries(statMap).forEach(([statKey, [barId, valId]]) => {
      const val = z.stats[statKey] || 0;
      const bar = document.getElementById(barId);
      const valEl = document.getElementById(valId);
      if (bar) bar.style.width = val + '%';
      if (valEl) valEl.textContent = val;
    });
  }, 100);
}

// ===================== 슬라이드 네비게이션 =====================
function initSlideNav(key, z) {
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  const dotsEl = document.getElementById('slide-dots');

  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let i = 1; i <= TOTAL_SLIDES; i++) {
      const dot = document.createElement('span');
      dot.className = 'slide-dot' + (i === 1 ? ' active' : '');
      dot.dataset.slide = i;
      dotsEl.appendChild(dot);
    }
  }

  updateSlideNav();

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 1) goToSlide(currentSlide - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentSlide === COUPANG_SLIDE && !fortuneUnlocked) {
        // 쿠팡 새탭 열기 후 운세 공개
        const coupangUrl = z.coupang || '#';
        window.open(coupangUrl, '_blank');
        unlockFortune(key, z);
        setTimeout(() => goToSlide(currentSlide + 1), 400);
        return;
      }
      if (currentSlide < TOTAL_SLIDES) goToSlide(currentSlide + 1);
    });
  }
}

function goToSlide(n) {
  if (n < 1 || n > TOTAL_SLIDES) return;
  currentSlide = n;

  document.querySelectorAll('.slide').forEach(slide => {
    slide.classList.remove('active');
  });
  const target = document.querySelector(`.slide[data-slide="${n}"]`);
  if (target) {
    // fadeInUp 애니메이션 재생을 위해 리플로우 강제
    target.classList.remove('active');
    void target.offsetWidth;
    target.classList.add('active');
  }

  if (n === 2) renderStatBarsIfNeeded();

  updateSlideNav();
}

function renderStatBarsIfNeeded() {
  document.querySelectorAll('.stat-bar').forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    void bar.offsetWidth;
    bar.style.width = width;
  });
}

function updateSlideNav() {
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  const progressEl = document.getElementById('slide-progress-text');

  if (prevBtn) prevBtn.disabled = currentSlide === 1;
  if (nextBtn) {
    nextBtn.disabled = currentSlide === TOTAL_SLIDES;
    nextBtn.textContent = (currentSlide === COUPANG_SLIDE && !fortuneUnlocked) ? '운세 공개하기 🔓' : '다음 →';
  }
  if (progressEl) progressEl.textContent = `${currentSlide} / ${TOTAL_SLIDES}`;

  document.querySelectorAll('.slide-dot').forEach(dot => {
    dot.classList.toggle('active', Number(dot.dataset.slide) === currentSlide);
  });
}

// ===================== 운세 공개 =====================
function unlockFortune(key, z) {
  if (fortuneUnlocked) return;
  fortuneUnlocked = true;

  const lockHint = document.getElementById('lock-hint');
  if (lockHint) lockHint.textContent = '✅ 운세가 공개되었어요! 다음 버튼을 눌러 확인해보세요';

  // 오늘의 운세 계산
  const fortune = getDailyFortune(key);

  // 별점 렌더
  function stars(n) { return '⭐'.repeat(n) + '☆'.repeat(5 - n); }

  const fl = document.getElementById('fortune-love');
  const fm = document.getElementById('fortune-money');
  const fh = document.getElementById('fortune-health');
  const fw = document.getElementById('fortune-work');
  if (fl) fl.textContent = stars(fortune.love.stars);
  if (fm) fm.textContent = stars(fortune.money.stars);
  if (fh) fh.textContent = stars(fortune.health.stars);
  if (fw) fw.textContent = stars(fortune.work.stars);

  // 운세 메시지 (오늘의 조언)
  const msgEl = document.getElementById('fortune-message');
  if (msgEl) msgEl.textContent = fortune.advice || '';

  // 행운 색상 (객체면 .name으로 읽기)
  const lcEl = document.getElementById('fortune-lucky-color');
  if (lcEl) {
    const lc = fortune.luckyColor;
    lcEl.textContent = (lc && typeof lc === 'object') ? (lc.name || '') : (lc || '');
  }

  // 연간 운세 (현재 연도 자동)
  const currentYear = new Date().getFullYear();
  const yearly = z.yearlyForecast?.[currentYear] || z['yearly' + currentYear] || z.yearly2026 || null;
  const yearlyEl = document.getElementById('fortune-yearly');
  const yearlyDetailEl = document.getElementById('fortune-yearly-detail');
  const yearLabelEl = document.getElementById('yearly-year-label');
  if (yearLabelEl) yearLabelEl.textContent = currentYear + '년 연간 운세';

  if (yearlyEl) {
    if (typeof yearly === 'string') {
      yearlyEl.textContent = yearly;
    } else if (yearly && typeof yearly === 'object') {
      yearlyEl.textContent = yearly.overall || '';
    } else {
      yearlyEl.textContent = '올 한 해도 별자리의 기운을 받아 좋은 일이 가득하길 바랍니다!';
    }
  }

  if (yearlyDetailEl) {
    if (yearly && typeof yearly === 'object') {
      const items = [
        ['💕 연애', yearly.love],
        ['💰 금전', yearly.money],
        ['💪 건강', yearly.health],
        ['💼 직업', yearly.work],
      ];
      yearlyDetailEl.innerHTML = items
        .filter(([, text]) => !!text)
        .map(([label, text]) => `
          <div class="yearly-detail-item">
            <div class="yearly-detail-label">${label}</div>
            <div class="yearly-detail-text">${text}</div>
          </div>
        `).join('');
    } else {
      yearlyDetailEl.innerHTML = '';
    }
  }

  // 궁합 TOP 3 + 주의 별자리
  const compatEl = document.getElementById('result-compat-list');
  const avoidEl = document.getElementById('result-avoid');
  if (z.compatibility) {
    const top3 = z.compatibility.top3 || [];
    if (compatEl) {
      compatEl.innerHTML = top3.map(item => {
        const skey = typeof item === 'object' ? item.sign : item;
        const reason = typeof item === 'object' ? item.reason : '';
        const cz = ZODIAC[skey];
        if (!cz) return '';
        return `<div class="compat-item good">${cz.symbol} <b>${cz.name}</b> 💕${reason ? `<div class="compat-reason">${reason}</div>` : ''}</div>`;
      }).join('');
    }

    if (avoidEl) {
      const avoidList = Array.isArray(z.compatibility.avoid) ? z.compatibility.avoid : (z.compatibility.avoid ? [z.compatibility.avoid] : []);
      avoidEl.innerHTML = avoidList.map(item => {
        const skey = typeof item === 'object' ? item.sign : item;
        const reason = typeof item === 'object' ? item.reason : '';
        const cz = ZODIAC[skey];
        if (!cz) return '';
        return `<div class="compat-item caution">${cz.symbol} <b>${cz.name}</b> ⚠️${reason ? `<div class="compat-reason">${reason}</div>` : ''}</div>`;
      }).join('');
    }
  }
}

// ===================== 궁합 페이지 =====================
function initCompat() {
  initTwinkle();
  initShootingStar();

  const sel1 = document.getElementById('compat-sign1');
  const sel2 = document.getElementById('compat-sign2');
  const btn = document.getElementById('compat-btn');

  if (sel1 && sel2) {
    ZODIAC_ORDER.forEach(key => {
      const z = ZODIAC[key];
      [sel1, sel2].forEach(sel => {
        const op = document.createElement('option');
        op.value = key;
        op.textContent = z.symbol + ' ' + z.name;
        sel.appendChild(op);
      });
    });
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const k1 = sel1?.value;
      const k2 = sel2?.value;
      if (!k1 || !k2) return;
      showCompat(k1, k2);
    });
  }
}

function showCompat(k1, k2) {
  const z1 = ZODIAC[k1];
  const z2 = ZODIAC[k2];
  if (!z1 || !z2) return;

  const score = getCompatScore(k1, k2);
  const grade = getCompatGrade(score);

  const s1El = document.getElementById('compat-sym1');
  const s2El = document.getElementById('compat-sym2');
  const n1El = document.getElementById('compat-name1');
  const n2El = document.getElementById('compat-name2');
  const scoreEl = document.getElementById('compat-score');
  const gradeEl = document.getElementById('compat-grade');
  const resultEl = document.getElementById('compat-result');

  if (s1El) s1El.textContent = z1.symbol;
  if (s2El) s2El.textContent = z2.symbol;
  if (n1El) n1El.textContent = z1.name;
  if (n2El) n2El.textContent = z2.name;
  if (scoreEl) scoreEl.textContent = score + '점';
  if (gradeEl) gradeEl.textContent = grade;
  if (resultEl) { resultEl.style.display = 'block'; resultEl.scrollIntoView({ behavior: 'smooth' }); }
}

// ===================== 라우팅 =====================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  else if (page === 'result') initResult();
  else if (page === 'compat') initCompat();
});
