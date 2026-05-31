// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentCity = { lat: 42.9849, lng: 47.5046, name: "Махачкала" };
let originalPrayerTimes = {};
let timeOffsets = {
    fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0
};

// ==================== ЗАГРУЗКА СОХРАНЁННЫХ НАСТРОЕК ====================
function loadOffsets() {
    const saved = localStorage.getItem('namaz_offsets');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            timeOffsets = { ...timeOffsets, ...parsed };
            console.log('✅ Настройки загружены:', timeOffsets);
        } catch(e) {}
    }
}

// ==================== СОХРАНЕНИЕ НАСТРОЕК ====================
function saveOffsets() {
    localStorage.setItem('namaz_offsets', JSON.stringify(timeOffsets));
    console.log('💾 Настройки сохранены:', timeOffsets);
}

// ==================== ПРИМЕНЕНИЕ СМЕЩЕНИЙ ====================
function applyOffsets() {
    if (!originalPrayerTimes.Fajr) {
        console.log('⏳ Нет данных о намазах, ждём...');
        return;
    }
    
    console.log('🔄 Применяем смещения...');
    
    const mappings = [
        { id: 'fajr', key: 'Fajr', offset: timeOffsets.fajr },
        { id: 'sunrise', key: 'Sunrise', offset: timeOffsets.sunrise },
        { id: 'dhuhr', key: 'Dhuhr', offset: timeOffsets.dhuhr },
        { id: 'asr', key: 'Asr', offset: timeOffsets.asr },
        { id: 'maghrib', key: 'Maghrib', offset: timeOffsets.maghrib },
        { id: 'isha', key: 'Isha', offset: timeOffsets.isha }
    ];
    
    for (const m of mappings) {
        const original = originalPrayerTimes[m.key];
        if (original) {
            const adjusted = adjustTime(original, m.offset);
            const el = document.getElementById(m.id);
            if (el) el.innerText = adjusted;
            console.log(`${m.key}: ${original} → ${adjusted} (${m.offset} мин)`);
        }
    }
    
    updateNextPrayer();
}

