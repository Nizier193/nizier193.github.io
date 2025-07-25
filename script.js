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

// Функция инициализации
async function initApp() {
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
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM уже готов, запускаем сразу
    initApp();
}

// Загрузка данных из JSON файла
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки data.json:', error);
        throw error;
    }
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

    // Обновляем статистику
    updateStats();
}

// Получение радиуса узла
function getNodeRadius(d) {
    return d.size || 15;
}

// Обновление статистики
function updateStats() {
    const nodesCountElement = document.getElementById('nodes-count');
    const linksCountElement = document.getElementById('links-count');
    
    if (nodesCountElement && linksCountElement) {
        nodesCountElement.textContent = nodes ? nodes.length : 0;
        linksCountElement.textContent = links ? links.length : 0;
    }
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