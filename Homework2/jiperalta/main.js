const colorMap = new Map([
    ["Normal", "#D1F0CE"], 
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
    ["Rock", "#3D1406"],
    ["Ghost", "#735797"],
    ["Dragon", "#6F35FC"],
    ["Dark", "#705746"],
    ["Steel", "#B7B7CE"],
    ["Fairy", "#D685AD"],
]);

function getTypeData(data, type) {
    const retData = {
        type: type,
        color: colorMap.get(type),
        speed: 0,
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
        retData.attack += d.attack;
        retData.spAttack += d.spAttack;
        retData.defense += d.defense;
        retData.spDefense += d.spDefense;
        count += 1;
    });

    retData.speed /= count;
    retData.attack /= count;
    retData.spAttack /= count;
    retData.defense /= count;
    retData.spDefense /= count;

    return retData;
}

function createStar(data) {
    const labels = ["Speed", "Attack", "Sp. Attack", "Defense", "Sp. Def"]
    const width = 350;
    const height = 350;
    const maxStat = 150;
    const margin = 50;

    const chartData = [];
    chartData.push(getTypeData(data, "Steel"));
    chartData.push(getTypeData(data, "Dragon"));
    chartData.push(getTypeData(data, "Rock"));
    chartData.push(getTypeData(data, "Normal"));

    const svg = d3.select("#plot3")
        .attr("width", width + margin)
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

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

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

        return coordinates;
    }

    svg.selectAll("path")
    .data(chartData)
    .join(
        enter => enter.append("path")
            .attr("stroke", d => { return d.color; })
            .attr("fill", d => { return d.color; })
            .datum(d => getPathCoords(d))
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.75)
    );
}

function createNormSPScatter(data) {
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = 350;
    const height = 350;

    data = data.filter((d) =>{
        if (
            d.type == "Normal" || 
            d.type == "Steel" ||
            d.type == "Dragon" || 
            d.type == "Rock"
        )
            return true;
        else
            return false;
    });

    const svg = d3.select("#plot2")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xAxis = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.totalAttack)])
        .range([0, width])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis))

    const yAxis = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.totalDefense)])
        .range([height, 0])
    svg.append("g")
        .call(d3.axisLeft(yAxis));

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", d => { return xAxis(d.totalAttack); } )
            .attr("cy", d => { return yAxis(d.totalDefense); } )
            .attr("r", 4.0)
            .style("fill", d => { return colorMap.get(d.type); })
}


function createBarChart(data) {
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = 800;
    const height = 800;

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

    svg.selectAll("bar")
        .data(typeData)
        .join("rect")
            .attr("x", d => { return xAxis(d.type) })
            .attr("y", d => { return yAxis(d.avgStatTotal) })
            .attr("width", xAxis.bandwidth())
            .attr("height", d => { return height - yAxis(d.avgStatTotal) })
            .style("fill", d => { return colorMap.get(d.type); })
}

d3.csv("pokemon.csv").then(rawData =>{
    filteredData = rawData.map(d=>{
        return {
            weight: Number(d.Weight_kg),
            attack: Number(d.Attack),
            spAttack: Number(d.Sp_Atk),
            defense: Number(d.Defense),
            spDefense: Number(d.Sp_Def),
            speed: Number(d.Speed),
            type: d.Type_1
        };
    });

    filteredData.forEach(d=>{
        d.totalStats = d.attack + d.spAttack + d.defense + d.spDefense + d.speed
        d.totalAttack = d.attack + d.spAttack
        d.totalDefense = d.defense + d.spDefense 
    });

    createNormSPScatter(filteredData);
    createBarChart(filteredData);
    createStar(filteredData);
    console.log(getTypeData(filteredData, "Rock"));
});
