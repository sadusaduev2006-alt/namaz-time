const citiesData = {
    "Махачкала": { Fajr: "02:07", Sunrise: "04:14", Dhuhr: "11:51", Asr: "15:51", Maghrib: "19:24", Isha: "21:06" },
    "Дербент": { Fajr: "02:15", Sunrise: "04:22", Dhuhr: "11:59", Asr: "15:59", Maghrib: "19:32", Isha: "21:14" },
    "Хасавюрт": { Fajr: "02:05", Sunrise: "04:12", Dhuhr: "11:49", Asr: "15:49", Maghrib: "19:22", Isha: "21:04" },
    "Буйнакск": { Fajr: "02:09", Sunrise: "04:16", Dhuhr: "11:53", Asr: "15:53", Maghrib: "19:26", Isha: "21:08" },
    "Избербаш": { Fajr: "02:11", Sunrise: "04:18", Dhuhr: "11:55", Asr: "15:55", Maghrib: "19:28", Isha: "21:10" },
    "Кизляр": { Fajr: "02:00", Sunrise: "04:07", Dhuhr: "11:44", Asr: "15:44", Maghrib: "19:17", Isha: "20:59" },
    "Каспийск": { Fajr: "02:08", Sunrise: "04:15", Dhuhr: "11:52", Asr: "15:52", Maghrib: "19:25", Isha: "21:07" }
};

let currentCityName = "Махачкала";
let prayerTimes = citiesData[currentCityName];

