// ==================== МЕНЮ (САМОЕ ВАЖНОЕ) ====================
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuToggle');
    const drawer = document.getElementById('drawerMenu');
    const closeBtn = document.getElementById('closeDrawer');
    const overlay = document.getElementById('overlay');

    function openMenu() {
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuBtn) menuBtn.onclick = openMenu;
    if (closeBtn) closeBtn.onclick = closeMenu;
    if (overlay) overlay.onclick = closeMenu;

    // Переключение вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContent = document.getElementById('tabContent');
    
    const contents = {
        fatiha: `<div class="surah-content"><h3>Сура Аль-Фатиха</h3>
            <p class="arabic-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ<br>الرَّحْمَٰنِ الرَّحِيمِ<br>مَالِكِ يَوْمِ الدِّينِ<br>إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ<br>اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ<br>صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</p>
            <div class="transliteration"><h4>Транскрипция:</h4><p>Бисмилляхир-рахманир-рахим.<br>Альхамдулилляхи раббиль-алямин.<br>Ар-рахманир-рахим.<br>Малики яумид-дин.<br>Ийякя на'буду ва ийякя наста'ин.<br>Ихдинас-сыраталь-мустакым.<br>Сыраталь-лязина ан'амта 'алейхим гайриль-магдуби 'алейхим ва ляд-даллин.</p></div>
            <div class="translation"><h4>Перевод смыслов:</h4><p>Во имя Аллаха, Милостивого, Милосердного.<br>Хвала Аллаху, Господу миров,<br>Милостивому, Милосердному,<br>Властелину Дня воздаяния!<br>Тебе одному мы поклоняемся и Тебя одного молим о помощи.<br>Веди нас прямым путём,<br>путём тех, кого Ты облагодетельствовал, не тех, на кого пал гнев, и не заблудших.</p></div></div>`
    };

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            if (tabContent && contents[tab]) tabContent.innerHTML = contents[tab];
        };
    });

    // ==================== ОСТАЛЬНОЙ КОД (НАМАЗЫ, ТЕМА, КОМПАС) ====================
    let currentCity = { lat: 42.9849, lng: 47.5046 };
    let prayerTimes = {};
    let lastNotifiedPrayers = new Set();
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
