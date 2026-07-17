(function () {
    const revealBtn = document.getElementById("revealBtn");
    const lockedWrap = document.getElementById("lockedWrap");
    const fullResult = document.getElementById("fullResult");
    const countdownBox = document.getElementById("countdownBox");
    const popupWarning = document.getElementById("popupWarning");

    let chartRendered = false;

    function renderChart() {
        if (chartRendered) return;
        chartRendered = true;

        const canvas = document.getElementById("statsChart");
        if (!canvas || typeof Chart === "undefined") return;

        const stats = window.__ZODIAC_STATS__ || {};
        const labels = Object.keys(stats);
        const values = Object.values(stats);

        new Chart(canvas.getContext("2d"), {
            type: "radar",
            data: {
                labels: labels,
                datasets: [{
                    label: "능력치",
                    data: values,
                    backgroundColor: "rgba(198, 107, 255, 0.25)",
                    borderColor: "rgba(198, 107, 255, 0.9)",
                    pointBackgroundColor: "rgba(255, 217, 122, 0.9)",
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: "rgba(255,255,255,0.15)" },
                        angleLines: { color: "rgba(255,255,255,0.15)" },
                        pointLabels: { color: "#f0eaff", font: { size: 12 } },
                    },
                },
                plugins: {
                    legend: { display: false },
                },
            },
        });
    }

    function unlockEverything() {
        lockedWrap.classList.add("unlocked");
        fullResult.classList.add("revealed");
        renderChart();
        revealBtn.style.display = "none";
        countdownBox.classList.remove("show");
        fullResult.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function startCountdown(seconds) {
        countdownBox.classList.add("show");
        let remaining = seconds;
        countdownBox.textContent = "🔓 " + remaining + "초 후 정밀 운세가 공개됩니다...";

        const timer = setInterval(function () {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(timer);
                unlockEverything();
                return;
            }
            countdownBox.textContent = "🔓 " + remaining + "초 후 정밀 운세가 공개됩니다...";
        }, 1000);
    }

    revealBtn.addEventListener("click", function () {
        const coupangUrl = window.__COUPANG_URL__;
        const newTab = window.open(coupangUrl, "_blank", "noopener");

        // 팝업 차단 감지: 새 탭 참조가 없거나 즉시 닫힌 경우
        const openedSuccessfully = !!newTab;

        if (!openedSuccessfully) {
            popupWarning.classList.add("show");
            return;
        }

        popupWarning.classList.remove("show");
        revealBtn.disabled = true;
        startCountdown(5);
    });
})();
