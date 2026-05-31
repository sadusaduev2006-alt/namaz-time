// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentCity = { lat: 42.9849, lng: 47.5046, name: "Махачкала" };
let originalPrayerTimes = {};   // Оригинальное время из API
let displayedPrayerTimes = {};  // Время с учётом настроек
let timeOffsets = {
    fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0
};
let currentHeading = 0;
let qiblaDirection = 0;
let compassActive = false;
const MECCA = { lat: 21.4225, lng: 39.8262 };
const API_METHOD = 3;

// ==================== ФУНКЦИЯ СМЕЩЕНИЯ ВРЕМЕНИ ====================
function adjustTime(timeStr, minutesOffset) {
    if (!timeStr || minutesOffset === 0) return timeStr;
    const [hours, minutes] = timeStr.split(':').map(Number);
    let total = hours * 60 + minutes + minutesOffset;
    if (total < 0) total += 1440;
    if (total >= 1440) total -= 1440;
    const newHours = Math.floor(total / 60);
    const newMinutes = total % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

// ==================== ПРИМЕНЕНИЕ НАСТРОЕК К ЭКРАНУ ====================
function applyOffsetsToScreen() {
    console.log("Применяем смещения:", timeOffsets);
    
    const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const ids = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const offsetKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (let i = 0; i < keys.length; i++) {
        const original = originalPrayerTimes[keys[i]];
        if (original) {
            const adjusted = adjustTime(original, timeOffsets[offsetKeys[i]]);
            displayedPrayerTimes[keys[i]] = adjusted;
            const el = document.getElementById(ids[i]);
            if (el) el.innerText = adjusted;
        }
    }
    
    recalculateNearestPrayer();
}

// ==================== ПЕРЕСЧЁТ БЛИЖАЙШЕГО НАМАЗА ====================
function recalculateNearestPrayer() {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Фаджр', id: 'fajr', key: 'Fajr' },
        { name: 'Зухр', id: 'dhuhr', key: 'Dhuhr' },
        { name: 'Аср', id: 'asr', key: 'Asr' },
        { name: 'Магриб', id: 'maghrib', key: 'Maghrib' },
        { name: 'Иша', id: 'isha', key: 'Isha' }
    ];
    
    let next = null;
    for (let p of prayers) {
        const timeStr = displayedPrayerTimes[p.key] || originalPrayerTimes[p.key];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const total = h * 60 + m;
        if (total > current) {
            next = { ...p, time: timeStr, total };
            break;
        }
    }
    
    if (!next && prayers[0]) {
        const timeStr = displayedPrayerTimes[prayers[0].key] || originalPrayerTimes[prayers[0].key];
        if (timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            next = { ...prayers[0], time: timeStr, total: h * 60 + m + 1440 };
        }
    }
    
    if (next) {
        let left = next.total - current;
        document.getElementById('nextPrayerName').innerText = next.name;
        document.getElementById('nextPrayerTime').innerText = next.time;
        const countdownEl = document.getElementById('countdownText');
        if (countdownEl) {
            if (left <= 0) countdownEl.innerHTML = "🕋 Время наступило!";
            else {
                const hours = Math.floor(left / 60);
                const mins = left % 60;
                countdownEl.innerHTML = hours > 0 ? `${hours} ч ${mins} мин` : `${mins} минут`;
            }
        }
        
        document.querySelectorAll('.prayer-item').forEach(i => i.classList.remove('active'));
        const activeEl = document.getElementById(next.id);
        if (activeEl) activeEl.closest('.prayer-item')?.classList.add('active');
    }
}

