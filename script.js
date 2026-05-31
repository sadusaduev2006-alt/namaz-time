// ==================== ВЫПАДАЮЩЕЕ МЕНЮ ====================
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
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    function initCitySelect() {
        let sel = document.getElementById('citySelect');
        if (sel) {
            sel.addEventListener('change', (e) => {
                let [lat,lng] = e.target.value.split(',');
                currentCity = {lat:parseFloat(lat), lng:parseFloat(lng)};
                fetchPrayerTimes();
                calculateQiblaAngle();
            });
        }
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
        if (btn) {
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
    if (!window.prayerTimes || !window.prayerTimes.Fajr) return;
    
    const prayerIds = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (let i = 0; i < prayerIds.length; i++) {
        const originalTime = window.prayerTimes[prayerKeys[i]];
        if (originalTime) {
            const offset = timeOffsets[prayerIds[i]];
            const adjustedTime = adjustTime(originalTime, offset);
            const element = document.getElementById(prayerIds[i]);
            if (element) element.innerText = adjustedTime;
        }
    }
    
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
    if (!window.prayerTimes || !window.prayerTimes.Fajr) return;
    
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
        const originalTime = window.prayerTimes[p.key];
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
        const originalTime = window.prayerTimes[prayers[0].key];
        const adjustedTime = adjustTime(originalTime, timeOffsets[prayers[0].id]);
        const [hours, minutes] = adjustedTime.split(':').map(Number);
        next = { ...prayers[0], time: adjustedTime, total: hours * 60 + minutes + 1440 };
    }
    
    if (next) {
        const left = next.total - currentTotalMinutes;
        const nextNameEl = document.getElementById('nextPrayerName');
        const nextTimeEl = document.getElementById('nextPrayerTime');
        const countdownEl = document.getElementById('countdownText');
        
        if (nextNameEl) nextNameEl.innerText = next.name;
        if (nextTimeEl) nextTimeEl.innerText = next.time;
        if (countdownEl) {
            if (left <= 0) countdownEl.innerHTML = "🕋 Время наступило!";
            else {
                const hours = Math.floor(left / 60), mins = left % 60;
                countdownEl.innerHTML = hours > 0 ? `${hours} ч ${mins} мин` : `${mins} минут`;
            }
        }
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
            const el = document.getElementById(id);
            if (el) el.value = 0;
        });
    };
    document.getElementById('settingsModal').onclick = (e) => {
        if (e.target === document.getElementById('settingsModal')) document.getElementById('settingsModal').remove();
    // ==================== НАСТРОЙКА ВРЕМЕНИ НАМАЗА (ПОЛНОСТЬЮ ПЕРЕРАБОТАНО) ====================
let timeOffsets = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
};

// Загрузка сохранённых настроек
function loadTimeOffsets() {
    const saved = localStorage.getItem('namazTimeOffsets');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            timeOffsets = { ...timeOffsets, ...parsed };
            console.log('Настройки загружены:', timeOffsets);
        } catch(e) {}
    }
}

// Сохранение настроек
function saveTimeOffsets() {
    localStorage.setItem('namazTimeOffsets', JSON.stringify(timeOffsets));
    console.log('Настройки сохранены:', timeOffsets);
}

// Применение смещений к отображаемому времени
function applyTimeOffsetsToDisplay() {
    if (!window.prayerTimes || !window.prayerTimes.Fajr) {
        console.log('Нет данных о намазах');
        return;
    }
    
    console.log('Применяем смещения:', timeOffsets);
    
    const mappings = [
        { id: 'fajr', key: 'Fajr', offsetKey: 'fajr' },
        { id: 'sunrise', key: 'Sunrise', offsetKey: 'sunrise' },
        { id: 'dhuhr', key: 'Dhuhr', offsetKey: 'dhuhr' },
        { id: 'asr', key: 'Asr', offsetKey: 'asr' },
        { id: 'maghrib', key: 'Maghrib', offsetKey: 'maghrib' },
        { id: 'isha', key: 'Isha', offsetKey: 'isha' }
    ];
    
    for (const mapping of mappings) {
        const originalTime = window.prayerTimes[mapping.key];
        if (originalTime) {
            const offset = timeOffsets[mapping.offsetKey];
            const adjustedTime = adjustTimeByMinutes(originalTime, offset);
            const element = document.getElementById(mapping.id);
            if (element) {
                element.innerText = adjustedTime;
                console.log(`${mapping.key}: ${originalTime} → ${adjustedTime} (${offset} мин)`);
            }
        }
    }
    
    // Пересчитываем ближайший намаз с учётом смещений
    recalculateNearestPrayerWithOffsets();
}

