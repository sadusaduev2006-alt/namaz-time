// ==================== ДАННЫЕ ГОРОДОВ ====================
const citiesData = {
    "Махачкала": { Fajr: "02:07", Sunrise: "04:14", Dhuhr: "11:51", Asr: "15:51", Maghrib: "19:24", Isha: "21:06" },
    "Дербент": { Fajr: "02:15", Sunrise: "04:22", Dhuhr: "11:59", Asr: "15:59", Maghrib: "19:32", Isha: "21:14" },
    "Хасавюрт": { Fajr: "02:05", Sunrise: "04:12", Dhuhr: "11:49", Asr: "15:49", Maghrib: "19:22", Isha: "21:04" },
    "Буйнакск": { Fajr: "02:09", Sunrise: "04:16", Dhuhr: "11:53", Asr: "15:53", Maghrib: "19:26", Isha: "21:08" },
    "Избербаш": { Fajr: "02:11", Sunrise: "04:18", Dhuhr: "11:55", Asr: "15:55", Maghrib: "19:28", Isha: "21:10" },
    "Кизляр": { Fajr: "02:00", Sunrise: "04:07", Dhuhr: "11:44", Asr: "15:44", Maghrib: "19:17", Isha: "20:59" },
    "Каспийск": { Fajr: "02:08", Sunrise: "04:15", Dhuhr: "11:52", Asr: "15:52", Maghrib: "19:25", Isha: "21:07" }
};

// Текущий город
let currentCityName = "Махачкала";
let prayerTimes = citiesData[currentCityName];

// ==================== ФУНКЦИИ ОБНОВЛЕНИЯ ====================
function updatePrayerTimes() {
    document.getElementById('fajr').innerText = prayerTimes.Fajr;
    document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
    document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
    document.getElementById('asr').innerText = prayerTimes.Asr;
    document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
    document.getElementById('isha').innerText = prayerTimes.Isha;
    document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', () => {
    updatePrayerTimes();

    // --- ВЫБОР ГОРОДА ---
    const citySelect = document.getElementById('citySelect');
    citySelect.addEventListener('change', (e) => {
        currentCityName = e.target.value;
        prayerTimes = citiesData[currentCityName];
        updatePrayerTimes();
        localStorage.setItem('selectedCity', currentCityName);
    });
    // Восстановление города
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
    profileBtn.onclick = () => profileModal.classList.add('show');
    closeProfile.onclick = () => profileModal.classList.remove('show');

    // --- ТЕМА ---
    const darkToggle = document.getElementById('profileDarkModeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    if (darkToggle) darkToggle.checked = (savedTheme === 'dark');
    
    darkToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // --- УВЕДОМЛЕНИЯ ---
    const notifToggle = document.getElementById('notificationsToggle');
    const notifTime = document.getElementById('notificationTimeSelect');
    // Загрузка настроек
    notifToggle.checked = localStorage.getItem('notificationsEnabled') === 'true';
    if (localStorage.getItem('notificationTime')) notifTime.value = localStorage.getItem('notificationTime');
    
    notifToggle.addEventListener('change', (e) => {
        localStorage.setItem('notificationsEnabled', e.target.checked);
        if (e.target.checked && Notification.permission === 'default') Notification.requestPermission();
    });
    notifTime.addEventListener('change', (e) => localStorage.setItem('notificationTime', e.target.value));

    // --- ЗВУК АЗАНА (ТЕСТ) ---
    const azanAudio = document.getElementById('azanAudio');
    const testBtn = document.getElementById('testAzanBtn');
    const soundSelect = document.getElementById('azanSoundSelect');
    
    const soundMap = {
        'makkah': 'https://cdn.islamic.network/audio/adhan/ar-makkah.mp3',
        'medina': 'https://cdn.islamic.network/audio/adhan/ar-medina.mp3'
    };
    
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            const src = soundMap[soundSelect.value];
            if (src) {
                azanAudio.src = src;
                azanAudio.play().catch(() => alert("Нажмите на экран, чтобы разрешить звук"));
            }
        });
    }

    // --- МЕНЮ (ТРИ ТОЧКИ) ---
    const menuBtn = document.getElementById('menuToggle');
    const dropdown = document.getElementById('dropdownMenu');
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => dropdown.classList.remove('show'));
    
    document.getElementById('aboutMenuItem').addEventListener('click', (e) => {
        e.preventDefault();
        alert("📱 Намаз Дагестан\nВерсия 2.0\n📍 Точное время намазов");
        dropdown.classList.remove('show');
    });

    // --- ВКЛАДКИ В ПРОФИЛЕ ---
    const tabs = document.querySelectorAll('.profile-tab');
    const panes = document.querySelectorAll('.profile-pane');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.profileTab;
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`profile-tab-${tabId}`).classList.add('active');
        });
    });

    // --- КОМПАС (КИБЛА) ---
    const compassBtn = document.getElementById('floatingCompassBtn');
    const compassModal = document.getElementById('fullscreenCompass');
    const closeCompass = document.getElementById('closeFullscreenCompass');
    const startCompass = document.getElementById('startCompassFull');
    const needle = document.getElementById('needleFull');
    const hintSpan = document.getElementById('compassHintFull');
    const degreeSpan = document.getElementById('qiblaDegreeFull');

    compassBtn.onclick = () => compassModal.classList.add('show');
    closeCompass.onclick = () => compassModal.classList.remove('show');

    // Фиксированная Кибла для Махачкалы (для примера ~ 202 градуса, но проще показать угол)
    const qiblaAngle = 202; // Примерный угол для Махачкалы
    
    startCompass.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(perm => {
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        hintSpan.innerText = "✅ Компас активен!";
                    } else alert("Доступ не разрешён");
                })
                .catch(() => alert("Ошибка"));
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
            hintSpan.innerText = "✅ Компас активен!";
        }
    });

    function handleOrientation(e) {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading) {
            const diff = Math.abs(qiblaAngle - heading);
            needle.style.transform = `translate(-50%, -50%) rotate(${qiblaAngle - heading}deg)`;
            degreeSpan.innerText = `${Math.round(heading)}° (Вы) / ${Math.round(qiblaAngle)}° (Кибла)`;
            if (diff < 15) hintSpan.innerHTML = "✅ Вы смотрите в сторону Киблы!";
            else hintSpan.innerHTML = `🔄 Повернитесь на ${Math.round(diff)}°`;
        }
    }

    // --- НАПОМИНАНИЕ ---
    setInterval(() => {
        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const minutesBefore = parseInt(localStorage.getItem('notificationTime')) || 5;
        
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
        
        if (target && Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') === 'true') {
            new Notification(`🕌 Скоро намаз ${target.name}`, {
                body: `Осталось ${minutesBefore} минут`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png'
            });
        }
    }, 60000);
});
