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

document.addEventListener('DOMContentLoaded', function() {
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
            if (select.options[i].text === city.name) { 
                select.selectedIndex = i; 
                break; 
            }
        }
        localStorage.setItem('selectedCity', city.name);
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
                                if (hintSpan) {
                                    hintSpan.innerHTML = "❌ Доступ к компасу не разрешён";
                                    hintSpan.style.color = "#f44336";
                                }
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            if (hintSpan) {
                                hintSpan.innerHTML = "❌ Ошибка доступа к компасу";
                                hintSpan.style.color = "#f44336";
                            }
                        });
                } else if (typeof DeviceOrientationEvent !== 'undefined') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    compassActive = true;
                    if (hintSpan) {
                        hintSpan.innerHTML = "✅ Компас активен! Поворачивайте телефон";
                        hintSpan.style.color = "#4CAF50";
                        hintSpan.style.background = "rgba(76, 175, 80, 0.2)";
                    }
                } else {
                    if (hintSpan) {
                        hintSpan.innerHTML = "❌ Ваш браузер не поддерживает компас";
                        hintSpan.style.color = "#f44336";
                    }
                }
            };
        }
    }
    
    function handleOrientation(event) {
        let heading = null;
        if (event.webkitCompassHeading !== undefined) {
            heading = event.webkitCompassHeading;
        } else if (event.alpha !== undefined && event.alpha !== null) {
            heading = 360 - event.alpha;
        }
        if (heading !== null && heading !== undefined) {
            currentHeading = heading;
            updateCompassNeedle();
        }
    }
    
    if (floatingCompassBtn) {
        const newFloatingBtn = floatingCompassBtn.cloneNode(true);
        floatingCompassBtn.parentNode.replaceChild(newFloatingBtn, floatingCompassBtn);
        newFloatingBtn.onclick = () => {
            if (fullscreenCompass) {
                fullscreenCompass.classList.add('show');
                initFullscreenCompass();
            }
        };
    }
    
    if (closeCompass) {
        const newCloseBtn = closeCompass.cloneNode(true);
        closeCompass.parentNode.replaceChild(newCloseBtn, closeCompass);
        newCloseBtn.onclick = () => {
            if (fullscreenCompass) fullscreenCompass.classList.remove('show');
        };
    }
    
    if (fullscreenCompass) {
        fullscreenCompass.onclick = (e) => {
            if (e.target === fullscreenCompass) {
                fullscreenCompass.classList.remove('show');
            }
        };
    }
    
    // ==================== ПРОФИЛЬ И НАСТРОЙКИ ====================
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (profileBtn) {
        profileBtn.onclick = () => {
            if (profileModal) profileModal.classList.add('show');
        };
    }
    if (closeModal) {
        closeModal.onclick = () => {
            if (profileModal) profileModal.classList.remove('show');
        };
    }
    window.onclick = (e) => { 
        if (e.target === profileModal) profileModal.classList.remove('show'); 
    };
    
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
    
    // ==================== ГЕОЛОКАЦИЯ ====================
    function findNearestCity(lat, lng) {
        let nearest = cities[0];
        let minDist = Infinity;
        for (let city of cities) {
            const dist = Math.hypot(city.lat - lat, city.lng - lng);
            if (dist < minDist) { 
                minDist = dist; 
                nearest = city; 
            }
        }
        return nearest;
    }
    
    function requestLocation() {
        if (!navigator.geolocation) { 
            document.getElementById('locationStatus').innerHTML = '❌ Браузер не поддерживает геолокацию'; 
            return; 
        }
        const statusDiv = document.getElementById('locationStatus');
        if (statusDiv) statusDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Определение...';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
                updateCityAndTimes(nearest);
                if (statusDiv) {
                    statusDiv.innerHTML = `✅ Определён город: ${nearest.name}`;
                    setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
                }
            },
            (err) => {
                let msg = '❌ Ошибка: ';
                if (err.code === err.PERMISSION_DENIED) msg += 'Разрешите доступ в настройках';
                else msg += 'Не удалось определить';
                if (statusDiv) statusDiv.innerHTML = msg;
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }
    
    const locationAsked = localStorage.getItem('locationAsked');
    if (!locationAsked) {
        setTimeout(() => {
            if (confirm('📍 Разрешить сайту определить ваш город для точного времени намаза?')) {
                requestLocation();
                localStorage.setItem('locationAsked', 'true');
            }
        }, 1000);
    }
    
    document.getElementById('enableLocationBtn')?.addEventListener('click', requestLocation);
    
    // ==================== АВТОРИЗАЦИЯ ====================
    const googleBtn = document.getElementById('googleSignIn');
    const signOutBtn = document.getElementById('signOutBtn');
    const userInfoDiv = document.getElementById('userInfo');
    const authBtns = document.querySelector('.auth-buttons');
    
    if (googleBtn) {
        googleBtn.onclick = async () => {
            if (window.auth && window.signInWithPopup && window.provider) {
                try {
                    const result = await window.signInWithPopup(window.auth, window.provider);
                    const user = result.user;
                    if (userInfoDiv) {
                        userInfoDiv.innerHTML = `<p><strong>${user.displayName || user.email}</strong></p><p style="font-size:12px;">${user.email}</p>`;
                    }
                    if (authBtns) authBtns.style.display = 'none';
                    if (signOutBtn) signOutBtn.style.display = 'block';
                    localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email }));
                } catch(e) { 
                    console.error(e); 
                    alert('Ошибка входа'); 
                }
            } else {
                alert('Firebase не инициализирован. Настройте конфигурацию Firebase в index.html');
            }
        };
    }
    
    if (signOutBtn) {
        signOutBtn.onclick = async () => {
            if (window.auth && window.signOut) await window.signOut(window.auth);
            localStorage.removeItem('user');
            if (userInfoDiv) userInfoDiv.innerHTML = '<p>Войдите, чтобы сохранять настройки</p>';
            if (authBtns) authBtns.style.display = 'flex';
            signOutBtn.style.display = 'none';
        };
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser && userInfoDiv) {
        const user = JSON.parse(savedUser);
        userInfoDiv.innerHTML = `<p><strong>${user.name || user.email}</strong></p>`;
        if (authBtns) authBtns.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'block';
    }
    
    // ==================== НАСТРОЙКИ ====================
    const notificationSelect = document.getElementById('notificationTime');
    const azanSelect = document.getElementById('azanSound');
    
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
    
    // ==================== ТЁМНАЯ ТЕМА ====================
    const darkModeCheckbox = document.getElementById('darkModeToggle');
    
    function initTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
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
    
    // ==================== МЕНЮ ====================
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.onclick = (e) => { 
            e.stopPropagation(); 
            dropdownMenu.classList.toggle('show'); 
        };
        document.onclick = (e) => {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        };
    }
    
    document.getElementById('aboutMenuItem')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('📱 Намаз Дагестан — приложение для точного определения времени намазов.\nВерсия 2.0\n\n📍 Автоопределение города\n🕌 Направление Киблы\n📖 Священный Коран\n\nРазработано для жителей Дагестана');
    });
});
