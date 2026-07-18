/* ── 별 반짝임 ── */
(function initTwinkle() {
  const layer = document.getElementById('twinkle-layer');
  if (!layer) return;
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    const size = Math.random() * 2.5 + 0.5;
    Object.assign(s.style, {
      position: 'absolute',
      width: size + 'px', height: size + 'px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,' + (Math.random() * 0.7 + 0.2) + ')',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      animation: 'twinkle ' + (Math.random() * 3 + 2) + 's ease-in-out ' + (Math.random() * 3) + 's infinite alternate'
    });
    layer.appendChild(s);
  }
  if (!document.getElementById('twinkle-style')) {
    const st = document.createElement('style');
    st.id = 'twinkle-style';
    st.textContent = '@keyframes twinkle{from{opacity:0.2;transform:scale(0.8)}to{opacity:1;transform:scale(1.2)}}';
    document.head.appendChild(st);
  }
})();

/* ── 유성 ── */
(function initShooting() {
  const canvas = document.getElementById('shooting-star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function newStar() {
    return { x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.5,
      len: Math.random() * 150 + 80, speed: Math.random() * 4 + 3,
      angle: Math.PI / 4, alpha: 1 };
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Math.random() < 0.015) stars.push(newStar());
    stars = stars.filter(s => s.alpha > 0.05);
    stars.forEach(s => {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= 0.015;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      grad.addColorStop(0, 'rgba(255,255,255,' + s.alpha + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── 홈 초기화 ── */
function initHome() {
  const monthSel = document.getElementById('month-select');
  const daySel = document.getElementById('day-select');
  const btn = document.getElementById('find-sign-btn');
  const signListEl = document.getElementById('sign-list');

  if (!monthSel || !daySel) return;

  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m + '월';
    monthSel.appendChild(opt);
  }

  function fillDays(month) {
    daySel.innerHTML = '';
    const days = [31,29,31,30,31,30,31,31,30,31,30,31][month-1] || 31;
    for (let d = 1; d <= days; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d + '일';
      daySel.appendChild(opt);
    }
  }
  fillDays(1);
  monthSel.addEventListener('change', () => fillDays(parseInt(monthSel.value)));

  /* 별자리 그리드 */
  if (signListEl && typeof ZODIAC_ORDER !== 'undefined') {
    signListEl.className = 'sign-grid';
    signListEl.innerHTML = '';
    ZODIAC_ORDER.forEach(key => {
      const z = ZODIAC[key];
      if (!z) return;
      const a = document.createElement('a');
      a.href = 'result.html?sign=' + key;
      a.className = 'sign-card';
      a.innerHTML =
        '<span class="sign-symbol">' + z.symbol + '</span>' +
        '<span class="sign-name">' + z.name + '</span>' +
        '<span class="sign-date">' + z.dateRange + '</span>';
      signListEl.appendChild(a);
    });
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const m = parseInt(monthSel.value);
      const d = parseInt(daySel.value);
      const key = getZodiacKeyByDate(m, d);
      if (key) window.location.href = 'result.html?sign=' + key;
    });
  }
}

/* ── 결과 페이지 ── */
function initResult() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('sign');
  if (!key || !ZODIAC[key]) return;
  const z = ZODIAC[key];

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  setEl('result-symbol', z.symbol);
  setEl('result-name', z.name);
  setEl('result-date', z.dateRange);
  setEl('result-element', z.element);
  setEl('result-planet', z.planet);
  setEl('result-stone', z.guardianStone);
  setEl('result-color', z.guardianColor);
  setEl('result-animal', z.guardianAnimal);
  setEl('result-lucky', z.luckyNumber ? z.luckyNumber.join(', ') : '');

  const traitsEl = document.getElementById('result-traits');
  if (traitsEl && z.traits) {
    traitsEl.innerHTML = z.traits.map(t => '<span class="trait-badge">' + t + '</span>').join('');
  }

  ['charm','lucky','social','creativity','leadership'].forEach(stat => {
    const barEl = document.getElementById('stat-bar-' + stat);
    const valEl = document.getElementById('stat-val-' + stat);
    if (z.stats && z.stats[stat] != null) {
      if (barEl) barEl.style.width = z.stats[stat] + '%';
      if (valEl) valEl.textContent = z.stats[stat];
    }
  });

  if (typeof getDailyFortune === 'function') {
    const fortune = getDailyFortune(key);
    if (fortune) {
      const stars = n => '⭐'.repeat(n) + '☆'.repeat(5 - n);
      setHTML('fortune-love', stars(fortune.love));
      setHTML('fortune-money', stars(fortune.money));
      setHTML('fortune-health', stars(fortune.health));
      setHTML('fortune-work', stars(fortune.work));
      setEl('fortune-message', fortune.message);
      setEl('fortune-lucky-color', fortune.luckyColor);
      setEl('fortune-lucky-advice', fortune.luckyAdvice);
    }
  }

  const cpBtn = document.getElementById('result-coupang-btn');
  if (cpBtn && z.coupangUrl) cpBtn.href = z.coupangUrl;
}

/* ── 궁합 초기화 ── */
function initCompat() {
  const mySel = document.getElementById('my-sign-select');
  const partSel = document.getElementById('partner-sign-select');
  if (!mySel || !partSel || typeof ZODIAC_ORDER === 'undefined') return;

  ZODIAC_ORDER.forEach(key => {
    const z = ZODIAC[key];
    [mySel, partSel].forEach(sel => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = z.symbol + ' ' + z.name;
      sel.appendChild(opt);
    });
  });

  const btn = document.getElementById('compat-btn');
  if (btn) btn.addEventListener('click', showCompat);
}

