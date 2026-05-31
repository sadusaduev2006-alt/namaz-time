// ВСЕ 114 СУР (массив surahs оставь как есть из предыдущей версии)

let currentSurahId = 1;
let isLoading = false;

function getCachedSurah(surahId) {
    const cached = localStorage.getItem(`surah_${surahId}`);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < 30 * 24 * 60 * 60 * 1000) return data.verses;
        } catch(e) {}
    }
    return null;
}

function setCachedSurah(surahId, verses) {
    localStorage.setItem(`surah_${surahId}`, JSON.stringify({ timestamp: Date.now(), verses }));
}

async function loadSurah(surahId, animate = false) {
    if (isLoading) return;
    isLoading = true;
    
    const surah = surahs.find(s => s.id === surahId);
    if (!surah) return;
    
    if (animate) {
        const page = document.getElementById('quranPage');
        page.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        page.style.transform = 'scale(0.98)';
        page.style.opacity = '0.8';
        setTimeout(() => { page.style.transform = ''; page.style.opacity = ''; }, 200);
    }
    
    document.getElementById('surahName').innerText = surah.name;
    document.getElementById('surahInfo').innerText = `${surah.place} • ${surah.verses} آيات`;
    document.getElementById('currentSurahNum').innerText = surahId;
    
    const quranTextDiv = document.getElementById('quranText');
    
    const cached = getCachedSurah(surahId);
    if (cached) {
        renderVerses(cached);
        isLoading = false;
        return;
    }
    
    quranTextDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
    
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.alafasy`);
        const data = await response.json();
        if (data.code === 200) {
            const verses = data.data.ayahs;
            setCachedSurah(surahId, verses);
            renderVerses(verses);
        } else throw new Error();
    } catch (error) {
        quranTextDiv.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i> خطأ في التحميل</div>';
    }
    isLoading = false;
}

function renderVerses(verses) {
    const container = document.getElementById('quranText');
    container.innerHTML = verses.map(v => `
        <div class="ayah">
            <span class="ayah-number">${v.numberInSurah}</span>
            <span class="ayah-text">${v.text}</span>
        </div>
    `).join('');
}

function nextSurah() {
    if (currentSurahId < 114) {
        currentSurahId++;
        loadSurah(currentSurahId, true);
    }
}

function prevSurah() {
    if (currentSurahId > 1) {
        currentSurahId--;
        loadSurah(currentSurahId, true);
    }
}

function goToSurah(surahId) {
    if (surahId === currentSurahId) { closeDrawer(); return; }
    currentSurahId = surahId;
    loadSurah(currentSurahId, true);
    closeDrawer();
}

// Построение списка сур
function buildSurahList() {
    const container = document.getElementById('surahList');
    container.innerHTML = surahs.map(s => `
        <div class="surah-item" data-id="${s.id}">
            <div><span class="surah-name">${s.id}. ${s.nameRu}</span><br><span class="surah-name-ar">${s.name}</span></div>
            <div class="surah-number">${s.id}</div>
        </div>
    `).join('');
    document.querySelectorAll('.surah-item').forEach(el => {
        el.addEventListener('click', () => goToSurah(parseInt(el.dataset.id)));
    });
}

function updateActiveSurah() {
    document.querySelectorAll('.surah-item').forEach(el => {
        if (parseInt(el.dataset.id) === currentSurahId) el.classList.add('active');
        else el.classList.remove('active');
    });
}

// Тёмная тема для Корана
function initThemeQuran() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', saved);
    const icon = document.querySelector('#themeToggleQuran i');
    if (saved === 'dark') icon.classList.replace('fa-moon', 'fa-sun');
    else icon.classList.replace('fa-sun', 'fa-moon');
}

function toggleThemeQuran() {
    const cur = document.body.getAttribute('data-theme');
    const neu = cur === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', neu);
    localStorage.setItem('theme', neu);
    const icon = document.querySelector('#themeToggleQuran i');
    if (neu === 'dark') icon.classList.replace('fa-moon', 'fa-sun');
    else icon.classList.replace('fa-sun', 'fa-moon');
}

// Меню
function openDrawer() { document.getElementById('surahDrawer').classList.add('open'); document.getElementById('drawerOverlay').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeDrawer() { document.getElementById('surahDrawer').classList.remove('open'); document.getElementById('drawerOverlay').classList.remove('active'); document.body.style.overflow = ''; }

// Поиск
function initSearch() {
    document.getElementById('surahSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.surah-item').forEach(el => {
            const text = el.innerText.toLowerCase();
            el.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    buildSurahList();
    initSearch();
    initThemeQuran();
    loadSurah(1);
    document.getElementById('nextSurah').onclick = nextSurah;
    document.getElementById('prevSurah').onclick = prevSurah;
    document.getElementById('menuToggleBtn').onclick = openDrawer;
    document.getElementById('closeDrawerBtn').onclick = closeDrawer;
    document.getElementById('drawerOverlay').onclick = closeDrawer;
    document.getElementById('themeToggleQuran').onclick = toggleThemeQuran;
    document.getElementById('backToMain').onclick = () => window.location.href = 'index.html';
});
