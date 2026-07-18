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

  // 기본 정보
  setEl('result-symbol', z.symbol);
  setEl('result-name', z.name);
  setEl('result-date', z.dateRange);
  setEl('result-element', z.element);
  setEl('result-planet', z.planet);
  setEl('result-stone', z.guardianStone);
  setEl('result-color', z.guardianColor);
  setEl('result-animal', z.guardianAnimal);
  setEl('result-lucky', z.luckyNumber);

  // 특성 카드
  const traitsEl = document.getElementById('result-traits');
  if (traitsEl && z.traits) {
    traitsEl.innerHTML = z.traits.map(t =>
      '<div style="display:flex; gap:10px; align-items:flex-start; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.07);">' +
        '<span style="font-size:22px; flex-shrink:0;">' + t.icon + '</span>' +
        '<div>' +
          '<div style="font-size:13px; font-weight:700; margin-bottom:3px;">' + t.title + '</div>' +
          '<div style="font-size:12px; color:rgba(255,255,255,0.65); line-height:1.6;">' + t.desc + '</div>' +
        '</div>' +
      '</div>'
    ).join('');
  }

  // 능력치 바 (data.js 키: leadership, sensitivity, activity, creativity, sociability)
  ['leadership','sensitivity','activity','creativity','sociability'].forEach(stat => {
    const barEl = document.getElementById('stat-bar-' + stat);
    const valEl = document.getElementById('stat-val-' + stat);
    if (z.stats && z.stats[stat] != null) {
      setTimeout(() => { if (barEl) barEl.style.width = z.stats[stat] + '%'; }, 100);
      if (valEl) valEl.textContent = z.stats[stat];
    }
  });

  // 쿠팡 링크
  const cpBtn = document.getElementById('result-coupang-btn');
  if (cpBtn && z.coupang) cpBtn.href = z.coupang;

  // 운세 데이터 미리 계산 (잠금 해제 시 사용)
  window._zodiacKey = key;
  window._zodiacData = z;
}

/* ── 잠금 해제 (쿠팡 클릭 시) ── */
function unlockFortune() {
  const key = window._zodiacKey;
  const z = window._zodiacData;
  if (!key || !z) return;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  // 오늘의 운세
  if (typeof getDailyFortune === 'function') {
    const fortune = getDailyFortune(key);
    const stars = n => '⭐'.repeat(n) + '☆'.repeat(5 - n);
    setHTML('fortune-love', stars(fortune.love.stars));
    setHTML('fortune-money', stars(fortune.money.stars));
    setHTML('fortune-health', stars(fortune.health.stars));
    setHTML('fortune-work', stars(fortune.work.stars));

    setHTML('fortune-messages',
      '💕 연애: ' + fortune.love.message + '<br>' +
      '💰 금전: ' + fortune.money.message + '<br>' +
      '💪 건강: ' + fortune.health.message + '<br>' +
      '💼 직업: ' + fortune.work.message
    );
    setEl('fortune-lucky-color', fortune.luckyColor.name);
    setEl('fortune-lucky-num', fortune.luckyNumber);
    setEl('fortune-advice', fortune.advice);
  }

  // 연간 운세 (자동 연도)
  const currentYear = new Date().getFullYear();
  const yearlyKey = 'yearly' + currentYear;
  const yearly = z[yearlyKey] || z.yearly2026;
  setEl('yearly-title', currentYear + '년');
  if (yearly) {
    setEl('yearly-overall', yearly.overall);
    setEl('yearly-love', yearly.love);
    setEl('yearly-money', yearly.money);
    setEl('yearly-health', yearly.health);
    setEl('yearly-work', yearly.work);
  }

  // 궁합 TOP3
  const compatTop = document.getElementById('result-compat-top');
  if (compatTop && z.compatibility && z.compatibility.top3) {
    compatTop.innerHTML = z.compatibility.top3.map((c, i) => {
      const partner = ZODIAC[c.sign];
      if (!partner) return '';
      return '<div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.07);">' +
        '<span style="font-size:28px;">' + partner.symbol + '</span>' +
        '<div>' +
          '<div style="font-size:13px; font-weight:700;">' + ['💕 1위','👍 2위','😊 3위'][i] + ' ' + partner.name + '</div>' +
          '<div style="font-size:12px; color:rgba(255,255,255,0.65); margin-top:2px;">' + c.reason + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // 주의 별자리
  const avoid = z.compatibility && z.compatibility.avoid;
  if (avoid) {
    const avoidZ = ZODIAC[avoid.sign];
    if (avoidZ) {
      setHTML('result-compat-avoid',
        avoidZ.symbol + ' <b>' + avoidZ.name + '</b> — ' + avoid.reason
      );
    }
  }

  // 잠금 배너 숨기고 운세 섹션 표시
  const banner = document.getElementById('lock-banner');
  const section = document.getElementById('fortune-section');
  if (banner) banner.style.display = 'none';
  if (section) {
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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
  const gradeObj = getCompatGrade(score);

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  setEl('compat-symbol-a', myZ.symbol);
  setEl('compat-symbol-b', partZ.symbol);
  setEl('compat-name-a', myZ.name);
  setEl('compat-name-b', partZ.name);
  setEl('compat-score-num', score);
  setEl('compat-grade', gradeObj.emoji + ' ' + gradeObj.label);

  const detailEl = document.getElementById('compat-detail-text');
  if (detailEl) {
    detailEl.textContent = myZ.name + '과(와) ' + partZ.name + '의 궁합은 '
      + (score >= 85 ? '최고예요! 별들이 두 분의 인연을 강하게 축복하고 있어요 ✨'
        : score >= 70 ? '좋은 편이에요. 서로를 이해하며 함께 성장할 수 있는 관계예요 🌙'
        : score >= 55 ? '보통이에요. 노력과 배려로 더 좋아질 수 있는 관계예요 😊'
        : '주의가 필요해요. 하지만 이해와 존중으로 극복할 수 있어요 💪');
  }

  const goodData = score >= 70
    ? ['감정적으로 서로를 자연스럽게 이해해요', '함께할 때 시너지 에너지가 넘쳐요', '공통 관심사가 많아 대화가 즐거워요']
    : score >= 55
    ? ['서로의 부족한 점을 채워줄 수 있어요', '다른 시각이 새로운 자극이 돼요', '함께 성장하는 파트너가 될 수 있어요']
    : ['인내심을 키워주는 관계예요', '서로에게서 배울 점이 많아요', '극복하면 더 단단해지는 사이가 돼요'];

  const cautionData = score >= 70
    ? ['너무 비슷해 의존도가 높아질 수 있어요', '새로운 자극과 도전이 필요할 수 있어요']
    : score >= 55
    ? ['소통 방식의 차이로 오해가 생길 수 있어요', '서로의 페이스 차이를 인정해야 해요']
    : ['가치관 차이로 마찰이 생길 수 있어요', '충분한 대화와 이해가 꼭 필요해요', '감정적인 반응을 조절하는 연습이 필요해요'];

  const goodList = document.getElementById('compat-good-list');
  const cautionList = document.getElementById('compat-caution-list');
  if (goodList) goodList.innerHTML = goodData.map(t => '<li>' + t + '</li>').join('');
  if (cautionList) cautionList.innerHTML = cautionData.map(t => '<li>' + t + '</li>').join('');

  const cpBtn = document.getElementById('compat-coupang-btn');
  if (cpBtn) cpBtn.href = (myZ.coupang || '#');

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
