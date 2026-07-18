// ── 별 배경 ──
(function() {
  const layer = document.getElementById('twinkle-layer');
  if (!layer) return;
  const style = document.createElement('style');
  style.textContent = '@keyframes tw{from{opacity:.1}to{opacity:.9}}';
  document.head.appendChild(style);
  for (let i = 0; i < 80; i++) {
    const d = document.createElement('div');
    const size = Math.random()*2+1;
    d.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:#fff;border-radius:50%;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${Math.random()*0.6+0.1};animation:tw ${Math.random()*3+2}s ${Math.random()*3}s infinite alternate`;
    layer.appendChild(d);
  }
})();

// ── 유성 ──
(function() {
  const canvas = document.getElementById('shooting-star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function randomStar() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    const len = Math.random() * 120 + 60;
    const dur = Math.random() * 600 + 400;
    const start = performance.now();
    function draw(now) {
      const p = Math.min((now - start) / dur, 1);
      ctx.save();
      ctx.globalAlpha = p < 0.5 ? p*2 : (1-p)*2;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + p*len, y + p*len*0.4);
      ctx.lineTo(x + p*len - 30, y + p*len*0.4 - 12);
      ctx.stroke();
      ctx.restore();
      if (p < 1) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
  setInterval(randomStar, 2200);
  randomStar();
})();

// ── 홈 페이지 초기화 ──
function initHome() {
  const monthEl = document.getElementById('month-select');
  const dayEl = document.getElementById('day-select');
  if (!monthEl || !dayEl) return;

  // 월 옵션 채우기
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = m;
    monthEl.appendChild(opt);
  });

  // 일 옵션 채우기
  function updateDays() {
    const m = parseInt(monthEl.value);
    const days = [31,29,31,30,31,30,31,31,30,31,30,31][m-1];
    dayEl.innerHTML = '';
    for (let d = 1; d <= days; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d + '일';
      dayEl.appendChild(opt);
    }
  }
  monthEl.addEventListener('change', updateDays);
  updateDays();

  // 12개 별자리 목록 렌더링
  const signList = document.getElementById('sign-list');
  if (signList && typeof ZODIAC_ORDER !== 'undefined') {
    ZODIAC_ORDER.forEach(key => {
      const s = ZODIAC[key];
      const a = document.createElement('a');
      a.href = `result.html?sign=${key}`;
      a.className = 'sign-item';
      a.innerHTML = `<span class="sign-symbol">${s.symbol}</span><span class="sign-name">${s.name}</span><span class="sign-date">${s.dateRange}</span>`;
      signList.appendChild(a);
    });
  }

  // 내 별자리 알아보기 버튼
  const btn = document.getElementById('find-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const m = parseInt(monthEl.value);
      const d = parseInt(dayEl.value);
      const key = getZodiacKeyByDate(m, d);
      if (key) window.location.href = `result.html?sign=${key}`;
    });
  }
}

// ── 결과 페이지 초기화 ──
function initResult() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('sign');
  if (!key || !ZODIAC[key]) return;
  const s = ZODIAC[key];

  const nameEl = document.getElementById('sign-name');
  const symbolEl = document.getElementById('sign-symbol');
  const dateEl = document.getElementById('sign-date');
  const elementEl = document.getElementById('sign-element');
  const planetEl = document.getElementById('sign-planet');

  if (nameEl) nameEl.textContent = s.name;
  if (symbolEl) symbolEl.textContent = s.symbol;
  if (dateEl) dateEl.textContent = s.dateRange;
  if (elementEl) elementEl.textContent = '원소 ' + s.element;
  if (planetEl) planetEl.textContent = '지배 행성 ' + s.planet;

  // 성격 특징
  const traitsList = document.getElementById('traits-list');
  if (traitsList && s.traits) {
    s.traits.forEach(t => {
      const div = document.createElement('div');
      div.className = 'trait-card glass-card';
      div.innerHTML = `<span class="trait-icon">${t.icon}</span><div><strong>${t.title}</strong><p>${t.desc}</p></div>`;
      traitsList.appendChild(div);
    });
  }

  // 수호 정보
  const stoneEl = document.getElementById('guardian-stone');
  const colorEl = document.getElementById('guardian-color');
  const animalEl = document.getElementById('guardian-animal');
  const luckyNumEl = document.getElementById('lucky-number');
  if (stoneEl) stoneEl.textContent = s.guardianStone;
  if (colorEl) colorEl.textContent = s.guardianColor;
  if (animalEl) animalEl.textContent = s.guardianAnimal;
  if (luckyNumEl) luckyNumEl.textContent = s.luckyNumber;

  // 오늘의 운세
  const fortune = getDailyFortune(key);
  const cats = ['love','money','health','work'];
  const catNames = { love:'💗 사랑운', money:'💰 금전운', health:'🌿 건강운', work:'💼 직장운' };
  const fortuneEl = document.getElementById('fortune-list');
  if (fortuneEl) {
    cats.forEach(cat => {
      const f = fortune[cat];
      const div = document.createElement('div');
      div.className = 'fortune-item glass-card';
      div.innerHTML = `<div class="fortune-cat">${catNames[cat]}</div><div class="fortune-stars">${'⭐'.repeat(f.stars)}${'☆'.repeat(5-f.stars)}</div><p>${f.message}</p>`;
      fortuneEl.appendChild(div);
    });
  }

  // 쿠팡 링크
  const coupangBtn = document.getElementById('coupang-btn');
  if (coupangBtn && s.coupang) coupangBtn.href = s.coupang;
}

