// Pokemon type colors provided by: 
// https://www.epidemicjohto.com/t882-type-colors-hex-colors
//
// I changed the normal color, since it was hard to 
// differentiate it on the context graphs
const colorMap = new Map([
    ["Normal", "#1D5443"], 
    ["Fire", "#EE8130"],
    ["Water", "#6390F0"],
    ["Electric", "#F7D02C"],
    ["Grass", "#7AC74C"],
    ["Ice", "#96D9D6"],
    ["Fighting", "#C22E28"],
    ["Poison", "#A33EA1"],
    ["Ground", "#E2BF65"],
    ["Flying", "#A98FF3"],
    ["Psychic", "#F95587"],
    ["Bug", "#A6B91A"],
    ["Rock", "#B6A136"],
    ["Ghost", "#735797"],
    ["Dragon", "#6F35FC"],
    ["Dark", "#705746"],
    ["Steel", "#B7B7CE"],
    ["Fairy", "#D685AD"],
]);

let selectedTypes = new Set();

// Based on tutorial provided by:
// https://d3-graph-gallery.com/graph/custom_legend.html
function createTypeLegend(svg, types, width, height, xOffset, yOffset) {
    const legendSize = 15
    types = Array.from(types)

    svg.selectAll("mydots")
      .data(types)
      .enter()
      .append("rect")
        .attr("x", width - xOffset)
        .attr("y", (d, i) => { return height + i * (legendSize + 5) - yOffset})
        .attr("width", legendSize)
        .attr("height", legendSize)
        .style("fill", d => { return colorMap.get(d); })
        .style("font", "10px arial")

    svg.selectAll("mylabels")
      .data(types)
      .enter()
      .append("text")
        .attr("x", width + legendSize * 1.2 - xOffset)
        .attr("y", (d, i) => { return height + 3 + i * (legendSize + 5) + (legendSize / 2) - yOffset})
        .text( d => { return d + " Type"; })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font", "10px arial")
}

// Based on tutorial provided by:
// https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
function createStar(data) {
    const labels = ["Avg. Speed", "Avg. Attack", "Avg. Sp. Attack", "Avg. Defense", "Avg. Sp. Def", "Avg. HP"]
    const width = 275;
    const height = 275;
    const maxStat = 150;
    const margin = 25;

    const svg = d3.select("#plot2")
        .attr("width", width + margin + 100)
        .attr("height", height + margin)
        .style("font", "10px arial")

    const scale = d3.scaleLinear()
        .domain([0, maxStat])
        .range([0, width / 2 - margin]);

    function getCoords(angle, value) {
        const x = Math.cos(angle) * scale(value);
        const y = Math.sin(angle) * scale(value);
        return {"x": width / 2 + x, "y": height / 2 - y};
    }

    let labelData = labels.map((name, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
        return {
            name: name,
            angle: angle,
            lineCoord: getCoords(angle, maxStat),
            labelCoord: getCoords(angle, maxStat + 10)
        };
    });

    svg.selectAll("line")
    .data(labelData)
    .join(
        enter => enter.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", d => d.lineCoord.x)
            .attr("y2", d => d.lineCoord.y)
            .attr("stroke","black")
    );
    svg.selectAll(".axislabel")
    .data(labelData)
    .join(
        enter => enter.append("text")
            .attr("x", d => d.labelCoord.x)
            .attr("y", d => d.labelCoord.y)
            .text(d => d.name)
    );
}

