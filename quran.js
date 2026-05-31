// ==================== ДАННЫЕ О СУРАХ ====================
const surahs = [
    { id: 1, name: "الفاتحة", nameRu: "Аль-Фатиха", place: "مكية", verses: 7 },
    { id: 2, name: "البقرة", nameRu: "Аль-Бакара", place: "مدنية", verses: 286 },
    { id: 3, name: "آل عمران", nameRu: "Аль-Имран", place: "مدنية", verses: 200 },
    { id: 4, name: "النساء", nameRu: "Ан-Ниса", place: "مدنية", verses: 176 },
    { id: 5, name: "المائدة", nameRu: "Аль-Маида", place: "مدنية", verses: 120 },
    { id: 6, name: "الأنعام", nameRu: "Аль-Анам", place: "مكية", verses: 165 },
    { id: 7, name: "الأعراف", nameRu: "Аль-Араф", place: "مكية", verses: 206 },
    { id: 8, name: "الأنفال", nameRu: "Аль-Анфаль", place: "مدنية", verses: 75 },
    { id: 9, name: "التوبة", nameRu: "Ат-Тавба", place: "مدنية", verses: 129 },
    { id: 10, name: "يونس", nameRu: "Юнус", place: "مكية", verses: 109 },
    { id: 11, name: "هود", nameRu: "Худ", place: "مكية", verses: 123 },
    { id: 12, name: "يوسف", nameRu: "Юсуф", place: "مكية", verses: 111 },
    { id: 13, name: "الرعد", nameRu: "Ар-Рад", place: "مدنية", verses: 43 },
    { id: 14, name: "إبراهيم", nameRu: "Ибрахим", place: "مكية", verses: 52 },
    { id: 15, name: "الحجر", nameRu: "Аль-Хиджр", place: "مكية", verses: 99 },
    { id: 16, name: "النحل", nameRu: "Ан-Нахль", place: "مكية", verses: 128 },
    { id: 17, name: "الإسراء", nameRu: "Аль-Исра", place: "مكية", verses: 111 },
    { id: 18, name: "الكهف", nameRu: "Аль-Кахф", place: "مكية", verses: 110 },
    { id: 19, name: "مريم", nameRu: "Марьям", place: "مكية", verses: 98 },
    { id: 20, name: "طه", nameRu: "Та Ха", place: "مكية", verses: 135 },
    { id: 21, name: "الأنبياء", nameRu: "Аль-Анбия", place: "مكية", verses: 112 },
    { id: 22, name: "الحج", nameRu: "Аль-Хаджж", place: "مدنية", verses: 78 },
    { id: 23, name: "المؤمنون", nameRu: "Аль-Муминун", place: "مكية", verses: 118 },
    { id: 24, name: "النور", nameRu: "Ан-Нур", place: "مدنية", verses: 64 },
    { id: 25, name: "الفرقان", nameRu: "Аль-Фуркан", place: "مكية", verses: 77 },
    { id: 26, name: "الشعراء", nameRu: "Аш-Шуара", place: "مكية", verses: 227 },
    { id: 27, name: "النمل", nameRu: "Ан-Намль", place: "مكية", verses: 93 },
    { id: 28, name: "القصص", nameRu: "Аль-Касас", place: "مكية", verses: 88 },
    { id: 29, name: "العنكبوت", nameRu: "Аль-Анкабут", place: "مكية", verses: 69 },
    { id: 30, name: "الروم", nameRu: "Ар-Рум", place: "مكية", verses: 60 },
    { id: 31, name: "لقمان", nameRu: "Лукман", place: "مكية", verses: 34 },
    { id: 32, name: "السجدة", nameRu: "Ас-Саджда", place: "مكية", verses: 30 },
    { id: 33, name: "الأحزاب", nameRu: "Аль-Ахзаб", place: "مدنية", verses: 73 },
    { id: 34, name: "سبأ", nameRu: "Саба", place: "مكية", verses: 54 },
    { id: 35, name: "فاطر", nameRu: "Фатир", place: "مكية", verses: 45 },
    { id: 36, name: "يس", nameRu: "Йа Син", place: "مكية", verses: 83 },
    { id: 37, name: "الصافات", nameRu: "Ас-Саффат", place: "مكية", verses: 182 },
    { id: 38, name: "ص", nameRu: "Сад", place: "مكية", verses: 88 },
    { id: 39, name: "الزمر", nameRu: "Аз-Зумар", place: "مكية", verses: 75 },
    { id: 40, name: "غافر", nameRu: "Гафир", place: "مكية", verses: 85 },
    { id: 41, name: "فصلت", nameRu: "Фуссилят", place: "مكية", verses: 54 },
    { id: 42, name: "الشورى", nameRu: "Аш-Шура", place: "مكية", verses: 53 },
    { id: 43, name: "الزخرف", nameRu: "Аз-Зухруф", place: "مكية", verses: 89 },
    { id: 44, name: "الدخان", nameRu: "Ад-Духан", place: "مكية", verses: 59 },
    { id: 45, name: "الجاثية", nameRu: "Аль-Джасия", place: "مكية", verses: 37 },
    { id: 46, name: "الأحقاف", nameRu: "Аль-Ахкаф", place: "مكية", verses: 35 },
    { id: 47, name: "محمد", nameRu: "Мухаммад", place: "مدنية", verses: 38 },
    { id: 48, name: "الفتح", nameRu: "Аль-Фатх", place: "مدنية", verses: 29 },
    { id: 49, name: "الحجرات", nameRu: "Аль-Худжурат", place: "مدنية", verses: 18 },
    { id: 50, name: "ق", nameRu: "Каф", place: "مكية", verses: 45 },
    { id: 51, name: "الذاريات", nameRu: "Аз-Зарият", place: "مكية", verses: 60 },
    { id: 52, name: "الطور", nameRu: "Ат-Тур", place: "مكية", verses: 49 },
    { id: 53, name: "النجم", nameRu: "Ан-Наджм", place: "مكية", verses: 62 },
    { id: 54, name: "القمر", nameRu: "Аль-Камар", place: "مكية", verses: 55 },
    { id: 55, name: "الرحمن", nameRu: "Ар-Рахман", place: "مدنية", verses: 78 },
    { id: 56, name: "الواقعة", nameRu: "Аль-Вакиа", place: "مكية", verses: 96 },
    { id: 57, name: "الحديد", nameRu: "Аль-Хадид", place: "مدنية", verses: 29 },
    { id: 58, name: "المجادلة", nameRu: "Аль-Муджадиля", place: "مدنية", verses: 22 },
    { id: 59, name: "الحشر", nameRu: "Аль-Хашр", place: "مدنية", verses: 24 },
    { id: 60, name: "الممتحنة", nameRu: "Аль-Мумтахана", place: "مدنية", verses: 13 },
    { id: 61, name: "الصف", nameRu: "Ас-Сафф", place: "مدنية", verses: 14 },
    { id: 62, name: "الجمعة", nameRu: "Аль-Джумуа", place: "مدنية", verses: 11 },
    { id: 63, name: "المنافقون", nameRu: "Аль-Мунафикун", place: "مدنية", verses: 11 },
    { id: 64, name: "التغابن", nameRu: "Ат-Тагабун", place: "مدنية", verses: 18 },
    { id: 65, name: "الطلاق", nameRu: "Ат-Талак", place: "مدنية", verses: 12 },
    { id: 66, name: "التحريم", nameRu: "Ат-Тахрим", place: "مدنية", verses: 12 },
    { id: 67, name: "الملك", nameRu: "Аль-Мульк", place: "مكية", verses: 30 },
    { id: 68, name: "القلم", nameRu: "Аль-Калям", place: "مكية", verses: 52 },
    { id: 69, name: "الحاقة", nameRu: "Аль-Хакка", place: "مكية", verses: 52 },
    { id: 70, name: "المعارج", nameRu: "Аль-Мааридж", place: "مكية", verses: 44 },
    { id: 71, name: "نوح", nameRu: "Нух", place: "مكية", verses: 28 },
    { id: 72, name: "الجن", nameRu: "Аль-Джинн", place: "مكية", verses: 28 },
    { id: 73, name: "المزمل", nameRu: "Аль-Муззаммиль", place: "مكية", verses: 20 },
    { id: 74, name: "المدثر", nameRu: "Аль-Муддассир", place: "مكية", verses: 56 },
    { id: 75, name: "القيامة", nameRu: "Аль-Кияма", place: "مكية", verses: 40 },
    { id: 76, name: "الإنسان", nameRu: "Аль-Инсан", place: "مدنية", verses: 31 },
    { id: 77, name: "المرسلات", nameRu: "Аль-Мурсалят", place: "مكية", verses: 50 },
    { id: 78, name: "النبإ", nameRu: "Ан-Наба", place: "مكية", verses: 40 },
    { id: 79, name: "النازعات", nameRu: "Ан-Назиат", place: "مكية", verses: 46 },
    { id: 80, name: "عبس", nameRu: "Абаса", place: "مكية", verses: 42 },
    { id: 81, name: "التكوير", nameRu: "Ат-Таквир", place: "مكية", verses: 29 },
    { id: 82, name: "الإنفطار", nameRu: "Аль-Инфитар", place: "مكية", verses: 19 },
    { id: 83, name: "المطففين", nameRu: "Аль-Мутаффифин", place: "مكية", verses: 36 },
    { id: 84, name: "الإنشقاق", nameRu: "Аль-Иншикак", place: "مكية", verses: 25 },
    { id: 85, name: "البروج", nameRu: "Аль-Бурудж", place: "مكية", verses: 22 },
    { id: 86, name: "الطارق", nameRu: "Ат-Тарик", place: "مكية", verses: 17 },
    { id: 87, name: "الأعلى", nameRu: "Аль-Аля", place: "مكية", verses: 19 },
    { id: 88, name: "الغاشية", nameRu: "Аль-Гашия", place: "مكية", verses: 26 },
    { id: 89, name: "الفجر", nameRu: "Аль-Фаджр", place: "مكية", verses: 30 },
    { id: 90, name: "البلد", nameRu: "Аль-Баляд", place: "مكية", verses: 20 },
    { id: 91, name: "الشمس", nameRu: "Аш-Шамс", place: "مكية", verses: 15 },
    { id: 92, name: "الليل", nameRu: "Аль-Ляйль", place: "مكية", verses: 21 },
    { id: 93, name: "الضحى", nameRu: "Ад-Духа", place: "مكية", verses: 11 },
    { id: 94, name: "الشرح", nameRu: "Аш-Шарх", place: "مكية", verses: 8 },
    { id: 95, name: "التين", nameRu: "Ат-Тин", place: "مكية", verses: 8 },
    { id: 96, name: "العلق", nameRu: "Аль-Аляк", place: "مكية", verses: 19 },
    { id: 97, name: "القدر", nameRu: "Аль-Кадр", place: "مكية", verses: 5 },
    { id: 98, name: "البينة", nameRu: "Аль-Баййина", place: "مدنية", verses: 8 },
    { id: 99, name: "الزلزلة", nameRu: "Аз-Зальзаля", place: "مدنية", verses: 8 },
    { id: 100, name: "العاديات", nameRu: "Аль-Адият", place: "مكية", verses: 11 },
    { id: 101, name: "القارعة", nameRu: "Аль-Кариа", place: "مكية", verses: 11 },
    { id: 102, name: "التكاثر", nameRu: "Ат-Такасур", place: "مكية", verses: 8 },
    { id: 103, name: "العصر", nameRu: "Аль-Аср", place: "مكية", verses: 3 },
    { id: 104, name: "الهمزة", nameRu: "Аль-Хумаза", place: "مكية", verses: 9 },
    { id: 105, name: "الفيل", nameRu: "Аль-Филь", place: "مكية", verses: 5 },
    { id: 106, name: "قريش", nameRu: "Курайш", place: "مكية", verses: 4 },
    { id: 107, name: "الماعون", nameRu: "Аль-Маун", place: "مكية", verses: 7 },
    { id: 108, name: "الكوثر", nameRu: "Аль-Каусар", place: "مكية", verses: 3 },
    { id: 109, name: "الكافرون", nameRu: "Аль-Кафирун", place: "مكية", verses: 6 },
    { id: 110, name: "النصر", nameRu: "Ан-Наср", place: "مدنية", verses: 3 },
    { id: 111, name: "المسد", nameRu: "Аль-Масад", place: "مكية", verses: 5 },
    { id: 112, name: "الإخلاص", nameRu: "Аль-Ихляс", place: "مكية", verses: 4 },
    { id: 113, name: "الفلق", nameRu: "Аль-Фалак", place: "مكية", verses: 5 },
    { id: 114, name: "الناس", nameRu: "Ан-Нас", place: "مكية", verses: 6 }
];