function updatePrayerTimes() {
    document.getElementById('fajr').innerText = prayerTimes.Fajr;
    document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
    document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
    document.getElementById('asr').innerText = prayerTimes.Asr;
    document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
    document.getElementById('isha').innerText = prayerTimes.Isha;
    document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

document.addEventListener('DOMContentLoaded', () => {
    updatePrayerTimes();

    const citySelect = document.getElementById('citySelect');
    citySelect.addEventListener('change', (e) => {
        currentCityName = e.target.value;
        prayerTimes = citiesData[currentCityName];
        updatePrayerTimes();
        localStorage.setItem('selectedCity', currentCityName);
    });
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity && citiesData[savedCity]) {
        currentCityName = savedCity;
        prayerTimes = citiesData[currentCityName];
        citySelect.value = savedCity;
        updatePrayerTimes();
    }

    // --- ПРОФИЛЬ ---
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('fullscreenProfile');
    const closeProfile = document.getElementById('closeProfile');
    if (profileBtn) profileBtn.onclick = () => profileModal.classList.add('show');
    if (closeProfile) closeProfile.onclick = () => profileModal.classList.remove('show');

    // --- ТЕМА ---
    const darkToggle = document.getElementById('profileDarkModeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    if (darkToggle) darkToggle.checked = (savedTheme === 'dark');
    if (darkToggle) darkToggle.onchange = (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // --- УВЕДОМЛЕНИЯ ---
    const notifToggle = document.getElementById('notificationsToggle');
    const notifTime = document.getElementById('notificationTimeSelect');
    if (notifToggle) {
        notifToggle.checked = localStorage.getItem('notificationsEnabled') === 'true';
        notifToggle.onchange = (e) => {
            localStorage.setItem('notificationsEnabled', e.target.checked);
            if (e.target.checked && Notification.permission === 'default') Notification.requestPermission();
        };
    }
    if (notifTime) {
        if (localStorage.getItem('notificationTime')) notifTime.value = localStorage.getItem('notificationTime');
        notifTime.onchange = (e) => localStorage.setItem('notificationTime', e.target.value);
    }

    // --- ТЕСТ АЗАНА ---
    const azanAudio = document.getElementById('azanAudio');
    const testBtn = document.getElementById('testAzanBtn');
    const soundSelect = document.getElementById('azanSoundSelect');
    const soundMap = {
        'makkah': 'https://cdn.islamic.network/audio/adhan/ar-makkah.mp3',
        'medina': 'https://cdn.islamic.network/audio/adhan/ar-medina.mp3'
    };
    if (testBtn && azanAudio) {
        testBtn.onclick = () => {
            const src = soundMap[soundSelect?.value || 'makkah'];
            if (src) {
                azanAudio.src = src;
                azanAudio.play().catch(() => alert("Нажмите на экран, затем попробуйте снова"));
            }
        };
    }

    // --- МЕНЮ ---
    const menuBtn = document.getElementById('menuToggle');
    const dropdown = document.getElementById('dropdownMenu');
    if (menuBtn && dropdown) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        };
        document.addEventListener('click', () => dropdown.classList.remove('show'));
    }
    const aboutItem = document.getElementById('aboutMenuItem');
    if (aboutItem) aboutItem.onclick = (e) => {
        e.preventDefault();
        alert("📱 Намаз Дагестан\nВерсия 2.0");
        if (dropdown) dropdown.classList.remove('show');
    };

    // --- ВКЛАДКИ ---
    const tabs = document.querySelectorAll('.profile-tab');
    const panes = document.querySelectorAll('.profile-pane');
    tabs.forEach(tab => {
        tab.onclick = () => {
            const tabId = tab.dataset.profileTab;
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const activePane = document.getElementById(`profile-tab-${tabId}`);
            if (activePane) activePane.classList.add('active');
        };
    });

    // ==================== КОМПАС ====================
    const compassBtn = document.getElementById('floatingCompassBtn');
    const compassModal = document.getElementById('fullscreenCompass');
    const closeCompass = document.getElementById('closeFullscreenCompass');
    const startCompassBtn = document.getElementById('startCompassFull');
    const needleFull = document.getElementById('needleFull');
    const degreeSpan = document.getElementById('qiblaDegreeFull');
    const hintSpan = document.getElementById('compassHintFull');
    
    const QIBLA_ANGLE = 203;
    let currentHeading = 0;
    let compassActive = false;
    let listenerAdded = false;
    
    function updateCompass() {
        if (!needleFull) return;
        if (compassActive && currentHeading !== null && currentHeading !== undefined) {
            const rotation = QIBLA_ANGLE - currentHeading;
            needleFull.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            const diff = Math.abs(rotation % 360);
            const finalDiff = diff > 180 ? 360 - diff : diff;
            if (degreeSpan) degreeSpan.innerHTML = `${Math.round(currentHeading)}° (Вы) / ${QIBLA_ANGLE}° (Кибла)`;
            if (hintSpan) {
                if (finalDiff < 10) {
                    hintSpan.innerHTML = "✅ Вы смотрите точно на Киблу!";
                    hintSpan.style.color = "#4CAF50";
                } else {
                    hintSpan.innerHTML = `🔄 Повернитесь ${rotation > 0 ? 'налево' : 'направо'} на ${Math.round(finalDiff)}°`;
                    hintSpan.style.color = "#FF9800";
                }
            }
        } else {
            needleFull.style.transform = `translate(-50%, -50%) rotate(${QIBLA_ANGLE}deg)`;
            if (degreeSpan) degreeSpan.innerHTML = `${QIBLA_ANGLE}° (Кибла)`;
            if (hintSpan) hintSpan.innerHTML = "📍 Нажмите 'ЗАПУСТИТЬ КОМПАС' и разрешите доступ";
        }
    }
    
    function handleOrientation(e) {
        let heading = null;
        if (e.webkitCompassHeading !== undefined) heading = e.webkitCompassHeading;
        else if (e.alpha !== undefined && e.alpha !== null) heading = 360 - e.alpha;
        if (heading !== null && heading !== undefined) {
            currentHeading = heading;
            compassActive = true;
            updateCompass();
        }
    }
    
    function startCompass() {
        if (listenerAdded) return;
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(perm => {
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        listenerAdded = true;
                        compassActive = true;
                        alert('✅ Компас включён! Поворачивайте телефон');
                        updateCompass();
                    } else alert('❌ Доступ не разрешён. Разрешите в настройках Safari → Конфиденциальность → Движение и фитнес');
                })
                .catch(() => alert('❌ Ошибка доступа'));
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
            listenerAdded = true;
            compassActive = true;
            alert('✅ Компас включён! Поворачивайте телефон');
            updateCompass();
        }
    }
    
    if (compassBtn) compassBtn.onclick = () => compassModal.classList.add('show');
    if (closeCompass) closeCompass.onclick = () => compassModal.classList.remove('show');
    if (startCompassBtn) startCompassBtn.onclick = startCompass;
    
    updateCompass();

    // --- НАПОМИНАНИЯ ---
    let lastNotif = "";
    setInterval(() => {
        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const minutesBefore = parseInt(localStorage.getItem('notificationTime')) || 5;
        const today = now.toDateString();
        const prayersList = [
            { name: "Фаджр", time: prayerTimes.Fajr },
            { name: "Зухр", time: prayerTimes.Dhuhr },
            { name: "Аср", time: prayerTimes.Asr },
            { name: "Магриб", time: prayerTimes.Maghrib },
            { name: "Иша", time: prayerTimes.Isha }
        ];
        const target = prayersList.find(p => {
            if (!p.time) return false;
            const [h, m] = p.time.split(':').map(Number);
            const prayMin = h * 60 + m;
            return (prayMin - minutesBefore) === currentMin;
        });
        if (target && Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') === 'true' && lastNotif !== today + target.name) {
            new Notification(`🕌 Скоро намаз ${target.name}`, {
                body: `Осталось ${minutesBefore} минут`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png'
            });
            lastNotif = today + target.name;
        }
    }, 60000);
});
