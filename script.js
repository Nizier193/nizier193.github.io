// Конфигурация графа
const config = {
    width: window.innerWidth,
    height: window.innerHeight - 140, // Вычитаем высоту header и footer
    centerForce: 0.2,
    repelForce: -300,
    linkDistance: 100,
    alphaDecay: 0.01,
    velocityDecay: 0.4
};

// Глобальные переменные
let svg, g, simulation, nodes, links;
let selectedNode = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Загружаем данные
        const data = await loadData();
        
        // Инициализируем граф
        initGraph();
        
        // Создаем граф с данными
        createGraph(data);
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showError(`Ошибка инициализации: ${error.message}`);
    }
});

// Загрузка данных из JSON файла
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn('Не удалось загрузить data.json, используем встроенные данные:', error);
        // Fallback данные для случая прямого открытия файла
        return getEmbeddedData();
    }
}

// Встроенные данные как fallback
function getEmbeddedData() {
    return {
        "nodes": [
            {
                "id": "nikita",
                "name": "Никита Борисов | Nizier193",
                "size": 35,
                "color": "#3498db",
                "text": "# Никита Борисов | Nizier193\n\n**17-летний разработчик из Санкт-Петербурга**\n\n🎓 Студент Machine Learning в HSE\n💻 Специализируюсь на Python, ML и веб-разработке\n🏆 Победитель хакатонов\n\n---\n\n### Достижения:\n- 🥇 1-е место в AI-Arrow Hackathon\n- 🥈 2-е место в Digital Breakthrough\n- 📊 Исследователь в области CNN для классификации заболеваний растений\n\n### Контакты:\n- **Telegram:** [@Nizier193](https://t.me/Nizier193)\n- **GitHub:** [Nizier193](https://github.com/Nizier193)",
                "x": 0,
                "y": 0,
                "fixed": true
            },
            {
                "id": "education",
                "name": "Образование",
                "size": 25,
                "color": "#e74c3c",
                "text": "# 🎓 Образование\n\n## Текущее обучение:\n**HSE ML School (SPb)** - Октябрь 2024 - настоящее время\n- Изучение Machine Learning\n- Практические проекты\n- Работа с современными алгоритмами\n\n## Завершенные курсы:\n\n### AI-Arrow Bootcamp (Senior Track)\n*Июль 2024 - Август 2024*\n- Хакатон-ориентированный ML буткемп\n- Работа в команде над реальными проектами\n\n### Yandex Lyceum: Data Science\n*Январь 2024 - Апрель 2024* | **С отличием**\n- Pandas, Scipy\n- Анализ данных\n- Статистика\n\n### Yandex Lyceum: Machine Learning  \n*Сентябрь 2023 - Декабрь 2023* | **С отличием**\n- CNN, YOLO, Classic ML\n- Numpy, Matplotlib\n- Проект: Классификация CT сканов",
                "parent": "nikita"
            },
            {
                "id": "projects",
                "name": "Проекты",
                "size": 25,
                "color": "#f39c12",
                "text": "# 💻 Мои проекты\n\n## Главные достижения:\n\n### 🏆 Viral Clip Maker\n**2-е место в Digital Breakthrough**\n- Автоматическое создание вирусных видео\n- OpenAI Vision + GPT-4\n- MoviePy, FastAPI, FFmpeg\n\n### 🎮 AI-Arrow: D&D Environment\n**1-е место в Dungeons And Dragons Hackathon**\n- LLM как игроки и Dungeon Master\n- Генерация изображений и музыки\n- Streamlit, AsyncIO\n\n### 🎫 Automatic Ticket Dispatching\n**2-е место в хакатоне**\n- Обработка заявок первой линии\n- GPT-3.5, spaCy, PostgreSQL\n\n### 🌱 CNN для классификации болезней растений\n- Научная работа на 33 страницы\n- PyTorch, OpenCV, ResNet\n- Исследование архитектур CNN\n\n### 🎯 Theta Game\n- Игра с системой чанков (как в Minecraft)\n- PyGame, PyTMX, NumPy\n- Частицы, кастомные текстуры",
                "parent": "nikita"
            },
            {
                "id": "skills",
                "name": "Навыки",
                "size": 20,
                "color": "#9b59b6",
                "text": "# 🛠️ Технические навыки\n\n## Языки программирования:\n- **Python** ⭐⭐⭐⭐⭐\n- **JavaScript** ⭐⭐⭐⭐\n- **HTML/CSS** ⭐⭐⭐⭐\n\n## Machine Learning:\n- **PyTorch** ⭐⭐⭐⭐\n- **OpenCV** ⭐⭐⭐⭐\n- **Pandas/NumPy** ⭐⭐⭐⭐⭐\n- **Scikit-learn** ⭐⭐⭐⭐\n- **CNN, YOLO** ⭐⭐⭐⭐\n\n## Веб-разработка:\n- **FastAPI** ⭐⭐⭐⭐\n- **Streamlit** ⭐⭐⭐⭐\n- **PostgreSQL** ⭐⭐⭐\n- **Docker** ⭐⭐⭐\n\n## Инструменты:\n- **Git** ⭐⭐⭐⭐\n- **Linux** ⭐⭐⭐\n- **API Design** ⭐⭐⭐⭐",
                "parent": "nikita"
            },
            {
                "id": "team",
                "name": "Команда",
                "size": 20,
                "color": "#1abc9c",
                "text": "# 👥 Командная работа\n\n## Опыт работы в команде:\n\n### Хакатоны:\n- **Digital Breakthrough** - команда из 4 человек\n- **AI-Arrow Bootcamp** - различные команды\n- **Ticket Dispatching** - команда из 3 человек\n\n### Роли в команде:\n- 🧠 **Technical Lead** - архитектура решений\n- 💻 **Backend Developer** - API и алгоритмы\n- 🤖 **ML Engineer** - модели и обработка данных\n\n### Навыки:\n- Agile методологии\n- Git flow и code review\n- Документирование кода\n- Презентация результатов\n- Менторство младших участников\n\n### Достижения:\n- Лидерство в 3 призовых проектах\n- Эффективная координация разработки\n- Успешная интеграция ML в продукты",
                "parent": "nikita"
            },
            {
                "id": "hse",
                "name": "HSE ML School",
                "size": 15,
                "color": "#e67e22",
                "text": "# 🎓 HSE ML School (SPb)\n\n**Октябрь 2024 - настоящее время**\n\n## О программе:\nИнтенсивная программа изучения машинного обучения от Высшей школы экономики в Санкт-Петербурге.\n\n## Изучаемые темы:\n- Глубокое обучение\n- Компьютерное зрение\n- Обработка естественного языка\n- Рекомендательные системы\n- MLOps и продакшн системы\n\n## Практические проекты:\n- Классификация изображений\n- Анализ текстов\n- Временные ряды\n- A/B тестирование\n\n## Результаты:\n- Углубленное понимание ML алгоритмов\n- Практический опыт с реальными данными\n- Нетворкинг с экспертами индустрии",
                "parent": "education"
            },
            {
                "id": "yandex",
                "name": "Yandex Lyceum",
                "size": 15,
                "color": "#e67e22",
                "text": "# 🎓 Yandex Lyceum\n\n## Data Science Course\n**Январь 2024 - Апрель 2024** | **С отличием**\n\n### Изученные технологии:\n- **Pandas** - анализ и обработка данных\n- **Scipy** - статистические методы\n- **Matplotlib/Seaborn** - визуализация\n- **NumPy** - численные вычисления\n\n### Проекты:\n- Анализ продаж интернет-магазина\n- Исследование пользовательского поведения\n- A/B тестирование\n\n---\n\n## Machine Learning Course\n**Сентябрь 2023 - Декабрь 2023** | **С отличием**\n\n### Изученные технологии:\n- **CNN** - сверточные нейронные сети\n- **YOLO** - детекция объектов\n- **Classic ML** - традиционные алгоритмы\n- **PyTorch** - глубокое обучение\n\n### Финальный проект:\n**Классификация CT сканов**\n- Архитектуры: CNN, UNet, ResNet-52\n- Точность: 94%\n- Обработка медицинских изображений",
                "parent": "education"
            },
            {
                "id": "python_course",
                "name": "Code of the Future",
                "size": 12,
                "color": "#e67e22",
                "text": "# 🐍 Python Programming Course\n**\"Code of the Future\"**\n\n**Сентябрь 2022 - Август 2023** | **Лучший студент курса**\n\n## Освоенные технологии:\n- **OOP** - объектно-ориентированное программирование\n- **FastAPI** - создание REST API\n- **PyTelegramBotAPI** - боты для Telegram\n- **PyGame** - разработка игр\n- **SQLite/PostgreSQL** - работа с базами данных\n\n## Проекты курса:\n1. **Калькуляторы** - консольные и GUI приложения\n2. **Веб-парсеры** - сбор данных с сайтов\n3. **Игра с чанками** - система как в Minecraft\n4. **Прототип соцсети** - полнофункциональная платформа\n\n## Результат:\n- Твердая база в Python\n- Понимание архитектуры ПО\n- Опыт работы с API\n- Навыки проектирования БД",
                "parent": "education"
            }
        ],
        "links": [
            {
                "source": "nikita",
                "target": "education"
            },
            {
                "source": "nikita", 
                "target": "projects"
            },
            {
                "source": "nikita",
                "target": "skills"
            },
            {
                "source": "nikita",
                "target": "team"
            },
            {
                "source": "education",
                "target": "hse"
            },
            {
                "source": "education",
                "target": "yandex"
            },
            {
                "source": "education",
                "target": "python_course"
            }
        ]
    };
}

