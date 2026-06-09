// ==================== ТОЧНОЕ РАСПИСАНИЕ ИЮНЬ 2026 ====================
const prayerSchedule = {
    "2026-06-01": { fajr: "02:07", sunrise: "04:14", dhuhr: "11:51", asr: "15:51", maghrib: "19:24", isha: "21:06" },
    "2026-06-02": { fajr: "02:06", sunrise: "04:14", dhuhr: "11:51", asr: "15:51", maghrib: "19:24", isha: "21:07" },
    "2026-06-03": { fajr: "02:06", sunrise: "04:13", dhuhr: "11:51", asr: "15:52", maghrib: "19:25", isha: "21:08" },
    "2026-06-04": { fajr: "02:05", sunrise: "04:13", dhuhr: "11:51", asr: "15:52", maghrib: "19:26", isha: "21:09" },
    "2026-06-05": { fajr: "02:04", sunrise: "04:12", dhuhr: "11:52", asr: "15:52", maghrib: "19:26", isha: "21:10" },
    "2026-06-06": { fajr: "02:04", sunrise: "04:12", dhuhr: "11:52", asr: "15:53", maghrib: "19:27", isha: "21:11" },
    "2026-06-07": { fajr: "02:03", sunrise: "04:12", dhuhr: "11:52", asr: "15:53", maghrib: "19:28", isha: "21:12" },
    "2026-06-08": { fajr: "02:03", sunrise: "04:11", dhuhr: "11:52", asr: "15:53", maghrib: "19:28", isha: "21:13" },
    "2026-06-09": { fajr: "02:02", sunrise: "04:11", dhuhr: "11:52", asr: "15:53", maghrib: "19:29", isha: "21:13" },
    "2026-06-10": { fajr: "02:02", sunrise: "04:11", dhuhr: "11:53", asr: "15:54", maghrib: "19:30", isha: "21:14" },
    "2026-06-11": { fajr: "02:02", sunrise: "04:11", dhuhr: "11:53", asr: "15:54", maghrib: "19:30", isha: "21:15" },
    "2026-06-12": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:53", asr: "15:54", maghrib: "19:31", isha: "21:16" },
    "2026-06-13": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:53", asr: "15:54", maghrib: "19:31", isha: "21:16" },
    "2026-06-14": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:53", asr: "15:55", maghrib: "19:32", isha: "21:17" },
    "2026-06-15": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:54", asr: "15:55", maghrib: "19:32", isha: "21:17" },
    "2026-06-16": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:54", asr: "15:55", maghrib: "19:33", isha: "21:18" },
    "2026-06-17": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:54", asr: "15:55", maghrib: "19:33", isha: "21:18" },
    "2026-06-18": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:54", asr: "15:56", maghrib: "19:33", isha: "21:19" },
    "2026-06-19": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:54", asr: "15:56", maghrib: "19:34", isha: "21:19" },
    "2026-06-20": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:55", asr: "15:56", maghrib: "19:34", isha: "21:19" },
    "2026-06-21": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:55", asr: "15:56", maghrib: "19:34", isha: "21:20" },
    "2026-06-22": { fajr: "02:01", sunrise: "04:11", dhuhr: "11:55", asr: "15:56", maghrib: "19:34", isha: "21:20" },
    "2026-06-23": { fajr: "02:02", sunrise: "04:12", dhuhr: "11:55", asr: "15:57", maghrib: "19:35", isha: "21:20" },
    "2026-06-24": { fajr: "02:02", sunrise: "04:12", dhuhr: "11:55", asr: "15:57", maghrib: "19:35", isha: "21:20" },
    "2026-06-25": { fajr: "02:03", sunrise: "04:12", dhuhr: "11:56", asr: "15:57", maghrib: "19:35", isha: "21:20" },
    "2026-06-26": { fajr: "02:03", sunrise: "04:13", dhuhr: "11:56", asr: "15:57", maghrib: "19:35", isha: "21:20" },
    "2026-06-27": { fajr: "02:04", sunrise: "04:13", dhuhr: "11:56", asr: "15:57", maghrib: "19:35", isha: "21:20" },
    "2026-06-28": { fajr: "02:04", sunrise: "04:14", dhuhr: "11:56", asr: "15:57", maghrib: "19:35", isha: "21:20" },
    "2026-06-29": { fajr: "02:05", sunrise: "04:14", dhuhr: "11:56", asr: "15:58", maghrib: "19:35", isha: "21:20" },
    "2026-06-30": { fajr: "02:06", sunrise: "04:15", dhuhr: "11:57", asr: "15:58", maghrib: "19:35", isha: "21:19" }
};

