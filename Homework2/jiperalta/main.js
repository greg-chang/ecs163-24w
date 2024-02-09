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

function createNormSPScatter(data) {
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = 800;
    const height = 800;

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
            .attr("r", 8.0)
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
            type: d.Type_1
        };
    });

    filteredData.forEach(d=>{
        d.totalStats = d.attack + d.spAttack + d.defense + d.spDefense
        d.totalAttack = d.attack + d.spAttack
        d.totalDefense = d.defense + d.spDefense 
    });

    createNormSPScatter(filteredData);
    createBarChart(filteredData);
});
