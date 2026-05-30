// КООРДИНАТЫ МАХАЧКАЛЫ
const MAKHACHKALA = { lat: 42.9849, lng: 47.5046, method: 16, timezone: "Europe/Moscow" };

// ЗАПАСНЫЕ ДАННЫЕ (примерное время для Махачкалы в июне)
// Если интернет плохой, покажет это, но потом обновит через API
const FALLBACK_TIMES = {
    Fajr: "02:01", Sunrise: "04:14", Dhuhr: "11:51",
    Asr: "15:51", Maghrib: "19:24", Isha: "21:35"
};

// --- 1. ПОКАЗЫВАЕМ ЗАПАСНЫЕ ДАННЫЕ МГНОВЕННО (чтобы экран не был пустым) ---
function showFallbackData() {
    console.log("Показываем сохраненное время для Махачкалы");
    document.getElementById('fajr').innerText = FALLBACK_TIMES.Fajr;
    document.getElementById('sunrise').innerText = FALLBACK_TIMES.Sunrise;
    document.getElementById('dhuhr').innerText = FALLBACK_TIMES.Dhuhr;
    document.getElementById('asr').innerText = FALLBACK_TIMES.Asr;
    document.getElementById('maghrib').innerText = FALLBACK_TIMES.Maghrib;
    document.getElementById('isha').innerText = FALLBACK_TIMES.Isha;
    
    const today = new Date();
    document.getElementById('currentDate').innerHTML = `📆 ${today.toLocaleDateString('ru-RU')}`;
    document.getElementById('gregorianDate').innerHTML = `Время для Махачкалы`;
    
    // Запускаем логику ближайшего намаза с запасными данными
    calculateNearestPrayer(FALLBACK_TIMES);
}

// --- 2. ФУНКЦИЯ ЗАПРОСА (СПЕЦИАЛЬНО ДЛЯ SAFARI) ---
async function fetchRealTimes() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    
    // Формируем ссылку напрямую, без сложных параметров
    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${MAKHACHKALA.lat}&longitude=${MAKHACHKALA.lng}&method=${MAKHACHKALA.method}`;
    
    try {
        console.log("Пытаемся загрузить реальное время...");
        // Добавляем специальный параметр 'cache: "no-store"', чтобы Safari не кешировал ошибку
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();
        
        if (data && data.code === 200 && data.data && data.data.timings) {
            const timings = data.data.timings;
            console.log("Реальное время загружено!", timings);
            
            // Обновляем экран реальным временем
            document.getElementById('fajr').innerText = timings.Fajr;
            document.getElementById('sunrise').innerText = timings.Sunrise;
            document.getElementById('dhuhr').innerText = timings.Dhuhr;
            document.getElementById('asr').innerText = timings.Asr;
            document.getElementById('maghrib').innerText = timings.Maghrib;
            document.getElementById('isha').innerText = timings.Isha;
            
            // Обновляем даты (хиджру)
            if(data.data.date && data.data.date.hijri) {
                document.getElementById('gregorianDate').innerHTML = `${data.data.date.hijri.date} г.х.`;
            }
            document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
            
            // Пересчитываем ближайший намаз с новыми данными
            calculateNearestPrayer(timings);
            return timings;
        } else {
            throw new Error("API вернул пустые данные");
        }
    } catch (error) {
        console.error("Ошибка загрузки с API (iPhone), оставляем запасные данные:", error);
        // Оставляем запасные данные (они уже на экране)
        document.getElementById('gregorianDate').innerHTML = `данные локально`;
        document.getElementById('updateTime').innerText = 'кеш';
        return FALLBACK_TIMES;
    }
}

// --- 3. ЛОГИКА БЛИЖАЙШЕГО НАМАЗА (скопировано из твоего кода, без изменений) ---
function calculateNearestPrayer(timings) {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Фаджр', time: timings.Fajr, id: 'fajr' },
        { name: 'Зухр', time: timings.Dhuhr, id: 'dhuhr' },
        { name: 'Аср', time: timings.Asr, id: 'asr' },
        { name: 'Магриб', time: timings.Maghrib, id: 'maghrib' },
        { name: 'Иша', time: timings.Isha, id: 'isha' }
    ];
    
    const prayerTimesInMinutes = prayers.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        return { ...prayer, totalMinutes: hours * 60 + minutes };
    });
    
    let nextPrayer = null;
    for (let prayer of prayerTimesInMinutes) {
        if (prayer.totalMinutes > currentTotalMinutes) {
            nextPrayer = prayer;
            break;
        }
    }
    
    if (!nextPrayer) {
        nextPrayer = prayerTimesInMinutes[0];
        const tomorrowMinutes = nextPrayer.totalMinutes + 24 * 60;
        const minutesLeft = tomorrowMinutes - currentTotalMinutes;
        updateCountdown(minutesLeft);
        updateNextPrayerUI(nextPrayer.name, nextPrayer.time);
        highlightPrayer(null);
        return;
    }
    
    const minutesLeft = nextPrayer.totalMinutes - currentTotalMinutes;
    updateCountdown(minutesLeft);
    updateNextPrayerUI(nextPrayer.name, nextPrayer.time);
    highlightPrayer(nextPrayer.id);
}

function updateNextPrayerUI(name, time) {
    document.getElementById('nextPrayerName').innerText = name;
    document.getElementById('nextPrayerTime').innerText = time;
}

function updateCountdown(minutesLeft) {
    if (minutesLeft <= 0) { document.getElementById('countdownText').innerHTML = "🕋 Время наступило!"; return; }
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    if (hours > 0) { document.getElementById('countdownText').innerHTML = `${hours} ч ${minutes} мин`; } 
    else { document.getElementById('countdownText').innerHTML = `${minutes} минут`; }
}

function highlightPrayer(activeId) {
    const allPrayerItems = document.querySelectorAll('.prayer-item');
    allPrayerItems.forEach(item => item.classList.remove('active'));
    if (activeId) {
        const activeElement = document.getElementById(activeId)?.closest('.prayer-item');
        if (activeElement) activeElement.classList.add('active');
    }
}

// --- 4. ЗАПУСК (СРАЗУ ПОКАЗЫВАЕМ ЗАПАСНЫЕ, ПОТОМ ЗАГРУЖАЕМ РЕАЛЬНЫЕ) ---
showFallbackData();        // Мгновенно показываем время для Махачкалы
fetchRealTimes();          // Фоновый запрос реального времени

// Обновляем счетчик каждую минуту
setInterval(() => {
    const fajrTime = document.getElementById('fajr').innerText;
    if (fajrTime !== '--:--') {
        const currentTimes = {
            Fajr: document.getElementById('fajr').innerText,
            Dhuhr: document.getElementById('dhuhr').innerText,
            Asr: document.getElementById('asr').innerText,
            Maghrib: document.getElementById('maghrib').innerText,
            Isha: document.getElementById('isha').innerText
        };
        calculateNearestPrayer(currentTimes);
    }
}, 60000);
