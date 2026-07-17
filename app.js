/* ==========================================================================
   별자리 운세 사이트 - 공통 애플리케이션 로직
   (data.js 가 먼저 로드되어 있어야 합니다)
   ========================================================================== */

/* Kakao 공유를 사용하려면 아래에 발급받은 JavaScript 키를 넣어주세요.
   비워두면 자동으로 링크 복사 / 시스템 공유로 대체됩니다. */
const KAKAO_JS_KEY = "";

/* -------------------------------------------------------------------------
   배경 애니메이션: 반짝이는 별 + 별똥별(Canvas)
   ------------------------------------------------------------------------- */
function initTwinkleStars() {
  const layer = document.getElementById("twinkle-layer");
  if (!layer) return;
  const count = window.innerWidth < 640 ? 70 : 130;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "twinkle-star";
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDuration = `${2 + Math.random() * 3}s`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    frag.appendChild(star);
  }
  layer.appendChild(frag);
}

function initShootingStars() {
  const canvas = document.getElementById("shooting-star-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let stars = [];

  function spawnStar() {
    const startX = Math.random() * w * 0.8 + w * 0.1;
    stars.push({
      x: startX,
      y: -20,
      len: Math.random() * 100 + 80,
      speed: Math.random() * 6 + 8,
      angle: Math.PI / 4 + (Math.random() * 0.15 - 0.075),
      life: 1,
    });
  }

  let lastSpawn = 0;
  function loop(ts) {
    ctx.clearRect(0, 0, w, h);

    if (ts - lastSpawn > 2500 + Math.random() * 3500) {
      spawnStar();
      lastSpawn = ts;
    }

    stars.forEach((s) => {
      const dx = Math.cos(s.angle) * s.speed;
      const dy = Math.sin(s.angle) * s.speed;
      s.x += dx;
      s.y += dy;
      s.life -= 0.012;

      const tailX = s.x - Math.cos(s.angle) * s.len;
      const tailY = s.y - Math.sin(s.angle) * s.len;

      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${Math.max(s.life, 0)})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    });

    stars = stars.filter((s) => s.life > 0 && s.y < h + 100);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* -------------------------------------------------------------------------
   공통 유틸
   ------------------------------------------------------------------------- */
function starRating(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast("링크가 복사되었어요 🔗"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("링크가 복사되었어요 🔗");
  }
}

function shareKakao(title, desc, imageUrl, linkUrl) {
  if (KAKAO_JS_KEY && window.Kakao) {
    if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: desc,
        imageUrl: imageUrl || "",
        link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
      },
      buttons: [{ title: "결과 보러가기", link: { mobileWebUrl: linkUrl, webUrl: linkUrl } }],
    });
    return;
  }
  if (navigator.share) {
    navigator.share({ title, text: desc, url: linkUrl }).catch(() => {});
  } else {
    copyToClipboard(linkUrl);
  }
}

/* -------------------------------------------------------------------------
   인덱스 페이지
   ------------------------------------------------------------------------- */
function initIndexPage() {
  const monthSelect = document.getElementById("month-select");
  const daySelect = document.getElementById("day-select");
  const form = document.getElementById("date-form");
  const grid = document.getElementById("zodiac-grid");
  const findBtn = document.getElementById("find-btn");

  if (monthSelect && daySelect) {
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = `${m}월`;
      monthSelect.appendChild(opt);
    }

    function updateDays() {
      const month = parseInt(monthSelect.value, 10);
      const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] || 31;
      const prevVal = daySelect.value;
      daySelect.innerHTML = "";
      for (let d = 1; d <= daysInMonth; d++) {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = `${d}일`;
        daySelect.appendChild(opt);
      }
      if (prevVal && prevVal <= daysInMonth) daySelect.value = prevVal;
    }

    monthSelect.value = 1;
    updateDays();
    monthSelect.addEventListener("change", updateDays);
  }

  if (grid) {
    ZODIAC_ORDER.forEach((key) => {
      const info = ZODIAC[key];
      const card = document.createElement("a");
      card.href = `result.html?sign=${key}`;
      card.className = "zodiac-card glass-card";
      card.style.setProperty("--card-color", info.color);
      card.style.setProperty("--card-glow", `${info.color}55`);
      card.innerHTML = `
        <span class="symbol">${info.symbol}</span>
        <div class="name">${info.name}</div>
        <div class="range">${info.dateRange}</div>
      `;
      grid.appendChild(card);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const month = parseInt(monthSelect.value, 10);
      const day = parseInt(daySelect.value, 10);
      const key = getZodiacKeyByDate(month, day);
      if (!key) return;

      findBtn.classList.add("active");
      setTimeout(() => {
        window.location.href = `result.html?sign=${key}`;
      }, 450);
    });
  }
}