// Инициализация SVG и настройка масштабирования
function initGraph() {
    svg = d3.select('#graph-svg')
        .attr('width', config.width)
        .attr('height', config.height);

    // Создаем группу для масштабирования
    g = svg.append('g');

    // Настройка масштабирования и панорамирования
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', function(event) {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Устанавливаем начальный масштаб
    svg.call(zoom.transform, d3.zoomIdentity.scale(0.8).translate(config.width/2, config.height/2));

    // Добавляем градиенты для узлов
    addGradients();
}

// Создание градиентов для красивых узлов
function addGradients() {
    const defs = svg.append('defs');
    
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
    
    colors.forEach((color, i) => {
        const gradient = defs.append('radialGradient')
            .attr('id', `gradient-${i}`)
            .attr('cx', '30%')
            .attr('cy', '30%');
            
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', d3.rgb(color).brighter(0.5));
            
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color);
    });
}

// Создание графа
function createGraph(data) {
    nodes = [...data.nodes];
    links = data.links.map(link => ({...link}));

    // Создаем симуляцию физики
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(config.linkDistance))
        .force('charge', d3.forceManyBody().strength(config.repelForce))
        .force('center', d3.forceCenter(0, 0).strength(config.centerForce))
        .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 5))
        .alphaDecay(config.alphaDecay)
        .velocityDecay(config.velocityDecay);

    // Создаем связи
    const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', 'link');

    // Создаем узлы
    const nodeGroup = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node-group')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

    // Добавляем кружки для узлов
    const node = nodeGroup.append('circle')
        .attr('class', 'node')
        .attr('r', getNodeRadius)
        .attr('fill', (d, i) => `url(#gradient-${i % 6})`)
        .attr('stroke', d => d3.rgb(d.color).darker())
        .attr('stroke-width', 2)
        .on('click', handleNodeClick)
        .on('mouseover', handleNodeHover)
        .on('mouseout', handleNodeOut);

    // Добавляем подписи к узлам
    const labels = nodeGroup.append('text')
        .attr('class', 'node-label')
        .attr('dy', d => getNodeRadius(d) + 15)
        .style('font-size', d => d.id === 'nikita' ? '14px' : '12px')
        .style('font-weight', d => d.id === 'nikita' ? '600' : '500')
        .text(d => d.name);

    // Обновление позиций на каждом тике симуляции
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        nodeGroup
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Фиксируем центральный узел
    const centerNode = nodes.find(n => n.id === 'nikita');
    if (centerNode) {
        centerNode.fx = 0;
        centerNode.fy = 0;
    }
}

