// ==================== ОСНОВНЫЕ ДАННЫЕ ====================
let currentCityName = "Махачкала";
let prayerTimes = {};
let scheduleData = null;
let usingFallback = false;

// Запасные данные на случай ошибки
const fallbackTimes = {
    "Махачкала": { Fajr: "02:07", Sunrise: "04:14", Dhuhr: "11:51", Asr: "15:51", Maghrib: "19:24", Isha: "21:06" }
};

// ==================== ЗАГРУЗКА РАСПИСАНИЯ ====================
async function loadSchedule() {
    try {
        const response = await fetch('schedule.json');
        scheduleData = await response.json();
        console.log("Расписание загружено");
        return true;
    } catch (error) {
        console.error("Не удалось загрузить расписание:", error);
        return false;
    }
}

function getTodaysTimes() {
    if (!scheduleData) return null;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    try {
        const monthData = scheduleData[year]?.[month];
        if (monthData && monthData[day]) {
            const times = monthData[day];
            return {
                Fajr: times.fajr,
                Sunrise: times.sunrise || "",
                Dhuhr: times.dhuhr,
                Asr: times.asr,
                Maghrib: times.maghrib,
                Isha: times.isha
            };
        }
    } catch (e) {
        console.error("Ошибка получения даты:", e);
    }
    return null;
}

async function updatePrayerTimesFromSchedule() {
    if (!scheduleData) {
        await loadSchedule();
    }
    
    const todaysTimes = getTodaysTimes();
    if (todaysTimes) {
        prayerTimes = todaysTimes;
        usingFallback = false;
    } else {
        prayerTimes = fallbackTimes[currentCityName];
        usingFallback = true;
        console.log("Используем запасные данные");
    }
    updatePrayerTimesDisplay();
}

function updatePrayerTimesDisplay() {
    if (prayerTimes) {
        document.getElementById('fajr').innerText = prayerTimes.Fajr || "--:--";
        document.getElementById('sunrise').innerText = prayerTimes.Sunrise || "--:--";
        document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr || "--:--";
        document.getElementById('asr').innerText = prayerTimes.Asr || "--:--";
        document.getElementById('maghrib').innerText = prayerTimes.Maghrib || "--:--";
        document.getElementById('isha').innerText = prayerTimes.Isha || "--:--";
    }
    document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', async () => {
    // --- ВЫБОР ГОРОДА (пока только Махачкала) ---
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.value = "Махачкала";
        citySelect.disabled = true; // пока другие города не добавлены в расписание
    }
    
    await updatePrayerTimesFromSchedule();
    
    // Обновляем каждый час
    setInterval(updatePrayerTimesFromSchedule, 3600000);
    
    // Обновляем время в подвале каждую минуту
    setInterval(() => {
        document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }, 60000);
    
    // Обновляем в полночь
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    setTimeout(() => {
        updatePrayerTimesFromSchedule();
        setInterval(updatePrayerTimesFromSchedule, 86400000);
    }, msUntilMidnight);
    
    // ========== ОСТАЛЬНЫЕ ФУНКЦИИ ==========
    // ... (профиль, компас, тема, уведомления, меню) ...
    // Я их не удалял, просто здесь они не показаны для краткости
    // Они остаются такими же, как в твоём последнем рабочем script.js
});
