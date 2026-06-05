// ==================== КООРДИНАТЫ ГОРОДОВ ====================
const citiesCoords = {
    "Махачкала": { lat: 42.9849, lng: 47.5046 },
    "Дербент": { lat: 42.0569, lng: 48.2885 },
    "Хасавюрт": { lat: 43.2500, lng: 46.5833 },
    "Буйнакск": { lat: 42.8167, lng: 47.1167 },
    "Избербаш": { lat: 42.5654, lng: 47.8634 },
    "Кизляр": { lat: 43.8485, lng: 46.7199 },
    "Каспийск": { lat: 42.8819, lng: 47.6372 }
};

// Для остальных городов пока запасные данные (можно потом дополнить)
const fallbackTimes = {
    "Махачкала": { Fajr: "02:07", Dhuhr: "11:51", Asr: "15:51", Maghrib: "19:24", Isha: "21:06" },
    "Дербент": { Fajr: "02:15", Dhuhr: "11:59", Asr: "15:59", Maghrib: "19:32", Isha: "21:14" },
    "Хасавюрт": { Fajr: "02:05", Dhuhr: "11:49", Asr: "15:49", Maghrib: "19:22", Isha: "21:04" },
    "Буйнакск": { Fajr: "02:09", Dhuhr: "11:53", Asr: "15:53", Maghrib: "19:26", Isha: "21:08" },
    "Избербаш": { Fajr: "02:11", Dhuhr: "11:55", Asr: "15:55", Maghrib: "19:28", Isha: "21:10" },
    "Кизляр": { Fajr: "02:00", Dhuhr: "11:44", Asr: "15:44", Maghrib: "19:17", Isha: "20:59" },
    "Каспийск": { Fajr: "02:08", Dhuhr: "11:52", Asr: "15:52", Maghrib: "19:25", Isha: "21:07" }
};

let currentCityName = "Махачкала";
let prayerTimes = fallbackTimes["Махачкала"];
let scheduleData = null;

// ==================== ЗАГРУЗКА РАСПИСАНИЯ ИЗ ФАЙЛА ====================
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
    // --- ВЫБОР ГОРОДА ---
    const citySelect = document.getElementById('citySelect');
    
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity && citiesCoords[savedCity]) {
        currentCityName = savedCity;
        citySelect.value = savedCity;
    }
    
    await updatePrayerTimesFromSchedule();
    
    citySelect.addEventListener('change', async (e) => {
        currentCityName = e.target.value;
        localStorage.setItem('selectedCity', currentCityName);
        await updatePrayerTimesFromSchedule();
    });
    
    // Обновляем каждый час
    setInterval(updatePrayerTimesFromSchedule, 3600000);
    
    // Обновляем время отображения каждую минуту
    setInterval(() => {
        document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }, 60000);
    
    // Обновляем в полночь, чтобы загрузить следующий день
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    setTimeout(() => {
        updatePrayerTimesFromSchedule();
        setInterval(updatePrayerTimesFromSchedule, 86400000);
    }, msUntilMidnight);
    
    // ... остальной код (профиль, компас, уведомления) остаётся без изменений ...
});