// ==================== ЗАГРУЗКА ВРЕМЕНИ ИЗ API ====================
async function fetchPrayerTimes() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${currentCity.lat}&longitude=${currentCity.lng}&method=${API_METHOD}&timezone=Europe/Moscow`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 200) {
            originalPrayerTimes = data.data.timings;
            console.log("Оригинальное время из API:", originalPrayerTimes);
            
            // Применяем сохранённые настройки
            applyOffsetsToScreen();
            
            // Обновляем даты
            const todayDate = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            document.getElementById('currentDate').innerHTML = `📆 ${todayDate}`;
            if (data.data.date?.hijri) {
                document.getElementById('gregorianDate').innerHTML = `${data.data.date.hijri.date} г.х.`;
            }
            document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
        }
    } catch(e) { console.error("Ошибка загрузки намазов:", e); }
}

// ==================== НАСТРОЙКИ ВРЕМЕНИ (МОДАЛЬНОЕ ОКНО) ====================
function loadSavedOffsets() {
    const saved = localStorage.getItem('namazTimeOffsets');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            timeOffsets = { ...timeOffsets, ...parsed };
            console.log("Загружены настройки:", timeOffsets);
        } catch(e) {}
    }
}

function saveOffsetsToStorage() {
    localStorage.setItem('namazTimeOffsets', JSON.stringify(timeOffsets));
    console.log("Настройки сохранены:", timeOffsets);
    applyOffsetsToScreen();
}

function openSettingsModal() {
    const modalHtml = `
        <div id="settingsModal" class="settings-modal">
            <div class="settings-modal-content">
                <div class="settings-modal-header">
                    <h3><i class="fas fa-clock"></i> Настройка времени намаза</h3>
                    <button id="closeSettingsModal" class="settings-close">&times;</button>
                </div>
                <div class="settings-modal-body">
                    <p style="font-size:13px; margin-bottom:16px; color:var(--accent)">Смещение времени для каждого намаза (± минуты)</p>
                    <div class="settings-list">
                        <div><label>Фаджр</label><input type="number" id="off_fajr" step="1" value="${timeOffsets.fajr}"><span>мин</span></div>
                        <div><label>Шурук</label><input type="number" id="off_sunrise" step="1" value="${timeOffsets.sunrise}"><span>мин</span></div>
                        <div><label>Зухр</label><input type="number" id="off_dhuhr" step="1" value="${timeOffsets.dhuhr}"><span>мин</span></div>
                        <div><label>Аср</label><input type="number" id="off_asr" step="1" value="${timeOffsets.asr}"><span>мин</span></div>
                        <div><label>Магриб</label><input type="number" id="off_maghrib" step="1" value="${timeOffsets.maghrib}"><span>мин</span></div>
                        <div><label>Иша</label><input type="number" id="off_isha" step="1" value="${timeOffsets.isha}"><span>мин</span></div>
                    </div>
                    <button id="resetOffsetsBtn" style="margin-top:16px; width:100%; padding:10px; border-radius:30px; border:none; background:var(--accent-light); cursor:pointer;">Сбросить все</button>
                </div>
                <div class="settings-modal-footer">
                    <button id="saveOffsetsBtn" class="settings-save">Сохранить настройки</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('closeSettingsModal').onclick = () => document.getElementById('settingsModal').remove();
    document.getElementById('settingsModal').onclick = (e) => {
        if (e.target === document.getElementById('settingsModal')) document.getElementById('settingsModal').remove();
    };
    document.getElementById('resetOffsetsBtn').onclick = () => {
        ['off_fajr','off_sunrise','off_dhuhr','off_asr','off_maghrib','off_isha'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = 0;
        });
    };
    document.getElementById('saveOffsetsBtn').onclick = () => {
        timeOffsets = {
            fajr: parseInt(document.getElementById('off_fajr').value) || 0,
            sunrise: parseInt(document.getElementById('off_sunrise').value) || 0,
            dhuhr: parseInt(document.getElementById('off_dhuhr').value) || 0,
            asr: parseInt(document.getElementById('off_asr').value) || 0,
            maghrib: parseInt(document.getElementById('off_maghrib').value) || 0,
            isha: parseInt(document.getElementById('off_isha').value) || 0
        };
        saveOffsetsToStorage();
        document.getElementById('settingsModal').remove();
        
        const toast = document.createElement('div');
        toast.textContent = '✅ Настройки сохранены!';
        toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#4CAF50; color:white; padding:10px 20px; border-radius:40px; z-index:3000; font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };
}

