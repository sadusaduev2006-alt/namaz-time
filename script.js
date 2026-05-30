// Координаты Махачкалы
const LATITUDE = 42.9849;
const LONGITUDE = 47.5046;
const METHOD = 16; // ДУМ РФ

// Запасные данные (примерное время для Махачкалы, если API недоступен)
const FALLBACK_TIMINGS = {
    Fajr: "02:00",
    Sunrise: "04:15",
    Dhuhr: "11:50",
    Asr: "15:50",
    Maghrib: "19:25",
    Isha: "21:35"
};

let prayerTimes = {};
let fallbackUsed = false;

// Получение текущей даты
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Функция запроса с повторными попытками (для iPhone)
async function fetchWithRetry(url, maxAttempts = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // Таймаут 10 секунд для мобильных устройств
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
            console.log(`Попытка ${attempt} не удалась:`, error.message);
            
            if (attempt === maxAttempts) break;
            
            // Задержка между попытками
            const delay = attempt * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

// Основная функция получения времени
async function fetchPrayerTimes() {
    const dateString = getCurrentDate();
    const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=${METHOD}&timezone=Europe/Moscow`;
    
    try {
        console.log("Загружаем время намаза...");
        const data = await fetchWithRetry(url, 3);
        
        if (data && data.code === 200) {
            const timings = data.data.timings;
            prayerTimes = timings;
            fallbackUsed = false;
            
            // Обновляем UI
            updateUIWithTimings(timings, data.data);
            console.log("Данные успешно загружены из API");
        } else {
            throw new Error("Неверный ответ от API");
        }
    } catch (error) {
        console.error("Ошибка загрузки из API, используем запасные данные:", error);
        
        // Используем запасные данные
        prayerTimes = FALLBACK_TIMINGS;
        fallbackUsed = true;
        
        // Обновляем UI с запасными данными
        updateUIWithFallback();
        
        // Показываем уведомление, что используются запасные данные
        showNetworkWarning();
    }
    
    // Устанавливаем таймеры на азан
    if (Object.keys(prayerTimes).length > 0) {
        setupAzanTimers(prayerTimes);
        calculateNearestPrayer(prayerTimes);
    }
}

// Обновление интерфейса с данными из API
function updateUIWithTimings(timings, fullData) {
    document.getElementById('fajr').innerText = timings.Fajr;
    document.getElementById('sunrise').innerText = timings.Sunrise;
    document.getElementById('dhuhr').innerText = timings.Dhuhr;
    document.getElementById('asr').innerText = timings.Asr;
    document.getElementById('maghrib').innerText = timings.Maghrib;
    document.getElementById('isha').innerText = timings.Isha;
    
    // Даты
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    document.getElementById('currentDate').innerHTML = `📆 ${formattedDate}`;
    
    if (fullData && fullData.date && fullData.date.hijri) {
        document.getElementById('gregorianDate').innerHTML = `${fullData.date.hijri.date} г.х.`;
    }
    
    const updateTime = new Date();
    document.getElementById('updateTime').innerText = `${updateTime.getHours().toString().padStart(2, '0')}:${updateTime.getMinutes().toString().padStart(2, '0')}`;
}

// Обновление интерфейса с запасными данными
function updateUIWithFallback() {
    document.getElementById('fajr').innerText = FALLBACK_TIMINGS.Fajr;
    document.getElementById('sunrise').innerText = FALLBACK_TIMINGS.Sunrise;
    document.getElementById('dhuhr').innerText = FALLBACK_TIMINGS.Dhuhr;
    document.getElementById('asr').innerText = FALLBACK_TIMINGS.Asr;
    document.getElementById('maghrib').innerText = FALLBACK_TIMINGS.Maghrib;
    document.getElementById('isha').innerText = FALLBACK_TIMINGS.Isha;
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    document.getElementById('currentDate').innerHTML = `📆 ${formattedDate} (приблизительно)`;
    document.getElementById('gregorianDate').innerHTML = `данные загружены из кеша`;
}

// Показываем предупреждение о сети
function showNetworkWarning() {
    const footer = document.querySelector('.footer-note');
    if (footer && !document.querySelector('.network-warning')) {
        const warning = document.createElement('p');
        warning.className = 'network-warning';
        warning.style.color = '#B67B4A';
        warning.style.fontSize = '11px';
        warning.style.marginTop = '8px';
        warning.innerHTML = '⚠️ Используются примерные данные. Проверьте интернет-соединение.';
        footer.appendChild(warning);
        
        // Скрыть через 5 секунд
        setTimeout(() => {
            warning.style.opacity = '0';
            setTimeout(() => warning.remove(), 1000);
        }, 5000);
    }
}

// Таймеры азана
let azanTimers = [];

function setupAzanTimers(timings) {
    azanTimers.forEach(timer => clearTimeout(timer));
    azanTimers = [];
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    prayers.forEach(prayerName => {
        const timeStr = timings[prayerName];
        if (!timeStr) return;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        let prayerTotalMinutes = hours * 60 + minutes;
        let azanTimeMinutes = prayerTotalMinutes - 5;
        
        if (azanTimeMinutes <= currentTotalMinutes) return;
        
        const targetDate = new Date(now);
        targetDate.setHours(Math.floor(azanTimeMinutes / 60), azanTimeMinutes % 60, 0, 0);
        const delay = targetDate.getTime() - now.getTime();
        
        if (delay > 0 && delay < 86400000) {
            const timer = setTimeout(() => {
                playAzan(prayerName);
            }, delay);
            azanTimers.push(timer);
        }
    });
}

function playAzan(prayerName) {
    const prayerNames = { 'Fajr': 'Фаджр', 'Dhuhr': 'Зухр', 'Asr': 'Аср', 'Maghrib': 'Магриб', 'Isha': 'Иша' };
    const russianName = prayerNames[prayerName] || prayerName;
    
    if (Notification.permission === 'granted') {
        new Notification(`🕌 Время намаза ${russianName} через 5 минут!`, {
            body: 'Приготовьтесь к намазу',
            icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    const audio = document.getElementById('azanAudio');
    if (audio) {
        audio.play().catch(e => console.log('Автовоспроизведение заблокировано'));
    }
    
    if (document.hidden) {
        alert(`🕌 Внимание! Через 5 минут намаз ${russianName}`);
    }
}

// Ближайший намаз
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
    if (minutesLeft <= 0) {
        document.getElementById('countdownText').innerHTML = "🕋 Время наступило!";
        return;
    }
    
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    
    if (hours > 0) {
        document.getElementById('countdownText').innerHTML = `${hours} ч ${minutes} мин`;
    } else {
        document.getElementById('countdownText').innerHTML = `${minutes} минут`;
    }
}

function highlightPrayer(activeId) {
    const allPrayerItems = document.querySelectorAll('.prayer-item');
    allPrayerItems.forEach(item => item.classList.remove('active'));
    
    if (activeId) {
        const activeElement = document.getElementById(activeId)?.closest('.prayer-item');
        if (activeElement) activeElement.classList.add('active');
    }
}

// Запрос разрешения на уведомления
if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
}

// Запускаем
fetchPrayerTimes();

// Обновляем таймер каждую минуту
setInterval(() => {
    if (Object.keys(prayerTimes).length > 0) {
        calculateNearestPrayer(prayerTimes);
    } else {
        fetchPrayerTimes();
    }
}, 60000);

// Обновляем данные каждый час
setInterval(() => {
    fetchPrayerTimes();
}, 3600000);