// ==================== ФУНКЦИЯ СМЕЩЕНИЯ ====================
function adjustTime(timeStr, minutes) {
    if (!timeStr || minutes === 0) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    let total = h * 60 + m + minutes;
    if (total < 0) total += 1440;
    if (total >= 1440) total -= 1440;
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

// ==================== ОБНОВЛЕНИЕ СЛЕДУЮЩЕГО НАМАЗА ====================
function updateNextPrayer() {
    if (!originalPrayerTimes.Fajr) return;
    
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Фаджр', id: 'fajr', key: 'Fajr', offset: timeOffsets.fajr },
        { name: 'Зухр', id: 'dhuhr', key: 'Dhuhr', offset: timeOffsets.dhuhr },
        { name: 'Аср', id: 'asr', key: 'Asr', offset: timeOffsets.asr },
        { name: 'Магриб', id: 'maghrib', key: 'Maghrib', offset: timeOffsets.maghrib },
        { name: 'Иша', id: 'isha', key: 'Isha', offset: timeOffsets.isha }
    ];
    
    let next = null;
    for (const p of prayers) {
        const original = originalPrayerTimes[p.key];
        if (!original) continue;
        const adjusted = adjustTime(original, p.offset);
        const [h, m] = adjusted.split(':').map(Number);
        const total = h * 60 + m;
        if (total > current) {
            next = { ...p, time: adjusted, total };
            break;
        }
    }
    
    if (!next && prayers[0]) {
        const original = originalPrayerTimes[prayers[0].key];
        const adjusted = adjustTime(original, prayers[0].offset);
        const [h, m] = adjusted.split(':').map(Number);
        next = { ...prayers[0], time: adjusted, total: h * 60 + m + 1440 };
    }
    
    if (next) {
        let left = next.total - current;
        document.getElementById('nextPrayerName').innerText = next.name;
        document.getElementById('nextPrayerTime').innerText = next.time;
        const cd = document.getElementById('countdownText');
        if (cd) {
            if (left <= 0) cd.innerHTML = "🕋 Время наступило!";
            else {
                const h = Math.floor(left / 60);
                const m = left % 60;
                cd.innerHTML = h > 0 ? `${h} ч ${m} мин` : `${m} минут`;
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
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${currentCity.lat}&longitude=${currentCity.lng}&method=3&timezone=Europe/Moscow`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 200) {
            originalPrayerTimes = data.data.timings;
            console.log('📡 Оригинальное время получено:', originalPrayerTimes);
            
            applyOffsets();
            
            document.getElementById('currentDate').innerHTML = `📆 ${today.toLocaleDateString('ru-RU')}`;
            if (data.data.date?.hijri) {
                document.getElementById('gregorianDate').innerHTML = `${data.data.date.hijri.date} г.х.`;
            }
            document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
        }
    } catch(e) { console.error('Ошибка загрузки:', e); }
}

// ==================== МОДАЛЬНОЕ ОКНО НАСТРОЕК ====================
function openSettings() {
    // Удаляем старое окно, если есть
    const old = document.getElementById('settingsModal');
    if (old) old.remove();
    
    const modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="settings-content">
            <div class="settings-header">
                <h3>⚙️ Настройка времени намаза</h3>
                <button id="closeSettings" class="settings-close">✕</button>
            </div>
            <div class="settings-body">
                <p style="margin-bottom:16px; font-size:13px; color:var(--accent)">Смещение времени (± минуты)</p>
                <div class="setting-row"><label>Фаджр</label><input type="number" id="off_fajr" value="${timeOffsets.fajr}" step="1"><span>мин</span></div>
                <div class="setting-row"><label>Шурук</label><input type="number" id="off_sunrise" value="${timeOffsets.sunrise}" step="1"><span>мин</span></div>
                <div class="setting-row"><label>Зухр</label><input type="number" id="off_dhuhr" value="${timeOffsets.dhuhr}" step="1"><span>мин</span></div>
                <div class="setting-row"><label>Аср</label><input type="number" id="off_asr" value="${timeOffsets.asr}" step="1"><span>мин</span></div>
                <div class="setting-row"><label>Магриб</label><input type="number" id="off_maghrib" value="${timeOffsets.maghrib}" step="1"><span>мин</span></div>
                <div class="setting-row"><label>Иша</label><input type="number" id="off_isha" value="${timeOffsets.isha}" step="1"><span>мин</span></div>
                <button id="resetOffsets" style="margin-top:16px; width:100%; padding:10px; border-radius:30px; border:none; background:var(--accent-light); cursor:pointer;">Сбросить все</button>
            </div>
            <div class="settings-footer">
                <button id="saveOffsets" class="settings-save">💾 Сохранить настройки</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeSettings').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.getElementById('resetOffsets').onclick = () => {
        document.getElementById('off_fajr').value = 0;
        document.getElementById('off_sunrise').value = 0;
        document.getElementById('off_dhuhr').value = 0;
        document.getElementById('off_asr').value = 0;
        document.getElementById('off_maghrib').value = 0;
        document.getElementById('off_isha').value = 0;
    };
    document.getElementById('saveOffsets').onclick = () => {
        timeOffsets = {
            fajr: parseInt(document.getElementById('off_fajr').value) || 0,
            sunrise: parseInt(document.getElementById('off_sunrise').value) || 0,
            dhuhr: parseInt(document.getElementById('off_dhuhr').value) || 0,
            asr: parseInt(document.getElementById('off_asr').value) || 0,
            maghrib: parseInt(document.getElementById('off_maghrib').value) || 0,
            isha: parseInt(document.getElementById('off_isha').value) || 0
        };
        saveOffsets();
        applyOffsets();
        modal.remove();
        
        const toast = document.createElement('div');
        toast.textContent = '✅ Настройки сохранены!';
        toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#4CAF50; color:white; padding:10px 20px; border-radius:40px; z-index:10000; font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };
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
    
    // Добавляем кнопку настроек в меню
    let settingsLink = document.getElementById('settingsLink');
    if (!settingsLink) {
        settingsLink = document.createElement('a');
        settingsLink.id = 'settingsLink';
        settingsLink.href = '#';
        settingsLink.innerHTML = '<i class="fas fa-sliders-h"></i> Настройки времени намаза';
        settingsLink.onclick = (e) => {
            e.preventDefault();
            openSettings();
        };
        dropdown.appendChild(settingsLink);
    } else {
        settingsLink.onclick = (e) => {
            e.preventDefault();
            openSettings();
        };
    }
}

// ==================== ОСТАЛЬНЫЕ ФУНКЦИИ (ТЕМА, КОМПАС, ГОРОД) ====================
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

// КОМПАС
let currentHeading = 0;
let qiblaDirection = 0;
let compassActive = false;
const MECCA = { lat: 21.4225, lng: 39.8262 };

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

// ==================== СТИЛИ ДЛЯ МОДАЛЬНОГО ОКНА ====================
const style = document.createElement('style');
style.textContent = `
    .settings-modal {
        position: fixed; top:0; left:0; right:0; bottom:0;
        background: rgba(0,0,0,0.5); z-index:20000;
        display: flex; align-items: center; justify-content: center;
    }
    .settings-content {
        background: var(--card-bg, white);
        border-radius: 32px; width: 90%; max-width: 380px;
        box-shadow: 0 20px 35px rgba(0,0,0,0.2);
    }
    .settings-header {
        display: flex; justify-content: space-between;
        padding: 18px 20px; border-bottom: 1px solid var(--border-color, #eee);
    }
    .settings-header h3 { color: var(--accent, #B67B4A); margin:0; }
    .settings-close { background: none; border: none; font-size: 24px; cursor: pointer; }
    .settings-body { padding: 20px; }
    .setting-row {
        display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .setting-row label { width: 80px; font-weight: 500; }
    .setting-row input {
        width: 70px; padding: 8px; border-radius: 12px;
        border: 1px solid var(--border-color, #ddd);
        background: var(--prayer-bg, #f5f5f5); text-align: center;
    }
    .settings-footer { padding: 16px 20px; border-top: 1px solid var(--border-color, #eee); }
    .settings-save {
        background: var(--accent, #B67B4A); color: white;
        border: none; padding: 12px; border-radius: 40px;
        width: 100%; font-weight: 600; cursor: pointer;
    }
`;
document.head.appendChild(style);

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', () => {
    loadOffsets();
    initMenu();
    initTheme();
    initCitySelect();
    initCompass();
    fetchPrayerTimes();
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    setInterval(() => updateNextPrayer(), 60000);
    setInterval(fetchPrayerTimes, 3600000);
});
