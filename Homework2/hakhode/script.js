const width = window.innerWidth;
const height = window.innerHeight;

let scatterMargin = {top: 50, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 300 - scatterMargin.top - scatterMargin.bottom;

let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 100 - distrMargin.top - distrMargin.bottom;

let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = 200 - teamMargin.top - teamMargin.bottom;

let plotMargin = {top: 10, right: 30, bottom: 30, left: 60},
    plotWidth = width - plotMargin.left - plotMargin.right,
    plotHeight = height - plotMargin.top - plotMargin.bottom;

let scatterLeft = 0, scatterTop = 0;
let distrLeft = 0, distrTop = scatterTop + scatterHeight + scatterMargin.top + scatterMargin.bottom;
let teamLeft = 0, teamTop = distrTop + distrHeight + distrMargin.top + distrMargin.bottom;

let plotLeft = 50;
let plotTop = teamTop + teamHeight + teamMargin.bottom + 50;

plotHeight = height - plotTop - plotMargin.bottom;

d3.csv("data/pokemon.csv").then(rawData => {
    console.log("rawData", rawData);
        
    rawData.forEach(function(d){
        d.Number = Number(d.Number);
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
    });
    
    // Plot 1: Scatterplot
    const svg = d3.select("svg")
    const scatterTitle = svg.append("text")
        .attr("x", scatterWidth / 2 + scatterMargin.left)
        .attr("y", scatterMargin.top/2)
        .attr("font-size", "25px")
        .attr("text-anchor", "middle")
        .text("Distribution of HP of all pokemons (ID)");

    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)
            
    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("ID")

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("HP")

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Number)])
    .range([0, scatterWidth])

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(7)

    g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.HP)])
    .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13)
    
    g1.append("g").call(yAxisCall)

    const rects = g1.selectAll("circle").data(rawData)

    rects.enter().append("circle")
         .attr("cx", function(d){
             return x1(d.Number);
         })
         .attr("cy", function(d){
             return y1(d.HP);
         })
         .attr("r", 3)
         .attr("fill", "#69b3a2")

    // Space
    const g2 = svg.append("g")
        .attr("width", distrWidth + distrMargin.left + distrMargin.right)
        .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
        .attr("transform", `translate(${distrLeft}, ${distrTop})`)

    // Plot 2: Bar Graph
    q = rawData.reduce((s, { Type_1 }) => (s[Type_1] = (s[Type_1] || 0) + 1, s), {});
    r = Object.keys(q).map((key) => ({ Type_1: key, count: q[key] }));
    console.log(r);

    const teamTitle = svg.append("text")
        .attr("x", teamWidth / 2 + teamMargin.left)
        .attr("y", distrTop + distrHeight + teamMargin.top / 2)
        .attr("font-size", "25px")
        .attr("text-anchor", "middle")
        .text("Number of pokemons of each type (Type 1)");

    const g3 = svg.append("g")
        .attr("width", teamWidth + teamMargin.left + teamMargin.right)
        .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
        .attr("transform", `translate(${teamMargin.left}, ${teamTop})`)

    // X label
    g3.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Type of Pokemon")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Pokemons")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(r.map(d => d.Type_1))
    .range([0, teamWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g3.append("g")
    .attr("transform", `translate(0, ${teamHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(r, d => d.count)])
    .range([teamHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(r)

    rects2.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", (d) => x2(d.Type_1))
    .attr("width", x2.bandwidth)
    .attr("height", d => teamHeight - y2(d.count))
    .attr("fill", "grey")

    // Plot 3: Parallel plot
    const plotTitle = svg.append("text")
        .attr("x", plotWidth / 2 + plotMargin.left)
        .attr("y", plotTop + plotMargin.top / 2)
        .attr("font-size", "25px")
        .attr("text-anchor", "middle")
        .text("Parallel Plot showing relation between all attributes of all pokemons");

    const g5 = svg.append("g")
        .attr("width", plotWidth + plotMargin.left + plotMargin.right)
        .attr("height", plotHeight + plotMargin.top + plotMargin.bottom)
        .attr("transform", `translate(${plotLeft}, ${plotTop})`);

    const attributes = ['HP', 'Attack', 'Defense', 'Sp_Atk', 'Sp_Def', 'Total'];

    const scales = {};
    attributes.forEach(attr => {
        scales[attr] = d3.scaleLinear()
            .domain([0, d3.max(rawData, d => d[attr])])
            .range([plotHeight, 0]);
    });

    const x3 = d3.scalePoint()
        .range([0, plotWidth])
        .domain(attributes);

    const line = d3.line()
        .x((d, i) => x3(attributes[i]))
        .y(d => scales[d.attr](d.value));

    rawData.forEach(d => {
        d.attributes = attributes.map(attr => ({ attr, value: d[attr] }));
    });

    const paths = g5.selectAll(".pokemon").data(rawData);

    paths.enter().append("path")
        .attr("class", "pokemon")
        .attr("d", d => line(d.attributes))
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("opacity", 0.5);

    const axis = d3.axisLeft().ticks(5);

    attributes.forEach((attr, i) => {
        const axisG = g5.append("g")
            .attr("transform", `translate(${x3(attr)}, 0)`);
        axisG.call(axis.scale(scales[attr]));
        axisG.append("text")
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(attr);
    });

    attributes.forEach((attr, i) => {
        const axisLabel = g5.append("text")
            .attr("transform", `translate(${x3(attr)}, ${plotHeight + 20})`)
            .attr("text-anchor", "middle")
            .text(attr);
    });
}).catch(function(error){
    console.log(error);
});
