// ==================== ПРЯМОЕ РАСПИСАНИЕ ДЛЯ ГОРОДОВ ДАГЕСТАНА ====================
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
let currentLanguage = localStorage.getItem('language') || 'ru';

// Переводы
const translations = {
    ru: {
        prayer: "Время намаза",
        updated: "Обновлено",
        fajr: "Фаджр",
        sunrise: "Шурук",
        dhuhr: "Зухр",
        asr: "Аср",
        maghrib: "Магриб",
        isha: "Иша",
        profile: "Профиль",
        about: "О приложении",
        compass: "Направление на Киблу",
        quran: "Коран",
        settings: "Настройки"
    },
    en: {
        prayer: "Prayer Times",
        updated: "Updated",
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
        profile: "Profile",
        about: "About",
        compass: "Qibla Direction",
        quran: "Quran",
        settings: "Settings"
    },
    ar: {
        prayer: "أوقات الصلاة",
        updated: "تم التحديث",
        fajr: "الفجر",
        sunrise: "الشروق",
        dhuhr: "الظهر",
        asr: "العصر",
        maghrib: "المغرب",
        isha: "العشاء",
        profile: "الملف الشخصي",
        about: "حول التطبيق",
        compass: "اتجاه القبلة",
        quran: "القرآن",
        settings: "الإعدادات"
    },
    av: {
        prayer: "Как заман",
        updated: "ТIадегӀан",
        fajr: "Фаджр",
        sunrise: "Шурук",
        dhuhr: "Зухр",
        asr: "Аср",
        maghrib: "Магриб",
        isha: "Иша",
        profile: "Профиль",
        about: "Приложениелъул",
        compass: "Кибла",
        quran: "Къуръан",
        settings: "Настройкаби"
    },
    ku: {
        prayer: "Намаз заман",
        updated: "Янгыртды",
        fajr: "Фаджр",
        sunrise: "Шурук",
        dhuhr: "Зухр",
        asr: "Аср",
        maghrib: "Магриб",
        isha: "Иша",
        profile: "Профиль",
        about: "Приложение",
        compass: "Кибла",
        quran: "Къуръан",
        settings: "Настройкалар"
    },
    lez: {
        prayer: "Намаздин вахт",
        updated: "ЦIийи хъайи",
        fajr: "Фаджр",
        sunrise: "Шурук",
        dhuhr: "Зухр",
        asr: "Аср",
        maghrib: "Магриб",
        isha: "Иша",
        profile: "Профиль",
        about: "Приложение",
        compass: "Кибла",
        quran: "Къуръан",
        settings: "Настройкайр"
    }
};

function updateUILanguage() {
    const t = translations[currentLanguage] || translations.ru;
    document.querySelector('.prayer-card h1')?.remove();
    const header = document.querySelector('.prayer-card .header');
    if (header && !document.querySelector('.prayer-card .header h1')) {
        const h1 = document.createElement('h1');
        h1.innerHTML = `🕌 ${t.prayer}`;
        header.insertBefore(h1, header.querySelector('.footer-note'));
    }
    // Обновляем названия намазов
    const prayerNames = document.querySelectorAll('.prayer-name');
    if (prayerNames.length) {
        prayerNames[0].innerText = t.fajr;
        prayerNames[1].innerText = t.sunrise;
        prayerNames[2].innerText = t.dhuhr;
        prayerNames[3].innerText = t.asr;
        prayerNames[4].innerText = t.maghrib;
        prayerNames[5].innerText = t.isha;
    }
    const updateSpan = document.querySelector('.footer-note p');
    if (updateSpan) updateSpan.innerHTML = `<i class="far fa-clock"></i> ${t.updated}: <span id="updateTime">${document.getElementById('updateTime')?.innerText || '--:--'}</span>`;
}

