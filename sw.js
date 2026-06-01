// ==================== УЛУЧШЕННОЕ КЭШИРОВАНИЕ СУР ====================
const surahCache = {};
let currentSurah = 1;
const totalSurahs = 114;
const STORAGE_KEY = 'quran_cache';

// Загрузка кэша из localStorage при старте
function loadCacheFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const cache = JSON.parse(saved);
        for (let [key, value] of Object.entries(cache)) {
            if (Date.now() - value.timestamp < 86400000) { // 24 часа
                surahCache[key] = value.html;
            }
        }
    }
}

// Сохранение кэша в localStorage
function saveCacheToStorage() {
    const toSave = {};
    for (let [key, value] of Object.entries(surahCache)) {
        toSave[key] = {
            html: value,
            timestamp: Date.now()
        };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// Предзагрузка следующих сур в фоне
function preloadNextSurahs(currentNum) {
    const toPreload = [];
    for (let i = 1; i <= 5; i++) {
        let nextNum = currentNum + i;
        if (nextNum > totalSurahs) nextNum = nextNum - totalSurahs;
        if (!surahCache[nextNum]) {
            toPreload.push(nextNum);
        }
    }
    
    toPreload.forEach(surahNum => {
        if (!surahCache[surahNum]) {
            fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/ar.uthmani`)
                .then(r => r.json())
                .then(data => {
                    if (data.code === 200) {
                        const surah = data.data[0];
                        let html = `
                            <div class="surah-name">${surahNum}. ${surahNames[surahNum]}</div>
                            <div class="surah-basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                            <div class="ayahs-container">
                        `;
                        surah.ayahs.forEach(ayah => {
                            html += `
                                <div class="ayah-line">
                                    <span class="arabic-ayah">${ayah.text}</span>
                                    <span class="ayah-number-badge">${ayah.numberInSurah}</span>
                                </div>
                            `;
                        });
                        html += `</div>`;
                        surahCache[surahNum] = html;
                        saveCacheToStorage();
                    }
                })
                .catch(err => console.log(`Не удалось предзагрузить суру ${surahNum}`));
        }
    });
}

// Обновлённая функция displaySurah с предзагрузкой
async function displaySurah(surahNumber) {
    const container = document.getElementById('surahContent');
    
    // Если сура уже в кэше
    if (surahCache[surahNumber]) {
        container.innerHTML = surahCache[surahNumber];
        preloadNextSurahs(surahNumber);
        return;
    }
    
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-pulse"></i> Загрузка...</div>';
    
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/ar.uthmani`);
        const data = await response.json();
        
        if (data.code === 200) {
            const surah = data.data[0];
            let html = `
                <div class="surah-name">${surahNumber}. ${surahNames[surahNumber]}</div>
                <div class="surah-basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                <div class="ayahs-container">
            `;
            
            surah.ayahs.forEach(ayah => {
                html += `
                    <div class="ayah-line">
                        <span class="arabic-ayah">${ayah.text}</span>
                        <span class="ayah-number-badge">${ayah.numberInSurah}</span>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            surahCache[surahNumber] = html;
            saveCacheToStorage();
            container.innerHTML = html;
            preloadNextSurahs(surahNumber);
        } else {
            container.innerHTML = '<div class="loading-placeholder">Ошибка загрузки</div>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="loading-placeholder">Ошибка сети. Проверьте подключение.</div>';
    }
}

// Загружаем кэш и запускаем первую суру
loadCacheFromStorage();
setSurah(1);