// Получение радиуса узла
function getNodeRadius(d) {
    return d.size || 15;
}

// Обработчики перетаскивания
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    // Не отпускаем центральный узел
    if (d.id !== 'nikita') {
        d.fx = null;
        d.fy = null;
    }
}

// Обработка клика по узлу
function handleNodeClick(event, d) {
    event.stopPropagation();
    
    // Убираем выделение с предыдущего узла
    d3.selectAll('.node').classed('selected', false);
    d3.selectAll('.link').classed('highlighted', false);
    
    // Выделяем текущий узел
    d3.select(this).classed('selected', true);
    selectedNode = d;
    
    // Подсвечиваем связанные связи
    d3.selectAll('.link')
        .classed('highlighted', link => 
            link.source.id === d.id || link.target.id === d.id
        );
    
    // Показываем информацию в sidebar
    showNodeInfo(d);
}

// Обработка наведения на узел
function handleNodeHover(event, d) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr('r', getNodeRadius(d) * 1.2);
    
    // Показываем tooltip
    showTooltip(event, d);
}

// Обработка ухода курсора с узла
function handleNodeOut(event, d) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr('r', getNodeRadius(d));
    
    // Скрываем tooltip
    hideTooltip();
}

// Показ информации об узле в sidebar
function showNodeInfo(node) {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('sidebar-content');
    
    // Рендерим markdown в HTML
    const htmlContent = marked.parse(node.text || 'Нет описания для этого узла.');
    
    content.innerHTML = htmlContent;
    sidebar.classList.add('open');
}

