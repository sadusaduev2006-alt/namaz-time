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

// ==================== ПЕРЕВОДЫ ====================
const translations = {
    ru: { prayer: "Время намаза", updated: "Обновлено", fajr: "Фаджр", sunrise: "Шурук", dhuhr: "Зухр", asr: "Аср", maghrib: "Магриб", isha: "Иша", profile: "Профиль", notifications: "Уведомления", language: "Язык", appearance: "Оформление", darkTheme: "Тёмная тема", notificationDesc: "Получать напоминания о намазе", remindBefore: "Напоминать за", azanSound: "Звук азана", testSound: "Тест", login: "Войти", logout: "Выйти" },
    en: { prayer: "Prayer Times", updated: "Updated", fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha", profile: "Profile", notifications: "Notifications", language: "Language", appearance: "Appearance", darkTheme: "Dark Theme", notificationDesc: "Receive prayer reminders", remindBefore: "Remind before", azanSound: "Azan sound", testSound: "Test", login: "Sign in", logout: "Sign out" },
    ar: { prayer: "أوقات الصلاة", updated: "تم التحديث", fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء", profile: "الملف الشخصي", notifications: "الإشعارات", language: "اللغة", appearance: "المظهر", darkTheme: "الوضع المظلم", notificationDesc: "تلقي تذكيرات الصلاة", remindBefore: "تذكير قبل", azanSound: "صوت الأذان", testSound: "اختبار", login: "تسجيل الدخول", logout: "تسجيل الخروج" },
    kk: { prayer: "Намаз уақыты", updated: "Жаңартылды", fajr: "Фажр", sunrise: "Шурық", dhuhr: "Зуһр", asr: "Аср", maghrib: "Мағриб", isha: "Иша", profile: "Профиль", notifications: "Хабарландырулар", language: "Тіл", appearance: "Көрініс", darkTheme: "Қараңғы тақырып", notificationDesc: "Намаз ескертулерін алу", remindBefore: "Еске салу", azanSound: "Азан дыбысы", testSound: "Тест", login: "Кіру", logout: "Шығу" },
    tr: { prayer: "Namaz Vakti", updated: "Güncellendi", fajr: "İmsak", sunrise: "Güneş", dhuhr: "Öğle", asr: "İkindi", maghrib: "Akşam", isha: "Yatsı", profile: "Profil", notifications: "Bildirimler", language: "Dil", appearance: "Görünüm", darkTheme: "Koyu Tema", notificationDesc: "Namaz hatırlatıcıları al", remindBefore: "Hatırlatma", azanSound: "Ezan sesi", testSound: "Test", login: "Giriş yap", logout: "Çıkış yap" },
    uz: { prayer: "Namoz vaqti", updated: "Yangilandi", fajr: "Bomdod", sunrise: "Quyosh", dhuhr: "Peshin", asr: "Asr", maghrib: "Shom", isha: "Xufton", profile: "Profil", notifications: "Bildirishnomalar", language: "Til", appearance: "Koʻrinish", darkTheme: "Qorongʻu mavzu", notificationDesc: "Namoz eslatmalarini olish", remindBefore: "Eslatma", azanSound: "Azon ovozi", testSound: "Sinov", login: "Kirish", logout: "Chiqish" },
    tt: { prayer: "Намаз вакыты", updated: "Яңартылды", fajr: "Фаҗр", sunrise: "Шөрек", dhuhr: "Зөһр", asr: "Аср", maghrib: "Мәгъриб", isha: "Иша", profile: "Профиль", notifications: "Белдермәләр", language: "Тел", appearance: "Күренеш", darkTheme: "Караңгы тема", notificationDesc: "Намаз искәртмәләре алу", remindBefore: "Искәртү", azanSound: "Азан тавышы", testSound: "Сынау", login: "Керү", logout: "Чыгу" },
    ky: { prayer: "Намаз убактысы", updated: "Жаңыртылды", fajr: "Таң", sunrise: "Күн чыгыш", dhuhr: "Бешим", asr: "Экинди", maghrib: "Шам", isha: "Куптан", profile: "Профиль", notifications: "Билдирмелер", language: "Тил", appearance: "Көрүнүш", darkTheme: "Караңгы тема", notificationDesc: "Намаз эскертмелерин алуу", remindBefore: "Эскертүү", azanSound: "Азан үнү", testSound: "Сыноо", login: "Кирүү", logout: "Чыгуу" },
    hi: { prayer: "नमाज़ का समय", updated: "अपडेट किया गया", fajr: "फज्र", sunrise: "सूर्योदय", dhuhr: "जुहर", asr: "असर", maghrib: "मगरिब", isha: "इशा", profile: "प्रोफ़ाइल", notifications: "सूचनाएं", language: "भाषा", appearance: "दिखावट", darkTheme: "डार्क थीम", notificationDesc: "नमाज़ रिमाइंडर प्राप्त करें", remindBefore: "याद दिलाएं", azanSound: "अज़ान की आवाज़", testSound: "परीक्षण", login: "साइन इन करें", logout: "साइन आउट करें" },
    es: { prayer: "Horario de oración", updated: "Actualizado", fajr: "Fajr", sunrise: "Amanecer", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha", profile: "Perfil", notifications: "Notificaciones", language: "Idioma", appearance: "Apariencia", darkTheme: "Tema oscuro", notificationDesc: "Recibir recordatorios de oración", remindBefore: "Recordar antes", azanSound: "Sonido del Adhan", testSound: "Probar", login: "Iniciar sesión", logout: "Cerrar sesión" }
};

let currentLanguage = localStorage.getItem('language') || 'ru';

function updateUILanguage() {
    const t = translations[currentLanguage];
    if (!t) return;
    
    let title = document.querySelector('.prayer-card h1');
    if (!title) {
        title = document.createElement('h1');
        document.querySelector('.header')?.insertBefore(title, document.querySelector('.date') || document.querySelector('.header').children[1]);
    }
    title.innerHTML = `🕌 ${t.prayer}`;
    
    const prayerNames = document.querySelectorAll('.prayer-name');
    if (prayerNames.length >= 6) {
        prayerNames[0].innerText = t.fajr;
        prayerNames[1].innerText = t.sunrise;
        prayerNames[2].innerText = t.dhuhr;
        prayerNames[3].innerText = t.asr;
        prayerNames[4].innerText = t.maghrib;
        prayerNames[5].innerText = t.isha;
    }
    
    const footer = document.querySelector('.footer-note p');
    if (footer) {
        footer.innerHTML = `<i class="far fa-clock"></i> ${t.updated}: <span id="updateTime">${document.getElementById('updateTime')?.innerText || '--:--'}</span>`;
    }
    
    const profileTitle = document.querySelector('.profile-full-header h2');
    if (profileTitle) profileTitle.innerText = t.profile;
    
    const tabs = document.querySelectorAll('.profile-tab');
    if (tabs.length >= 4) {
        tabs[0].innerHTML = "👤 " + t.login;
        tabs[1].innerHTML = "🔔 " + t.notifications;
        tabs[2].innerHTML = "🌐 " + t.language;
        tabs[3].innerHTML = "🎨 " + t.appearance;
    }
    
    const notifDesc = document.querySelector('#profile-tab-notifications .settings-item:first-child .settings-info p');
    if (notifDesc) notifDesc.innerText = t.notificationDesc;
    
    const remindLabel = document.querySelector('#profile-tab-notifications .settings-item:nth-child(2) .settings-info h4');
    if (remindLabel) remindLabel.innerText = t.remindBefore;
    
    const soundLabel = document.querySelector('#profile-tab-notifications .settings-item:nth-child(3) .settings-info h4');
    if (soundLabel) soundLabel.innerText = t.azanSound;
    
    const darkLabel = document.querySelector('#profile-tab-appearance .settings-info h4');
    if (darkLabel) darkLabel.innerText = t.darkTheme;
    
    const googleBtn = document.getElementById('profileGoogleSignIn');
    if (googleBtn) googleBtn.innerHTML = `<i class="fab fa-google"></i> ${t.login}`;
    
    const signOutBtn = document.getElementById('profileSignOutBtn');
    if (signOutBtn) signOutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${t.logout}`;
    
    const testBtn = document.getElementById('testAzanBtn');
    if (testBtn) testBtn.innerHTML = `<i class="fas fa-play"></i> ${t.testSound}`;
}

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
        calculateQiblaAngle();
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
    updateUILanguage();
    
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
                    if (kaabaIcon) kaabaIcon.classList.add('correct');
                } else {
                    hintSpan.innerHTML = `🔄 Повернитесь на ${Math.round(diff)}°`;
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
                        alert('Компас включён!');
                    } else alert('Доступ не разрешён');
                }).catch(() => alert('Ошибка доступа'));
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
                alert('Компас включён!');
            }
        };
    }
    
    // ==================== ПРОФИЛЬ ====================
    const fullscreenProfile = document.getElementById('fullscreenProfile');
    const profileBtn = document.getElementById('profileBtn');
    const closeProfile = document.getElementById('closeProfile');
    
    if (profileBtn) {
        profileBtn.onclick = function() {
            if (fullscreenProfile) fullscreenProfile.classList.add('show');
        };
    }
    
    if (closeProfile) {
        closeProfile.onclick = function() {
            if (fullscreenProfile) fullscreenProfile.classList.remove('show');
        };
    }
    
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
    
    // ==================== ЯЗЫК ====================
    const languageItems = document.querySelectorAll('.language-item');
    languageItems.forEach(item => {
        if (item.getAttribute('data-lang') === currentLanguage) item.classList.add('active');
        item.onclick = function() {
            const lang = this.getAttribute('data-lang');
            currentLanguage = lang;
            localStorage.setItem('language', lang);
            languageItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateUILanguage();
        };
    });
    
    // ==================== УВЕДОМЛЕНИЯ И ЗВУКИ ====================
    const azanSounds = {
        makkah: 'https://www.islamcan.com/audio/adhan/makkah-adhan.mp3',
        medina: 'https://www.islamcan.com/audio/adhan/medinah-adhan.mp3',
        fajr: 'https://www.islamcan.com/audio/adhan/fajr-adhan.mp3'
    };
    
    const notificationsToggle = document.getElementById('notificationsToggle');
    const notificationTimeSelect = document.getElementById('notificationTimeSelect');
    const azanSoundSelect = document.getElementById('azanSoundSelect');
    const testAzanBtn = document.getElementById('testAzanBtn');
    const azanAudio = document.getElementById('azanAudio');
    const azanSource = document.getElementById('azanSource');
    
    if (notificationsToggle) {
        const saved = localStorage.getItem('notificationsEnabled');
        if (saved !== null) notificationsToggle.checked = saved === 'true';
        notificationsToggle.onchange = function(e) {
            localStorage.setItem('notificationsEnabled', e.target.checked);
            if (e.target.checked && Notification.permission === 'default') Notification.requestPermission();
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
        if (saved && azanSounds[saved]) azanSoundSelect.value = saved;
        azanSoundSelect.onchange = function(e) {
            const selected = e.target.value;
            const soundUrl = azanSounds[selected];
            if (soundUrl && azanSource) {
                azanSource.src = soundUrl;
                azanAudio.load();
                localStorage.setItem('azanSound', selected);
            }
        };
    }
    
    if (testAzanBtn && azanAudio) {
        testAzanBtn.onclick = function() {
            azanAudio.play().catch(e => {
                console.log('Азан не воспроизводится:', e);
                alert('Нажмите на экран, чтобы разрешить звук, потом попробуйте снова');
            });
        };
    }
    
    const savedAzanSound = localStorage.getItem('azanSound');
    if (savedAzanSound && azanSounds[savedAzanSound] && azanSource) {
        azanSource.src = azanSounds[savedAzanSound];
        azanAudio.load();
    }
    
    // ==================== РЕАЛЬНЫЕ УВЕДОМЛЕНИЯ ====================
    let lastNotifiedPrayers = { Fajr: null, Dhuhr: null, Asr: null, Maghrib: null, Isha: null };
    
    function checkPrayerNotifications() {
        const enabled = localStorage.getItem('notificationsEnabled') === 'true';
        if (!enabled) return;
        
        const minutesBefore = parseInt(localStorage.getItem('notificationTime')) || 5;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'Fajr', display: 'Фаджр', time: prayerTimes.Fajr },
            { name: 'Dhuhr', display: 'Зухр', time: prayerTimes.Dhuhr },
            { name: 'Asr', display: 'Аср', time: prayerTimes.Asr },
            { name: 'Maghrib', display: 'Магриб', time: prayerTimes.Maghrib },
            { name: 'Isha', display: 'Иша', time: prayerTimes.Isha }
        ];
        
        prayers.forEach(prayer => {
            if (!prayer.time) return;
            const [h, m] = prayer.time.split(':').map(Number);
            const prayerMinutes = h * 60 + m;
            const notifyMinutes = prayerMinutes - minutesBefore;
            
            if (notifyMinutes === currentMinutes && lastNotifiedPrayers[prayer.name] !== new Date().toDateString()) {
                if (Notification.permission === 'granted') {
                    new Notification(`🕌 Скоро намаз ${prayer.display}`, {
                        body: `Осталось ${minutesBefore} минут до намаза ${prayer.display}`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png',
                        vibrate: [200, 100, 200]
                    });
                    if (azanAudio) azanAudio.play().catch(e => console.log('Азан заблокирован'));
                    lastNotifiedPrayers[prayer.name] = new Date().toDateString();
                }
            }
        });
    }
    
    setInterval(() => checkPrayerNotifications(), 60000);
    setTimeout(() => checkPrayerNotifications(), 5000);
    
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
    
    // ==================== МЕНЮ ====================
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuToggle && dropdownMenu) {
        menuToggle.onclick = function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        };
        document.onclick = function(e) {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.classList.remove('show');
        };
    }
    
    const aboutMenuItem = document.getElementById('aboutMenuItem');
    if (aboutMenuItem) {
        aboutMenuItem.onclick = function(e) {
            e.preventDefault();
            alert('📱 Намаз Дагестан — приложение для точного времени намазов.\nВерсия 2.0');
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
