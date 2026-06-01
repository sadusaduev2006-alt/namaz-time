// ==================== ПРОСТАЯ РАБОЧАЯ ВЕРСИЯ ====================
console.log("Скрипт загружен");

// Данные городов
const cities = [
    { name: "Махачкала", times: { Fajr: "02:07", Sunrise: "04:14", Dhuhr: "11:51", Asr: "15:51", Maghrib: "19:24", Isha: "21:06" } },
    { name: "Дербент", times: { Fajr: "02:15", Sunrise: "04:22", Dhuhr: "11:59", Asr: "15:59", Maghrib: "19:32", Isha: "21:14" } },
    { name: "Хасавюрт", times: { Fajr: "02:05", Sunrise: "04:12", Dhuhr: "11:49", Asr: "15:49", Maghrib: "19:22", Isha: "21:04" } },
    { name: "Буйнакск", times: { Fajr: "02:09", Sunrise: "04:16", Dhuhr: "11:53", Asr: "15:53", Maghrib: "19:26", Isha: "21:08" } },
    { name: "Избербаш", times: { Fajr: "02:11", Sunrise: "04:18", Dhuhr: "11:55", Asr: "15:55", Maghrib: "19:28", Isha: "21:10" } },
    { name: "Кизляр", times: { Fajr: "02:00", Sunrise: "04:07", Dhuhr: "11:44", Asr: "15:44", Maghrib: "19:17", Isha: "20:59" } },
    { name: "Каспийск", times: { Fajr: "02:08", Sunrise: "04:15", Dhuhr: "11:52", Asr: "15:52", Maghrib: "19:25", Isha: "21:07" } }
];

let currentCity = cities[0];

// Показать время намаза
function displayTimes() {
    document.getElementById('fajr').innerText = currentCity.times.Fajr;
    document.getElementById('sunrise').innerText = currentCity.times.Sunrise;
    document.getElementById('dhuhr').innerText = currentCity.times.Dhuhr;
    document.getElementById('asr').innerText = currentCity.times.Asr;
    document.getElementById('maghrib').innerText = currentCity.times.Maghrib;
    document.getElementById('isha').innerText = currentCity.times.Isha;
    document.getElementById('updateTime').innerText = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
}

// Ждём загрузку страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    // Показываем время
    displayTimes();
    
    // ========== ВЫБОР ГОРОДА ==========
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            const selectedName = citySelect.value;
            const found = cities.find(c => c.name === selectedName);
            if (found) {
                currentCity = found;
                displayTimes();
                localStorage.setItem('selectedCity', selectedName);
            }
        });
    }
    
    // Восстанавливаем сохранённый город
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const found = cities.find(c => c.name === savedCity);
        if (found) {
            currentCity = found;
            displayTimes();
            if (citySelect) citySelect.value = savedCity;
        }
    }
    
    // ========== ПРОФИЛЬ ==========
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('fullscreenProfile');
    const closeProfile = document.getElementById('closeProfile');
    
    if (profileBtn && profileModal) {
        profileBtn.onclick = function() {
            profileModal.classList.add('show');
        };
    }
    if (closeProfile && profileModal) {
        closeProfile.onclick = function() {
            profileModal.classList.remove('show');
        };
    }
    
    // ========== КОМПАС ==========
    const compassBtn = document.getElementById('floatingCompassBtn');
    const compassModal = document.getElementById('fullscreenCompass');
    const closeCompass = document.getElementById('closeFullscreenCompass');
    
    if (compassBtn && compassModal) {
        compassBtn.onclick = function() {
            compassModal.classList.add('show');
        };
    }
    if (closeCompass && compassModal) {
        closeCompass.onclick = function() {
            compassModal.classList.remove('show');
        };
    }
    
    // ========== МЕНЮ (ТРИ ТОЧКИ) ==========
    const menuBtn = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.onclick = function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        };
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // ========== О ПРИЛОЖЕНИИ ==========
    const aboutItem = document.getElementById('aboutMenuItem');
    if (aboutItem) {
        aboutItem.onclick = function(e) {
            e.preventDefault();
            alert('Намаз Дагестан\nВерсия 2.0');
        };
    }
    
    // ========== ТЕСТ АЗАНА ==========
    const testAzan = document.getElementById('testAzanBtn');
    const azanAudio = document.getElementById('azanAudio');
    
    if (testAzan && azanAudio) {
        testAzan.onclick = function(e) {
            e.preventDefault();
            azanAudio.play().catch(function() {
                alert('Нажмите на экран, затем попробуйте снова');
            });
        };
    }
    
    // ========== ВКЛАДКИ ПРОФИЛЯ ==========
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profilePanes = document.querySelectorAll('.profile-pane');
    
    profileTabs.forEach(tab => {
        tab.onclick = function() {
            const tabId = this.getAttribute('data-profile-tab');
            profileTabs.forEach(t => t.classList.remove('active'));
            profilePanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const activePane = document.getElementById(`profile-tab-${tabId}`);
            if (activePane) activePane.classList.add('active');
        };
    });
    
    // ========== ТЁМНАЯ ТЕМА ==========
    const darkToggle = document.getElementById('profileDarkModeToggle');
    if (darkToggle) {
        darkToggle.onchange = function(e) {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        };
    }
    
    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    if (darkToggle) darkToggle.checked = (savedTheme === 'dark');
    
    // ========== ЯЗЫК ==========
    const langItems = document.querySelectorAll('.language-item');
    langItems.forEach(item => {
        item.onclick = function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            langItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const titles = {
                ru: "Время намаза",
                en: "Prayer Times",
                ar: "أوقات الصلاة",
                kk: "Намаз уақыты",
                tr: "Namaz Vakti"
            };
            const h1 = document.querySelector('.prayer-card h1');
            if (h1 && titles[lang]) h1.innerHTML = `🕌 ${titles[lang]}`;
        };
    });
    
    // Восстанавливаем язык
    const savedLang = localStorage.getItem('language') || 'ru';
    const activeLang = document.querySelector(`.language-item[data-lang="${savedLang}"]`);
    if (activeLang) activeLang.click();
    
    console.log("Готово!");
});
