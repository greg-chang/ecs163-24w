const width = window.innerWidth;
const height = window.innerHeight;

let bodystyle_Margin = { top: 10, right: 30, bottom: 30, left: 30 },
  bodystyle_Width = 400 - bodystyle_Margin.left - bodystyle_Margin.right,
  bodystyle_Height = 350 - bodystyle_Margin.top - bodystyle_Margin.bottom;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let parallelLeft = 400, parallelTop = 0;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = 2000,
    parallelHeight = 350 - parallelMargin.top - parallelMargin.bottom;
    
  

const svg = d3.select("svg");

// Load and process the data
d3.csv("pokemon.csv").then(rawdata => {
    console.log("rawdata:", rawdata);

    rawdata.forEach(function (d) {
        d.Attack = Number(d.Attack);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.HP = Number(d.HP);
    });

    // Graph 1 Data (Overview)
    const bodyStyles = Array.from(new Set(rawdata.map(d => d.Body_Style)));
    const bodyStyleData = bodyStyles.map(bodyStyle => {
        const group = rawdata.filter(d => d.Body_Style === bodyStyle);
        const averageAttack = d3.mean(group, d => d.Attack);

        return {
        Body_Style: bodyStyle,
        averageAttack: averageAttack || 0, // Handle cases where there is no data for a specific body style
        };
    });

    bodyStyleData.sort((a, b) => b.averageAttack - a.averageAttack);
    console.log("bodyStyleData:", bodyStyleData);

    // Graph 2 Data 
    const bipedalTailedData = rawdata.filter(d => d.Body_Style === "bipedal_tailed");
    console.log("bipedalTailedData:", bipedalTailedData)

    // Graph 3 Data
    const bipedalTailedMap = bipedalTailedData.map(d => ({
        "Name": d.Name,
        "HP": +d.HP,         
        "Attack": +d.Attack, 
        "Defense": +d.Defense, 
        "Sp_Atk": +d.Sp_Atk, 
        "Sp_Def": +d.Sp_Def, 
        "Speed": +d.Speed,   
    }));
    console.log(bipedalTailedMap)


    // Graph 1
    const g1 = svg.append("g")
    .attr("width", bodystyle_Width + bodystyle_Margin.left + bodystyle_Margin.right)
    .attr("height", bodystyle_Height + bodystyle_Margin.top + bodystyle_Margin.bottom)
    .attr("transform", `translate(${bodystyle_Margin.left + 25}, ${bodystyle_Margin.top + 25})`);

    // Title
    g1.append("text")
    .attr("x", bodystyle_Width / 2)
    .attr("y", -10)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Graph 1: Body Style vs Average Attack");

    // X label
    g1.append("text")
    .attr("x", bodystyle_Width / 2)
    .attr("y", bodystyle_Height + 80)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Body Type");

    // Y label
    g1.append("text")
    .attr("x", -(bodystyle_Height / 2))
    .attr("y", -30)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Average Attack");

    // X-axis scale
    const x2 = d3.scaleBand()
        .domain(bodyStyleData.map(d => d.Body_Style))
        .range([0, bodystyle_Width])
        .paddingInner(0.3)
        .paddingOuter(0.2);

    // X-axis
    const xAxisCall2 = d3.axisBottom(x2);
    g1.append("g")
        .attr("transform", `translate(0, ${bodystyle_Height})`)
        .call(xAxisCall2)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");


    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([d3.max(bodyStyleData, d => +d.averageAttack), 0]);

    // Y-axis scale
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(bodyStyleData, d => d.averageAttack)])
        .range([bodystyle_Height, 0]);

    // Y-axis
    const yAxisCall2 = d3.axisLeft(y2).ticks(6);
    g1.append("g").call(yAxisCall2);

    // Bars
    const rects2 = g1.selectAll("rect").data(bodyStyleData);

    rects2.enter().append("rect")
        .attr("y", d => y2(d.averageAttack))
        .attr("x", d => x2(d.Body_Style))
        .attr("width", x2.bandwidth())
        .attr("height", d => bodystyle_Height - y2(d.averageAttack))
        .attr("fill", d => colorScale(d.averageAttack));


    // Graph 2
    const g2 = svg.append("g")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom + 25)
    .attr("transform", `translate(${width - scatterWidth - scatterMargin.right}, ${scatterMargin.top + 25})`);

    // Title
    g2.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", -10)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Graph 2: HP vs Attack - Bipedal Tailed Data");

    // X label
    g2.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("HP");

    // Y label
    g2.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Attack");

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawdata, d => d.HP)])
    .range([0, scatterWidth]);

    const xAxisCall = d3.axisBottom(x1)
    .ticks(7);

    g2.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)");

    // Y ticks
    const y1 = d3.scaleLinear()
    .domain([0, d3.max(rawdata, d => d.Attack)])
    .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(y1)
    .ticks(13);

    g2.append("g").call(yAxisCall);

    const colorScale_2 = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([d3.max(rawdata, d => d.Attack), 0]);

    const rects = g2.selectAll("circle").data(rawdata);

    rects.enter().append("circle")
    .attr("cx", function (d) {
        return x1(d.HP);
    })
    .attr("cy", function (d) {
        return y1(d.Attack);
    })
    .attr("r", 3)
    .attr("fill", d => colorScale_2(d.Attack)); 


    // Graph 3 
    const g3 = svg.append("g")
    .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
    .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
    .attr("transform", `translate(${(width - parallelWidth) / 2}, ${height - parallelHeight - parallelMargin.bottom})`);

    // Title
    g3.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -25)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Graph 3: Parallel Coordinates - Bipedal Tailed Data");

    // Define dimensions for parallel coordinates
    const dimensions = d3.keys(bipedalTailedMap[0]).filter(function(d) { return d !== "Name"; });

    var y = {};
    for (let i in dimensions) {
        let name = dimensions[i];
        y[name] = d3.scaleLinear()
            .domain(d3.extent(bipedalTailedMap, function(d) { return +d[name]; }))
            .range([parallelHeight, 0]);
    }

    var x = d3.scalePoint() 
        .range([0, parallelWidth])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    const colorScale_3 = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([d3.max(bipedalTailedMap, d => +d.Attack), 0]);



    g3.selectAll(".myPath")
        .data(bipedalTailedMap)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", d => colorScale_3(+d.Attack))
        .style("opacity", 0.5);

    g3.selectAll(".myAxis") // Use .selectAll instead of .append("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d) + ", 0)"; }) // Adjust the translation
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black");



}).catch(function (error) {
  console.log(error);
});
