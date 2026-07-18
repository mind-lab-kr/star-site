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
  // 월 선택
  const monthEl = document.getElementById('month-select');
  const dayEl = document.getElementById('day-select');
  if (!monthEl || !dayEl) return;

  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = m;
    monthEl.appendChild(opt);
  });

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

  // 별자리 목록 렌더링
  const signList = document.getElementById('sign-list');
  if (signList && typeof SIGNS !== 'undefined') {
    SIGNS.forEach(s => {
      const a = document.createElement('a');
      a.href = `result.html?sign=${s.key}`;
      a.className = 'sign-item';
      a.innerHTML = `<span class="sign-symbol">${s.symbol}</span><span class="sign-name">${s.name}</span><span class="sign-date">${s.date}</span>`;
      signList.appendChild(a);
    });
  }

  // 내 별자리 알아보기 버튼
  const btn = document.getElementById('find-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const m = parseInt(monthEl.value);
      const d = parseInt(dayEl.value);
      const sign = SIGNS.find(s => {
        const [sm, sd] = s.date.split('~')[0].split('/').map(Number);
        const [em, ed] = s.date.split('~')[1].split('/').map(Number);
        if (sm <= em) return (m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em);
        return (m === sm && d >= sd) || (m === em && d <= ed) || m > sm || m < em;
      });
      if (sign) window.location.href = `result.html?sign=${sign.key}`;
    });
  }
}

// ── 궁합 페이지 초기화 ──
function initCompat() {
  const myEl = document.getElementById('my-sign-select');
  const ptEl = document.getElementById('partner-sign-select');
  if (!myEl || !ptEl) return;
  SIGNS.forEach(s => {
    [myEl, ptEl].forEach(el => {
      const opt = document.createElement('option');
      opt.value = s.key;
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
  const mySign = SIGNS.find(s => s.key === myKey);
  const ptSign = SIGNS.find(s => s.key === ptKey);
  const data = COMPAT_DATA[myKey + '_' + ptKey];
  if (!data || !mySign || !ptSign) return;

  document.getElementById('compat-symbol-a').textContent = mySign.symbol;
  document.getElementById('compat-symbol-b').textContent = ptSign.symbol;
  document.getElementById('compat-name-pair').textContent = mySign.name + ' ♥ ' + ptSign.name;
  document.getElementById('compat-score-num').textContent = data.score + '점';

  const grade = data.score >= 90 ? '💖 최상의 궁합'
    : data.score >= 80 ? '💕 좋은 궁합'
    : data.score >= 65 ? '💛 무난한 궁합'
    : '💙 노력이 필요한 궁합';
  document.getElementById('compat-grade').textContent = grade;
  document.getElementById('compat-detail-text').textContent = data.detail;

  const goodUl = document.getElementById('compat-good-list');
  const cautionUl = document.getElementById('compat-caution-list');
  goodUl.innerHTML = '';
  cautionUl.innerHTML = '';
  data.good.forEach(t => { const li = document.createElement('li'); li.textContent = '✔ ' + t; goodUl.appendChild(li); });
  data.caution.forEach(t => { const li = document.createElement('li'); li.textContent = '• ' + t; cautionUl.appendChild(li); });

  const coupangBtn = document.getElementById('compat-coupang-btn');
  if (coupangBtn) coupangBtn.href = COUPANG_LINKS.default;

  const chartCanvas = document.getElementById('compat-radar-chart');
  if (radarChart) { radarChart.destroy(); radarChart = null; }
  radarChart = new Chart(chartCanvas, {
    type: 'radar',
    data: {
      labels: ['💗 애정', '🤝 신뢰', '💬 소통', '🔥 열정', '🌟 미래'],
      datasets: [{
        label: mySign.name,
        data: [data.radar.love, data.radar.trust, data.radar.comm, data.radar.passion, data.radar.future],
        backgroundColor: 'rgba(168,85,247,0.25)',
        borderColor: '#a855f7',
        borderWidth: 2,
        pointBackgroundColor: '#a855f7'
      }, {
        label: ptSign.name,
        data: [data.radar.love-5, data.radar.trust+4, data.radar.comm-3, data.radar.passion+6, data.radar.future-2].map(v=>Math.min(99,Math.max(40,v))),
        backgroundColor: 'rgba(244,114,182,0.2)',
        borderColor: '#f472b6',
        borderWidth: 2,
        pointBackgroundColor: '#f472b6'
      }]
    },
    options: {
      responsive: true,
      scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.15)' }, pointLabels: { color: '#e2d9f3', font: { size: 13 } }, angleLines: { color: 'rgba(255,255,255,0.15)' } } },
      plugins: { legend: { labels: { color: '#e2d9f3', font: { size: 12 } } } }
    }
  });

  const result = document.getElementById('compat-result');
  result.classList.remove('hidden-el');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'compat') {
    initCompat();
    const btn = document.getElementById('compat-btn');
    if (btn) btn.addEventListener('click', showCompat);
  }
});