function updateStar(data) {
    const labels = ["Avg. Speed", "Avg. Attack", "Avg. Sp. Attack", "Avg. Defense", "Avg. Sp. Def", "Avg. HP"]
    const width = 275;
    const height = 275;
    const maxStat = 150;
    const margin = 25;

    const scale = d3.scaleLinear()
        .domain([0, maxStat])
        .range([0, width / 2 - margin]);

    function getTypeData(data, type) {
        const retData = {
            type: type,
            color: colorMap.get(type),
            speed: 0,
            hp: 0,
            attack: 0,
            spAttack: 0,
            defense: 0,
            spDefense: 0
        };

        count = 0;
        data.forEach(d => {
            if (d.type != type)
                return;

            retData.speed += d.speed;
            retData.hp += d.hp;
            retData.attack += d.attack;
            retData.spAttack += d.spAttack;
            retData.defense += d.defense;
            retData.spDefense += d.spDefense;
            count += 1;
        });

        retData.speed /= count;
        retData.hp /= count;
        retData.attack /= count;
        retData.spAttack /= count;
        retData.defense /= count;
        retData.spDefense /= count;

        return retData;
    }
    const chartData = [];
    selectedTypes.forEach(t => {
        chartData.push(getTypeData(data, t));
    });

    function getCoords(angle, value) {
        const x = Math.cos(angle) * scale(value);
        const y = Math.sin(angle) * scale(value);
        return {"x": width / 2 + x, "y": height / 2 - y};
    }

    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinearClosed)
    const noLine = d3.line()
        .x(width / 2)
        .y(height / 2)
        .curve(d3.curveLinearClosed)

    function getPathCoords(typeData) {
        let coordinates = [];
        let angle = 0;

        angle = (Math.PI / 2) + (2 * Math.PI * 0 / labels.length);
        coordinates.push(getCoords(angle, typeData.speed));

        angle = (Math.PI / 2) + (2 * Math.PI * 1 / labels.length);
        coordinates.push(getCoords(angle, typeData.attack));

        angle = (Math.PI / 2) + (2 * Math.PI * 2 / labels.length);
        coordinates.push(getCoords(angle, typeData.spAttack));

        angle = (Math.PI / 2) + (2 * Math.PI * 3 / labels.length);
        coordinates.push(getCoords(angle, typeData.defense));

        angle = (Math.PI / 2) + (2 * Math.PI * 4 / labels.length);
        coordinates.push(getCoords(angle, typeData.spDefense));

        angle = (Math.PI / 2) + (2 * Math.PI * 5 / labels.length);
        coordinates.push(getCoords(angle, typeData.hp));

        return coordinates;
    }

    d3.select("#plot2")
    .selectAll("path")
    .data(chartData)
    .join(
        enter => {
            return enter
                .append("path")
                .attr("transform-origin", (width / 2) + " " + (height / 2))
                .attr("transform", "scale(0.0)")
        },
        update => {
            return update;
        },
        exit => {
            return exit
                .remove();
        }
    )
    .attr("stroke", d => { return d.color; })
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .attr("opacity", 1.0)
    .datum(d => getPathCoords(d))
    .attr("d", line)
    .transition()
    .attr("transform", "scale(1.0)")

    console.log(line)
}

function createScatter(data) {
    const margin = {top: 50, right: 150, bottom: 50, left: 75};
    const width = 300;
    const height = 275;

    data = data.filter(d => {
        if (selectedTypes.has(d.type))
            return true;
        else
            return false;
    });

    const svg = d3.select("#plot3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xAxis = d3.scaleLinear()
        .domain([0, 300])
        .range([0, width])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis))

    const yAxis = d3.scaleLinear()
        .domain([0, 300])
        .range([height, 0])
    svg.append("g")
        .call(d3.axisLeft(yAxis));

    // X-Label
    svg.append("text")
        .attr("transform", 
            "translate(" + width / 2 + "," + (height + margin.bottom - 5) + ")"
        )
        .style("text-anchor", "middle")
        .style("font", "16px arial")
        .text("Total Attack (Attack + Sp.Attack)");

    // Y-Label
    svg.append("text")
        .attr("transform", 
            "translate(" + (-margin.left + 30) + "," + width / 2 + ")" +
            "rotate(-90)"
        )
        .style("text-anchor", "middle")
        .style("font", "16px arial")
        .text("Total Defense (Defense + Sp.Defense)");

    svg.append('g')
        .attr("id", "scatterData");
}