/* -------------------------------------------------------------------------
   결과 페이지
   ------------------------------------------------------------------------- */
function initResultPage() {
  const params = new URLSearchParams(window.location.search);
  let key = params.get("sign");

  if (!key || !ZODIAC[key]) {
    const month = parseInt(params.get("month"), 10);
    const day = parseInt(params.get("day"), 10);
    key = getZodiacKeyByDate(month, day);
  }
  if (!key || !ZODIAC[key]) {
    window.location.href = "index.html";
    return;
  }

  const info = ZODIAC[key];
  document.documentElement.style.setProperty("--sign-color", info.color);

  // 헤더
  document.getElementById("result-symbol").textContent = info.symbol;
  document.getElementById("result-name").textContent = info.name;
  document.getElementById("result-range").textContent = info.dateRange;
  document.getElementById("result-element").textContent = info.element;
  document.getElementById("result-planet").textContent = info.planet;
  document.title = `${info.name} 운세 - 나의 별자리 운세`;

  // 1단계: 무료 특징 3가지
  const freeTraitEl = document.getElementById("free-traits");
  info.traits.slice(0, 3).forEach((t) => {
    freeTraitEl.appendChild(buildTraitCard(t));
  });

  // 수호 정보
  document.getElementById("guardian-stone").textContent = info.guardianStone;
  document.getElementById("guardian-color").textContent = info.guardianColor;
  document.getElementById("guardian-animal").textContent = info.guardianAnimal;
  document.getElementById("guardian-number").textContent = info.luckyNumber;

  // 2단계: 전체 특징 10가지
  const allTraitEl = document.getElementById("all-traits");
  info.traits.forEach((t) => {
    allTraitEl.appendChild(buildTraitCard(t));
  });

  // 레이더 차트
  renderRadarChart("radar-chart", [
    { label: info.name, color: info.color, stats: info.stats },
  ]);

  // 오늘의 운세
  const fortune = getDailyFortune(key);
  renderDailyFortune(fortune);

  // 2026 연간 운세
  document.getElementById("yearly-overall").textContent = info.yearly2026.overall;
  document.getElementById("yearly-love").textContent = info.yearly2026.love;
  document.getElementById("yearly-money").textContent = info.yearly2026.money;
  document.getElementById("yearly-health").textContent = info.yearly2026.health;
  document.getElementById("yearly-work").textContent = info.yearly2026.work;

  // 궁합
  const compatTopEl = document.getElementById("compat-top3");
  info.compatibility.top3.forEach((c, i) => {
    const target = ZODIAC[c.sign];
    const card = document.createElement("div");
    card.className = "compat-card glass-card";
    card.innerHTML = `
      <div class="rank">TOP ${i + 1}</div>
      <span class="symbol" style="color:${target.color}">${target.symbol}</span>
      <div class="name">${target.name}</div>
      <div class="reason">${c.reason}</div>
    `;
    compatTopEl.appendChild(card);
  });

  const avoidInfo = ZODIAC[info.compatibility.avoid.sign];
  document.getElementById("compat-avoid").innerHTML = `
    <span class="symbol" style="color:${avoidInfo.color}">${avoidInfo.symbol}</span>
    <div>
      <div class="name">${avoidInfo.name} - 조금 더 노력이 필요해요</div>
      <div class="reason">${info.compatibility.avoid.reason}</div>
    </div>
  `;

  document.getElementById("compat-detail-link").href = `compatibility.html?my=${key}`;

  // 쿠팡 배너
  document.getElementById("coupang-phrase").textContent = `${info.name}의 행운을 높여줄 오늘의 아이템 🛍️`;
  const coupangBtn = document.getElementById("coupang-btn");
  coupangBtn.addEventListener("click", () => window.open(info.coupang, "_blank"));

  // 잠금 해제 로직
  setupUnlock(info);

  // 공유
  setupShareButtons(info);
}

function buildTraitCard(trait) {
  const div = document.createElement("div");
  div.className = "trait-card glass-card";
  div.innerHTML = `
    <span class="icon">${trait.icon}</span>
    <div>
      <div class="title">${trait.title}</div>
      <div class="desc">${trait.desc}</div>
    </div>
  `;
  return div;
}

