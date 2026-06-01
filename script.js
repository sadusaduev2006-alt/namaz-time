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

// Координаты Мекки (объявляем ДО использования)
const MECCA = { lat: 21.4225, lng: 39.8262 };

// ==================== ОТОБРАЖЕНИЕ ВРЕМЕНИ ====================
function displayPrayerTimes() {
    if (document.getElementById('fajr')) {
        document.getElementById('fajr').innerText = prayerTimes.Fajr;
        document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
        document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
        document.getElementById('asr').innerText = prayerTimes.Asr;
        document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
        document.getElementById('isha').innerText = prayerTimes.Isha;
        document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    }
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

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    // Восстанавливаем сохранённый город
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const found = cities.find(c => c.name === savedCity);
        if (found) updateCityAndTimes(found);
    } else {
        displayPrayerTimes();
    }
    
    // ========== ВЫБОР ГОРОДА ==========
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            const selected = citySelect.options[citySelect.selectedIndex]?.text;
            const found = cities.find(c => c.name === selected);
            if (found) updateCityAndTimes(found);
        });
    }
    
    // ========== ПРОФИЛЬ ==========
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('fullscreenProfile');
    const closeProfile = document.getElementById('closeProfile');
    
    if (profileBtn && profileModal) {
        profileBtn.onclick = function(e) {
            e.preventDefault();
            console.log("Профиль открыт");
            profileModal.classList.add('show');
        };
    }
    
    if (closeProfile && profileModal) {
        closeProfile.onclick = function(e) {
            e.preventDefault();
            console.log("Профиль закрыт");
            profileModal.classList.remove('show');
        };
    }
    
    // ========== КОМПАС ==========
    const compassBtn = document.getElementById('floatingCompassBtn');
    const compassModal = document.getElementById('fullscreenCompass');
    const closeCompass = document.getElementById('closeFullscreenCompass');
    const startCompassBtn = document.getElementById('startCompassFull');
    const needleFull = document.getElementById('needleFull');
    const degreeSpan = document.getElementById('qiblaDegreeFull');
    const hintSpan = document.getElementById('compassHintFull');
    const kaabaIcon = document.getElementById('kaabaIcon');
    
    let currentHeading = 0;
    let qiblaDirection = 0;
    let compassActive = false;
    
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
    
    if (compassBtn && compassModal) {
        compassBtn.onclick = function(e) {
            e.preventDefault();
            console.log("Компас открыт");
            compassModal.classList.add('show');
            calculateQiblaAngle();
        };
    }
    
    if (closeCompass && compassModal) {
        closeCompass.onclick = function(e) {
            e.preventDefault();
            console.log("Компас закрыт");
            compassModal.classList.remove('show');
        };
    }
    
    if (startCompassBtn) {
        startCompassBtn.onclick = function(e) {
            e.preventDefault();
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(perm => {
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        alert('Компас включён! Поворачивайте телефон');
                    } else alert('Доступ не разрешён');
                }).catch(() => alert('Ошибка доступа'));
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
                alert('Компас включён! Поворачивайте телефон');
            }
        };
    }
    
    // ========== МЕНЮ (ТРИ ТОЧКИ) ==========
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
        };
        
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // ========== О ПРИЛОЖЕНИИ ==========
    const aboutItem = document.getElementById('aboutMenuItem');
    if (aboutItem) {
        aboutItem.onclick = function(e) {
            e.preventDefault();
            alert('📱 Намаз Дагестан\nВерсия 2.0\n\n📍 Махачкала и города Дагестана\n🕌 Направление Киблы\n📖 Священный Коран');
        };
    }
    
    // ========== ВКЛАДКИ ПРОФИЛЯ ==========
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profilePanes = document.querySelectorAll('.profile-pane');
    
    profileTabs.forEach(tab => {
        tab.onclick = function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-profile-tab');
            profileTabs.forEach(t => t.classList.remove('active'));
            profilePanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const activePane = document.getElementById(`profile-tab-${tabId}`);
            if (activePane) activePane.classList.add('active');
        };
    });
    
    // ========== ТЁМНАЯ ТЕМА ==========
    const darkToggle = document.getElementById('profileDarkModeToggle');
    function initTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', theme);
        if (darkToggle) darkToggle.checked = (theme === 'dark');
    }
    if (darkToggle) {
        darkToggle.onchange = function(e) {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        };
    }
    initTheme();
    
    // ========== ЯЗЫКИ ==========
    const langItems = document.querySelectorAll('.language-item');
    const currentLang = localStorage.getItem('language') || 'ru';
    langItems.forEach(item => {
        if (item.getAttribute('data-lang') === currentLang) item.classList.add('active');
        item.onclick = function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            langItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const translations = {
                ru: "Время намаза",
                en: "Prayer Times",
                ar: "أوقات الصلاة",
                kk: "Намаз уақыты",
                tr: "Namaz Vakti"
            };
            const title = document.querySelector('.prayer-card h1');
            if (title && translations[lang]) {
                title.innerHTML = `🕌 ${translations[lang]}`;
            }
        };
    });
    
    // ========== УВЕДОМЛЕНИЯ ==========
    const notifToggle = document.getElementById('notificationsToggle');
    const notifTime = document.getElementById('notificationTimeSelect');
    const azanSelect = document.getElementById('azanSoundSelect');
    const testAzan = document.getElementById('testAzanBtn');
    const azanAudio = document.getElementById('azanAudio');
    const azanSource = document.getElementById('azanSource');
    
    // Рабочие ссылки на азан
    const azanUrls = {
        makkah: 'https://cdn.islamic.network/audio/adhan/ar-makkah.mp3',
        medina: 'https://cdn.islamic.network/audio/adhan/ar-medina.mp3',
        fajr: 'https://cdn.islamic.network/audio/adhan/ar-fajr.mp3'
    };
    
    if (notifToggle) {
        const saved = localStorage.getItem('notificationsEnabled');
        if (saved !== null) notifToggle.checked = saved === 'true';
        notifToggle.onchange = function(e) {
            localStorage.setItem('notificationsEnabled', e.target.checked);
            if (e.target.checked && Notification.permission === 'default') Notification.requestPermission();
        };
    }
    
    if (notifTime) {
        const saved = localStorage.getItem('notificationTime');
        if (saved) notifTime.value = saved;
        notifTime.onchange = function(e) {
            localStorage.setItem('notificationTime', e.target.value);
        };
    }
    
    if (azanSelect && azanAudio && azanSource) {
        const saved = localStorage.getItem('azanSound');
        if (saved && azanUrls[saved]) {
            azanSelect.value = saved;
            azanSource.src = azanUrls[saved];
            azanAudio.load();
        }
        azanSelect.onchange = function(e) {
            const url = azanUrls[e.target.value];
            if (url) {
                azanSource.src = url;
                azanAudio.load();
                localStorage.setItem('azanSound', e.target.value);
            }
        };
    }
    
    if (testAzan && azanAudio) {
        testAzan.onclick = function(e) {
            e.preventDefault();
            azanAudio.play().catch(function() {
                alert('Нажмите на экран, затем попробуйте снова');
            });
        };
    }
    
    // ========== УВЕДОМЛЕНИЯ О НАМАЗАХ ==========
    let notified = { Fajr: null, Dhuhr: null, Asr: null, Maghrib: null, Isha: null };
    
    function checkNotifications() {
        const enabled = localStorage.getItem('notificationsEnabled') === 'true';
        if (!enabled) return;
        
        const minutesBefore = parseInt(localStorage.getItem('notificationTime')) || 5;
        const now = new Date();
        const current = now.getHours() * 60 + now.getMinutes();
        const today = now.toDateString();
        
        const prayers = [
            { name: 'Fajr', display: 'Фаджр', time: prayerTimes.Fajr },
            { name: 'Dhuhr', display: 'Зухр', time: prayerTimes.Dhuhr },
            { name: 'Asr', display: 'Аср', time: prayerTimes.Asr },
            { name: 'Maghrib', display: 'Магриб', time: prayerTimes.Maghrib },
            { name: 'Isha', display: 'Иша', time: prayerTimes.Isha }
        ];
        
        prayers.forEach(p => {
            if (!p.time) return;
            const [h, m] = p.time.split(':').map(Number);
            const prayerMin = h * 60 + m;
            const notifyMin = prayerMin - minutesBefore;
            
            if (notifyMin === current && notified[p.name] !== today) {
                if (Notification.permission === 'granted') {
                    new Notification(`🕌 Скоро намаз ${p.display}`, {
                        body: `Осталось ${minutesBefore} минут`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png'
                    });
                    notified[p.name] = today;
                }
            }
        });
    }
    
    setInterval(checkNotifications, 60000);
    setTimeout(checkNotifications, 5000);
    
    // ========== АВТОРИЗАЦИЯ ==========
    const googleBtn = document.getElementById('profileGoogleSignIn');
    const signOutBtn = document.getElementById('profileSignOutBtn');
    const userInfo = document.getElementById('profileUserInfo');
    const authBtns = document.querySelector('.profile-auth-buttons');
    
    if (googleBtn && window.auth && window.signInWithPopup && window.provider) {
        googleBtn.onclick = async function(e) {
            e.preventDefault();
            try {
                const result = await window.signInWithPopup(window.auth, window.provider);
                const user = result.user;
                if (userInfo) userInfo.innerHTML = `<p><strong>${user.displayName || user.email}</strong></p>`;
                if (authBtns) authBtns.style.display = 'none';
                if (signOutBtn) signOutBtn.style.display = 'block';
                localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email }));
            } catch(err) {
                alert('Ошибка входа');
            }
        };
    }
    
    if (signOutBtn) {
        signOutBtn.onclick = async function(e) {
            e.preventDefault();
            if (window.auth && window.signOut) await window.signOut(window.auth);
            localStorage.removeItem('user');
            if (userInfo) userInfo.innerHTML = '<p>Войдите, чтобы сохранять настройки</p>';
            if (authBtns) authBtns.style.display = 'flex';
            signOutBtn.style.display = 'none';
        };
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser && userInfo) {
        const user = JSON.parse(savedUser);
        userInfo.innerHTML = `<p><strong>${user.name || user.email}</strong></p>`;
        if (authBtns) authBtns.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'block';
    }
    
    setTimeout(function() {
        if (Notification && Notification.permission === 'default') Notification.requestPermission();
    }, 2000);
    
    console.log("Инициализация завершена");
});