// Добавляем стили для модального окна
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .settings-modal {
        position: fixed; top:0; left:0; right:0; bottom:0;
        background: rgba(0,0,0,0.5); z-index:10000;
        display: flex; align-items: center; justify-content: center;
    }
    .settings-modal-content {
        background: var(--card-bg, white);
        border-radius: 32px; width: 90%; max-width: 380px;
        box-shadow: 0 20px 35px rgba(0,0,0,0.2);
    }
    .settings-modal-header {
        display: flex; justify-content: space-between;
        padding: 18px 20px; border-bottom: 1px solid var(--border-color, #eee);
    }
    .settings-modal-header h3 { color: var(--accent, #B67B4A); margin:0; }
    .settings-close { background: none; border: none; font-size: 28px; cursor: pointer; }
    .settings-modal-body { padding: 20px; }
    .settings-list div {
        display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .settings-list label { width: 80px; font-weight: 500; }
    .settings-list input {
        width: 70px; padding: 8px; border-radius: 12px;
        border: 1px solid var(--border-color, #ddd);
        background: var(--prayer-bg, #f5f5f5); text-align: center;
    }
    .settings-modal-footer { padding: 16px 20px; border-top: 1px solid var(--border-color, #eee); }
    .settings-save {
        background: var(--accent, #B67B4A); color: white;
        border: none; padding: 12px; border-radius: 40px;
        width: 100%; font-weight: 600; cursor: pointer;
    }
`;
document.head.appendChild(modalStyle);

// ==================== ТЁМНАЯ ТЕМА ====================
function initTheme() {
    let theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        if (theme === 'dark') icon.classList.replace('fa-moon', 'fa-sun');
        else icon.classList.replace('fa-sun', 'fa-moon');
    }
}
function toggleTheme() {
    let cur = document.body.getAttribute('data-theme');
    let neu = cur === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', neu);
    localStorage.setItem('theme', neu);
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        if (neu === 'dark') icon.classList.replace('fa-moon', 'fa-sun');
        else icon.classList.replace('fa-sun', 'fa-moon');
    }
}

// ==================== ВЫБОР ГОРОДА ====================
function initCitySelect() {
    const sel = document.getElementById('citySelect');
    if (sel) {
        sel.addEventListener('change', (e) => {
            const [lat, lng] = e.target.value.split(',');
            currentCity = { lat: parseFloat(lat), lng: parseFloat(lng), name: sel.options[sel.selectedIndex].text };
            fetchPrayerTimes();
            calculateQiblaAngle();
        });
    }
}

// ==================== КОМПАС ====================
function calculateQiblaAngle() {
    const φ1 = currentCity.lat * Math.PI/180;
    const φ2 = MECCA.lat * Math.PI/180;
    const Δλ = (MECCA.lng - currentCity.lng) * Math.PI/180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    let θ = Math.atan2(y,x);
    qiblaDirection = (θ*180/Math.PI+360)%360;
    document.getElementById('qiblaDegree').innerHTML = `${Math.round(qiblaDirection)}° от севера`;
    updateNeedle();
}
function updateNeedle() {
    const needle = document.getElementById('needle');
    if (!needle) return;
    if (compassActive && currentHeading) {
        const angle = qiblaDirection - currentHeading;
        needle.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
        const hint = document.getElementById('compassHint');
        if (hint) {
            let diff = Math.abs(angle % 360); if (diff > 180) diff = 360 - diff;
            if (diff < 10) hint.innerHTML = "✅ Вы смотрите в сторону Киблы!";
            else if (diff < 45) hint.innerHTML = `🔄 Повернитесь ${angle>0?'налево':'направо'} на ${Math.round(diff)}°`;
            else hint.innerHTML = `🧭 Повернитесь ${angle>0?'налево':'направо'} на ${Math.round(diff)}°`;
        }
    } else {
        needle.style.transform = `translate(-50%,-50%) rotate(${qiblaDirection}deg)`;
    }
}
function initCompass() {
    calculateQiblaAngle();
    const btn = document.getElementById('requestLocation');
    if (btn) {
        btn.onclick = () => {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(perm => {
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', (e) => {
                            let heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : null);
                            if (heading) { currentHeading = heading; compassActive = true; updateNeedle(); }
                        });
                        alert('Компас включён! Поворачивайте телефон');
                    } else alert('Доступ не разрешён');
                }).catch(() => alert('Ошибка доступа'));
            } else {
                window.addEventListener('deviceorientation', (e) => {
                    let heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : null);
                    if (heading) { currentHeading = heading; compassActive = true; updateNeedle(); }
                });
                alert('Компас включён! Поворачивайте телефон');
            }
        };
    }
}

// ==================== МЕНЮ (ТРИ ТОЧКИ) ====================
function initMenu() {
    const menuBtn = document.getElementById('menuToggle');
    const dropdown = document.getElementById('dropdownMenu');
    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
    
    // Добавляем кнопку настроек в меню, если её нет
    if (!document.getElementById('settingsLink')) {
        const settingsItem = document.createElement('a');
        settingsItem.id = 'settingsLink';
        settingsItem.href = '#';
        settingsItem.innerHTML = '<i class="fas fa-sliders-h"></i> Настройки времени намаза';
        settingsItem.onclick = (e) => {
            e.preventDefault();
            openSettingsModal();
        };
        dropdown.appendChild(settingsItem);
    }
}

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', () => {
    loadSavedOffsets();
    initMenu();
    initTheme();
    initCitySelect();
    initCompass();
    fetchPrayerTimes();
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    setInterval(() => {
        recalculateNearestPrayer();
    }, 60000);
    setInterval(fetchPrayerTimes, 3600000);
});
