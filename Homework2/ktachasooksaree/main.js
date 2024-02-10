const width = window.innerWidth;
const height = window.innerHeight;
const pieWidth = 400;
const pieHeight = 350;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let barLeft = 75, barTop = 400;
let barMargin = {top: 10, right: 30, bottom: 30, left: 60},
    barWidth = width - barMargin.left - barMargin.right,
    barHeight = height - 450 - barMargin.top - barMargin.bottom;



d3.csv("data/pokemon_alopez247.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
    });
    

    rawData = rawData.map(d=>{
                          return {
                            "Body_Style":d.Body_Style,
                            "Color":d.Color,
                            "Generation":d.Generation,
                            "HP":d.HP,
                            "Attack":d.Attack,
                            "Defense":d.Defense
                          };
    });
    console.log(rawData);

    const svg = d3.select("svg")
    
//plot 1
// Pie chart of pokemon by color
    const g1 = svg.append("g")
        .attr("transform", `translate(${scatterLeft}, ${scatterTop})`);

    q = rawData.reduce((s, { Color }) => (s[Color] = (s[Color] || 0) + 1, s), {});
    r = Object.entries(q).map(([Color, count]) => ({ Color, count }));

    const radius = Math.min(pieWidth, pieHeight) / 2;

    const pieChart = g1.append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight - 150})`);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pieLayout = d3.pie().value(d => d.count);
    const arcs = pieChart.selectAll(".arc")
        .data(pieLayout(r))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.Color)
        .attr("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", 0.7);

    // Add a legend
    legend = g1.selectAll(".legend")
        .data(r)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20 + 10})`);

    legend.append("rect")
        .attr("x", pieWidth + 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d.Color)
        .style("stroke", "black")
        .style("stroke-width", "1px");

    legend.append("text")
        .attr("x", pieWidth + 34)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d.Color);

    // Add a title
    g1.append("text")
        .attr("x", pieWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Pokemon Distribution by Color");

//space
    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`)

// Plot 2
// Bar chart of all the pokemon distributed by body style
    const g3 = svg.append("g")
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .attr("transform", `translate(${barMargin.left}, ${barTop})`)
    q = rawData.reduce((s, { Body_Style }) => (s[Body_Style] = (s[Body_Style] || 0) + 1, s), {});
    r = Object.keys(q).map((key) => ({ Body_Style: key.replace("_", " "), count: q[key] }));
    console.log(r);

    // X label
    g3.append("text")
    .attr("x", barWidth / 2)
    .attr("y", barHeight + 75)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("Body Style")
    

    // Y label
    g3.append("text")
    .attr("x", -(barHeight / 2))
    .attr("y", -40)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Pokemons")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(r.map(d => d.Body_Style))
    .range([0, barWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g3.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(r, d => d.count)])
    .range([barHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(r)

    rects2.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", (d) => x2(d.Body_Style))
    .attr("width", x2.bandwidth)
    .attr("height", d => barHeight - y2(d.count))
    .attr("fill", "#70E0BB")

    // Add a title
    g3.append("text")
        .attr("x", barWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Pokemon Distributed by Body Style");


// Plot 3
// Parallel plot of the average HP, Attack, and Defense by generation
    const g4 = svg.append("g")
                    .attr("transform", `translate(${distrLeft}, ${distrTop})`);

    // Extract unique generations
    const generations = [...new Set(rawData.map(d => d.Generation))];

    // Compute average HP, Attack, and Defense for each generation
    const averages = generations.map(gen => {
        const pokemonsInGeneration = rawData.filter(d => d.Generation === gen);
        const hpSum = pokemonsInGeneration.reduce((acc, curr) => acc + curr.HP, 0);
        const attackSum = pokemonsInGeneration.reduce((acc, curr) => acc + curr.Attack, 0);
        const defenseSum = pokemonsInGeneration.reduce((acc, curr) => acc + curr.Defense, 0);
        const count = pokemonsInGeneration.length;
        return {
            Generation: gen,
            Average_HP: hpSum / count,
            Average_Attack: attackSum / count,
            Average_Defense: defenseSum / count
        };  
    });

    // Define scales for each attribute
    const xScale = d3.scalePoint()
                        .domain(["HP", "Attack", "Defense"])
                        .range([0, distrWidth]);

    const yScales = {
        Average_HP: d3.scaleLinear().domain([0, d3.max(averages, d => d.Average_HP)]).range([distrHeight, 0]),
        Average_Attack: d3.scaleLinear().domain([0, d3.max(averages, d => d.Average_Attack)]).range([distrHeight, 0]),
        Average_Defense: d3.scaleLinear().domain([0, d3.max(averages, d => d.Average_Defense)]).range([distrHeight, 0])
    };

    // Define colors for each generation
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                            .domain(generations);

    // Draw lines
    g4.selectAll(".line")
        .data(generations)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", gen => {
            return d3.line()([
                [xScale("HP") + 275, yScales.Average_HP(averages.find(d => d.Generation === gen).Average_HP) + 50],
                [xScale("Attack") + 275, yScales.Average_Attack(averages.find(d => d.Generation === gen).Average_Attack) + 50],
                [xScale("Defense") + 275, yScales.Average_Defense(averages.find(d => d.Generation === gen).Average_Defense) + 50]
            ]);
        })
        .style("stroke", d => colorScale(d))
        .style("fill", "none")
        .style("stroke-width", "2px");

    // Draw axes
    Object.keys(yScales).forEach((attr, i) => {
    const axis = d3.axisLeft(yScales[attr]);
    g4.append("g")
        .attr("transform", `translate(${xScale(["HP", "Attack", "Defense"][i]) + 275}, 50)`)
        .call(axis)
        .append("text")
        .attr("class", "axis-label")
        .attr("y", -30)
        .attr("x", 0)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text(attr);
    });

    // Add axis labels
    g4.append("text")
        .attr("class", "axis-label")
        .attr("x", 275)
        .attr("y", distrHeight + 60)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average HP");
    
    g4.append("text")
        .attr("class", "axis-label")
        .attr("x", 425)
        .attr("y", distrHeight + 60)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Attack");

    g4.append("text")
        .attr("class", "axis-label")
        .attr("x", 575)
        .attr("y", distrHeight + 60)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Defense");


    // Add legend
    legend = g4.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${distrWidth - 100}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
                                .data(generations)
                                .enter().append("g")
                                .attr("class", "legend-item")
                                .attr("transform", (d, i) => `translate(0, ${i * 20})`); 

    legendItems.append("rect")
                .attr("x", 435)
                .attr("y", 25)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", d => colorScale(d));

    legendItems.append("text")
                .attr("x", 450)
                .attr("y", 35)
                .text(d => "Gen " + d);

    // Add a title
    g4.append("text")
        .attr("x", distrWidth + 120)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Average HP, Attack, and Defense of Pokemon by Generation");


}).catch(function(error){
    console.log(error);

    });