function getTodayTimes() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return prayerSchedule[dateKey] || null;
}

function updatePrayerTimes() {
    const todayTimes = getTodayTimes();
    if (todayTimes) {
        document.getElementById('fajr').innerText = todayTimes.fajr;
        document.getElementById('sunrise').innerText = todayTimes.sunrise;
        document.getElementById('dhuhr').innerText = todayTimes.dhuhr;
        document.getElementById('asr').innerText = todayTimes.asr;
        document.getElementById('maghrib').innerText = todayTimes.maghrib;
        document.getElementById('isha').innerText = todayTimes.isha;
    } else {
        document.getElementById('fajr').innerText = "02:07";
        document.getElementById('sunrise').innerText = "04:14";
        document.getElementById('dhuhr').innerText = "11:51";
        document.getElementById('asr').innerText = "15:51";
        document.getElementById('maghrib').innerText = "19:24";
        document.getElementById('isha').innerText = "21:06";
    }
    document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', () => {
    updatePrayerTimes();
    
    setInterval(() => {
        document.getElementById('updateTime').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }, 60000);
    
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    setTimeout(() => {
        updatePrayerTimes();
        setInterval(updatePrayerTimes, 86400000);
    }, msUntilMidnight);
    
    // ПРОФИЛЬ
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('fullscreenProfile');
    const closeProfile = document.getElementById('closeProfile');
    if (profileBtn) profileBtn.onclick = () => profileModal.classList.add('show');
    if (closeProfile) closeProfile.onclick = () => profileModal.classList.remove('show');
    
    // ТЁМНАЯ ТЕМА
    const darkToggle = document.getElementById('profileDarkModeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    if (darkToggle) darkToggle.checked = (savedTheme === 'dark');
    if (darkToggle) darkToggle.onchange = (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };
    
    // УВЕДОМЛЕНИЯ
    const notifToggle = document.getElementById('notificationsToggle');
    const notifTimeSelect = document.getElementById('notificationTimeSelect');
    if (notifToggle) {
        notifToggle.checked = localStorage.getItem('notificationsEnabled') === 'true';
        notifToggle.onchange = (e) => {
            localStorage.setItem('notificationsEnabled', e.target.checked);
            if (e.target.checked && Notification.permission === 'default') Notification.requestPermission();
        };
    }
    if (notifTimeSelect) {
        if (localStorage.getItem('notificationTime')) notifTimeSelect.value = localStorage.getItem('notificationTime');
        notifTimeSelect.onchange = (e) => localStorage.setItem('notificationTime', e.target.value);
    }
    
    // МЕНЮ (ТРИ ТОЧКИ)
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
        alert("📱 Намаз Дагестан\nВерсия 2.0\n📍 Точное время по расписанию мечети Махачкалы");
        dropdown.classList.remove('show');
    };
    
    // ВКЛАДКИ ПРОФИЛЯ
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
    
    // КОМПАС
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
                    } else alert('❌ Доступ не разрешён');
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
    
    // НАПОМИНАНИЯ
    let lastNotif = "";
    setInterval(() => {
        const todayTimes = getTodayTimes();
        if (!todayTimes) return;
        
        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const minutesBefore = parseInt(localStorage.getItem('notificationTime')) || 5;
        const today = now.toDateString();
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
        
        const prayersList = [
            { name: "Фаджр", time: todayTimes.fajr },
            { name: "Зухр", time: todayTimes.dhuhr },
            { name: "Аср", time: todayTimes.asr },
            { name: "Магриб", time: todayTimes.maghrib },
            { name: "Иша", time: todayTimes.isha }
        ];
        
        const target = prayersList.find(p => {
            if (!p.time) return false;
            const [h, m] = p.time.split(':').map(Number);
            const prayMin = h * 60 + m;
            return (prayMin - minutesBefore) === currentMin;
        });
        
        if (target && notificationsEnabled && lastNotif !== today + target.name) {
            if (Notification.permission === 'granted') {
                new Notification(`🕌 Скоро намаз ${target.name}`, {
                    body: `Осталось ${minutesBefore} минут (${target.time})`,
                    icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png'
                });
            }
            lastNotif = today + target.name;
        }
    }, 60000);
    
    setTimeout(() => {
        if (Notification && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, 2000);
    
    console.log("Сайт загружен");
});
