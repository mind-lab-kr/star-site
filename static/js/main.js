(function () {
    const monthSelect = document.getElementById("monthSelect");
    const daySelect = document.getElementById("daySelect");
    if (!monthSelect || !daySelect) return;

    const DAYS_IN_MONTH = { 1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };

    monthSelect.addEventListener("change", function () {
        const month = parseInt(monthSelect.value, 10);
        const maxDay = DAYS_IN_MONTH[month] || 31;
        const currentDay = parseInt(daySelect.value, 10);

        daySelect.innerHTML = '<option value="" disabled>일</option>';
        for (let d = 1; d <= maxDay; d++) {
            const opt = document.createElement("option");
            opt.value = d;
            opt.textContent = d + "일";
            daySelect.appendChild(opt);
        }
        if (currentDay && currentDay <= maxDay) {
            daySelect.value = currentDay;
        } else {
            daySelect.selectedIndex = 0;
        }
    });
})();
