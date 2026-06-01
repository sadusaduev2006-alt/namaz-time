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

// ==================== ПЕРЕВОДЫ НА ВСЕ ЯЗЫКИ ====================
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
        compass: "Компас",
        quran: "Коран",
        settings: "Настройки",
        notifications: "Уведомления",
        language: "Язык",
        appearance: "Оформление",
        darkTheme: "Тёмная тема",
        notificationDesc: "Получать напоминания о намазе",
        remindBefore: "Напоминать за",
        azanSound: "Звук азана",
        testSound: "Тест звука",
        login: "Войти",
        logout: "Выйти"
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
        compass: "Compass",
        quran: "Quran",
        settings: "Settings",
        notifications: "Notifications",
        language: "Language",
        appearance: "Appearance",
        darkTheme: "Dark Theme",
        notificationDesc: "Receive prayer reminders",
        remindBefore: "Remind before",
        azanSound: "Azan sound",
        testSound: "Test sound",
        login: "Sign in",
        logout: "Sign out"
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
        about: "عن التطبيق",
        compass: "البوصلة",
        quran: "القرآن",
        settings: "الإعدادات",
        notifications: "الإشعارات",
        language: "اللغة",
        appearance: "المظهر",
        darkTheme: "الوضع المظلم",
        notificationDesc: "تلقي تذكيرات الصلاة",
        remindBefore: "تذكير قبل",
        azanSound: "صوت الأذان",
        testSound: "اختبار الصوت",
        login: "تسجيل الدخول",
        logout: "تسجيل الخروج"
    },
    kk: {
        prayer: "Намаз уақыты",
        updated: "Жаңартылды",
        fajr: "Фажр",
        sunrise: "Шурық",
        dhuhr: "Зуһр",
        asr: "Аср",
        maghrib: "Мағриб",
        isha: "Иша",
        profile: "Профиль",
        about: "Қосымша туралы",
        compass: "Компас",
        quran: "Құран",
        settings: "Баптаулар",
        notifications: "Хабарландырулар",
        language: "Тіл",
        appearance: "Көрініс",
        darkTheme: "Қараңғы тақырып",
        notificationDesc: "Намаз ескертулерін алу",
        remindBefore: "Еске салу",
        azanSound: "Азан дыбысы",
        testSound: "Дыбысты тексеру",
        login: "Кіру",
        logout: "Шығу"
    },
    tr: {
        prayer: "Namaz Vakti",
        updated: "Güncellendi",
        fajr: "İmsak",
        sunrise: "Güneş",
        dhuhr: "Öğle",
        asr: "İkindi",
        maghrib: "Akşam",
        isha: "Yatsı",
        profile: "Profil",
        about: "Hakkında",
        compass: "Pusula",
        quran: "Kuran",
        settings: "Ayarlar",
        notifications: "Bildirimler",
        language: "Dil",
        appearance: "Görünüm",
        darkTheme: "Koyu Tema",
        notificationDesc: "Namaz hatırlatıcıları al",
        remindBefore: "Hatırlatma",
        azanSound: "Ezan sesi",
        testSound: "Sesi test et",
        login: "Giriş yap",
        logout: "Çıkış yap"
    },
    uz: {
        prayer: "Namoz vaqti",
        updated: "Yangilandi",
        fajr: "Bomdod",
        sunrise: "Quyosh",
        dhuhr: "Peshin",
        asr: "Asr",
        maghrib: "Shom",
        isha: "Xufton",
        profile: "Profil",
        about: "Ilova haqida",
        compass: "Kompas",
        quran: "Qurʼon",
        settings: "Sozlamalar",
        notifications: "Bildirishnomalar",
        language: "Til",
        appearance: "Koʻrinish",
        darkTheme: "Qorongʻu mavzu",
        notificationDesc: "Namoz eslatmalarini olish",
        remindBefore: "Eslatma",
        azanSound: "Azon ovozi",
        testSound: "Ovozni sinash",
        login: "Kirish",
        logout: "Chiqish"
    },
    tt: {
        prayer: "Намаз вакыты",
        updated: "Яңартылды",
        fajr: "Фаҗр",
        sunrise: "Шөрек",
        dhuhr: "Зөһр",
        asr: "Аср",
        maghrib: "Мәгъриб",
        isha: "Иша",
        profile: "Профиль",
        about: "Кушымта турында",
        compass: "Компас",
        quran: "Коръән",
        settings: "Көйләүләр",
        notifications: "Белдермәләр",
        language: "Тел",
        appearance: "Күренеш",
        darkTheme: "Караңгы тема",
        notificationDesc: "Намаз искәртмәләре алу",
        remindBefore: "Искәртү",
        azanSound: "Азан тавышы",
        testSound: "Тавышны тикшерү",
        login: "Керү",
        logout: "Чыгу"
    },
    ky: {
        prayer: "Намаз убактысы",
        updated: "Жаңыртылды",
        fajr: "Таң",
        sunrise: "Күн чыгыш",
        dhuhr: "Бешим",
        asr: "Экинди",
        maghrib: "Шам",
        isha: "Куптан",
        profile: "Профиль",
        about: "Кошумча жөнүндө",
        compass: "Компас",
        quran: "Куран",
        settings: "Орнотуулар",
        notifications: "Билдирмелер",
        language: "Тил",
        appearance: "Көрүнүш",
        darkTheme: "Караңгы тема",
        notificationDesc: "Намаз эскертмелерин алуу",
        remindBefore: "Эскертүү",
        azanSound: "Азан үнү",
        testSound: "Үндү текшерүү",
        login: "Кирүү",
        logout: "Чыгуу"
    },
    hi: {
        prayer: "नमाज़ का समय",
        updated: "अपडेट किया गया",
        fajr: "फज्र",
        sunrise: "सूर्योदय",
        dhuhr: "जुहर",
        asr: "असर",
        maghrib: "मगरिब",
        isha: "इशा",
        profile: "प्रोफ़ाइल",
        about: "ऐप के बारे में",
        compass: "कम्पास",
        quran: "कुरान",
        settings: "सेटिंग्स",
        notifications: "सूचनाएं",
        language: "भाषा",
        appearance: "दिखावट",
        darkTheme: "डार्क थीम",
        notificationDesc: "नमाज़ रिमाइंडर प्राप्त करें",
        remindBefore: "याद दिलाएं",
        azanSound: "अज़ान की आवाज़",
        testSound: "आवाज़ टेस्ट करें",
        login: "साइन इन करें",
        logout: "साइन आउट करें"
    },
    es: {
        prayer: "Horario de oración",
        updated: "Actualizado",
        fajr: "Fajr",
        sunrise: "Amanecer",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
        profile: "Perfil",
        about: "Acerca de",
        compass: "Brújula",
        quran: "Corán",
        settings: "Ajustes",
        notifications: "Notificaciones",
        language: "Idioma",
        appearance: "Apariencia",
        darkTheme: "Tema oscuro",
        notificationDesc: "Recibir recordatorios de oración",
        remindBefore: "Recordar antes",
        azanSound: "Sonido del Adhan",
        testSound: "Probar sonido",
        login: "Iniciar sesión",
        logout: "Cerrar sesión"
    }
};