function renderDailyFortune(fortune) {
  const catMeta = {
    love: { icon: "❤️", label: "애정" },
    money: { icon: "💰", label: "금전" },
    health: { icon: "💪", label: "건강" },
    work: { icon: "💼", label: "직장" },
  };
  const gridEl = document.getElementById("today-fortune-grid");
  Object.keys(catMeta).forEach((cat) => {
    const data = fortune[cat];
    const meta = catMeta[cat];
    const card = document.createElement("div");
    card.className = "fortune-card glass-card";
    card.innerHTML = `
      <div class="f-head"><span>${meta.icon}</span><span>${meta.label}</span></div>
      <div class="stars">${starRating(data.stars)}</div>
      <div class="f-desc">${data.message}</div>
    `;
    gridEl.appendChild(card);
  });

  const luckyEl = document.getElementById("today-lucky");
  luckyEl.innerHTML = `
    <div class="lucky-badge">🔢 행운의 숫자 <span style="color:var(--sign-color)">${fortune.luckyNumber}</span></div>
    <div class="lucky-badge"><span class="color-dot" style="background:${fortune.luckyColor.hex}"></span>${fortune.luckyColor.name}</div>
    <div class="advice">${fortune.advice}</div>
  `;
}

function setupUnlock(info) {
  const overlay = document.getElementById("lock-overlay");
  const blurTarget = document.getElementById("locked-content");
  const fadeTarget = document.getElementById("fade-content");
  const unlockBtn = document.getElementById("unlock-btn");
  const countdownEl = document.getElementById("countdown-display");

  unlockBtn.addEventListener("click", () => {
    window.open(info.coupang, "_blank");
    unlockBtn.disabled = true;
    unlockBtn.style.opacity = "0.6";

    let n = 5;
    countdownEl.textContent = `잠금 해제 중... ${n}`;
    const timer = setInterval(() => {
      n -= 1;
      if (n > 0) {
        countdownEl.textContent = `잠금 해제 중... ${n}`;
      } else {
        clearInterval(timer);
        countdownEl.textContent = "🔓 잠금 해제 완료!";
        overlay.classList.add("hidden");
        blurTarget.classList.add("unlocked");
        setTimeout(() => fadeTarget.classList.add("show"), 150);
      }
    }, 1000);
  });
}

