// Координаты Махачкалы
const LATITUDE = 42.9849;
const LONGITUDE = 47.5046;
const METHOD = 16; // ДУМ РФ

// Хранилище времен намазов
let prayerTimes = {};
let azanTimers = [];

// Функция получения текущей даты в формате YYYY-MM-DD (реальная, не из API)
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Функция для получения времени намаза
async function fetchPrayerTimes() {
    const dateString = getCurrentDate();
    
    // Используем параметр adjustment, чтобы принудительно взять сегодняшний день
    const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=${METHOD}&timezone=Europe/Moscow`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200) {
            const timings = data.data.timings;
            prayerTimes = timings;
            
            // Показываем реальную дату с компьютера пользователя
            const today = new Date();
            const formattedDate = today.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            
            // Хиджра дата из API (она обычно правильная)
            const hijriDate = data.data.date.hijri.date;
            
            document.getElementById('fajr').innerText = timings.Fajr;
            document.getElementById('sunrise').innerText = timings.Sunrise;
            document.getElementById('dhuhr').innerText = timings.Dhuhr;
            document.getElementById('asr').innerText = timings.Asr;
            document.getElementById('maghrib').innerText = timings.Maghrib;
            document.getElementById('isha').innerText = timings.Isha;
            
            // Отображаем ПРАВИЛЬНУЮ дату (2026, а не 2030)
            document.getElementById('currentDate').innerHTML = `📆 ${formattedDate}`;
            document.getElementById('gregorianDate').innerHTML = `${hijriDate} г.х.`;
            
            const updateTime = new Date();
            document.getElementById('updateTime').innerText = `${updateTime.getHours().toString().padStart(2, '0')}:${updateTime.getMinutes().toString().padStart(2, '0')}`;
            
            // Очищаем старые таймеры азана
            azanTimers.forEach(timer => clearTimeout(timer));
            azanTimers = [];
            
            // Устанавливаем таймеры на азан за 5 минут до каждого намаза
            setupAzanTimers(timings);
            
            // Вычисляем ближайший намаз
            calculateNearestPrayer(timings);
        } else {
            showError();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showError();
    }
}

// Функция для установки таймеров азана за 5 минут до намаза
function setupAzanTimers(timings) {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    prayers.forEach(prayerName => {
        const timeStr = timings[prayerName];
        if (!timeStr) return;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        let prayerTotalMinutes = hours * 60 + minutes;
        
        // Время азана за 5 минут до намаза
        let azanTimeMinutes = prayerTotalMinutes - 5;
        
        // Если время азана уже прошло сегодня, пропускаем
        if (azanTimeMinutes <= currentTotalMinutes) return;
        
        const nowMs = now.getTime();
        const targetDate = new Date(now);
        targetDate.setHours(Math.floor(azanTimeMinutes / 60), azanTimeMinutes % 60, 0, 0);
        
        const delay = targetDate.getTime() - nowMs;
        
        if (delay > 0) {
            const timer = setTimeout(() => {
                playAzan(prayerName);
            }, delay);
            azanTimers.push(timer);
        }
    });
}

// Функция воспроизведения азана
function playAzan(prayerName) {
    // Перевод названия на русский
    const prayerNames = {
        'Fajr': 'Фаджр',
        'Dhuhr': 'Зухр',
        'Asr': 'Аср',
        'Maghrib': 'Магриб',
        'Isha': 'Иша'
    };
    
    const russianName = prayerNames[prayerName] || prayerName;
    
    // Показываем уведомление
    if (Notification.permission === 'granted') {
        new Notification(`🕌 Время намаза ${russianName} через 5 минут!`, {
            body: 'Приготовьтесь к намазу',
            icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png',
            silent: false
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // Воспроизводим азан (реальный файл азана)
    const audio = document.getElementById('azanAudio');
    if (audio) {
        // Реальная ссылка на азан (можно заменить на любую другую)
        audio.src = 'https://www.islamcan.com/audio/adhan/fajr-adhan.shtml'; // Замени на реальный MP3
        
        // ВАЖНО: Вставь реальную ссылку на MP3 файл азана, например:
        // audio.src = 'https://example.com/azan.mp3';
        
        audio.play().catch(e => console.log('Автовоспроизведение заблокировано браузером', e));
    }
    
    // Также показываем alert (на случай, если уведомления выключены)
    if (document.hidden) {
        alert(`🕌 Внимание! Через 5 минут намаз ${russianName}`);
    }
}

// Функция для определения ближайшего намаза
function calculateNearestPrayer(timings) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
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
    allPrayerItems.forEach(item => {
        item.classList.remove('active');
    });
    
    if (activeId) {
        const activeElement = document.getElementById(activeId)?.closest('.prayer-item');
        if (activeElement) {
            activeElement.classList.add('active');
        }
    }
}

function showError() {
    const times = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    times.forEach(id => {
        document.getElementById(id).innerText = '--:--';
    });
    document.getElementById('updateTime').innerText = 'ошибка';
    document.getElementById('nextPrayerName').innerText = '--';
    document.getElementById('nextPrayerTime').innerText = '--:--';
    document.getElementById('countdownText').innerText = 'Не удалось загрузить';
}

// Запрашиваем разрешение на уведомления при загрузке
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

// Обновляем данные каждый час (на случай смены дня)
setInterval(() => {
    fetchPrayerTimes();
}, 3600000);