// ------------------------------------------------------------
// КОНФИГУРАЦИЯ
// ------------------------------------------------------------
let currentCity = { lat: 42.9849, lng: 47.5046, name: "Махачкала" };
let prayerTimes = {};
let lastNotifiedPrayers = new Set();

// Метод MWL (угол 18° для Фаджра, 17° для Иша)
const API_METHOD = 3; // Muslim World League

// Координаты Мекки для Киблы
const MECCA = { lat: 21.4225, lng: 39.8262 };

// ------------------------------------------------------------
// 1. ЗАГРУЗКА ВРЕМЕНИ НАМАЗА
// ------------------------------------------------------------
async function fetchPrayerTimes() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${currentCity.lat}&longitude=${currentCity.lng}&method=${API_METHOD}&timezone=Europe/Moscow`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200) {
            const timings = data.data.timings;
            prayerTimes = timings;
            
            // Обновляем UI
            document.getElementById('fajr').innerText = timings.Fajr;
            document.getElementById('sunrise').innerText = timings.Sunrise;
            document.getElementById('dhuhr').innerText = timings.Dhuhr;
            document.getElementById('asr').innerText = timings.Asr;
            document.getElementById('maghrib').innerText = timings.Maghrib;
            document.getElementById('isha').innerText = timings.Isha;
            
            // Даты
            const formattedDate = today.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            document.getElementById('currentDate').innerHTML = `📆 ${formattedDate}`;
            if (data.data.date && data.data.date.hijri) {
                document.getElementById('gregorianDate').innerHTML = `${data.data.date.hijri.date} г.х.`;
            }
            
            document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            
            // Проверяем наступление намазов (для эффекта)
            checkPrayerTimesAndNotify();
            
            // Пересчитываем ближайший намаз
            calculateNearestPrayer();
            
            // Сохраняем в localStorage для виджета
            saveToLocalStorage();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// ------------------------------------------------------------
// 2. ПРОВЕРКА НАСТУПЛЕНИЯ НАМАЗА (ЭФФЕКТ + ЗВУК)
// ------------------------------------------------------------
function checkPrayerTimesAndNotify() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    prayers.forEach(prayerName => {
        const timeStr = prayerTimes[prayerName];
        if (!timeStr) return;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;
        
        // Если намаз наступил в течение последних 2 минут и ещё не уведомляли
        if (Math.abs(currentMinutes - prayerMinutes) <= 2 && !lastNotifiedPrayers.has(prayerName)) {
            // Добавляем эффект на карточку
            const prayerId = getPrayerId(prayerName);
            const prayerElement = document.getElementById(prayerId)?.closest('.prayer-item');
            if (prayerElement) {
                prayerElement.classList.add('just-happened');
                setTimeout(() => {
                    prayerElement.classList.remove('just-happened');
                }, 1000);
            }
            
            // Воспроизводим звук уведомления
            const sound = document.getElementById('notificationSound');
            if (sound) {
                sound.play().catch(e => console.log('Звук заблокирован'));
            }
            
            lastNotifiedPrayers.add(prayerName);
        }
    });
}

function getPrayerId(prayerName) {
    const map = {
        'Fajr': 'fajr',
        'Dhuhr': 'dhuhr',
        'Asr': 'asr',
        'Maghrib': 'maghrib',
        'Isha': 'isha'
    };
    return map[prayerName];
}

// ------------------------------------------------------------
// 3. БЛИЖАЙШИЙ НАМАЗ И ТАЙМЕР
// ------------------------------------------------------------
function calculateNearestPrayer() {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Фаджр', time: prayerTimes.Fajr, id: 'fajr' },
        { name: 'Зухр', time: prayerTimes.Dhuhr, id: 'dhuhr' },
        { name: 'Аср', time: prayerTimes.Asr, id: 'asr' },
        { name: 'Магриб', time: prayerTimes.Maghrib, id: 'maghrib' },
        { name: 'Иша', time: prayerTimes.Isha, id: 'isha' }
    ];
    
    const prayerTimesInMinutes = prayers.map(prayer => {
        if (!prayer.time) return { ...prayer, totalMinutes: Infinity };
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
    document.getElementById('nextPrayerTime').innerText = time || '--:--';
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

// ------------------------------------------------------------
// 4. ТЁМНАЯ / СВЕТЛАЯ ТЕМА
// ------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    if (savedTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.getElementById('themeToggle').querySelector('i');
    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// ------------------------------------------------------------
// 5. ВЫБОР ГОРОДА
// ------------------------------------------------------------
function initCitySelect() {
    const select = document.getElementById('citySelect');
    select.addEventListener('change', (e) => {
        const [lat, lng] = e.target.value.split(',');
        currentCity = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            name: e.target.options[e.target.selectedIndex].text
        };
        fetchPrayerTimes();
    });
}

// ------------------------------------------------------------
// 6. КОМПАС КИБЛЫ
// ------------------------------------------------------------
let currentOrientation = 0;
let qiblaAngle = 0;

function calculateQiblaAngle(lat, lng) {
    const φ1 = lat * Math.PI / 180;
    const φ2 = MECCA.lat * Math.PI / 180;
    const Δλ = (MECCA.lng - lng) * Math.PI / 180;
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
}

function updateCompass(heading) {
    const angle = (qiblaAngle - heading + 360) % 360;
    const needle = document.getElementById('needle');
    if (needle) {
        needle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }
    const degreeSpan = document.getElementById('qiblaDegree');
    if (degreeSpan) {
        degreeSpan.innerHTML = `${Math.round(angle)}° от севера`;
    }
}

function initCompass() {
    qiblaAngle = calculateQiblaAngle(currentCity.lat, currentCity.lng);
    
    const locationBtn = document.getElementById('requestLocation');
    locationBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                qiblaAngle = calculateQiblaAngle(userLat, userLng);
                document.getElementById('qiblaDegree').innerHTML = `${Math.round(qiblaAngle)}° от севера`;
            });
        }
    });
    
    if ('DeviceOrientationEvent' in window) {
        DeviceOrientationEvent.requestPermission?.().then(permissionState => {
            if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', (e) => {
                    currentOrientation = e.webkitCompassHeading || 0;
                    updateCompass(currentOrientation);
                });
            }
        }).catch(() => {
            window.addEventListener('deviceorientation', (e) => {
                currentOrientation = e.webkitCompassHeading || 0;
                updateCompass(currentOrientation);
            });
        });
    }
}

// ------------------------------------------------------------
// 7. СОХРАНЕНИЕ ДЛЯ ВИДЖЕТА (LocalStorage)
// ------------------------------------------------------------
function saveToLocalStorage() {
    const widgetData = {
        timestamp: Date.now(),
        nextPrayerName: document.getElementById('nextPrayerName').innerText,
        nextPrayerTime: document.getElementById('nextPrayerTime').innerText,
        fajr: prayerTimes.Fajr,
        dhuhr: prayerTimes.Dhuhr,
        asr: prayerTimes.Asr,
        maghrib: prayerTimes.Maghrib,
        isha: prayerTimes.Isha
    };
    localStorage.setItem('namazWidgetData', JSON.stringify(widgetData));
}

// ------------------------------------------------------------
// 8. ЗАПУСК
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCitySelect();
    initCompass();
    fetchPrayerTimes();
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Обновляем таймер каждую минуту
    setInterval(() => {
        if (Object.keys(prayerTimes).length > 0) {
            calculateNearestPrayer();
            checkPrayerTimesAndNotify();
        }
    }, 60000);
    
    // Обновляем данные каждый час
    setInterval(() => {
        fetchPrayerTimes();
    }, 3600000);
});
