// ==================== ПРЯМОЕ РАСПИСАНИЕ ДЛЯ МАХАЧКАЛЫ (Sajda) ====================
// Исправляем время намаза вручную, так как API даёт ошибку
const SAJDA_TIMES = {
    Fajr: "02:07",
    Sunrise: "04:14",
    Dhuhr: "11:51",
    Asr: "15:51",
    Maghrib: "19:24",
    Isha: "21:06"
};

// Координаты городов Дагестана
const cities = [
    { name: "Махачкала", lat: 42.9849, lng: 47.5046, times: SAJDA_TIMES },
    { name: "Дербент", lat: 42.0569, lng: 48.2885, times: { Fajr: "02:15", Sunrise: "04:22", Dhuhr: "11:59", Asr: "15:59", Maghrib: "19:32", Isha: "21:14" } },
    { name: "Хасавюрт", lat: 43.2500, lng: 46.5833, times: { Fajr: "02:05", Sunrise: "04:12", Dhuhr: "11:49", Asr: "15:49", Maghrib: "19:22", Isha: "21:04" } },
    { name: "Буйнакск", lat: 42.8167, lng: 47.1167, times: { Fajr: "02:09", Sunrise: "04:16", Dhuhr: "11:53", Asr: "15:53", Maghrib: "19:26", Isha: "21:08" } },
    { name: "Избербаш", lat: 42.5654, lng: 47.8634, times: { Fajr: "02:11", Sunrise: "04:18", Dhuhr: "11:55", Asr: "15:55", Maghrib: "19:28", Isha: "21:10" } },
    { name: "Кизляр", lat: 43.8485, lng: 46.7199, times: { Fajr: "02:00", Sunrise: "04:07", Dhuhr: "11:44", Asr: "15:44", Maghrib: "19:17", Isha: "20:59" } },
    { name: "Каспийск", lat: 42.8819, lng: 47.6372, times: { Fajr: "02:08", Sunrise: "04:15", Dhuhr: "11:52", Asr: "15:52", Maghrib: "19:25", Isha: "21:07" } }
];

let currentCity = { name: "Махачкала", lat: 42.9849, lng: 47.5046, times: SAJDA_TIMES };
let prayerTimes = {};
let currentHeading = 0;
let qiblaDirection = 0;
let compassActive = false;
const MECCA = { lat: 21.4225, lng: 39.8262 };

