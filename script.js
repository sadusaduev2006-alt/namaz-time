// ==================== ВЫПАДАЮЩЕЕ МЕНЮ (три точки) ====================
document.addEventListener('DOMContentLoaded', function() {
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

    // ==================== НАМАЗЫ, ТЕМА, КОМПАС ====================
    let currentCity = { lat: 42.9849, lng: 47.5046 };
    let prayerTimes = {};
    let currentHeading = 0;
    let qiblaDirection = 0;
    let compassActive = false;
    const MECCA = { lat: 21.4225, lng: 39.8262 };
    const API_METHOD = 3;

    async function fetchPrayerTimes() {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${currentCity.lat}&longitude=${currentCity.lng}&method=${API_METHOD}&timezone=Europe/Moscow`;
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
        sel.addEventListener('change', (e) => {
            let [lat,lng] = e.target.value.split(',');
            currentCity = {lat:parseFloat(lat), lng:parseFloat(lng)};
            fetchPrayerTimes();
            calculateQiblaAngle();
        });
    }

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
// ==================== НАСТРОЙКА ВРЕМЕНИ НАМАЗА ====================
let timeOffsets = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
};

function loadOffsets() {
    const saved = localStorage.getItem('namazTimeOffsets');
    if (saved) {
        timeOffsets = JSON.parse(saved);
        applyOffsetsToDisplay();
    }
}

function saveOffsets() {
    localStorage.setItem('namazTimeOffsets', JSON.stringify(timeOffsets));
}

function applyOffsetsToDisplay() {
    if (!prayerTimes.Fajr) return;
    
    const prayerIds = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (let i = 0; i < prayerIds.length; i++) {
        const originalTime = prayerTimes[prayerKeys[i]];
        if (originalTime) {
            const offset = timeOffsets[prayerIds[i]];
            const adjustedTime = adjustTime(originalTime, offset);
            document.getElementById(prayerIds[i]).innerText = adjustedTime;
        }
    }
    
    // Пересчитываем ближайший намаз с новыми временами
    calculateNearestPrayerWithOffsets();
}

function adjustTime(timeStr, minutesOffset) {
    if (!timeStr || minutesOffset === 0) return timeStr;
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + minutesOffset;
    if (totalMinutes < 0) totalMinutes += 1440;
    if (totalMinutes >= 1440) totalMinutes -= 1440;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

function calculateNearestPrayerWithOffsets() {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Фаджр', id: 'fajr', key: 'Fajr' },
        { name: 'Зухр', id: 'dhuhr', key: 'Dhuhr' },
        { name: 'Аср', id: 'asr', key: 'Asr' },
        { name: 'Магриб', id: 'maghrib', key: 'Maghrib' },
        { name: 'Иша', id: 'isha', key: 'Isha' }
    ];
    
    let next = null;
    for (let p of prayers) {
        const originalTime = prayerTimes[p.key];
        if (!originalTime) continue;
        const adjustedTime = adjustTime(originalTime, timeOffsets[p.id]);
        const [hours, minutes] = adjustedTime.split(':').map(Number);
        const total = hours * 60 + minutes;
        if (total > currentTotalMinutes) {
            next = { ...p, time: adjustedTime, total };
            break;
        }
    }
    
    if (!next && prayers[0]) {
        const originalTime = prayerTimes[prayers[0].key];
        const adjustedTime = adjustTime(originalTime, timeOffsets[prayers[0].id]);
        const [hours, minutes] = adjustedTime.split(':').map(Number);
        next = { ...prayers[0], time: adjustedTime, total: hours * 60 + minutes + 1440 };
    }
    
    if (next) {
        let left = next.total - currentTotalMinutes;
        document.getElementById('nextPrayerName').innerText = next.name;
        document.getElementById('nextPrayerTime').innerText = next.time;
        if (left <= 0) document.getElementById('countdownText').innerHTML = "🕋 Время наступило!";
        else {
            const hours = Math.floor(left / 60), mins = left % 60;
            document.getElementById('countdownText').innerHTML = hours > 0 ? `${hours} ч ${mins} мин` : `${mins} минут`;
        }
    }
}

// Создаём кнопку настроек в меню
function addSettingsButton() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu && !document.getElementById('settingsLink')) {
        const settingsLink = document.createElement('a');
        settingsLink.id = 'settingsLink';
        settingsLink.href = '#';
        settingsLink.innerHTML = '<i class="fas fa-sliders-h"></i> Настройки времени намаза';
        settingsLink.onclick = (e) => {
            e.preventDefault();
            openSettingsModal();
        };
        dropdownMenu.appendChild(settingsLink);
    }
}

function openSettingsModal() {
    const modalHtml = `
        <div id="settingsModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-clock"></i> Настройка времени намаза</h3>
                    <button id="closeModalBtn" class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-note">Настройте смещение времени для каждого намаза (± минуты)</p>
                    <div class="offset-list">
                        <div class="offset-item"><label>Фаджр</label><input type="number" id="offsetFajr" step="1" value="${timeOffsets.fajr}"><span>мин</span></div>
                        <div class="offset-item"><label>Шурук</label><input type="number" id="offsetSunrise" step="1" value="${timeOffsets.sunrise}"><span>мин</span></div>
                        <div class="offset-item"><label>Зухр</label><input type="number" id="offsetDhuhr" step="1" value="${timeOffsets.dhuhr}"><span>мин</span></div>
                        <div class="offset-item"><label>Аср</label><input type="number" id="offsetAsr" step="1" value="${timeOffsets.asr}"><span>мин</span></div>
                        <div class="offset-item"><label>Магриб</label><input type="number" id="offsetMaghrib" step="1" value="${timeOffsets.maghrib}"><span>мин</span></div>
                        <div class="offset-item"><label>Иша</label><input type="number" id="offsetIsha" step="1" value="${timeOffsets.isha}"><span>мин</span></div>
                    </div>
                    <button id="resetOffsetsBtn" class="reset-btn">Сбросить все</button>
                </div>
                <div class="modal-footer">
                    <button id="saveOffsetsBtn" class="save-btn">Сохранить настройки</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('settingsModal').remove();
    document.getElementById('saveOffsetsBtn').onclick = () => {
        timeOffsets = {
            fajr: parseInt(document.getElementById('offsetFajr').value) || 0,
            sunrise: parseInt(document.getElementById('offsetSunrise').value) || 0,
            dhuhr: parseInt(document.getElementById('offsetDhuhr').value) || 0,
            asr: parseInt(document.getElementById('offsetAsr').value) || 0,
            maghrib: parseInt(document.getElementById('offsetMaghrib').value) || 0,
            isha: parseInt(document.getElementById('offsetIsha').value) || 0
        };
        saveOffsets();
        applyOffsetsToDisplay();
        document.getElementById('settingsModal').remove();
    };
    document.getElementById('resetOffsetsBtn').onclick = () => {
        ['offsetFajr','offsetSunrise','offsetDhuhr','offsetAsr','offsetMaghrib','offsetIsha'].forEach(id => {
            document.getElementById(id).value = 0;
        });
    };
    document.getElementById('settingsModal').onclick = (e) => {
        if (e.target === document.getElementById('settingsModal')) document.getElementById('settingsModal').remove();
    };
}

// Добавляем стили для модального окна
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-content {
        background: var(--card-bg);
        border-radius: 32px;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid var(--border-color);
    }
    .modal-header h3 { color: var(--accent); margin: 0; }
    .close-modal { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); }
    .modal-body { padding: 20px; }
    .modal-note { font-size: 13px; margin-bottom: 16px; color: var(--accent); }
    .offset-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .offset-item { display: flex; align-items: center; gap: 12px; }
    .offset-item label { width: 80px; font-weight: 500; }
    .offset-item input { width: 70px; padding: 8px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--prayer-bg); text-align: center; }
    .reset-btn { background: var(--accent-light); border: none; padding: 10px 16px; border-radius: 30px; cursor: pointer; width: 100%; color: var(--text-secondary); }
    .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border-color); }
    .save-btn { background: var(--accent); border: none; padding: 12px; border-radius: 40px; width: 100%; color: white; font-weight: 600; cursor: pointer; }
`;
document.head.appendChild(modalStyles);

// Инициализация
loadOffsets();
// Добавляем вызов addSettingsButton() в DOMContentLoaded
// В существующем DOMContentLoaded добавь вызов addSettingsButton()
