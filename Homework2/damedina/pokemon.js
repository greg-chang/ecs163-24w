
let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let lineLeft = 0, lineTop = 0;
let lineMargin = {top: 600, right: 30, bottom: 0, left: 100},
    lineWidth = 800 - lineMargin.left - lineMargin.right,
    lineHeight = 900 - lineMargin.top - lineMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let parallelLeft = 0, parallelTop = 400;
let parallelMargin = {top: 70, right: 200, bottom: 30, left: 100},
    parallelWidth = width - parallelMargin.left - parallelMargin.right,
    parallelHeight = height-450 - parallelMargin.top - parallelMargin.bottom;

let legendLeft = 1550, legendTop = 0;
let legendMargin = {top: 10, right: 30, bottom: 30, left: 800},
    legendWidth = width - legendMargin.left - legendMargin.right,
    legendHeight = height - legendMargin.top - legendMargin.bottom;

let donutLeft = 1000, donutTop = 0;
let donutMargin = {top: 750, right: 30, bottom: 0, left: 1200},
    donutWidth = 400,
    donutHeight = 400;


const svg = d3.select("svg")
.append("g")
    .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
    .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
    

d3.csv("pokemon_alopez247.csv").then(data =>{

    const generations = {};

    data.forEach(pokemon => {
        const generation = pokemon.Generation;

        if (!generations[generation]) {
            generations[generation] = {};
        }

        const type1 = pokemon.Type_1;

        if (!generations[generation][type1]) {
            generations[generation][type1] = 1;
        } else {
            generations[generation][type1]++;
        }
    });

    var genFourFullData = data.filter((pokemon) => {
        return pokemon.Generation == 4
    })

    // Code for parallel coordinate chart adapted from: (https://d3-graph-gallery.com/graph/parallel_custom.html)(2/9/24).
    const parallelSVG = svg.append("g")
    .attr("transform",
        `translate(${parallelMargin.left},${parallelMargin.top})`);
   
    dimensions = ["Type_1", "Weight_kg", "Height_m", "HP"];

    const type_keys = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost",
    "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];

    // Pokemon type color mappings by apaleslimghost (https://gist.github.com/apaleslimghost/0d25ec801ca4fc43317bcff298af43c3)(2/9/24).
    var color = d3.scaleOrdinal()
        .domain(type_keys)
        .range(["#A6B91A", "#705746", "#6F35FC", "#F7D02C", "#D685AD", "#C22E28", "#EE8130", "#A98FF3",
        "#735797", "#7AC74C", "#E2BF65", "#96D9D6", "#A8A77A", "#A33EA1", "#F95587", "#B6A136",
        "#B7B7CE", "#6390F0"])

    const y = {}

    y[dimensions[0]] = d3.scalePoint()
        .domain(genFourFullData.map((d) => {
            return d[dimensions[0]];
        }))
        .range([parallelHeight, 0])

    for (i in dimensions) {
        if (i != 0){
            cat = dimensions[i]

            y[cat] = d3.scaleLinear()
                .domain(d3.extent(genFourFullData, (d) => {
                    return +d[cat];
                }))
                .range([parallelHeight, 0])
        }
    }

    x = d3.scalePoint()
        .range([0, parallelWidth])
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map((p) => {
            return [x(p), y[p](d[p])];
        }));
    }

    parallelSVG.selectAll("paths")
        .data(genFourFullData)
        .enter()
        .append("path")
            .attr("class", (d) => {
                return "line " + d.Type_1
            })
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d) => {
                return (color(d.Type_1))
            })
            .style("stroke-width", 1.5)
            .style("opacity", 1.0)

    parallelSVG.selectAll("axis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", (d) =>{
            return "translate(" + x(d) + ")";
        })
        .each(function(d){
            d3.select(this).call(d3.axisLeft().scale(y[d]));
        })
        .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text((d) => {
                switch(d){
                    case "Type_1":
                        return "Primary Type"
                    case "Weight_kg":
                        return "Weight(kg)"
                    case "Height_m":
                        return "Height(m)"
                    default:
                        return d
                }
            })
            .style("fill", "black")
    parallelSVG.append("text")
        .attr("x", 600)
        .attr("y", -30)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text("Fourth Generation Pokemon Physical Data Mapped to HP Value (Focus View)")


    // Code for legend adapted from: (https://d3-graph-gallery.com/graph/custom_legend.html)(2/9/24).
    const legendSVG = svg.append("g")
        .attr("width", legendWidth + legendMargin.left + legendMargin.right)
            .attr("height", legendHeight + legendMargin.top + legendMargin.bottom)
            .attr("transform", `translate(${legendLeft}, ${legendTop})`)

    legendSVG.append("rect")
        .attr("x", 70)
        .attr("y", 65)
        .attr("width", 140)
        .attr("height", type_keys.length * 25 + 20)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 1);

    legendSVG.append("text")
            .attr("x", 70)
            .attr("y", 80)
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("text-decoration", "underline")
            .text("Pokemon Type Legend")

    legendSVG.selectAll("legend")
        .data(type_keys)
        .enter()
        .append("circle")
            .attr("cx", 100)
            .attr("cy", (d, i) => {
                return 100 + i*25
            })
            .attr("r", 7)
            .style("fill", (d) => {
                return color(d)
            })

    legendSVG.selectAll("legend_labels")
        .data(type_keys)
        .enter()
        .append("text")
            .attr("x", 120)
            .attr("y", (d, i) => {
                return 100 + i*25
            })
            .style("fill", (d) => {
                return color(d)
            })
            .text((d) => {
                return d
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", 'middle')



    // Code for line chart adapted from: (https://d3-graph-gallery.com/graph/line_several_group.html)(2/9/24).
    const generationData = Object.keys(generations).map(generation => {
        return {
            generation: +generation,
            Bug: generations[generation].Bug || 0,
            Dark: generations[generation].Dark || 0,
            Dragon: generations[generation].Dragon || 0,
            Electric: generations[generation].Electric || 0,
            Fairy: generations[generation].Fairy || 0,
            Fighting: generations[generation].Fighting || 0,
            Fire: generations[generation].Fire || 0,
            Flying: generations[generation].Flying || 0,
            Ghost: generations[generation].Ghost || 0,
            Grass: generations[generation].Grass || 0,
            Ground: generations[generation].Ground || 0,
            Ice: generations[generation].Ice || 0,
            Normal: generations[generation].Normal || 0,
            Poison: generations[generation].Poison || 0,
            Psychic: generations[generation].Psychic || 0,
            Rock: generations[generation].Rock || 0,
            Steel: generations[generation].Steel || 0,
            Water: generations[generation].Water || 0
        }
    })

    const lineSVG = svg.append("g")
        .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")")

    const lineX = d3.scaleLinear()
        .domain(d3.extent(generationData, d => d.generation))
        .range([0, lineWidth]);
    lineSVG.append("g")
        .attr("transform", `translate(0, ${lineHeight})`)
        .call(d3.axisBottom(lineX).ticks(5));

    const lineY = d3.scaleLinear()
        .domain([0, d3.max(generationData, d => d3.max(Object.values(d).slice(1)))])
        .range([lineHeight, 0])
    lineSVG.append("g")
        .call(d3.axisLeft(lineY));

    // Pokemon type color mappings by apaleslimghost (https://gist.github.com/apaleslimghost/0d25ec801ca4fc43317bcff298af43c3)(2/9/24).
    const colorLine = d3.scaleOrdinal()
        .range(["#A6B91A", "#705746", "#6F35FC", "#F7D02C", "#D685AD", "#C22E28", "#EE8130", "#A98FF3",
        "#735797", "#7AC74C", "#E2BF65", "#96D9D6", "#A8A77A", "#A33EA1", "#F95587", "#B6A136",
        "#B7B7CE", "#6390F0"])

    const primary_types = Object.keys(generationData[0]).slice(1);
    primary_types.forEach(type => {
        const line = d3.line()
            .x(d => lineX(d.generation))
            .y(d => lineY(d[type]));
        lineSVG.append("path")
            .datum(generationData)
            .attr("fill", "none")
            .attr("stroke", () => colorLine(type))
            .attr("stroke-width", 2.0)
            .attr("d", line);
    });
    lineSVG.append("text")
        .attr("x", 100)
        .attr("y", 0)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text("Total Number of Pokemon by Type For All Generations (Context View)")
    lineSVG.append("text")
        .attr("x", 250)
        .attr("y", 335)
        .style("font-size", "14px")
        .text("Pokemon Generation")
    lineSVG.append("text")
        .attr("x", -200)
        .attr("y", -35)
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .text("# of Pokemon")

    const genFourData = generations[4];

    var colorDonut = color;

    var radius = Math.min(donutWidth, donutHeight) / 2 

    // Code for donut chart adapted from: (https://d3-graph-gallery.com/graph/donut_label.html)(2/9/24).
    var donutSVG = svg.append("g")
    .attr("transform", "translate(" + donutMargin.left + "," + donutMargin.top + ")")
    
    var pie = d3.pie()
        .sort(null)
        .value(d => d[1])

    const genFourPieData = pie(Object.entries(genFourData))

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8)

    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

    donutSVG.selectAll('slice')
        .data(genFourPieData)
        .join('path')
        .attr('d', arc)
        .attr('fill', d => colorDonut(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
    
    donutSVG.selectAll('polylines')
        .data(genFourPieData)
        .join('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', (d) => {
                const posA = arc.centroid(d)
                const posB = outerArc.centroid(d)
                const posC = outerArc.centroid(d)
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                posC[1] = posC[1] + 5 * (midangle < Math.PI ? 1 : -1)
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1)
                return [posA, posB, posC]
            })

    donutSVG.selectAll('labels')
        .data(genFourPieData)
        .join('text')
            .text(d => d.data[0])
            .attr('transform', (d) => {
                const pos = outerArc.centroid(d)
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[1] = pos[1] + 5 * (midangle < Math.PI ? 1 : -1)
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
                return `translate(${pos})`
            })
            .style('text-anchor', (d) => {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })

    donutSVG.append("text")
        .attr("x", -165)
        .attr("y", -225)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text("Fourth Generation Pokemon Type Distribution (Focus View)")


    
}).catch(function(error){
    console.log(error);
});