// ==================== ПРОФИЛЬ И АВТОРИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Модальное окно профиля
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            profileModal.classList.add('show');
        });
    }
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            profileModal.classList.remove('show');
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === profileModal) profileModal.classList.remove('show');
    });
    
    // Google Sign In
    const googleBtn = document.getElementById('googleSignIn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            if (window.auth && window.signInWithPopup && window.provider) {
                try {
                    const result = await window.signInWithPopup(window.auth, window.provider);
                    const user = result.user;
                    document.getElementById('userInfo').innerHTML = `
                        <p><strong>${user.displayName || user.email}</strong></p>
                        <p style="font-size: 12px;">${user.email}</p>
                    `;
                    document.querySelector('.auth-buttons').style.display = 'none';
                    document.getElementById('userSettings').style.display = 'block';
                    localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email }));
                } catch (error) {
                    console.error(error);
                    alert('Ошибка входа: ' + error.message);
                }
            }
        });
    }
    
    // Apple Sign In
    if (window.AppleID) {
        window.AppleID.auth.init({
            clientId: 'com.namaz.dagestan',
            scope: 'name email',
            redirectURI: window.location.origin + '/callback',
            usePopup: true
        });
    }
    
    // Восстановление сессии
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('userInfo').innerHTML = `<p><strong>${user.name || user.email}</strong></p>`;
        document.querySelector('.auth-buttons').style.display = 'none';
        document.getElementById('userSettings').style.display = 'block';
    }
    
    // Выход
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            if (window.auth && window.signOut) {
                await window.signOut(window.auth);
            }
            localStorage.removeItem('user');
            document.getElementById('userInfo').innerHTML = '<p>Войдите, чтобы сохранять настройки</p>';
            document.querySelector('.auth-buttons').style.display = 'flex';
            document.getElementById('userSettings').style.display = 'none';
        });
    }
    
    // Загрузка настроек
    const savedNotification = localStorage.getItem('notificationTime');
    if (savedNotification) document.getElementById('notificationTime').value = savedNotification;
    document.getElementById('notificationTime')?.addEventListener('change', (e) => {
        localStorage.setItem('notificationTime', e.target.value);
    });
    
    const savedAzan = localStorage.getItem('azanSound');
    if (savedAzan) document.getElementById('azanSound').value = savedAzan;
    document.getElementById('azanSound')?.addEventListener('change', (e) => {
        localStorage.setItem('azanSound', e.target.value);
    });
    
    // ==================== НАМАЗЫ ====================
    function updateCityFromSelect() {
        const select = document.getElementById('citySelect');
        const selectedCityName = select.options[select.selectedIndex]?.text || "Махачкала";
        const foundCity = cities.find(c => c.name === selectedCityName);
        if (foundCity) {
            currentCity = foundCity;
            prayerTimes = currentCity.times;
        } else {
            currentCity = cities[0];
            prayerTimes = SAJDA_TIMES;
        }
        localStorage.setItem('selectedCity', currentCity.name);
    }
    
    function displayPrayerTimes() {
        document.getElementById('fajr').innerText = prayerTimes.Fajr;
        document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
        document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
        document.getElementById('asr').innerText = prayerTimes.Asr;
        document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
        document.getElementById('isha').innerText = prayerTimes.Isha;
        
        const today = new Date();
        document.getElementById('currentDate').innerHTML = `📆 ${today.toLocaleDateString('ru-RU')}`;
        document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
        calculateNearestPrayer();
    }
    
    function calculateNearestPrayer() {
        const now = new Date();
        const current = now.getHours()*60 + now.getMinutes();
        const prayers = [
            {name:'Фаджр', time:prayerTimes.Fajr, id:'fajr'},
            {name:'Зухр', time:prayerTimes.Dhuhr, id:'dhuhr'},
            {name:'Аср', time:prayerTimes.Asr, id:'asr'},
            {name:'Магриб', time:prayerTimes.Maghrib, id:'maghrib'},
            {name:'Иша', time:prayerTimes.Isha, id:'isha'}
        ];
        let next = null;
        for(let p of prayers) {
            if(!p.time) continue;
            let [h,m] = p.time.split(':').map(Number);
            let total = h*60+m;
            if(total > current) { next = {...p, total}; break; }
        }
        if(!next && prayers[0]) {
            let [h,m] = prayers[0].time.split(':').map(Number);
            next = {...prayers[0], total: h*60+m+1440};
        }
        if(next) {
            let left = next.total - current;
            document.getElementById('nextPrayerName').innerText = next.name;
            document.getElementById('nextPrayerTime').innerText = next.time;
            if(left<=0) document.getElementById('countdownText').innerHTML = "🕋 Время наступило!";
            else {
                let hours = Math.floor(left/60), mins = left%60;
                document.getElementById('countdownText').innerHTML = hours>0 ? `${hours} ч ${mins} мин` : `${mins} минут`;
            }
            document.querySelectorAll('.prayer-item').forEach(i=>i.classList.remove('active'));
            if(next.id) document.getElementById(next.id)?.closest('.prayer-item')?.classList.add('active');
        }
    }
    
    // GPS определение
    function findNearestCity(lat, lng) {
        let nearest = cities[0];
        let minDistance = Infinity;
        for (let city of cities) {
            const dLat = city.lat - lat;
            const dLng = city.lng - lng;
            const distance = Math.sqrt(dLat*dLat + dLng*dLng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = city;
            }
        }
        return nearest;
    }
    
    function detectLocation() {
        if (!navigator.geolocation) {
            alert("Ваш браузер не поддерживает геолокацию");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const nearestCity = findNearestCity(latitude, longitude);
                const select = document.getElementById('citySelect');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].text === nearestCity.name) {
                        select.selectedIndex = i;
                        break;
                    }
                }
                updateCityFromSelect();
                displayPrayerTimes();
                calculateQiblaAngle();
                alert(`📍 Ваш город: ${nearestCity.name}`);
            },
            (error) => {
                let errorMessage = "Не удалось определить местоположение. ";
                if (error.code === error.PERMISSION_DENIED) errorMessage += "Разрешите доступ к геолокации.";
                alert(errorMessage);
            }
        );
    }
    
    document.getElementById('gpsLocationBtn')?.addEventListener('click', detectLocation);
    document.getElementById('citySelect')?.addEventListener('change', () => {
        updateCityFromSelect();
        displayPrayerTimes();
        calculateQiblaAngle();
    });
    
    // Компас
    function calculateQiblaAngle() {
        let φ1 = currentCity.lat * Math.PI/180;
        let φ2 = MECCA.lat * Math.PI/180;
        let Δλ = (MECCA.lng - currentCity.lng) * Math.PI/180;
        let y = Math.sin(Δλ) * Math.cos(φ2);
        let x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
        let θ = Math.atan2(y,x);
        qiblaDirection = (θ*180/Math.PI+360)%360;
        document.getElementById('qiblaDegree').innerHTML = `${Math.round(qiblaDirection)}° от севера`;
        updateNeedle();
    }
    
    function updateNeedle() {
        let needle = document.getElementById('needle');
        if(!needle) return;
        if(compassActive && currentHeading) {
            let angle = qiblaDirection - currentHeading;
            needle.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
        } else {
            needle.style.transform = `translate(-50%,-50%) rotate(${qiblaDirection}deg)`;
        }
    }
    
    function initCompass() {
        calculateQiblaAngle();
        let btn = document.getElementById('requestLocation');
        btn.onclick = () => {
            if(typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(perm => {
                    if(perm==='granted') {
                        window.addEventListener('deviceorientation', (e) => {
                            let heading = e.webkitCompassHeading || (e.alpha ? 360-e.alpha : null);
                            if(heading) { currentHeading = heading; compassActive = true; updateNeedle(); }
                        });
                        alert('Компас включён! Поворачивайте телефон');
                    } else alert('Доступ не разрешён');
                }).catch(()=>alert('Ошибка доступа'));
            } else {
                window.addEventListener('deviceorientation', (e) => {
                    let heading = e.webkitCompassHeading || (e.alpha ? 360-e.alpha : null);
                    if(heading) { currentHeading = heading; compassActive = true; updateNeedle(); }
                });
                alert('Компас включён! Поворачивайте телефон');
            }
        };
    }
    
    // Тёмная тема
    function initTheme() {
        let theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);
        let icon = document.querySelector('#themeToggle i');
        if(theme==='dark') icon.classList.replace('fa-moon','fa-sun');
        else icon.classList.replace('fa-sun','fa-moon');
    }
    function toggleTheme() {
        let cur = document.body.getAttribute('data-theme');
        let neu = cur==='light'?'dark':'light';
        document.body.setAttribute('data-theme', neu);
        localStorage.setItem('theme', neu);
        let icon = document.querySelector('#themeToggle i');
        if(neu==='dark') icon.classList.replace('fa-moon','fa-sun');
        else icon.classList.replace('fa-sun','fa-moon');
    }
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Меню
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // Запуск
    initTheme();
    initCompass();
    updateCityFromSelect();
    displayPrayerTimes();
    setInterval(() => calculateNearestPrayer(), 60000);
});
