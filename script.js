// ==================== БАЗА ДАННЫХ ГОРОДОВ ДАГЕСТАНА ====================
const cities = [
    { name: "Махачкала", lat: 42.9849, lng: 47.5046 },
    { name: "Дербент", lat: 42.0569, lng: 48.2885 },
    { name: "Хасавюрт", lat: 43.2500, lng: 46.5833 },
    { name: "Буйнакск", lat: 42.8167, lng: 47.1167 },
    { name: "Избербаш", lat: 42.5654, lng: 47.8634 },
    { name: "Кизляр", lat: 43.8485, lng: 46.7199 },
    { name: "Каспийск", lat: 42.8819, lng: 47.6372 },
    { name: "Южно-Сухокумск", lat: 44.6667, lng: 45.6500 },
    { name: "Кизилюрт", lat: 43.2000, lng: 46.8667 },
    { name: "Дагестанские Огни", lat: 42.1167, lng: 48.2000 }
];

// Функция поиска ближайшего города по координатам
function findNearestCity(lat, lng) {
    let nearest = cities[0];
    let minDistance = Infinity;
    
    for (let city of cities) {
        const dLat = city.lat - lat;
        const dLng = city.lng - lng;
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = city;
        }
    }
    return nearest;
}

// Функция определения местоположения
function detectLocation() {
    if (!navigator.geolocation) {
        alert("Ваш браузер не поддерживает геолокацию");
        return;
    }
    
    // Показываем индикатор загрузки
    const gpsBtn = document.getElementById('gpsLocationBtn');
    const originalIcon = gpsBtn.innerHTML;
    gpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    gpsBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const nearestCity = findNearestCity(latitude, longitude);
            
            // Обновляем выпадающий список
            const select = document.getElementById('citySelect');
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === nearestCity.name) {
                    select.selectedIndex = i;
                    break;
                }
            }
            
            // Обновляем текущий город
            currentCity = { lat: nearestCity.lat, lng: nearestCity.lng };
            
            // Сохраняем выбранный город в localStorage
            localStorage.setItem('selectedCity', nearestCity.name);
            
            // Загружаем время намаза
            fetchPrayerTimes();
            calculateQiblaAngle();
            
            // Восстанавливаем кнопку
            gpsBtn.innerHTML = originalIcon;
            gpsBtn.disabled = false;
            
            // Показываем уведомление
            alert(`📍 Ваш город: ${nearestCity.name}`);
        },
        (error) => {
            console.error("Ошибка геолокации:", error);
            gpsBtn.innerHTML = originalIcon;
            gpsBtn.disabled = false;
            
            let errorMessage = "Не удалось определить местоположение. ";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += "Разрешите доступ к геолокации в настройках браузера.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += "Информация о местоположении недоступна.";
                    break;
                case error.TIMEOUT:
                    errorMessage += "Время ожидания истекло.";
                    break;
            }
            alert(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// ==================== ОСТАЛЬНОЙ КОД ====================
document.addEventListener('DOMContentLoaded', function() {
    // Меню
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // GPS кнопка
    const gpsBtn = document.getElementById('gpsLocationBtn');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', detectLocation);
    }
    
    // Восстанавливаем сохранённый город
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const select = document.getElementById('citySelect');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text === savedCity) {
                select.selectedIndex = i;
                break;
            }
        }
    }
    
    // ==================== НАМАЗЫ ====================
    let currentCity = { lat: 42.9849, lng: 47.5046 };
    let prayerTimes = {};
    let currentHeading = 0;
    let qiblaDirection = 0;
    let compassActive = false;
    const MECCA = { lat: 21.4225, lng: 39.8262 };
    
    // Кастомный метод для Sajda (Фаджр 24°, Иша 15°)
    const CUSTOM_SETTINGS = "24,null,15";
    const API_METHOD = 99;
    
    // Обновляем currentCity из выбранного в селекте
    function updateCityFromSelect() {
        const select = document.getElementById('citySelect');
        const selectedOption = select.options[select.selectedIndex];
        const [lat, lng] = selectedOption.value.split(',');
        currentCity = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            name: selectedOption.text
        };
        localStorage.setItem('selectedCity', currentCity.name);
    }
    
    async function fetchPrayerTimes() {
        updateCityFromSelect();
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${currentCity.lat}&longitude=${currentCity.lng}&method=${API_METHOD}&methodSettings=${CUSTOM_SETTINGS}&timezone=Europe/Moscow`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.code === 200) {
                prayerTimes = data.data.timings;
                document.getElementById('fajr').innerText = prayerTimes.Fajr;
                document.getElementById('sunrise').innerText = prayerTimes.Sunrise;
                document.getElementById('dhuhr').innerText = prayerTimes.Dhuhr;
                document.getElementById('asr').innerText = prayerTimes.Asr;
                document.getElementById('maghrib').innerText = prayerTimes.Maghrib;
                document.getElementById('isha').innerText = prayerTimes.Isha;
                document.getElementById('currentDate').innerHTML = `📆 ${today.toLocaleDateString('ru-RU')}`;
                if (data.data.date?.hijri) document.getElementById('gregorianDate').innerHTML = `${data.data.date.hijri.date} г.х.`;
                document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
                calculateNearestPrayer();
            }
        } catch(e) { console.error(e); }
    }
    
    function calculateNearestPrayer() {
        if (!prayerTimes.Fajr) return;
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
    
    function initTheme() {
        let theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);
        let icon = document.querySelector('#themeToggle i');
        if(theme==='dark') icon.classList.replace('fa-moon','fa-sun');
        else icon.classList.replace('fa-sun','fa-moon');
    }
    function toggleTheme() {
        let cur = document.body.getAttribute('data-theme');
        let neu = cur==='light'?'dark':'light';
        document.body.setAttribute('data-theme', neu);
        localStorage.setItem('theme', neu);
        let icon = document.querySelector('#themeToggle i');
        if(neu==='dark') icon.classList.replace('fa-moon','fa-sun');
        else icon.classList.replace('fa-sun','fa-moon');
    }
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    function initCitySelect() {
        let sel = document.getElementById('citySelect');
        sel.addEventListener('change', () => {
            fetchPrayerTimes();
            calculateQiblaAngle();
        });
    }
    
    function calculateQiblaAngle() {
        updateCityFromSelect();
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
                else if(diff<45) hint.innerHTML = `🔄 Повернитесь ${angle>0?'налево':'направо'} на ${Math.round(diff)}°`;
                else hint.innerHTML = `🧭 Повернитесь ${angle>0?'налево':'направо'} на ${Math.round(diff)}°`;
            }
        } else {
            needle.style.transform = `translate(-50%,-50%) rotate(${qiblaDirection}deg)`;
        }
    }
    function initCompass() {
        calculateQiblaAngle();
        let btn = document.getElementById('requestLocation');
        btn.onclick = () => {
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
    
    initTheme();
    initCitySelect();
    initCompass();
    fetchPrayerTimes();
    setInterval(() => { if(Object.keys(prayerTimes).length) calculateNearestPrayer(); }, 60000);
    setInterval(fetchPrayerTimes, 3600000);
});
