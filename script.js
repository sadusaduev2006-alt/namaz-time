// ==================== ПРЯМОЕ РАСПИСАНИЕ ДЛЯ ГОРОДОВ ====================
const cities = [
    { name: "Махачкала", lat: 42.9849, lng: 47.5046, times: { Fajr: "02:07", Sunrise: "04:14", Dhuhr: "11:51", Asr: "15:51", Maghrib: "19:24", Isha: "21:06" } },
    { name: "Дербент", lat: 42.0569, lng: 48.2885, times: { Fajr: "02:15", Sunrise: "04:22", Dhuhr: "11:59", Asr: "15:59", Maghrib: "19:32", Isha: "21:14" } },
    { name: "Хасавюрт", lat: 43.2500, lng: 46.5833, times: { Fajr: "02:05", Sunrise: "04:12", Dhuhr: "11:49", Asr: "15:49", Maghrib: "19:22", Isha: "21:04" } },
    { name: "Буйнакск", lat: 42.8167, lng: 47.1167, times: { Fajr: "02:09", Sunrise: "04:16", Dhuhr: "11:53", Asr: "15:53", Maghrib: "19:26", Isha: "21:08" } },
    { name: "Избербаш", lat: 42.5654, lng: 47.8634, times: { Fajr: "02:11", Sunrise: "04:18", Dhuhr: "11:55", Asr: "15:55", Maghrib: "19:28", Isha: "21:10" } },
    { name: "Кизляр", lat: 43.8485, lng: 46.7199, times: { Fajr: "02:00", Sunrise: "04:07", Dhuhr: "11:44", Asr: "15:44", Maghrib: "19:17", Isha: "20:59" } },
    { name: "Каспийск", lat: 42.8819, lng: 47.6372, times: { Fajr: "02:08", Sunrise: "04:15", Dhuhr: "11:52", Asr: "15:52", Maghrib: "19:25", Isha: "21:07" } }
];