// Функция смещения времени
function adjustTimeByMinutes(timeStr, minutesOffset) {
    if (!timeStr) return '--:--';
    if (minutesOffset === 0) return timeStr;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + minutesOffset;
    
    // Корректировка на следующий/предыдущий день
    if (totalMinutes < 0) totalMinutes += 1440;
    if (totalMinutes >= 1440) totalMinutes -= 1440;
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

// Пересчёт ближайшего намаза с учётом смещений
function recalculateNearestPrayerWithOffsets() {
    if (!window.prayerTimes || !window.prayerTimes.Fajr) return;
    
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Фаджр', id: 'fajr', key: 'Fajr', offsetKey: 'fajr' },
        { name: 'Зухр', id: 'dhuhr', key: 'Dhuhr', offsetKey: 'dhuhr' },
        { name: 'Аср', id: 'asr', key: 'Asr', offsetKey: 'asr' },
        { name: 'Магриб', id: 'maghrib', key: 'Maghrib', offsetKey: 'maghrib' },
        { name: 'Иша', id: 'isha', key: 'Isha', offsetKey: 'isha' }
    ];
    
    const prayerTimesWithOffset = prayers.map(p => {
        const originalTime = window.prayerTimes[p.key];
        const adjustedTime = adjustTimeByMinutes(originalTime, timeOffsets[p.offsetKey]);
        const [hours, minutes] = adjustedTime.split(':').map(Number);
        return { ...p, time: adjustedTime, totalMinutes: hours * 60 + minutes };
    });
    
    // Ищем следующий намаз
    let nextPrayer = null;
    for (const p of prayerTimesWithOffset) {
        if (p.totalMinutes > currentTotalMinutes) {
            nextPrayer = p;
            break;
        }
    }
    
    // Если все намазы прошли сегодня — берём первый на завтра
    if (!nextPrayer && prayerTimesWithOffset.length > 0) {
        nextPrayer = { ...prayerTimesWithOffset[0], totalMinutes: prayerTimesWithOffset[0].totalMinutes + 1440 };
    }
    
    if (nextPrayer) {
        const minutesLeft = nextPrayer.totalMinutes - currentTotalMinutes;
        
        const nextNameEl = document.getElementById('nextPrayerName');
        const nextTimeEl = document.getElementById('nextPrayerTime');
        const countdownEl = document.getElementById('countdownText');
        
        if (nextNameEl) nextNameEl.innerText = nextPrayer.name;
        if (nextTimeEl) nextTimeEl.innerText = nextPrayer.time;
        
        if (countdownEl) {
            if (minutesLeft <= 0) {
                countdownEl.innerHTML = "🕋 Время наступило!";
            } else {
                const hours = Math.floor(minutesLeft / 60);
                const minutes = minutesLeft % 60;
                if (hours > 0) {
                    countdownEl.innerHTML = `${hours} ч ${minutes} мин`;
                } else {
                    countdownEl.innerHTML = `${minutes} минут`;
                }
            }
        }
        
        // Подсветка активного намаза
        document.querySelectorAll('.prayer-item').forEach(item => item.classList.remove('active'));
        const activeEl = document.getElementById(nextPrayer.id);
        if (activeEl) {
            const parentItem = activeEl.closest('.prayer-item');
            if (parentItem) parentItem.classList.add('active');
        }
    }
}

