// ==================== ДАННЫЕ О СУРАХ ====================
const surahs = [ /* ТВОЙ ПОЛНЫЙ СПИСОК СУР — ОСТАВЬ КАК ЕСТЬ */ ];
// ВНИМАНИЕ: Оставь здесь свой полный массив surahs из 114 сур!
// В этом сообщении он сокращен для краткости, но ты должен вставить свой полный список.

let currentSurahId = 1;
let isLoading = false;

// КЛЮЧЕВАЯ ФУНКЦИЯ КЕШИРОВАНИЯ
function getCachedSurah(surahId) {
    const cacheKey = `surah_${surahId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const data = JSON.parse(cached);
            // Проверяем, не устарел ли кеш (например, 30 дней)
            const isExpired = (Date.now() - data.timestamp) > 30 * 24 * 60 * 60 * 1000;
            if (!isExpired) {
                return data.verses;
            }
        } catch(e) { console.warn("Ошибка кеша", e); }
    }
    return null;
}

function setCachedSurah(surahId, verses) {
    const cacheKey = `surah_${surahId}`;
    const cacheData = {
        timestamp: Date.now(),
        verses: verses
    };
    try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch(e) { console.warn("Не удалось сохранить в кеш", e); }
}

// ПЕРЕРАБОТАННАЯ ФУНКЦИЯ ЗАГРУЗКИ (С КЕШЕМ)
async function loadSurah(surahId) {
    if (isLoading) return;
    isLoading = true;
    
    const surah = surahs.find(s => s.id === surahId);
    if (!surah) return;
    
    // Обновляем заголовки
    document.getElementById('surahName').innerText = surah.name;
    document.getElementById('surahInfo').innerText = `${surah.place} • ${surah.verses} آيات`;
    document.getElementById('currentSurahNum').innerText = surahId;
    
    const quranTextDiv = document.getElementById('quranText');
    
    // 1. ПРОВЕРЯЕМ КЕШ
    const cachedVerses = getCachedSurah(surahId);
    if (cachedVerses) {
        // Если сура есть в кеше — показываем мгновенно
        renderVerses(cachedVerses);
        isLoading = false;
        updateActiveSurahInList();
        return;
    }
    
    // 2. ЕСЛИ В КЕШЕ НЕТ — ГРУЗИМ С API
    quranTextDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
    
    try {
        // Используем более быстрый альтернативный API (quran.gading.dev)
        // Он примерно в 3 раза быстрее стандартного [citation:5][citation:9]
        const response = await fetch(`https://api.quran.gading.dev/surah/${surahId}`);
        const data = await response.json();
        
        if (data.code === 200) {
            const verses = data.data.verses;
            // Сохраняем в кеш для следующих разов
            setCachedSurah(surahId, verses);
            // Показываем на экране
            renderVerses(verses);
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

// ФУНКЦИЯ ДЛЯ ОТРИСОВКИ АЯТОВ
function renderVerses(verses) {
    const quranTextDiv = document.getElementById('quranText');
    let html = '';
    for (let i = 0; i < verses.length; i++) {
        const verse = verses[i];
        // Адаптация под структуру данных разных API
        const verseNumber = verse.number?.inSurah || verse.number || (i+1);
        const verseText = verse.text?.arab || verse.text || verse.arab;
        
        html += `
            <div class="ayah">
                <span class="ayah-number">${verseNumber}</span>
                <span class="ayah-text">${verseText}</span>
            </div>
        `;
    }
    quranTextDiv.innerHTML = html;
}

// ФУНКЦИЯ ДЛЯ ПРЕДЗАГРУЗКИ СОСЕДНИХ СУР (ОПЦИОНАЛЬНО)
function preloadAdjacentSurahs() {
    if (currentSurahId > 1 && !getCachedSurah(currentSurahId - 1)) {
        fetch(`https://api.quran.gading.dev/surah/${currentSurahId - 1}`)
            .then(r => r.json())
            .then(data => {
                if (data.code === 200) setCachedSurah(currentSurahId - 1, data.data.verses);
            })
            .catch(e => console.log("Preload failed", e));
    }
    if (currentSurahId < 114 && !getCachedSurah(currentSurahId + 1)) {
        fetch(`https://api.quran.gading.dev/surah/${currentSurahId + 1}`)
            .then(r => r.json())
            .then(data => {
                if (data.code === 200) setCachedSurah(currentSurahId + 1, data.data.verses);
            })
            .catch(e => console.log("Preload failed", e));
    }
}

// ==================== НАВИГАЦИЯ (С ПРЕДЗАГРУЗКОЙ) ====================
function nextSurah() {
    if (currentSurahId < 114) {
        currentSurahId++;
        loadSurah(currentSurahId);
        preloadAdjacentSurahs(); // Загружаем следующую суру в фоне
    }
}

function prevSurah() {
    if (currentSurahId > 1) {
        currentSurahId--;
        loadSurah(currentSurahId);
        preloadAdjacentSurahs(); // Загружаем предыдущую суру в фоне
    }
}

function goToSurah(surahId) {
    if (surahId === currentSurahId) {
        closeDrawer();
        return;
    }
    currentSurahId = surahId;
    loadSurah(currentSurahId);
    preloadAdjacentSurahs();
    closeDrawer();
}

// ОСТАЛЬНОЙ КОД (buildSurahList, initSearch, initTheme, initBackButton) ОСТАВЬ БЕЗ ИЗМЕНЕНИЙ
// ...