// Скрытие sidebar
function hideSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    
    // Убираем выделение
    d3.selectAll('.node').classed('selected', false);
    d3.selectAll('.link').classed('highlighted', false);
    selectedNode = null;
}

// Показ tooltip
function showTooltip(event, d) {
    // Создаем tooltip если его нет
    let tooltip = d3.select('body').select('.tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000);
    }
    
    tooltip.html(`<strong>${d.name}</strong><br/>Нажмите для подробностей`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
}

// Скрытие tooltip
function hideTooltip() {
    d3.select('.tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка закрытия sidebar
    document.getElementById('close-sidebar').addEventListener('click', hideSidebar);
    
    // Кнопка сброса масштаба
    document.getElementById('reset-zoom').addEventListener('click', resetZoom);
    
    // Кнопка центрирования
    document.getElementById('center-graph').addEventListener('click', centerGraph);
    
    // Закрытие sidebar при клике на фон
    svg.on('click', function(event) {
        if (event.target === this) {
            hideSidebar();
        }
    });
    
    // Обработка изменения размера окна
    window.addEventListener('resize', handleResize);
    
    // Закрытие sidebar при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideSidebar();
        }
    });
}

// Сброс масштаба
function resetZoom() {
    const zoom = d3.zoom();
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.scale(0.8).translate(config.width/2, config.height/2));
}

// Центрирование графа
function centerGraph() {
    if (simulation) {
        simulation.alpha(0.3).restart();
        
        // Перезапускаем силы
        simulation
            .force('center', d3.forceCenter(0, 0).strength(0.3))
            .alpha(0.3)
            .restart();
        
        setTimeout(() => {
            simulation.force('center', d3.forceCenter(0, 0).strength(config.centerForce));
        }, 1000);
    }
}

// Обработка изменения размера окна
function handleResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight - 140;
    
    config.width = newWidth;
    config.height = newHeight;
    
    svg.attr('width', newWidth)
       .attr('height', newHeight);
    
    if (simulation) {
        simulation.force('center', d3.forceCenter(0, 0));
    }
}

// Показ ошибки
function showError(message) {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('sidebar-content');
    
    content.innerHTML = `
        <div style="color: #e74c3c; text-align: center; padding: 20px;">
            <h3>⚠️ Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
    
    sidebar.classList.add('open');
}

// Утилиты для отладки
window.graphDebug = {
    getNodes: () => nodes,
    getLinks: () => links,
    getSimulation: () => simulation,
    getSelectedNode: () => selectedNode,
    centerNode: (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            node.fx = 0;
            node.fy = 0;
            simulation.alpha(0.3).restart();
        }
    }
};

console.log('График знаний готов к использованию!'); 