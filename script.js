// ------------------------------------------------------------
// КОНФИГУРАЦИЯ
// ------------------------------------------------------------
let currentCity = { lat: 42.9849, lng: 47.5046, name: "Махачкала" };
let prayerTimes = {};
let lastNotifiedPrayers = new Set();

// Метод MWL (угол 18° для Фаджра)
const API_METHOD = 3; // Muslim World League

// Координаты Мекки для Киблы
const MECCA = { lat: 21.4225, lng: 39.8262 };

let currentHeading = 0;
let qiblaDirection = 0;
let compassActive = false;

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
            
            document.getElementById('fajr').innerText = timings.Fajr;
            document.getElementById('sunrise').innerText = timings.Sunrise;
            document.getElementById('dhuhr').innerText = timings.Dhuhr;
            document.getElementById('asr').innerText = timings.Asr;
            document.getElementById('maghrib').innerText = timings.Maghrib;
            document.getElementById('isha').innerText = timings.Isha;
            
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
            
            checkPrayerTimesAndNotify();
            calculateNearestPrayer();
            saveToLocalStorage();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// ------------------------------------------------------------
// 2. ПРОВЕРКА НАСТУПЛЕНИЯ НАМАЗА
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
        
        if (Math.abs(currentMinutes - prayerMinutes) <= 2 && !lastNotifiedPrayers.has(prayerName)) {
            const prayerId = getPrayerId(prayerName);
            const prayerElement = document.getElementById(prayerId)?.closest('.prayer-item');
            if (prayerElement) {
                prayerElement.classList.add('just-happened');
                setTimeout(() => {
                    prayerElement.classList.remove('just-happened');
                }, 1000);
            }
            
            const sound = document.getElementById('notificationSound');
            if (sound) {
                sound.play().catch(e => console.log('Звук заблокирован'));
            }
            
            lastNotifiedPrayers.add(prayerName);
        }
    });
}

function getPrayerId(prayerName) {
    const map = { 'Fajr': 'fajr', 'Dhuhr': 'dhuhr', 'Asr': 'asr', 'Maghrib': 'maghrib', 'Isha': 'isha' };
    return map[prayerName];
}

// ------------------------------------------------------------
// 3. БЛИЖАЙШИЙ НАМАЗ
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
// 4. ТЁМНАЯ ТЕМА
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
        calculateQiblaAngle();
    });
}

// ------------------------------------------------------------
// 6. КОМПАС КИБЛЫ (ПОЛНОСТЬЮ ПЕРЕРАБОТАН)
// ------------------------------------------------------------
function calculateQiblaAngle() {
    const φ1 = currentCity.lat * Math.PI / 180;
    const φ2 = MECCA.lat * Math.PI / 180;
    const Δλ = (MECCA.lng - currentCity.lng) * Math.PI / 180;
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x);
    qiblaDirection = (θ * 180 / Math.PI + 360) % 360;
    
    document.getElementById('qiblaDegree').innerHTML = `${Math.round(qiblaDirection)}° от севера`;
    
    // Обновляем стрелку
    updateNeedle();
}

function updateNeedle() {
    const needle = document.getElementById('needle');
    if (!needle) return;
    
    // Если компас активен, используем текущее направление телефона
    if (compassActive && currentHeading !== 0) {
        const rotationAngle = qiblaDirection - currentHeading;
        needle.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;
        
        // Подсказка
        let diff = Math.abs(rotationAngle % 360);
        if (diff > 180) diff = 360 - diff;
        
        const hint = document.getElementById('compassHint');
        if (hint) {
            if (diff < 10) {
                hint.innerHTML = "✅ Вы смотрите в сторону Киблы!";
                hint.style.color = "#4CAF50";
            } else if (diff < 45) {
                hint.innerHTML = `🔄 Повернитесь ${rotationAngle > 0 ? 'налево' : 'направо'} на ${Math.round(diff)}°`;
                hint.style.color = "#FF9800";
            } else {
                hint.innerHTML = `🧭 Повернитесь ${rotationAngle > 0 ? 'налево' : 'направо'} на ${Math.round(diff)}°`;
                hint.style.color = "#f44336";
            }
        }
    } else {
        // Если компас не активен, просто показываем статическую стрелку на Киблу
        needle.style.transform = `translate(-50%, -50%) rotate(${qiblaDirection}deg)`;
        const hint = document.getElementById('compassHint');
        if (hint) {
            hint.innerHTML = "📍 Нажмите 'Определить направление' и поверните телефон";
            hint.style.color = "#B67B4A";
        }
    }
}

function initCompass() {
    calculateQiblaAngle();
    
    const locationBtn = document.getElementById('requestLocation');
    
    // Функция запуска компаса
    function startCompass() {
        if (!window.DeviceOrientationEvent) {
            alert('Ваш браузер не поддерживает компас');
            return;
        }
        
        // Для iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        compassActive = true;
                        alert('✅ Компас включён! Поворачивайте телефон — стрелка будет двигаться');
                    } else {
                        alert('❌ Доступ к компасу не разрешён');
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Ошибка: не удалось получить доступ к компасу');
                });
        } else {
            // Android и старые iOS
            window.addEventListener('deviceorientation', handleOrientation);
            compassActive = true;
            alert('✅ Компас включён! Поворачивайте телефон');
        }
    }
    
    // Привязываем к кнопке
    locationBtn.onclick = startCompass;
}

function handleOrientation(event) {
    // iOS: webkitCompassHeading (0-360)
    let heading = event.webkitCompassHeading;
    
    // Android: alpha (0-360, но нужно калибровать)
    if (heading === undefined && event.alpha !== undefined) {
        heading = 360 - event.alpha;
    }
    
    if (heading !== undefined && heading !== null) {
        currentHeading = heading;
        updateNeedle();
    } else {
        console.log('Нет данных компаса');
    }
}

// ------------------------------------------------------------
// 7. СОХРАНЕНИЕ ДЛЯ ВИДЖЕТА
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
    
    setInterval(() => {
        if (Object.keys(prayerTimes).length > 0) {
            calculateNearestPrayer();
            checkPrayerTimesAndNotify();
        }
    }, 60000);
    
    setInterval(() => {
        fetchPrayerTimes();
    }, 3600000);
});