function updateScatterPlot(data) {
    const width = 300;
    const height = 275;

    data = data.filter(d => {
        if (selectedTypes.has(d.type))
            return true;
        else
            return false;
    });

    const xAxis = d3.scaleLinear()
        .domain([0, 300])
        .range([0, width])

    const yAxis = d3.scaleLinear()
        .domain([0, 300])
        .range([height, 0])

    d3.select("#scatterData")
        .selectAll("circle")
        .data(data, d => { return d.name })
        .join(
            enter => {
                return enter
                    .append("circle")
                    .attr("cx", d => { return xAxis(d.totalAttack); } )
                    .attr("cy", d => { return yAxis(d.totalDefense); } )
                    .style("fill", d => { return colorMap.get(d.type); })
                    .attr("r", 0.0);
            },
            update => {
                return update;
            },
            exit => {
                return exit 
                    .transition()
                    .attr("r", 0.0)
                    .remove();
            }
        )
        .transition()
        .attr("r", 4.0)
}


function createBarChart(data) {
    const margin = {top: 75, right: 50, bottom: 75, left: 100};
    const width = 550;
    const height = 550;

    const svg = d3.select("#plot1")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const avgStatTotals = new Map();
    data.forEach(d => {
        if (avgStatTotals.has(d.type)) {
            const avgStatTotal = avgStatTotals.get(d.type);
            avgStatTotal.sum += d.totalStats;
            avgStatTotal.count += 1;
        }
        else
        {
            avgStatTotals.set(d.type, {
                sum: d.totalStats,
                count: 1
            });
        }
    });

    const typeData = []
    for (const [key, value] of avgStatTotals.entries()) {
        typeData.push({
            type: key,
            avgStatTotal: value.sum / value.count
        })
    }
    typeData.sort(function(a, b) {
      return d3.ascending(a.avgStatTotal, b.avgStatTotal)
    })

    const xAxis = d3.scaleBand()
        .domain(typeData.map(d => d.type))
        .range([0, width])
        .padding(0.2)
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    const yAxis = d3.scaleLinear()
        .domain([d3.min(typeData, d => d.avgStatTotal) - 10, d3.max(typeData, d => d.avgStatTotal)])
        .range([height, 0])
    svg.append("g")
        .call(d3.axisLeft(yAxis));

    // X-Label
    svg.append("text")
        .attr("transform", 
            "translate(" + width / 2 + "," + (height + margin.bottom - 15) + ")"
        )
        .style("text-anchor", "middle")
        .style("font", "24px arial")
        .text("Primary Type");

    // Y-Label
    svg.append("text")
        .attr("transform", 
            "translate(" + (-margin.left + 50) + "," + width / 2 + ")" +
            "rotate(-90)"
        )
        .style("text-anchor", "middle")
        .style("font", "24px arial")
        .text("Total Avg. Base Stats");

    let bars = svg.selectAll("bar")
        .data(typeData)
        .join("rect")
            .attr("x", d => { return xAxis(d.type) })
            .attr("y", d => { return yAxis(d.avgStatTotal) })
            .attr("width", xAxis.bandwidth())
            .attr("height", d => { return height - yAxis(d.avgStatTotal) })
            .attr("opacity", "0.1")
            .style("fill", d => { return colorMap.get(d.type); })

    bars.on("click", function(d) {
        if (selectedTypes.has(d.type)) {
            selectedTypes.delete(d.type);
            d3.select(this)
                .transition()
                .attr("opacity", "0.1")
        }
        else {
            selectedTypes.add(d.type);
            d3.select(this)
                .transition()
                .attr("opacity", "1.0")
        }
        updateScatterPlot(data);
        updateStar(data);
    });
}

function constructGraphs() {
    d3.csv("pokemon.csv").then(rawData =>{
        filteredData = rawData.map(d=>{
            return {
                name: d.Name,
                weight: Number(d.Weight_kg),
                attack: Number(d.Attack),
                spAttack: Number(d.Sp_Atk),
                defense: Number(d.Defense),
                spDefense: Number(d.Sp_Def),
                speed: Number(d.Speed),
                hp: Number(d.HP),
                type: d.Type_1
            };
        });

        filteredData.forEach(d=>{
            d.totalStats = d.attack + d.spAttack + d.defense + d.spDefense + d.speed + d.hp
            d.totalAttack = d.attack + d.spAttack
            d.totalDefense = d.defense + d.spDefense 
        });

        createBarChart(filteredData);
        createScatter(filteredData);
        createStar(filteredData);
    });
}

constructGraphs();
