// ==================== ПРЯМОЕ РАСПИСАНИЕ ДЛЯ ВСЕХ ГОРОДОВ ====================
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
let currentHeading = 0;
let qiblaDirection = 0;
let compassActive = false;
const MECCA = { lat: 21.4225, lng: 39.8262 };

document.addEventListener('DOMContentLoaded', function() {
    // ==================== МОДАЛЬНОЕ ОКНО ПРОФИЛЯ ====================
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.querySelector('.close-modal');
    
    function openModal() { profileModal.classList.add('show'); }
    function closeModalFunc() { profileModal.classList.remove('show'); }
    
    if (profileBtn) profileBtn.onclick = openModal;
    if (closeModal) closeModal.onclick = closeModalFunc;
    window.onclick = (e) => { if (e.target === profileModal) closeModalFunc(); };
    
    // Переключение вкладок в модальном окне
    const tabs = document.querySelectorAll('.modal-tab');
    const panes = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        };
    });
    
    // ==================== ГЕОЛОКАЦИЯ ПРИ ЗАГРУЗКЕ ====================
    function findNearestCity(lat, lng) {
        let nearest = cities[0];
        let minDistance = Infinity;
        for (let city of cities) {
            const dLat = city.lat - lat;
            const dLng = city.lng - lng;
            const distance = Math.sqrt(dLat*dLat + dLng*dLng);
            if (distance < minDistance) { minDistance = distance; nearest = city; }
        }
        return nearest;
    }
    
    function updateCityAndTimes(city) {
        currentCity = city;
        prayerTimes = city.times;
        document.getElementById('fajr').innerText = prayerTimes.Fajr;
        document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
        document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
        document.getElementById('asr').innerText = prayerTimes.Asr;
        document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
        document.getElementById('isha').innerText = prayerTimes.Isha;
        
        const select = document.getElementById('citySelect');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text === city.name) { select.selectedIndex = i; break; }
        }
        calculateNearestPrayer();
        calculateQiblaAngle();
    }
    
    function requestLocationPermission() {
        if (!navigator.geolocation) {
            document.getElementById('locationStatus').innerHTML = 'Ваш браузер не поддерживает геолокацию';
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const nearest = findNearestCity(position.coords.latitude, position.coords.longitude);
                updateCityAndTimes(nearest);
                localStorage.setItem('selectedCity', nearest.name);
                document.getElementById('locationStatus').innerHTML = `✅ Определён город: ${nearest.name}`;
                setTimeout(() => { document.getElementById('locationStatus').innerHTML = ''; }, 3000);
            },
            (error) => {
                let msg = '❌ Не удалось определить местоположение. ';
                if (error.code === error.PERMISSION_DENIED) msg += 'Разрешите доступ в настройках браузера.';
                document.getElementById('locationStatus').innerHTML = msg;
            }
        );
    }
    
    // Запрос геолокации при загрузке страницы (один раз)
    const locationAsked = localStorage.getItem('locationAsked');
    if (!locationAsked) {
        setTimeout(() => {
            if (confirm('📍 Разрешить сайту определить ваш город для точного времени намаза?')) {
                requestLocationPermission();
                localStorage.setItem('locationAsked', 'true');
            }
        }, 1000);
    }
    
    document.getElementById('enableLocationBtn')?.addEventListener('click', requestLocationPermission);
    
    // ==================== АВТОРИЗАЦИЯ ====================
    const googleBtn = document.getElementById('googleSignIn');
    const signOutBtn = document.getElementById('signOutBtn');
    const userInfoDiv = document.getElementById('userInfo');
    const authBtnsDiv = document.querySelector('.auth-buttons');
    
    if (googleBtn) {
        googleBtn.onclick = async () => {
            if (window.auth && window.signInWithPopup && window.provider) {
                try {
                    const result = await window.signInWithPopup(window.auth, window.provider);
                    const user = result.user;
                    userInfoDiv.innerHTML = `<p><strong>${user.displayName || user.email}</strong></p><p style="font-size:12px;">${user.email}</p>`;
                    if (authBtnsDiv) authBtnsDiv.style.display = 'none';
                    if (signOutBtn) signOutBtn.style.display = 'block';
                    localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email }));
                } catch(e) { console.error(e); alert('Ошибка входа'); }
            }
        };
    }
    
    if (signOutBtn) {
        signOutBtn.onclick = async () => {
            if (window.auth && window.signOut) await window.signOut(window.auth);
            localStorage.removeItem('user');
            userInfoDiv.innerHTML = '<p>Войдите, чтобы сохранять настройки</p>';
            if (authBtnsDiv) authBtnsDiv.style.display = 'flex';
            signOutBtn.style.display = 'none';
        };
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser && userInfoDiv) {
        const user = JSON.parse(savedUser);
        userInfoDiv.innerHTML = `<p><strong>${user.name || user.email}</strong></p>`;
        if (authBtnsDiv) authBtnsDiv.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'block';
    }
    
    // ==================== НАСТРОЙКИ ====================
    const notificationSelect = document.getElementById('notificationTime');
    const azanSelect = document.getElementById('azanSound');
    const darkModeCheckbox = document.getElementById('darkModeToggle');
    
    if (notificationSelect) {
        const saved = localStorage.getItem('notificationTime');
        if (saved) notificationSelect.value = saved;
        notificationSelect.onchange = (e) => localStorage.setItem('notificationTime', e.target.value);
    }
    if (azanSelect) {
        const saved = localStorage.getItem('azanSound');
        if (saved) azanSelect.value = saved;
        azanSelect.onchange = (e) => localStorage.setItem('azanSound', e.target.value);
    }
    
    // Тёмная тема
    function initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);
        if (darkModeCheckbox) darkModeCheckbox.checked = (theme === 'dark');
    }
    function toggleThemeManually(e) {
        const isDark = e.target.checked;
        const newTheme = isDark ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    initTheme();
    if (darkModeCheckbox) darkModeCheckbox.onchange = toggleThemeManually;
    
    // Кнопка темы на главном экране
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            const current = document.body.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (darkModeCheckbox) darkModeCheckbox.checked = (newTheme === 'dark');
            const icon = themeToggleBtn.querySelector('i');
            if (newTheme === 'dark') icon.classList.replace('fa-moon', 'fa-sun');
            else icon.classList.replace('fa-sun', 'fa-moon');
        };
    }
    
    // ==================== НАМАЗЫ ====================
    function updateCityFromSelect() {
        const select = document.getElementById('citySelect');
        const selectedName = select.options[select.selectedIndex]?.text;
        const found = cities.find(c => c.name === selectedName);
        if (found) updateCityAndTimes(found);
    }
    document.getElementById('citySelect')?.addEventListener('change', updateCityFromSelect);
    
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
    
    // ==================== КОМПАС В ОТДЕЛЬНОЙ ПАНЕЛИ ====================
    const compassPanel = document.getElementById('compassPanel');
    const compassMenuItem = document.getElementById('compassMenuItem');
    const closeCompass = document.getElementById('closeCompass');
    const requestLocationBtn = document.getElementById('requestLocation');
    
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
            let hint = document.getElementById('compassHint');
            if(hint) {
                let diff = Math.abs(angle%360); if(diff>180) diff=360-diff;
                if(diff<10) hint.innerHTML = "✅ Вы смотрите в сторону Киблы!";
                else hint.innerHTML = `🔄 Повернитесь ${angle>0?'налево':'направо'} на ${Math.round(diff)}°`;
            }
        } else {
            needle.style.transform = `translate(-50%,-50%) rotate(${qiblaDirection}deg)`;
        }
    }
    
    function initCompass() {
        calculateQiblaAngle();
        if (requestLocationBtn) {
            requestLocationBtn.onclick = () => {
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
    }
    
    if (compassMenuItem) {
        compassMenuItem.onclick = (e) => {
            e.preventDefault();
            if (compassPanel) compassPanel.style.display = 'block';
            initCompass();
        };
    }
    if (closeCompass) closeCompass.onclick = () => { if (compassPanel) compassPanel.style.display = 'none'; };
    
    // ==================== МЕНЮ ====================
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuBtn && dropdownMenu) {
        menuBtn.onclick = (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); };
        document.onclick = (e) => {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.classList.remove('show');
        };
    }
    
    const aboutMenuItem = document.getElementById('aboutMenuItem');
    if (aboutMenuItem) {
        aboutMenuItem.onclick = (e) => {
            e.preventDefault();
            alert('📱 Намаз Дагестан — приложение для точного определения времени намазов.\nВерсия 2.0\nРазработано для жителей Дагестана.\n\n📍 Автоопределение города\n🕌 Направление Киблы\n📖 Суры Корана\n⚙️ Настройки уведомлений');
        };
    }
    
    // Запуск
    displayPrayerTimes();
    setInterval(() => calculateNearestPrayer(), 60000);
});