document.addEventListener('DOMContentLoaded', function() {
    // Отображение времени
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
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text === city.name) { select.selectedIndex = i; break; }
        }
        localStorage.setItem('selectedCity', city.name);
        if (typeof calculateQiblaAngle === 'function') calculateQiblaAngle();
    }
    
    document.getElementById('citySelect')?.addEventListener('change', () => {
        const select = document.getElementById('citySelect');
        const selected = select.options[select.selectedIndex]?.text;
        const found = cities.find(c => c.name === selected);
        if (found) updateCityAndTimes(found);
    });
    
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const found = cities.find(c => c.name === savedCity);
        if (found) updateCityAndTimes(found);
    }
    
    displayPrayerTimes();
    updateUILanguage();
    
    // ==================== ПОЛНОЭКРАННЫЙ ПРОФИЛЬ ====================
    const fullscreenProfile = document.getElementById('fullscreenProfile');
    const profileBtn = document.getElementById('profileBtn');
    const closeProfile = document.getElementById('closeProfile');
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profilePanes = document.querySelectorAll('.profile-pane');
    
    if (profileBtn) {
        profileBtn.onclick = () => { if (fullscreenProfile) fullscreenProfile.classList.add('show'); };
    }
    if (closeProfile) {
        closeProfile.onclick = () => { if (fullscreenProfile) fullscreenProfile.classList.remove('show'); };
    }
    
    profileTabs.forEach(tab => {
        tab.onclick = () => {
            const tabId = tab.dataset.profileTab;
            profileTabs.forEach(t => t.classList.remove('active'));
            profilePanes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
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
        notificationsToggle.onchange = (e) => {
            localStorage.setItem('notificationsEnabled', e.target.checked);
            if (e.target.checked && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        };
    }
    
    if (notificationTimeSelect) {
        const saved = localStorage.getItem('notificationTime');
        if (saved) notificationTimeSelect.value = saved;
        notificationTimeSelect.onchange = (e) => localStorage.setItem('notificationTime', e.target.value);
    }
    
    if (azanSoundSelect) {
        const saved = localStorage.getItem('azanSound');
        if (saved) azanSoundSelect.value = saved;
        azanSoundSelect.onchange = (e) => {
            localStorage.setItem('azanSound', e.target.value);
            const source = document.getElementById('azanSource');
            if (source) {
                const sounds = {
                    default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    makkah: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    medina: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
                };
                source.src = sounds[e.target.value] || sounds.default;
                azanAudio.load();
            }
        };
    }
    
    if (testAzanBtn) {
        testAzanBtn.onclick = () => { if (azanAudio) azanAudio.play().catch(e => console.log('Тест азана заблокирован')); };
    }
    
    // ==================== ЯЗЫК ====================
    const languageItems = document.querySelectorAll('.language-item');
    languageItems.forEach(item => {
        if (item.dataset.lang === currentLanguage) item.classList.add('active');
        item.onclick = () => {
            currentLanguage = item.dataset.lang;
            localStorage.setItem('language', currentLanguage);
            languageItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            updateUILanguage();
        };
    });
    
    // ==================== ТЁМНАЯ ТЕМА В ПРОФИЛЕ ====================
    const profileDarkModeToggle = document.getElementById('profileDarkModeToggle');
    function initProfileTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', theme);
        if (profileDarkModeToggle) profileDarkModeToggle.checked = (theme === 'dark');
    }
    if (profileDarkModeToggle) {
        profileDarkModeToggle.onchange = (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        };
    }
    initProfileTheme();
    
    // ==================== АВТОРИЗАЦИЯ В ПРОФИЛЕ ====================
    const profileGoogleBtn = document.getElementById('profileGoogleSignIn');
    const profileAppleBtn = document.getElementById('profileAppleSignIn');
    const profileSignOutBtn = document.getElementById('profileSignOutBtn');
    const profileUserInfo = document.getElementById('profileUserInfo');
    const profileAuthBtns = document.querySelector('.profile-auth-buttons');
    
    if (profileGoogleBtn && window.auth && window.signInWithPopup && window.provider) {
        profileGoogleBtn.onclick = async () => {
            try {
                const result = await window.signInWithPopup(window.auth, window.provider);
                const user = result.user;
                if (profileUserInfo) profileUserInfo.innerHTML = `<p><strong>${user.displayName || user.email}</strong></p><p style="font-size:12px;">${user.email}</p>`;
                if (profileAuthBtns) profileAuthBtns.style.display = 'none';
                if (profileSignOutBtn) profileSignOutBtn.style.display = 'block';
                localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email }));
            } catch(e) { console.error(e); alert('Ошибка входа'); }
        };
    }
    
    if (profileSignOutBtn) {
        profileSignOutBtn.onclick = async () => {
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
        updateCompassNeedle();
    }
    
    function updateCompassNeedle() {
        if (!needleFull) return;
        if (compassActive && currentHeading !== undefined && currentHeading !== null) {
            let rotationAngle = qiblaDirection - currentHeading;
            needleFull.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;
            let diff = Math.abs(rotationAngle % 360);
            if (diff > 180) diff = 360 - diff;
            if (hintSpan) {
                if (diff < 5) {
                    hintSpan.innerHTML = "✅ Вы смотрите точно в сторону Киблы!";
                    hintSpan.style.color = "#4CAF50";
                    hintSpan.style.background = "rgba(76, 175, 80, 0.2)";
                    if (kaabaIcon) kaabaIcon.classList.add('correct');
                } else if (diff < 15) {
                    hintSpan.innerHTML = `🔄 Почти правильно! Отклонение ${Math.round(diff)}° ${rotationAngle > 0 ? 'влево' : 'вправо'}`;
                    hintSpan.style.color = "#FF9800";
                    hintSpan.style.background = "rgba(255, 152, 0, 0.2)";
                    if (kaabaIcon) kaabaIcon.classList.remove('correct');
                } else {
                    hintSpan.innerHTML = `🧭 Повернитесь ${rotationAngle > 0 ? 'налево' : 'направо'} на ${Math.round(diff)}°`;
                    hintSpan.style.color = "#f44336";
                    hintSpan.style.background = "rgba(244, 67, 54, 0.2)";
                    if (kaabaIcon) kaabaIcon.classList.remove('correct');
                }
            }
        } else {
            needleFull.style.transform = `translate(-50%, -50%) rotate(${qiblaDirection}deg)`;
            if (hintSpan) {
                hintSpan.innerHTML = "📍 Нажмите 'Запустить компас' и поверните телефон";
                hintSpan.style.color = "var(--text-secondary)";
                hintSpan.style.background = "var(--accent-light)";
            }
            if (kaabaIcon) kaabaIcon.classList.remove('correct');
        }
    }
    
    function initFullscreenCompass() {
        calculateQiblaAngle();
        if (startCompassBtn) {
            const newStartBtn = startCompassBtn.cloneNode(true);
            startCompassBtn.parentNode.replaceChild(newStartBtn, startCompassBtn);
            newStartBtn.onclick = () => {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation);
                                compassActive = true;
                                if (hintSpan) {
                                    hintSpan.innerHTML = "✅ Компас активен! Поворачивайте телефон";
                                    hintSpan.style.color = "#4CAF50";
                                    hintSpan.style.background = "rgba(76, 175, 80, 0.2)";
                                }
                            } else {
                                if (hintSpan) hintSpan.innerHTML = "❌ Доступ к компасу не разрешён";
                            }
                        })
                        .catch(err => { if (hintSpan) hintSpan.innerHTML = "❌ Ошибка доступа"; });
                } else if (typeof DeviceOrientationEvent !== 'undefined') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    compassActive = true;
                    if (hintSpan) {
                        hintSpan.innerHTML = "✅ Компас активен! Поворачивайте телефон";
                        hintSpan.style.color = "#4CAF50";
                        hintSpan.style.background = "rgba(76, 175, 80, 0.2)";
                    }
                }
            };
        }
    }
    
    function handleOrientation(event) {
        let heading = event.webkitCompassHeading || (event.alpha ? 360 - event.alpha : null);
        if (heading !== null && heading !== undefined) {
            currentHeading = heading;
            updateCompassNeedle();
        }
    }
    
    if (floatingCompassBtn) {
        const newBtn = floatingCompassBtn.cloneNode(true);
        floatingCompassBtn.parentNode.replaceChild(newBtn, floatingCompassBtn);
        newBtn.onclick = () => { if (fullscreenCompass) { fullscreenCompass.classList.add('show'); initFullscreenCompass(); } };
    }
    if (closeCompass) closeCompass.onclick = () => { if (fullscreenCompass) fullscreenCompass.classList.remove('show'); };
    
    // ==================== МЕНЮ ====================
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuBtn && dropdownMenu) {
        menuBtn.onclick = (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); };
        document.onclick = (e) => { if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.classList.remove('show'); };
    }
    
    document.getElementById('aboutMenuItem')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('📱 Намаз Дагестан — приложение для точного определения времени намазов.\nВерсия 2.0\n\n📍 Автоопределение города\n🕌 Направление Киблы\n📖 Священный Коран\n\nРазработано для жителей Дагестана');
    });
});
