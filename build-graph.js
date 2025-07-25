// Graph Builder - Автоматическая сборка графа из модулей
// Использование: node build-graph.js

const fs = require('fs');
const path = require('path');

class GraphBuilder {
    constructor() {
        this.config = {};
        this.allNodes = [];
        this.allLinks = [];
        this.colorSchemes = {};
        this.defaultSizes = {};
    }

    // Загрузка конфигурации
    loadConfig() {
        try {
            const configPath = './graph-config.json';
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            this.colorSchemes = this.config.graph_settings.color_schemes;
            this.defaultSizes = this.config.graph_settings.default_sizes;
            console.log('✅ Конфигурация загружена');
        } catch (error) {
            console.error('❌ Ошибка загрузки конфигурации:', error.message);
            process.exit(1);
        }
    }

    // Загрузка модуля
    loadModule(modulePath) {
        try {
            const fullPath = path.resolve(modulePath);
            const moduleData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            console.log(`📦 Загружен модуль: ${modulePath}`);
            return moduleData;
        } catch (error) {
            console.error(`❌ Ошибка загрузки модуля ${modulePath}:`, error.message);
            return null;
        }
    }

    // Обработка узлов из модуля
    processNodes(moduleData, categoryName = null) {
        if (moduleData.nodes) {
            // Центральный узел
            moduleData.nodes.forEach(node => {
                this.processNode(node, categoryName);
            });
        }
    }

    // Обработка отдельного узла
    processNode(node, categoryName, parentId = null) {
        // Применение настроек по умолчанию
        const processedNode = {
            id: node.id,
            name: node.name,
            size: node.size || this.getDefaultSize(node.type || 'item'),
            color: node.color || this.getColor(categoryName, node.type),
            text: node.text || `# ${node.name}\n\nОписание отсутствует.`,
            ...node
        };

        // Добавление parent если указан
        if (parentId) {
            processedNode.parent = parentId;
        }

        // Удаление служебных полей
        delete processedNode.children;
        delete processedNode.type;

        this.allNodes.push(processedNode);

        // Обработка дочерних узлов
        if (node.children) {
            node.children.forEach(child => {
                this.processNode(child, categoryName, node.id);
            });
        }
    }

    // Получение размера по умолчанию
    getDefaultSize(type) {
        return this.defaultSizes[type] || this.defaultSizes.item;
    }

    // Получение цвета для категории
    getColor(categoryName, type) {
        if (!categoryName || !this.colorSchemes[categoryName]) {
            return '#95a5a6'; // Цвет по умолчанию
        }

        const colors = this.colorSchemes[categoryName];
        const typeIndex = {
            'category': 0,
            'subcategory': 1,
            'item': 2,
            'detail': 3
        };

        return colors[typeIndex[type] || 2];
    }

    // Автоматическая генерация связей на основе parent-child
    generateLinks() {
        this.allNodes.forEach(node => {
            if (node.parent) {
                this.allLinks.push({
                    source: node.parent,
                    target: node.id
                });
            }
        });

        // Добавление кастомных связей из конфигурации
        if (this.config.config.link_rules.custom_links) {
            this.allLinks.push(...this.config.config.link_rules.custom_links);
        }
    }

    // Сборка всего графа
    build() {
        console.log('🚀 Начинаем сборку графа...\n');

        // Загрузка конфигурации
        this.loadConfig();

        // Загрузка всех модулей
        this.config.config.modules.forEach(modulePath => {
            const moduleData = this.loadModule(modulePath);
            if (moduleData) {
                // Определение категории из пути файла
                const categoryName = path.basename(modulePath, '.json');
                this.processNodes(moduleData, categoryName);
            }
        });

        // Автогенерация связей
        if (this.config.config.auto_generate_links) {
            this.generateLinks();
            console.log('🔗 Связи автоматически сгенерированы');
        }

        // Создание итогового объекта
        const result = {
            nodes: this.allNodes,
            links: this.allLinks
        };

        console.log(`\n📊 Статистика сборки:`);
        console.log(`   Узлов: ${this.allNodes.length}`);
        console.log(`   Связей: ${this.allLinks.length}`);

        return result;
    }

    // Сохранение результата
    save(outputPath = './data.json') {
        const result = this.build();
        
        try {
            // Создание красиво отформатированного JSON
            const jsonString = JSON.stringify(result, null, 2);
            fs.writeFileSync(outputPath, jsonString);
            
            console.log(`\n✅ Граф успешно собран: ${outputPath}`);
            console.log(`📁 Размер файла: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
            
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error.message);
        }
    }

    // Проверка целостности графа
    validate() {
        console.log('\n🔍 Проверка целостности графа...');
        
        const nodeIds = new Set(this.allNodes.map(n => n.id));
        const issues = [];

        // Проверка связей
        this.allLinks.forEach(link => {
            if (!nodeIds.has(link.source)) {
                issues.push(`Связь указывает на несуществующий source: ${link.source}`);
            }
            if (!nodeIds.has(link.target)) {
                issues.push(`Связь указывает на несуществующий target: ${link.target}`);
            }
        });

        // Проверка дубликатов ID
        const duplicates = this.allNodes
            .map(n => n.id)
            .filter((id, index, arr) => arr.indexOf(id) !== index);

        if (duplicates.length > 0) {
            issues.push(`Дублированные ID: ${duplicates.join(', ')}`);
        }

        if (issues.length === 0) {
            console.log('✅ Граф валиден!');
        } else {
            console.log('⚠️  Найдены проблемы:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return issues.length === 0;
    }
}

// Функция для добавления нового узла
function addNode(categoryPath, nodeData) {
    try {
        const module = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        
        // Логика добавления узла в нужное место модуля
        // ... (реализация зависит от структуры)
        
        fs.writeFileSync(categoryPath, JSON.stringify(module, null, 2));
        console.log(`✅ Узел добавлен в ${categoryPath}`);
    } catch (error) {
        console.error('❌ Ошибка добавления узла:', error.message);
    }
}

// Основной запуск
if (require.main === module) {
    const builder = new GraphBuilder();
    
    // Сборка и сохранение
    builder.save();
    
    // Валидация
    builder.validate();
    
    console.log('\n🎉 Готово! Теперь можете использовать обновленный data.json');
    console.log('\n📖 Для добавления новых узлов:');
    console.log('   1. Отредактируйте соответствующий файл в nodes/');
    console.log('   2. Запустите: node build-graph.js');
    console.log('   3. Новый граф автоматически соберется!');
}

module.exports = { GraphBuilder, addNode }; 