let currentSurahId = 1;
let currentSurahData = null;
let isLoading = false;

// ==================== ЗАГРУЗКА СУРЫ ====================
async function loadSurah(surahId) {
    if (isLoading) return;
    isLoading = true;
    
    const surah = surahs.find(s => s.id === surahId);
    if (!surah) return;
    
    document.getElementById('surahName').innerText = surah.name;
    document.getElementById('surahInfo').innerText = `${surah.place} • ${surah.verses} آيات`;
    document.getElementById('currentSurahNum').innerText = surahId;
    
    const quranTextDiv = document.getElementById('quranText');
    quranTextDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
    
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.alafasy`);
        const data = await response.json();
        
        if (data.code === 200) {
            const verses = data.data.ayahs;
            let html = '';
            for (let i = 0; i < verses.length; i++) {
                html += `
                    <div class="ayah">
                        <span class="ayah-number">${verses[i].numberInSurah}</span>
                        <span class="ayah-text">${verses[i].text}</span>
                    </div>
                `;
            }
            quranTextDiv.innerHTML = html;
            currentSurahData = verses;
        } else {
            throw new Error('Не удалось загрузить суру');
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        quranTextDiv.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i> خطأ في التحميل<br>
                <small>يرجى التحقق من اتصال الإنترنت</small>
            </div>
        `;
    }
    
    isLoading = false;
    updateActiveSurahInList();
}

