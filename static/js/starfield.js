// 배경 반짝이는 별 + 별똥별 효과 생성 (모든 페이지 공통)
(function () {
    const layer = document.getElementById("starsLayer");
    if (!layer) return;

    const STAR_COUNT = 60;
    for (let i = 0; i < STAR_COUNT; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = Math.random() * 100 + "%";
        star.style.left = Math.random() * 100 + "%";
        star.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
        star.style.animationDuration = (2 + Math.random() * 2).toFixed(2) + "s";
        layer.appendChild(star);
    }

    const SHOOTING_STAR_COUNT = 3;
    for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
        const shootingStar = document.createElement("div");
        shootingStar.className = "shooting-star";
        shootingStar.style.setProperty("--x", Math.random() * 80 + 10 + "%");
        shootingStar.style.setProperty("--y", Math.random() * 50 + "%");
        shootingStar.style.setProperty("--delay", (Math.random() * 8).toFixed(2) + "s");
        layer.appendChild(shootingStar);
    }
})();