// Открытие модального окна настроек
function openSettingsModal() {
    // Удаляем старое модальное окно, если есть
    const oldModal = document.getElementById('settingsModal');
    if (oldModal) oldModal.remove();
    
    const modalHtml = `
        <div id="settingsModal" class="settings-modal-overlay">
            <div class="settings-modal-content">
                <div class="settings-modal-header">
                    <h3><i class="fas fa-clock"></i> Настройка времени намаза</h3>
                    <button id="closeSettingsModal" class="settings-close-btn">&times;</button>
                </div>
                <div class="settings-modal-body">
                    <p class="settings-note">Настройте смещение времени для каждого намаза (± минуты)</p>
                    <div class="settings-offset-list">
                        <div class="settings-offset-item"><label>Фаджр</label><input type="number" id="set_offsetFajr" step="1" value="${timeOffsets.fajr}"><span>мин</span></div>
                        <div class="settings-offset-item"><label>Шурук</label><input type="number" id="set_offsetSunrise" step="1" value="${timeOffsets.sunrise}"><span>мин</span></div>
                        <div class="settings-offset-item"><label>Зухр</label><input type="number" id="set_offsetDhuhr" step="1" value="${timeOffsets.dhuhr}"><span>мин</span></div>
                        <div class="settings-offset-item"><label>Аср</label><input type="number" id="set_offsetAsr" step="1" value="${timeOffsets.asr}"><span>мин</span></div>
                        <div class="settings-offset-item"><label>Магриб</label><input type="number" id="set_offsetMaghrib" step="1" value="${timeOffsets.maghrib}"><span>мин</span></div>
                        <div class="settings-offset-item"><label>Иша</label><input type="number" id="set_offsetIsha" step="1" value="${timeOffsets.isha}"><span>мин</span></div>
                    </div>
                    <button id="resetSettingsOffsets" class="settings-reset-btn">Сбросить все</button>
                </div>
                <div class="settings-modal-footer">
                    <button id="saveSettingsOffsets" class="settings-save-btn">Сохранить настройки</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Закрытие
    document.getElementById('closeSettingsModal').onclick = () => document.getElementById('settingsModal').remove();
    document.getElementById('settingsModal').onclick = (e) => {
        if (e.target === document.getElementById('settingsModal')) document.getElementById('settingsModal').remove();
    };
    
    // Сброс
    document.getElementById('resetSettingsOffsets').onclick = () => {
        document.getElementById('set_offsetFajr').value = 0;
        document.getElementById('set_offsetSunrise').value = 0;
        document.getElementById('set_offsetDhuhr').value = 0;
        document.getElementById('set_offsetAsr').value = 0;
        document.getElementById('set_offsetMaghrib').value = 0;
        document.getElementById('set_offsetIsha').value = 0;
    };
    
    // Сохранение
    document.getElementById('saveSettingsOffsets').onclick = () => {
        timeOffsets = {
            fajr: parseInt(document.getElementById('set_offsetFajr').value) || 0,
            sunrise: parseInt(document.getElementById('set_offsetSunrise').value) || 0,
            dhuhr: parseInt(document.getElementById('set_offsetDhuhr').value) || 0,
            asr: parseInt(document.getElementById('set_offsetAsr').value) || 0,
            maghrib: parseInt(document.getElementById('set_offsetMaghrib').value) || 0,
            isha: parseInt(document.getElementById('set_offsetIsha').value) || 0
        };
        saveTimeOffsets();
        applyTimeOffsetsToDisplay();
        document.getElementById('settingsModal').remove();
        
        // Показываем уведомление об успехе
        const toast = document.createElement('div');
        toast.innerHTML = '✅ Настройки сохранены!';
        toast.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
            background: var(--accent, #B67B4A); color: white;
            padding: 12px 24px; border-radius: 40px; z-index: 3000;
            font-size: 14px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };
}

// Добавляем стили для модального окна
const settingsStyles = document.createElement('style');
settingsStyles.textContent = `
    .settings-modal-overlay {
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
    .settings-modal-content {
        background: var(--card-bg, #FFFFFF);
        border-radius: 32px;
        width: 90%;
        max-width: 380px;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .settings-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid var(--border-color, rgba(210,180,140,0.2));
    }
    .settings-modal-header h3 {
        color: var(--accent, #B67B4A);
        margin: 0;
        font-size: 18px;
    }
    .settings-close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: var(--text-secondary, #5E4B3A);
    }
    .settings-modal-body {
        padding: 20px;
    }
    .settings-note {
        font-size: 13px;
        margin-bottom: 16px;
        color: var(--accent, #B67B4A);
    }
    .settings-offset-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
    }
    .settings-offset-item {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .settings-offset-item label {
        width: 80px;
        font-weight: 500;
    }
    .settings-offset-item input {
        width: 70px;
        padding: 8px;
        border-radius: 12px;
        border: 1px solid var(--border-color, rgba(210,180,140,0.2));
        background: var(--prayer-bg, #FCF9F5);
        text-align: center;
        font-family: inherit;
    }
    .settings-reset-btn {
        background: var(--accent-light, #F7EFE4);
        border: none;
        padding: 10px 16px;
        border-radius: 30px;
        cursor: pointer;
        width: 100%;
        color: var(--text-secondary, #5E4B3A);
    }
    .settings-modal-footer {
        padding: 16px 20px;
        border-top: 1px solid var(--border-color, rgba(210,180,140,0.2));
    }
    .settings-save-btn {
        background: var(--accent, #B67B4A);
        border: none;
        padding: 12px;
        border-radius: 40px;
        width: 100%;
        color: white;
        font-weight: 600;
        cursor: pointer;
        font-size: 16px;
    }
    .settings-save-btn:hover {
        opacity: 0.9;
    }
    body[data-theme="dark"] .settings-modal-content {
        background: #2C2C2C;
    }
`;
document.head.appendChild(settingsStyles);

// Инициализация кнопки настроек в меню
function initSettingsButton() {
    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.onclick = (e) => {
            e.preventDefault();
            openSettingsModal();
        };
        console.log('Кнопка настроек подключена');
    } else {
        console.log('Кнопка настроек не найдена');
    }
}

// Перехватываем обновление времени из API и применяем смещения
const originalFetchPrayerTimes = window.fetchPrayerTimes;
if (originalFetchPrayerTimes) {
    window.fetchPrayerTimes = async function() {
        await originalFetchPrayerTimes();
        applyTimeOffsetsToDisplay();
    };
}

// Запускаем
loadTimeOffsets();
initSettingsButton();

// Если данные уже загружены, применяем смещения
if (window.prayerTimes && window.prayerTimes.Fajr) {
    setTimeout(() => applyTimeOffsetsToDisplay(), 500);
}
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
        background: var(--card-bg, #FFFFFF);
        border-radius: 32px;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid var(--border-color, rgba(210,180,140,0.2));
    }
    .modal-header h3 { color: var(--accent, #B67B4A); margin: 0; }
    .close-modal { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary, #5E4B3A); }
    .modal-body { padding: 20px; }
    .modal-note { font-size: 13px; margin-bottom: 16px; color: var(--accent, #B67B4A); }
    .offset-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .offset-item { display: flex; align-items: center; gap: 12px; }
    .offset-item label { width: 80px; font-weight: 500; }
    .offset-item input { width: 70px; padding: 8px; border-radius: 12px; border: 1px solid var(--border-color, rgba(210,180,140,0.2)); background: var(--prayer-bg, #FCF9F5); text-align: center; }
    .reset-btn { background: var(--accent-light, #F7EFE4); border: none; padding: 10px 16px; border-radius: 30px; cursor: pointer; width: 100%; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border-color, rgba(210,180,140,0.2)); }
    .save-btn { background: var(--accent, #B67B4A); border: none; padding: 12px; border-radius: 40px; width: 100%; color: white; font-weight: 600; cursor: pointer; }
`;
document.head.appendChild(modalStyles);

// Привязываем кнопку настроек
const settingsLink = document.getElementById('settingsLink');
if (settingsLink) {
    settingsLink.onclick = (e) => {
        e.preventDefault();
        openSettingsModal();
    };
}

// Загружаем настройки при старте
loadOffsets();