let currentCity = cities[0];
let prayerTimes = currentCity.times;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    // ==================== ВРЕМЯ НАМАЗА ====================
    function displayPrayerTimes() {
        document.getElementById('fajr').innerText = prayerTimes.Fajr;
        document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
        document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
        document.getElementById('asr').innerText = prayerTimes.Asr;
        document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
        document.getElementById('isha').innerText = prayerTimes.Isha;
        document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    }
    
    function updateCityAndTimes(city) {
        currentCity = city;
        prayerTimes = city.times;
        displayPrayerTimes();
        const select = document.getElementById('citySelect');
        if (select) {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === city.name) { select.selectedIndex = i; break; }
            }
        }
        localStorage.setItem('selectedCity', city.name);
    }
    
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.addEventListener('change', () => {
            const selected = citySelect.options[citySelect.selectedIndex]?.text;
            const found = cities.find(c => c.name === selected);
            if (found) updateCityAndTimes(found);
        });
    }
    
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const found = cities.find(c => c.name === savedCity);
        if (found) updateCityAndTimes(found);
    }
    
    displayPrayerTimes();
    
    // ==================== КОМПАС ====================
    const fullscreenCompass = document.getElementById('fullscreenCompass');
    const floatingCompassBtn = document.getElementById('floatingCompassBtn');
    const closeCompass = document.getElementById('closeFullscreenCompass');
    const startCompassBtn = document.getElementById('startCompassFull');
    const needleFull = document.getElementById('needleFull');
    const degreeSpan = document.getElementById('qiblaDegreeFull');
    const hintSpan = document.getElementById('compassHintFull');
    const kaabaIcon = document.getElementById('kaabaIcon');
    
    let currentHeading = 0;
    let qiblaDirection = 0;
    let compassActive = false;
    const MECCA = { lat: 21.4225, lng: 39.8262 };
    
    function calculateQiblaAngle() {
        let φ1 = currentCity.lat * Math.PI/180;
        let φ2 = MECCA.lat * Math.PI/180;
        let Δλ = (MECCA.lng - currentCity.lng) * Math.PI/180;
        let y = Math.sin(Δλ) * Math.cos(φ2);
        let x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
        let θ = Math.atan2(y,x);
        qiblaDirection = (θ*180/Math.PI + 360) % 360;
        if (degreeSpan) degreeSpan.innerHTML = `${Math.round(qiblaDirection)}°`;
        updateNeedle();
    }
    
    function updateNeedle() {
        if (!needleFull) return;
        if (compassActive && currentHeading !== 0) {
            let angle = qiblaDirection - currentHeading;
            needleFull.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            let diff = Math.abs(angle % 360);
            if (diff > 180) diff = 360 - diff;
            if (hintSpan) {
                if (diff < 5) {
                    hintSpan.innerHTML = "✅ Вы смотрите точно в сторону Киблы!";
                    hintSpan.style.color = "#4CAF50";
                    if (kaabaIcon) kaabaIcon.classList.add('correct');
                } else if (diff < 15) {
                    hintSpan.innerHTML = `🔄 Почти правильно! Отклонение ${Math.round(diff)}°`;
                    hintSpan.style.color = "#FF9800";
                    if (kaabaIcon) kaabaIcon.classList.remove('correct');
                } else {
                    hintSpan.innerHTML = `🧭 Повернитесь на ${Math.round(diff)}°`;
                    hintSpan.style.color = "#f44336";
                    if (kaabaIcon) kaabaIcon.classList.remove('correct');
                }
            }
        } else {
            needleFull.style.transform = `translate(-50%, -50%) rotate(${qiblaDirection}deg)`;
            if (hintSpan) hintSpan.innerHTML = "📍 Нажмите 'Запустить компас'";
        }
    }
    
    function handleOrientation(e) {
        let heading = e.webkitCompassHeading;
        if (heading === undefined && e.alpha !== undefined) heading = 360 - e.alpha;
        if (heading !== undefined && heading !== null) {
            currentHeading = heading;
            compassActive = true;
            updateNeedle();
        }
    }
    
    if (floatingCompassBtn) {
        floatingCompassBtn.onclick = function() {
            console.log("Кнопка компаса нажата");
            if (fullscreenCompass) fullscreenCompass.classList.add('show');
            calculateQiblaAngle();
        };
    }
    
    if (closeCompass) {
        closeCompass.onclick = function() {
            if (fullscreenCompass) fullscreenCompass.classList.remove('show');
        };
    }
    
    if (startCompassBtn) {
        startCompassBtn.onclick = function() {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(perm => {
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        alert('Компас включён! Поворачивайте телефон');
                    } else {
                        alert('Доступ к компасу не разрешён');
                    }
                }).catch(() => alert('Ошибка доступа'));
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
                alert('Компас включён! Поворачивайте телефон');
            }
        };
    }
    
    // ==================== ПРОФИЛЬ ====================
    const fullscreenProfile = document.getElementById('fullscreenProfile');
    const profileBtn = document.getElementById('profileBtn');
    const closeProfile = document.getElementById('closeProfile');
    
    if (profileBtn) {
        profileBtn.onclick = function() {
            console.log("Кнопка профиля нажата");
            if (fullscreenProfile) fullscreenProfile.classList.add('show');
        };
    }
    
    if (closeProfile) {
        closeProfile.onclick = function() {
            if (fullscreenProfile) fullscreenProfile.classList.remove('show');
        };
    }
    
    // Закрытие по клику на фон
    if (fullscreenProfile) {
        fullscreenProfile.onclick = function(e) {
            if (e.target === fullscreenProfile) fullscreenProfile.classList.remove('show');
        };
    }
    if (fullscreenCompass) {
        fullscreenCompass.onclick = function(e) {
            if (e.target === fullscreenCompass) fullscreenCompass.classList.remove('show');
        };
    }
    
    // ==================== ВКЛАДКИ ПРОФИЛЯ ====================
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profilePanes = document.querySelectorAll('.profile-pane');
    
    profileTabs.forEach(tab => {
        tab.onclick = function() {
            const tabId = this.getAttribute('data-profile-tab');
            profileTabs.forEach(t => t.classList.remove('active'));
            profilePanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const activePane = document.getElementById(`profile-tab-${tabId}`);
            if (activePane) activePane.classList.add('active');
        };
    });
    
    // ==================== УВЕДОМЛЕНИЯ ====================
    const notificationsToggle = document.getElementById('notificationsToggle');
    const notificationTimeSelect = document.getElementById('notificationTimeSelect');
    const azanSoundSelect = document.getElementById('azanSoundSelect');
    const testAzanBtn = document.getElementById('testAzanBtn');
    const azanAudio = document.getElementById('azanAudio');
    
    if (notificationsToggle) {
        const saved = localStorage.getItem('notificationsEnabled');
        if (saved !== null) notificationsToggle.checked = saved === 'true';
        notificationsToggle.onchange = function(e) {
            localStorage.setItem('notificationsEnabled', e.target.checked);
            if (e.target.checked && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        };
    }
    
    if (notificationTimeSelect) {
        const saved = localStorage.getItem('notificationTime');
        if (saved) notificationTimeSelect.value = saved;
        notificationTimeSelect.onchange = function(e) {
            localStorage.setItem('notificationTime', e.target.value);
        };
    }
    
    if (azanSoundSelect) {
        const saved = localStorage.getItem('azanSound');
        if (saved) azanSoundSelect.value = saved;
        azanSoundSelect.onchange = function(e) {
            localStorage.setItem('azanSound', e.target.value);
        };
    }
    
    if (testAzanBtn && azanAudio) {
        testAzanBtn.onclick = function() {
            azanAudio.play().catch(e => console.log('Тест азана заблокирован'));
        };
    }
    
    // ==================== ЯЗЫК ====================
    const languageItems = document.querySelectorAll('.language-item');
    languageItems.forEach(item => {
        item.onclick = function() {
            const lang = this.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            languageItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // Здесь можно добавить смену языка интерфейса
        };
    });
    
    // ==================== ТЁМНАЯ ТЕМА ====================
    const profileDarkModeToggle = document.getElementById('profileDarkModeToggle');
    function initTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', theme);
        if (profileDarkModeToggle) profileDarkModeToggle.checked = (theme === 'dark');
    }
    if (profileDarkModeToggle) {
        profileDarkModeToggle.onchange = function(e) {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        };
    }
    initTheme();
    
    // ==================== МЕНЮ (ТРИ ТОЧКИ) ====================
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (menuToggle && dropdownMenu) {
        menuToggle.onclick = function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        };
        document.onclick = function(e) {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        };
    }
    
    const aboutMenuItem = document.getElementById('aboutMenuItem');
    if (aboutMenuItem) {
        aboutMenuItem.onclick = function(e) {
            e.preventDefault();
            alert('📱 Намаз Дагестан — приложение для точного определения времени намазов.\nВерсия 2.0');
        };
    }
    
    // ==================== АВТОРИЗАЦИЯ ====================
    const profileGoogleBtn = document.getElementById('profileGoogleSignIn');
    const profileSignOutBtn = document.getElementById('profileSignOutBtn');
    const profileUserInfo = document.getElementById('profileUserInfo');
    const profileAuthBtns = document.querySelector('.profile-auth-buttons');
    
    if (profileGoogleBtn && window.auth && window.signInWithPopup && window.provider) {
        profileGoogleBtn.onclick = async function() {
            try {
                const result = await window.signInWithPopup(window.auth, window.provider);
                const user = result.user;
                if (profileUserInfo) profileUserInfo.innerHTML = `<p><strong>${user.displayName || user.email}</strong></p>`;
                if (profileAuthBtns) profileAuthBtns.style.display = 'none';
                if (profileSignOutBtn) profileSignOutBtn.style.display = 'block';
                localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email }));
            } catch(e) {
                console.error(e);
                alert('Ошибка входа');
            }
        };
    }
    
    if (profileSignOutBtn) {
        profileSignOutBtn.onclick = async function() {
            if (window.auth && window.signOut) await window.signOut(window.auth);
            localStorage.removeItem('user');
            if (profileUserInfo) profileUserInfo.innerHTML = '<p>Войдите, чтобы сохранять настройки</p>';
            if (profileAuthBtns) profileAuthBtns.style.display = 'flex';
            profileSignOutBtn.style.display = 'none';
        };
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser && profileUserInfo) {
        const user = JSON.parse(savedUser);
        profileUserInfo.innerHTML = `<p><strong>${user.name || user.email}</strong></p>`;
        if (profileAuthBtns) profileAuthBtns.style.display = 'none';
        if (profileSignOutBtn) profileSignOutBtn.style.display = 'block';
    }
    
    console.log("Инициализация завершена");
});