let currentLanguage = localStorage.getItem('language') || 'ru';

// Функция обновления всего интерфейса
function updateUILanguage() {
    const t = translations[currentLanguage];
    if (!t) return;
    
    // Заголовок
    const header = document.querySelector('.header');
    let title = document.querySelector('.prayer-card h1');
    if (!title) {
        title = document.createElement('h1');
        header?.insertBefore(title, header.querySelector('.date') || header.children[1]);
    }
    title.innerHTML = `🕌 ${t.prayer}`;
    
    // Названия намазов
    const prayerNames = document.querySelectorAll('.prayer-name');
    if (prayerNames.length >= 6) {
        prayerNames[0].innerText = t.fajr;
        prayerNames[1].innerText = t.sunrise;
        prayerNames[2].innerText = t.dhuhr;
        prayerNames[3].innerText = t.asr;
        prayerNames[4].innerText = t.maghrib;
        prayerNames[5].innerText = t.isha;
    }
    
    // Футер
    const footer = document.querySelector('.footer-note p');
    if (footer) {
        footer.innerHTML = `<i class="far fa-clock"></i> ${t.updated}: <span id="updateTime">${document.getElementById('updateTime')?.innerText || '--:--'}</span>`;
    }
    
    // Заголовки в профиле
    const profileTitle = document.querySelector('.profile-full-header h2');
    if (profileTitle) profileTitle.innerText = t.profile;
    
    const tabs = document.querySelectorAll('.profile-tab');
    if (tabs.length >= 4) {
        tabs[0].innerHTML = "👤 " + t.login;
        tabs[1].innerHTML = "🔔 " + t.notifications;
        tabs[2].innerHTML = "🌐 " + t.language;
        tabs[3].innerHTML = "🎨 " + t.appearance;
    }
    
    // Настройки уведомлений
    const notifTitle = document.querySelector('#profile-tab-notifications h4');
    if (notifTitle) notifTitle.innerText = t.notifications;
    
    const notifDesc = document.querySelector('#profile-tab-notifications .settings-item:first-child .settings-info p');
    if (notifDesc) notifDesc.innerText = t.notificationDesc;
    
    const remindLabel = document.querySelector('#profile-tab-notifications .settings-item:nth-child(2) .settings-info h4');
    if (remindLabel) remindLabel.innerText = t.remindBefore;
    
    const soundLabel = document.querySelector('#profile-tab-notifications .settings-item:nth-child(3) .settings-info h4');
    if (soundLabel) soundLabel.innerText = t.azanSound;
    
    const testBtn = document.querySelector('#testAzanBtn span');
    if (testBtn && testBtn.innerText === "Тест") testBtn.innerText = t.testSound;
    
    // Тёмная тема
    const darkLabel = document.querySelector('#profile-tab-appearance .settings-info h4');
    if (darkLabel) darkLabel.innerText = t.darkTheme;
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('profileSignOutBtn');
    if (logoutBtn && logoutBtn.querySelector('span')) logoutBtn.querySelector('span').innerText = t.logout;
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
    
    // ==================== ЯЗЫК (С РЕАЛЬНЫМ ПЕРЕКЛЮЧЕНИЕМ) ====================
    const languageItems = document.querySelectorAll('.language-item');
    
    languageItems.forEach(item => {
        if (item.getAttribute('data-lang') === currentLanguage) {
            item.classList.add('active');
        }
        
        item.onclick = function() {
            const lang = this.getAttribute('data-lang');
            currentLanguage = lang;
            localStorage.setItem('language', lang);
            
            languageItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем весь интерфейс
            updateUILanguage();
            
            // Обновляем текст кнопок в профиле
            const t = translations[lang];
            if (t) {
                const googleBtn = document.getElementById('profileGoogleSignIn');
                if (googleBtn) googleBtn.innerHTML = `<i class="fab fa-google"></i> ${t.login}`;
                
                const signOutBtn = document.getElementById('profileSignOutBtn');
                if (signOutBtn) signOutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${t.logout}`;
                
                const testBtn = document.getElementById('testAzanBtn');
                if (testBtn) testBtn.innerHTML = `<i class="fas fa-play"></i> ${t.testSound}`;
            }
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
// Простой скрипт для проверки смены языка
document.addEventListener('DOMContentLoaded', function() {
    console.log("Скрипт загружен");
    
    // Находим все кнопки языков
    const langBtns = document.querySelectorAll('.language-item');
    console.log("Найдено кнопок языков:", langBtns.length);
    
    langBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log("Выбран язык:", lang);
            alert("Вы выбрали язык: " + lang);
            
            // Меняем текст заголовка для теста
            const title = document.querySelector('.prayer-card h1');
            if (title) {
                if (lang === 'ru') title.innerHTML = "🕌 Время намаза";
                if (lang === 'en') title.innerHTML = "🕌 Prayer Times";
                if (lang === 'ar') title.innerHTML = "🕌 أوقات الصلاة";
                if (lang === 'tr') title.innerHTML = "🕌 Namaz Vakti";
                if (lang === 'kk') title.innerHTML = "🕌 Намаз уақыты";
            }
            
            // Сохраняем выбор
            localStorage.setItem('language', lang);
            
            // Убираем активный класс у всех и добавляем текущему
            langBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Восстанавливаем сохранённый язык
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        console.log("Восстановлен язык:", savedLang);
        const activeBtn = document.querySelector(`.language-item[data-lang="${savedLang}"]`);
        if (activeBtn) activeBtn.click();
    }
});
// ==================== РЕАЛЬНЫЕ УВЕДОМЛЕНИЯ ====================
let lastNotifiedPrayers = {
    Fajr: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null
};

// Функция проверки уведомлений
function checkPrayerNotifications() {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    if (!notificationsEnabled) return;
    
    const notificationMinutes = parseInt(localStorage.getItem('notificationTime')) || 5;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Fajr', displayName: 'Фаджр', time: prayerTimes.Fajr },
        { name: 'Dhuhr', displayName: 'Зухр', time: prayerTimes.Dhuhr },
        { name: 'Asr', displayName: 'Аср', time: prayerTimes.Asr },
        { name: 'Maghrib', displayName: 'Магриб', time: prayerTimes.Maghrib },
        { name: 'Isha', displayName: 'Иша', time: prayerTimes.Isha }
    ];
    
    prayers.forEach(prayer => {
        if (!prayer.time) return;
        
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;
        const notifyMinutes = prayerMinutes - notificationMinutes;
        
        // Проверяем, нужно ли отправить уведомление (в пределах текущей минуты)
        if (notifyMinutes === currentMinutes && lastNotifiedPrayers[prayer.name] !== new Date().toDateString()) {
            // Отправляем уведомление
            if (Notification.permission === 'granted') {
                new Notification(`🕌 Скоро намаз ${prayer.displayName}`, {
                    body: `Осталось ${notificationMinutes} минут до намаза ${prayer.displayName}`,
                    icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png',
                    vibrate: [200, 100, 200],
                    sound: 'default'
                });
                
                // Воспроизводим азан
                const azanAudio = document.getElementById('azanAudio');
                if (azanAudio) {
                    azanAudio.play().catch(e => console.log('Азан заблокирован браузером'));
                }
                
                // Запоминаем, что уведомление отправлено
                lastNotifiedPrayers[prayer.name] = new Date().toDateString();
            }
        }
    });
}

// Запрашиваем разрешение на уведомления при загрузке
if (Notification.permission === 'default') {
    Notification.requestPermission();
}

// Запускаем проверку каждую минуту
setInterval(() => {
    checkPrayerNotifications();
}, 60000);

// Первая проверка при загрузке
setTimeout(() => {
    checkPrayerNotifications();
}, 5000);