/* ── 궁합 결과 ── */
function showCompat() {
  const myKey = document.getElementById('my-sign-select').value;
  const partKey = document.getElementById('partner-sign-select').value;
  if (!myKey || !partKey) return;

  const myZ = ZODIAC[myKey];
  const partZ = ZODIAC[partKey];
  const score = getCompatScore(myKey, partKey);
  const grade = getCompatGrade(score);

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  setEl('compat-symbol-a', myZ.symbol);
  setEl('compat-symbol-b', partZ.symbol);
  setEl('compat-name-a', myZ.name);
  setEl('compat-name-b', partZ.name);
  setEl('compat-score-num', score);
  setEl('compat-grade', grade);

  const detailEl = document.getElementById('compat-detail-text');
  if (detailEl) {
    detailEl.textContent = myZ.name + '과(와) ' + partZ.name + '의 궁합은 '
      + (score >= 80 ? '매우 좋습니다! 별들이 두 분의 인연을 축복하고 있어요 ✨'
        : score >= 65 ? '좋은 편입니다. 서로의 다름을 통해 성장할 수 있는 관계예요 🌙'
        : '노력이 필요합니다. 하지만 이해와 배려로 더 깊어질 수 있어요 💪');
  }

  const goodData = score >= 80
    ? ['감정적으로 서로를 직관적으로 이해해요', '함께할 때 시너지 에너지가 넘쳐요', '공통 관심사가 많아 대화가 즐거워요']
    : score >= 65
    ? ['서로의 부족한 점을 채워줄 수 있어요', '다른 시각이 새로운 자극이 돼요', '함께 성장하는 파트너가 될 수 있어요']
    : ['인내심을 키워주는 관계예요', '서로에게서 배울 점이 많아요', '극복하면 더 단단해지는 사이가 돼요'];

  const cautionData = score >= 80
    ? ['너무 비슷해 의존도가 높아질 수 있어요', '새로운 자극과 도전이 필요할 수 있어요']
    : score >= 65
    ? ['소통 방식의 차이로 오해가 생길 수 있어요', '서로의 페이스 차이를 인정해야 해요']
    : ['가치관 차이로 마찰이 생길 수 있어요', '충분한 대화와 이해가 꼭 필요해요', '감정적인 반응을 조절하는 연습이 필요해요'];

  const goodList = document.getElementById('compat-good-list');
  const cautionList = document.getElementById('compat-caution-list');
  if (goodList) goodList.innerHTML = goodData.map(t => '<li>' + t + '</li>').join('');
  if (cautionList) cautionList.innerHTML = cautionData.map(t => '<li>' + t + '</li>').join('');

  const cpBtn = document.getElementById('compat-coupang-btn');
  if (cpBtn) cpBtn.href = (myZ.coupangUrl || '#');

  const chartCanvas = document.getElementById('compat-radar-chart');
  if (chartCanvas && typeof Chart !== 'undefined') {
    const existing = Chart.getChart(chartCanvas);
    if (existing) existing.destroy();
    const rd = n => Math.min(99, Math.max(40, score + n));
    new Chart(chartCanvas, {
      type: 'radar',
      data: {
        labels: ['애정', '신뢰', '소통', '열정', '미래'],
        datasets: [{
          data: [rd(2), rd(-5), rd(3), rd(-3), rd(1)],
          backgroundColor: 'rgba(167,139,250,0.2)',
          borderColor: 'rgba(167,139,250,0.8)',
          borderWidth: 2,
          pointBackgroundColor: '#f472b6',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, stepSize: 20 },
            grid: { color: 'rgba(255,255,255,0.1)' },
            pointLabels: { color: '#e2e8f0', font: { size: 12 } }
          }
        }
      }
    });
  }

  const resultEl = document.getElementById('compat-result');
  if (resultEl) {
    resultEl.classList.add('show');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ── 라우팅 ── */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  else if (page === 'result') initResult();
  else if (page === 'compat') initCompat();
});