// ── 궁합 페이지 초기화 ──
function initCompat() {
  const myEl = document.getElementById('my-sign-select');
  const ptEl = document.getElementById('partner-sign-select');
  if (!myEl || !ptEl) return;

  ZODIAC_ORDER.forEach(key => {
    const s = ZODIAC[key];
    [myEl, ptEl].forEach(el => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = s.symbol + ' ' + s.name;
      el.appendChild(opt);
    });
  });
  ptEl.selectedIndex = 1;
}

let radarChart = null;
function showCompat() {
  const myKey = document.getElementById('my-sign-select').value;
  const ptKey = document.getElementById('partner-sign-select').value;
  const mySign = ZODIAC[myKey];
  const ptSign = ZODIAC[ptKey];
  if (!mySign || !ptSign) return;

  const score = getCompatScore(myKey, ptKey);
  const grade = getCompatGrade(score);

  document.getElementById('compat-symbol-a').textContent = mySign.symbol;
  document.getElementById('compat-symbol-b').textContent = ptSign.symbol;
  document.getElementById('compat-name-pair').textContent = mySign.name + ' ♥ ' + ptSign.name;
  document.getElementById('compat-score-num').textContent = score + '점';
  document.getElementById('compat-grade').textContent = grade.emoji + ' ' + grade.label;

  // 궁합 설명
  const detailEl = document.getElementById('compat-detail-text');
  if (detailEl) {
    detailEl.textContent = `${mySign.name}과(와) ${ptSign.name}의 만남은 ${score >= 80 ? '별들이 축복하는' : score >= 65 ? '서로를 성장시키는' : '도전적이지만 배움이 있는'} 관계입니다. 두 사람이 서로의 차이를 존중하고 소통에 노력한다면 오래도록 빛나는 관계가 될 수 있습니다.`;
  }

  // 잘 맞는 점 / 주의할 점
  const goodUl = document.getElementById('compat-good-list');
  const cautionUl = document.getElementById('compat-caution-list');
  if (goodUl) {
    goodUl.innerHTML = '';
    const goods = score >= 80
      ? ['서로의 감정을 직관적으로 이해', '함께할 때 에너지가 넘침', '공통 관심사가 많아 대화가 즐거움']
      : score >= 65
      ? ['서로의 부족함을 채워줌', '다른 시각으로 새로운 자극을 줌', '함께 성장하는 파트너십']
      : ['인내심을 키워주는 관계', '서로에게 배울 점이 많음', '극복하면 더 단단해지는 사이'];
    goods.forEach(t => { const li = document.createElement('li'); li.textContent = '✔ ' + t; goodUl.appendChild(li); });
  }
  if (cautionUl) {
    cautionUl.innerHTML = '';
    const cautions = score >= 80
      ? ['너무 비슷해 자극이 부족할 수 있음', '의존도가 높아지지 않도록 주의']
      : score >= 65
      ? ['소통 방식의 차이로 오해 발생 가능', '서로의 페이스 차이를 인정할 것']
      : ['가치관 차이로 마찰이 생길 수 있음', '충분한 대화와 이해가 필수'];
    cautions.forEach(t => { const li = document.createElement('li'); li.textContent = '• ' + t; cautionUl.appendChild(li); });
  }

  // 레이더 차트
  const chartCanvas = document.getElementById('compat-radar-chart');
  if (radarChart) { radarChart.destroy(); radarChart = null; }
  if (chartCanvas && typeof Chart !== 'undefined') {
    radarChart = new Chart(chartCanvas, {
      type: 'radar',
      data: {
        labels: ['💗 애정', '🤝 신뢰', '💬 소통', '🔥 열정', '🌟 미래'],
        datasets: [{
          label: mySign.name,
          data: [score, Math.min(99,score-5), Math.min(99,score+3), Math.min(99,score-3), Math.min(99,score+2)],
          backgroundColor: 'rgba(168,85,247,0.25)',
          borderColor: '#a855f7', borderWidth: 2, pointBackgroundColor: '#a855f7'
        }, {
          label: ptSign.name,
          data: [Math.min(99,score-5), Math.min(99,score+4), Math.min(99,score-3), Math.min(99,score+6), Math.min(99,score-2)],
          backgroundColor: 'rgba(244,114,182,0.2)',
          borderColor: '#f472b6', borderWidth: 2, pointBackgroundColor: '#f472b6'
        }]
      },
      options: {
        responsive: true,
        scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.15)' }, pointLabels: { color: '#e2d9f3', font: { size: 13 } }, angleLines: { color: 'rgba(255,255,255,0.15)' } } },
        plugins: { legend: { labels: { color: '#e2d9f3', font: { size: 12 } } } }
      }
    });
  }

  // 쿠팡 버튼
  const coupangBtn = document.getElementById('compat-coupang-btn');
  if (coupangBtn) coupangBtn.href = mySign.coupang || 'https://link.coupang.com/a/fsgaGQCK0y';

  const result = document.getElementById('compat-result');
  result.classList.remove('hidden-el');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'result') initResult();
  if (page === 'compat') {
    initCompat();
    const btn = document.getElementById('compat-btn');
    if (btn) btn.addEventListener('click', showCompat);
  }
});
