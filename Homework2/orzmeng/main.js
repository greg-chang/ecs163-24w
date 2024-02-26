document.addEventListener("DOMContentLoaded", function() {
    // 设置顶部图表容器的样式
    var topCharts = document.getElementById('top-charts');
    topCharts.style.display = 'flex';
    topCharts.style.justifyContent = 'space-between';
    topCharts.style.width = '100%';

    // 设置散点图和条形图容器的宽度和高度
    var scatterplot = document.getElementById('scatterplot');
    var barchart = document.getElementById('barchart');
    scatterplot.style.width = '50%';
    scatterplot.style.height = '600px';
    barchart.style.width = '50%';
    barchart.style.height = '600px';

    // 设置桑基图容器的样式
    var sankeychart = document.getElementById('sankeychart');
    sankeychart.style.width = '100%';
    sankeychart.style.marginTop = '20px';
});


let scatterMargin = { top: 10, right: 50, bottom: 100, left: 50 },
    barMargin = { top: 20, right: 30, bottom: 70, left: 150 },
    scatterWidth = window.innerWidth / 2.3,
    scatterHeight = 600,
    barWidth = window.innerWidth / 2.3,
    barHeight = 600;

let sankeyMargin = { top: 40, right: 95, bottom: 10, left: 90 },
    sankeyWidth = window.innerWidth - sankeyMargin.left - sankeyMargin.right - 180,
    sankeyHeight = 1700;

const sankeySvg = d3.select("body").append("svg")
    .attr("width", sankeyWidth + sankeyMargin.left + sankeyMargin.right)
    .attr("height", sankeyHeight + sankeyMargin.top + sankeyMargin.bottom)
    .append('g')
    .attr('transform', `translate(${sankeyMargin.left}, ${sankeyMargin.top})`);

const scatterSvg = d3.select("#scatterplot").append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    .append('g')
    .attr('transform', `translate(${scatterMargin.left}, ${scatterMargin.top})`);

// Create the bar chart SVG container
const barSvg = d3.select("#barchart").append("svg")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append('g')
    .attr('transform', `translate(${barMargin.left}, ${barMargin.top})`);

function createScatterPlot(data) {
    data.forEach(d => {
        d.salary_in_usd = +d.salary_in_usd;
    });

    const svg = d3.select('svg')
        .attr('width', scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr('height', scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .append('g')
        .attr('transform', `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.salary_in_usd)])
        .range([0, scatterWidth]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.experience_level))
        .range([0, scatterHeight])
        .padding(0.1);

    svg.append('g')
        .attr('transform', `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('font-size', '18px');

    svg.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '18px');

    svg.selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.salary_in_usd))
        .attr('cy', d => yScale(d.experience_level) + yScale.bandwidth() / 2)
        .attr('r', 5)
        .style('fill', '#69b3a2');

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', scatterWidth / 2)
        .attr('y', scatterHeight + scatterMargin.top + 40)
        .style('font-size', '20px')
        .text('Salary in USD');

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -scatterMargin.left + 20)
        .attr('x', -scatterHeight / 2)
        .style('font-size', '20px')
        .text('Experience Level');
}

function createBarChart(data, svg, width, height, margin) {
    const sumSalaries = {};
    const countSalaries = {};
    data.forEach(d => {
        if (sumSalaries[d.experience_level]) {
            sumSalaries[d.experience_level] += d.salary_in_usd;
            countSalaries[d.experience_level] += 1;
        } else {
            sumSalaries[d.experience_level] = d.salary_in_usd;
            countSalaries[d.experience_level] = 1;
        }
    });

    const averageSalaries = Object.keys(sumSalaries).map(key => ({
        experience_level: key,
        average_salary: sumSalaries[key] / countSalaries[key]
    })).sort((a, b) => b.average_salary - a.average_salary);

    const x = d3.scaleBand()
        .domain(averageSalaries.map(d => d.experience_level))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(averageSalaries, d => d.average_salary)])
        .range([height, 0]);

    svg.selectAll(".bar")
        .data(averageSalaries)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.experience_level))
        .attr("y", d => y(d.average_salary))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.average_salary))
        .attr("fill", "#69b3a2");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "20px");

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "20px");

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', scatterWidth / 2)
        .attr('y', scatterHeight + scatterMargin.top + 40)
        .style('font-size', '30px')
        .text('Salary in USD');

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -scatterMargin.left - 40)
        .attr('x', -scatterHeight / 3)
        .style('font-size', '30px')
        .text('Experience Level');
}

function createSankeyDiagram(data) {
    let sankeyData = transformDataToSankey(data);

    let sankey = d3.sankey()
        .nodeWidth(26)
        .nodePadding(90)
        .extent([
            [1, 1],
            [sankeyWidth - 1, sankeyHeight - 5]
        ]);

    sankey(sankeyData);

    sankeySvg.append("g")
        .selectAll("path")
        .data(sankeyData.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .style("stroke-width", d => Math.max(1, d.width))
        .style("fill", "none")
        .style("stroke", "grey")
        .style("stroke-opacity", 0.5);

    const node = sankeySvg.append("g")
        .selectAll("rect")
        .data(sankeyData.nodes)
        .enter()
        .append("g")
        .attr("class", "node");

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .attr("fill", "blue");

    node.append("text")
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => d.y0 - 10)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .style("font-size", "20px");
}

function transformDataToSankey(data) {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    const linkMap = new Map();

    function addNode(name) {
        if (!nodeMap.has(name)) {
            nodeMap.set(name, nodes.length);
            nodes.push({ name });
        }
    }

    function addLink(sourceName, targetName, value) {
        const source = nodeMap.get(sourceName);
        const target = nodeMap.get(targetName);
        const linkKey = `${source}-${target}`;

        if (linkMap.has(linkKey)) {
            linkMap.get(linkKey).value += value;
        } else {
            const newLink = { source, target, value };
            links.push(newLink);
            linkMap.set(linkKey, newLink);
        }
    }

    data.forEach(d => {
        const workYearNode = `work_year-${d.work_year}`;
        const experienceLevelNode = `experience_level-${d.experience_level}`;
        const companyLocationNode = `company_location-${d.company_location}`;
        const companySizeNode = `company_size-${d.company_size}`;

        addNode(workYearNode);
        addNode(experienceLevelNode);
        addNode(companyLocationNode);
        addNode(companySizeNode);

        addLink(workYearNode, experienceLevelNode, 1);
        addLink(experienceLevelNode, companyLocationNode, 1);
        addLink(companyLocationNode, companySizeNode, 1);
    });

    links.forEach(link => {
        link.source = nodeMap.get(nodes[link.source].name);
        link.target = nodeMap.get(nodes[link.target].name);
    });

    return { nodes, links };
}


let globalData;
d3.csv("ds_salaries.csv").then(data => {
    data.forEach(d => {
        d.salary_in_usd = +d.salary_in_usd;
    });

    globalData = data;

    createScatterPlot(data);
    createBarChart(data, barSvg, barWidth, barHeight, barMargin);
    createSankeyDiagram(data);
});