// ==================== НАВИГАЦИЯ ====================
function nextSurah() {
    if (currentSurahId < 114) {
        const page = document.getElementById('quranPage');
        page.classList.add('page-flip-right');
        setTimeout(() => {
            currentSurahId++;
            loadSurah(currentSurahId);
            setTimeout(() => {
                page.classList.remove('page-flip-right');
            }, 100);
        }, 150);
    }
}

function prevSurah() {
    if (currentSurahId > 1) {
        const page = document.getElementById('quranPage');
        page.classList.add('page-flip-left');
        setTimeout(() => {
            currentSurahId--;
            loadSurah(currentSurahId);
            setTimeout(() => {
                page.classList.remove('page-flip-left');
            }, 100);
        }, 150);
    }
}

function goToSurah(surahId) {
    if (surahId === currentSurahId) {
        closeDrawer();
        return;
    }
    
    const page = document.getElementById('quranPage');
    const direction = surahId > currentSurahId ? 'page-flip-right' : 'page-flip-left';
    page.classList.add(direction);
    
    setTimeout(() => {
        currentSurahId = surahId;
        loadSurah(currentSurahId);
        closeDrawer();
        setTimeout(() => {
            page.classList.remove(direction);
        }, 100);
    }, 150);
}

// ==================== МЕНЮ СО СПИСКОМ СУР ====================
function buildSurahList() {
    const container = document.getElementById('surahList');
    if (!container) return;
    
    let html = '';
    surahs.forEach(surah => {
        html += `
            <div class="surah-item" data-id="${surah.id}">
                <div class="surah-info">
                    <div class="surah-name">${surah.id}. ${surah.nameRu}</div>
                    <div class="surah-name-ar">${surah.name}</div>
                    <div class="surah-meta">${surah.place} • ${surah.verses} آيات</div>
                </div>
                <div class="surah-number">${surah.id}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.surah-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            goToSurah(id);
        });
    });
    
    updateActiveSurahInList();
}

function updateActiveSurahInList() {
    document.querySelectorAll('.surah-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        if (id === currentSurahId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function openDrawer() {
    document.getElementById('surahDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    document.getElementById('surahDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== ПОИСК СУР ====================
function initSearch() {
    const searchInput = document.getElementById('surahSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.surah-item');
        
        items.forEach(item => {
            const nameRu = item.querySelector('.surah-name').innerText.toLowerCase();
            const nameAr = item.querySelector('.surah-name-ar').innerText.toLowerCase();
            const id = item.dataset.id;
            
            if (nameRu.includes(query) || nameAr.includes(query) || id === query) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// ==================== ТЁМНАЯ ТЕМА ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const icon = document.querySelector('#themeToggleQuran i');
    if (savedTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#themeToggleQuran i');
    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// ==================== НАВИГАЦИЯ НА ГЛАВНУЮ ====================
function initBackButton() {
    const backBtn = document.getElementById('backToMain');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', () => {
    buildSurahList();
    initSearch();
    initTheme();
    initBackButton();
    loadSurah(1);
    
    document.getElementById('nextSurah').addEventListener('click', nextSurah);
    document.getElementById('prevSurah').addEventListener('click', prevSurah);
    document.getElementById('menuToggleBtn').addEventListener('click', openDrawer);
    document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
    document.getElementById('themeToggleQuran').addEventListener('click', toggleTheme);
});