function setupShareButtons(info) {
  const kakaoBtn = document.getElementById("share-kakao");
  const copyBtn = document.getElementById("share-copy");
  const friendBtn = document.getElementById("share-friend");

  if (kakaoBtn) {
    kakaoBtn.addEventListener("click", () => {
      shareKakao(
        `${info.symbol} ${info.name} 운세`,
        `나의 별자리 운세를 확인해보세요!`,
        "",
        window.location.href
      );
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", () => copyToClipboard(window.location.href));
  }
  if (friendBtn) {
    friendBtn.addEventListener("click", () => (window.location.href = "index.html"));
  }
}

/* -------------------------------------------------------------------------
   레이더 차트 (Chart.js)
   ------------------------------------------------------------------------- */
function renderRadarChart(canvasId, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === "undefined") return null;

  const labels = ["리더십", "감수성", "활동력", "창의력", "사교성"];
  const statKeys = ["leadership", "sensitivity", "activity", "creativity", "sociability"];

  return new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: datasets.map((d) => ({
        label: d.label,
        data: statKeys.map((k) => d.stats[k]),
        backgroundColor: `${d.color}33`,
        borderColor: d.color,
        borderWidth: 2,
        pointBackgroundColor: d.color,
        pointRadius: 4,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 1200, easing: "easeOutQuart" },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, stepSize: 20 },
          grid: { color: "rgba(255,255,255,0.15)" },
          angleLines: { color: "rgba(255,255,255,0.15)" },
          pointLabels: { color: "#f4f2ff", font: { size: 12, family: "Noto Sans KR" } },
        },
      },
      plugins: {
        legend: {
          display: datasets.length > 1,
          labels: { color: "#f4f2ff", font: { family: "Noto Sans KR" } },
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------
   궁합 페이지
   ------------------------------------------------------------------------- */
const COMPAT_GOOD_POOL_HARMONY = [
  "서로의 다름을 자연스럽게 받아들이는 여유가 있어요.",
  "함께 있을 때 편안하고 안정적인 분위기를 만들어가요.",
  "위기 상황에서 서로에게 든든한 힘이 되어줘요.",
  "대화를 나눌수록 새로운 공감대를 발견하게 돼요.",
  "서로의 장점을 알아보고 아낌없이 인정해줘요.",
  "함께하는 시간 속에서 자연스러운 신뢰가 쌓여가요.",
];
const COMPAT_GOOD_POOL_CHALLENGE = [
  "서로에게 없는 부분을 채워주는 좋은 자극제가 돼요.",
  "다른 시각 덕분에 더 넓은 관점을 배우게 돼요.",
  "노력한 만큼 더 특별하고 깊은 사이로 발전할 수 있어요.",
];
const COMPAT_CAUTION_POOL = [
  "표현 방식의 차이로 오해가 생기지 않도록 대화가 필요해요.",
  "서로의 속도 차이를 인정하고 맞춰가는 노력이 필요해요.",
  "고집을 부리기보다 한 발 양보하는 마음이 도움이 돼요.",
  "사소한 일로 자존심 싸움이 생기지 않도록 주의하세요.",
  "서로의 공간과 시간을 존중해주는 것이 중요해요.",
  "감정 표현에 서툴러 마음이 잘 전달되지 않을 수 있어요.",
];

const ELEMENT_RELATION_TEXT = {
  "불|불": (a, b) => `두 사람 모두 열정 넘치는 불의 기운을 가지고 있어 화끈하고 다이나믹한 관계를 만들어가요.`,
  "흙|흙": (a, b) => `안정을 추구하는 흙의 기운이 겹쳐 현실적이고 견고한 관계를 쌓아갈 수 있어요.`,
  "바람|바람": (a, b) => `바람의 기운을 함께 가진 두 사람은 대화가 잘 통하고 지적인 교감을 나누는 사이예요.`,
  "물|물": (a, b) => `물의 기운이 겹쳐 감정적으로 깊이 연결되고 서로의 마음을 세심하게 이해해주는 관계예요.`,
  "불|바람": (a, b) => `불은 바람을 만나 더 크게 타오르듯, 서로에게 좋은 자극과 에너지를 주는 조합이에요.`,
  "흙|물": (a, b) => `흙은 물을 만나 비옥해지듯, 서로를 편안하게 감싸주며 안정감을 더해주는 조합이에요.`,
  "불|흙": (a, b) => `뜨거운 불과 단단한 흙은 서로 다른 속도로 움직여 조율이 필요한 조합이에요.`,
  "불|물": (a, b) => `타오르는 불과 차분한 물은 서로를 다스리기 쉽지 않아 이해와 노력이 많이 필요한 조합이에요.`,
  "바람|흙": (a, b) => `자유로운 바람과 안정을 추구하는 흙은 가치관의 차이를 좁혀가는 노력이 필요한 조합이에요.`,
  "바람|물": (a, b) => `바람과 물은 서로 다른 방식으로 감정을 표현해 오해가 생기기 쉬우니 배려가 필요한 조합이에요.`,
};

const HARMONIOUS_PAIRS = new Set(["불|불", "흙|흙", "바람|바람", "물|물", "불|바람", "흙|물"]);

function getElementRelationText(elA, elB) {
  const key1 = `${elA}|${elB}`;
  const key2 = `${elB}|${elA}`;
  const fn = ELEMENT_RELATION_TEXT[key1] || ELEMENT_RELATION_TEXT[key2];
  return fn ? fn() : "";
}

function isHarmonious(elA, elB) {
  return HARMONIOUS_PAIRS.has(`${elA}|${elB}`) || HARMONIOUS_PAIRS.has(`${elB}|${elA}`);
}

function pickSeeded(pool, seed, count) {
  const picked = [];
  const used = new Set();
  let i = 0;
  while (picked.length < count && i < pool.length * 3) {
    const idx = (seed + i * 17) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(pool[idx]);
    }
    i++;
  }
  return picked;
}

function computeCompatibility(keyA, keyB) {
  const a = ZODIAC[keyA];
  const b = ZODIAC[keyB];
  const score = getCompatScore(keyA, keyB);
  const grade = getCompatGrade(score);
  const harmony = isHarmonious(a.element, b.element);
  const seed = seedFromString(`${keyA}-${keyB}`);

  const elementText = keyA === keyB
    ? `같은 별자리인 두 사람은 서로를 거울처럼 이해하며 강한 공감대를 형성하는 조합이에요.`
    : getElementRelationText(a.element, b.element);

  const specificGood = [];
  const aTop = a.compatibility.top3.find((t) => t.sign === keyB);
  const bTop = b.compatibility.top3.find((t) => t.sign === keyA);
  // 두 별자리가 서로를 top3로 꼽아도, 문구 중복을 피하기 위해 하나만 채택
  if (aTop) specificGood.push(aTop.reason);
  else if (bTop) specificGood.push(bTop.reason);

  const goodPool = harmony ? COMPAT_GOOD_POOL_HARMONY : COMPAT_GOOD_POOL_CHALLENGE.concat(COMPAT_GOOD_POOL_HARMONY);
  const goodPoints = specificGood.concat(pickSeeded(goodPool, seed, 3)).slice(0, 3);

  const specificCaution = [];
  if (a.compatibility.avoid.sign === keyB) specificCaution.push(a.compatibility.avoid.reason);
  if (b.compatibility.avoid.sign === keyA && b.compatibility.avoid.reason !== specificCaution[0]) {
    specificCaution.push(b.compatibility.avoid.reason);
  }
  const cautionPoints = specificCaution.concat(pickSeeded(COMPAT_CAUTION_POOL, seed + 3, 3)).slice(0, 3);

  const detailText = `${a.name}와(과) ${b.name}의 궁합 점수는 ${score}점, ${grade.label}이에요. ${elementText} ${
    score >= 70
      ? "서로의 매력에 자연스럽게 끌리며 즐거운 시간을 함께 만들어갈 수 있는 사이예요."
      : "처음에는 낯설게 느껴질 수 있지만, 서로를 이해하려는 노력이 쌓이면 특별한 관계로 발전할 수 있어요."
  }`;

  return { score, grade, detailText, goodPoints, cautionPoints };
}

function initCompatibilityPage() {
  const mySelect = document.getElementById("my-sign-select");
  const partnerSelect = document.getElementById("partner-sign-select");
  const btn = document.getElementById("compat-btn");
  const resultWrap = document.getElementById("compat-result");

  [mySelect, partnerSelect].forEach((sel) => {
    ZODIAC_ORDER.forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${ZODIAC[key].symbol} ${ZODIAC[key].name}`;
      sel.appendChild(opt);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const myParam = params.get("my");
  if (myParam && ZODIAC[myParam]) mySelect.value = myParam;
  if (partnerSelect.value === mySelect.value) {
    partnerSelect.selectedIndex = (mySelect.selectedIndex + 1) % ZODIAC_ORDER.length;
  }

  let chartInstance = null;

  function runCompat() {
    const keyA = mySelect.value;
    const keyB = partnerSelect.value;
    const a = ZODIAC[keyA];
    const b = ZODIAC[keyB];
    const result = computeCompatibility(keyA, keyB);

    document.getElementById("compat-symbol-a").textContent = a.symbol;
    document.getElementById("compat-symbol-a").style.color = a.color;
    document.getElementById("compat-symbol-b").textContent = b.symbol;
    document.getElementById("compat-symbol-b").style.color = b.color;
    document.getElementById("compat-name-pair").textContent = `${a.name} & ${b.name}`;
    document.getElementById("compat-score-num").textContent = `${result.score}점`;
    document.getElementById("compat-grade").textContent = `${result.grade.emoji} ${result.grade.label}`;
    document.getElementById("compat-detail-text").textContent = result.detailText;

    const goodEl = document.getElementById("compat-good-list");
    goodEl.innerHTML = "";
    result.goodPoints.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p;
      goodEl.appendChild(li);
    });

    const cautionEl = document.getElementById("compat-caution-list");
    cautionEl.innerHTML = "";
    result.cautionPoints.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p;
      cautionEl.appendChild(li);
    });

    if (chartInstance) chartInstance.destroy();
    chartInstance = renderRadarChart("compat-radar-chart", [
      { label: a.name, color: a.color, stats: a.stats },
      { label: b.name, color: b.color, stats: b.stats },
    ]);

    const coupangBtn = document.getElementById("compat-coupang-btn");
    if (coupangBtn) coupangBtn.href = a.coupang;

    resultWrap.classList.remove("hidden-el");
    resultWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  btn.addEventListener("click", runCompat);

  if (myParam && ZODIAC[myParam]) {
    runCompat();
  }
}

/* -------------------------------------------------------------------------
   초기화
   ------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initTwinkleStars();
  initShootingStars();

  const page = document.body.dataset.page;
  if (page === "index") initIndexPage();
  if (page === "result") initResultPage();
  if (page === "compat") initCompatibilityPage();
});
