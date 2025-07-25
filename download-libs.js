// Скрипт для скачивания библиотек локально
// Использование: node download-libs.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Создаем папку для библиотек
const libsDir = './libs';
if (!fs.existsSync(libsDir)) {
    fs.mkdirSync(libsDir);
    console.log('📁 Создана папка libs/');
}

// Список библиотек для скачивания
const libraries = [
    {
        name: 'D3.js v7',
        url: 'https://d3js.org/d3.v7.min.js',
        filename: 'd3.min.js'
    },
    {
        name: 'Marked.js',
        url: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
        filename: 'marked.min.js'
    }
];

// Функция для скачивания файла
function downloadFile(url, filepath, libraryName) {
    return new Promise((resolve, reject) => {
        console.log(`📥 Скачиваем ${libraryName}...`);
        
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    const sizeKB = Math.round(stats.size / 1024);
                    console.log(`✅ ${libraryName} скачана (${sizeKB} KB)`);
                    resolve();
                });
            } else {
                file.close();
                fs.unlink(filepath, () => {}); // Удаляем частично скачанный файл
                reject(new Error(`HTTP ${response.statusCode} для ${url}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {}); // Удаляем частично скачанный файл
            reject(err);
        });
    });
}

// Скачиваем все библиотеки
async function downloadAllLibraries() {
    console.log('🚀 Начинаем скачивание библиотек...\n');
    
    for (const lib of libraries) {
        const filepath = path.join(libsDir, lib.filename);
        
        try {
            await downloadFile(lib.url, filepath, lib.name);
        } catch (error) {
            console.error(`❌ Ошибка скачивания ${lib.name}:`, error.message);
            
            // Пробуем альтернативные URL
            if (lib.filename === 'd3.min.js') {
                console.log('🔄 Пробуем альтернативный источник для D3.js...');
                try {
                    await downloadFile(
                        'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
                        filepath,
                        'D3.js (альтернативный URL)'
                    );
                } catch (altError) {
                    console.error('❌ Альтернативный источник тоже недоступен');
                }
            }
        }
    }
    
    console.log('\n🎉 Скачивание завершено!');
    console.log('\n📖 Теперь можете использовать:');
    console.log('   - index.html (обычная версия)');
    console.log('   - index-offline.html (версия с локальными библиотеками)');
    
    // Проверяем, все ли файлы скачались
    let allDownloaded = true;
    for (const lib of libraries) {
        const filepath = path.join(libsDir, lib.filename);
        if (!fs.existsSync(filepath) || fs.statSync(filepath).size < 1000) {
            console.log(`⚠️  ${lib.name} не скачана или повреждена`);
            allDownloaded = false;
        }
    }
    
    if (allDownloaded) {
        console.log('\n✅ Все библиотеки успешно скачаны!');
        console.log('🌐 Теперь сайт будет работать без интернета!');
    }
}

// Запускаем скачивание
downloadAllLibraries().catch(console.error); 