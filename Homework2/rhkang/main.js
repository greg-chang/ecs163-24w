let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

/*
d3.csv("players.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.AB = Number(d.AB);
        d.H = Number(d.H);
        d.salary = Number(d.salary);
        d.SO = Number(d.SO);
    });
    

    rawData = rawData.filter(d=>d.AB>abFilter);
    rawData = rawData.map(d=>{
                          return {
                              "H_AB":d.H/d.AB,
                              "SO_AB":d.SO/d.AB,
                              "teamID":d.teamID,
                          };
    });
    console.log(rawData);
    console.log(typeof rawData);
//plot 1
    const svg = d3.select("svg")

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
    .text("H/AB")
    

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("SO/AB")

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.H_AB)])
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
    .domain([0, d3.max(rawData, d => d.SO_AB)])
    .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13)
    g1.append("g").call(yAxisCall)

    const rects = g1.selectAll("circle").data(rawData)

    rects.enter().append("circle")
         .attr("cx", function(d){
             return x1(d.H_AB);
         })
         .attr("cy", function(d){
             return y1(d.SO_AB);
         })
         .attr("r", 3)
         .attr("fill", "#69b3a2")
*/
//space
/*
    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`)
*/
//plot 2
    /*
    q = rawData.reduce((s, { teamID }) => (s[teamID] = (s[teamID] || 0) + 1, s), {});
    r = Object.keys(q).map((key) => ({ teamID: key, count: q[key] }));
    console.log(r);

           
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
    .text("Team")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of players")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(r.map(d => d.teamID))
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
    .attr("x", (d) => x2(d.teamID))
    .attr("width", x2.bandwidth)
    .attr("height", d => teamHeight - y2(d.count))
    .attr("fill", "grey")



*/
/*
categories = new Array("HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed");
function adderHelper(d){
    var total_stats = 0;
    var i;
    for (i of categories) {
      total_stats += parseInt(d[i]);
    }
    return total_stats;
  }
  var StatsByType = [];
formattedData = d3.csv("pokemon.csv").then(data1 =>{
    data1.forEach(d => {
      if(d.Type_1 in StatsByType){
        StatsByType[d.Type_1].size = StatsByType[d.Type_1].size + 1;
        StatsByType[d.Type_1].total_stats = StatsByType[d.Type_1].total_stats + adderHelper(d);
      }else{
        const ER = {
          name: d.Type_1,
          size: 1,
          total_stats: adderHelper(d),
          average: 0
        }
        StatsByType[d.Type_1] = ER;
      }
    })
    const formattedData = []
    Object.keys(StatsByType).forEach(d =>{
      StatsByType[d].average = StatsByType[d].total_stats/StatsByType[d].size;
      formattedData.push(StatsByType[d]);
    });
  
    
    // Sort by name
    
    formattedData.sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
    }) 
    return formattedData;
    });
StatsByType = Object.keys(formattedData);
/*
    let data1 = d3.csv("pokemon.csv");
    console.log(data1);
    categories = new Array("HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed");
    function adderHelper(d){
        var total_stats = 0;
        var i;
        for (i of categories) {
          total_stats += d[i];
        }
        return total_stats;
      }
      function processData(data1){
        const StatsByType = {};
        data1.forEach(d => {
          if(d.Type_1 in StatsByType){
            StatsByType[d.Type_1].size = StatsByType[d.Type_1].size + 1;
            StatsByType[d.Type_1].total_stats = StatsByType[d.Type_1].total_stats + adderHelper(d);
          }else{
            const ER = {
              name: d.Type_1,
              size: 1,
              total_stats: adderHelper(d),
              average: 0
            }
            StatsByType[d.Type_1] = ER;
          }
        })
        const formattedData = []
        Object.keys(StatsByType).forEach(d =>{
          StatsByType[d].average = StatsByType[d].total_stats/StatsByType[d].size;
          formattedData.push(StatsByType[d]);
        });
      
        
        // Sort by name
        
        formattedData.sort(function(a, b){
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        }) 
        return formattedData;
      }
      
      StatsByType = processData(data1);
      console.log(StatsByType);
      console.log(typeof StatsByType);
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
.text("Team")


// Y label
g3.append("text")
.attr("x", -(teamHeight / 2))
.attr("y", -40)
.attr("font-size", "20px")
.attr("text-anchor", "middle")
.attr("transform", "rotate(-90)")
.text("Number of players")

const x2 = d3.scaleBand()
.domain(StatsByType.map(d => d.name))
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
.domain([0, d3.max(StatsByType, d => d.average)])
.range([teamHeight, 0])

const yAxisCall2 = d3.axisLeft(y2)
              .ticks(6)
g3.append("g").call(yAxisCall2)

const rects2 = g3.selectAll("rect").data(StatsByType)

rects2.enter().append("rect")
.attr("y", d => y2(d.average))
.attr("x", (d) => x2(d.name))
.attr("width", x2.bandwidth)
.attr("height", d => teamHeight - y2(d.average))
.attr("fill", "grey")
*/
      /*height = 400;
      margin = ({top: 40, right: 40, bottom: 40, left: 100});
      const width = 928;
      const height = 500;
      const marginTop = 30;
      const marginRight = 0;
      const marginBottom = 30;
      const marginLeft = 40;
        // Declare the chart dimensions and margins.

      
        // Declare the x (horizontal position) scale.
        const x = d3.scaleBand()
            .domain(d3.groupSort(StatsByType, ([d]) => -d.average, (d) => d.name)) // descending frequency
            .range([marginLeft, width - marginRight])
            .padding(0.1)
        
        // Declare the y (vertical position) scale.
        const y = d3.scaleLinear()
            .domain([0, d3.max(StatsByType, (d) => d.average)])
            .range([height - marginBottom, marginTop]);
      
        // Create the SVG container.
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");
      
        // Add a rect for each bar.
        svg.append("g")
            .attr("fill", "steelblue")
          .selectAll()
          .data(StatsByType)
          .join("rect")
            .attr("x", (d) => x(d.name))
            .attr("y", (d) => y(d.average))
            .attr("height", (d) => y(0) - y(d.average))
            .attr("width", x.bandwidth());
      
        // Add the x-axis and label.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));
      
        // Add the y-axis and label, and remove the domain line.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickFormat((y) => (y).toFixed()))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("Stats By Type"));
      
        // Return the SVG element.
        return svg.node();*/
      










        const colours = {
            Normal: '#A8A77A',
            Fire: '#EE8130',
            Water: '#6390F0',
            Electric: '#F7D02C',
            Grass: '#7AC74C',
            Ice: '#96D9D6',
            Fighting: '#C22E28',
            Poison: '#A33EA1',
            Ground: '#E2BF65',
            Flying: '#A98FF3',
            Psychic: '#F95587',
            Bug: '#A6B91A',
            Rock: '#B6A136',
            Ghost: '#735797',
            Dragon: '#6F35FC',
            Dark: '#705746',
            Steel: '#B7B7CE',
            Fairy: '#D685AD',
        };
    const colorkeys = Object.keys(colours)
    const colors = Object.values(colours);
    const color = d3.scaleOrdinal(colorkeys,colors);
    console.log(colorkeys);
    console.log(colors);

// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Group data by type and calculate average stats
    var statsByType = d3.nest()
        .key(function(d) { return d.Type_1; })
        .rollup(function(v) {
            return {
                averageAttack: d3.mean(v, function(d) { return +d.Attack; }),
                averageDefense: d3.mean(v, function(d) { return +d.Defense; }),
                averageSpeed: d3.mean(v, function(d) { return +d.Speed; }),
                averageSpAttack: d3.mean(v, function(d) { return +d.Sp_Atk; }),
                averageSpDefense: d3.mean(v, function(d) { return +d.Sp_Def; })
            };
        })
        .entries(data);

    // Extract types and average stats
    var types = statsByType.map(function(d) { return d.key; });
    var averages = statsByType.map(function(d) { return d.value; });

    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 90 },
        width = 400 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Create the SVG element
    var svg = d3.select("svg")
        //.append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        //.attr("width", margin.left + margin.right)
        //.attr("height", margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 400 + ")");

    // Define scales
    var x = d3.scaleBand()
        .domain(types)
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, 500])
        .range([height, 0]);

    // Create bars
    svg.selectAll(".bar")
        .data(averages)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) { return x(types[i]); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(Object.values(d).reduce((a, b) => a + b, 0)); })
        .attr("height", function(d) { return height - y(Object.values(d).reduce((a, b) => a + b, 0)); })
        .attr("fill", function(d, i) { return color(types[i]);});

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add labels
    svg.append("text")
    .attr("y", 0 - margin.top / 2)
    .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Bar Graph of Stat Total by Type");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 1.5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Stats");

    svg.append("text")
        .attr("y", height + margin.bottom / 2 + 10)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Types");



    // Add legend
    /*
    var legend = svg.selectAll(".legend")
        .data(Object.keys(averages[0]))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return d3.schemeCategory10[i]; });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
        */
    }).catch(function(error){
        console.log(error);
    });

// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Group data by generation and calculate average stats
    var statsByGeneration = d3.nest()
        .key(function(d) { return d.Catch_Rate; })
        .rollup(function(v) {
            return {
                averageTotal: d3.mean(v, function(d) { return +d.Total; })
            };
        })
        .entries(data);

    // Extract generations and average stats
    function compare(a, b) {
        return parseInt(a.key) - parseInt(b.key);
    }
    statsByGeneration.sort(compare)
    var generations = statsByGeneration.map(function(d) { return d.key; });
    console.log(generations);
    var averages = statsByGeneration.map(function(d) { return d.value; });

    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 90 },
        width = 400 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Create the SVG element
    var svg = d3.select("svg")
        //.append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 550 + "," + margin.top + ")");

    // Define scales
    var x = d3.scaleBand()
        .domain(generations)
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([200, d3.max(averages, function(d) { return d.averageTotal; })])
        .range([height, 0]);

    // Define line
    var line = d3.line()
        .x(function(d, i) { return x(generations[i]) + x.bandwidth() / 2; })
        .y(function(d) { return y(d.averageTotal); });

    // Draw the line
    svg.append("path")
        .datum(averages)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add labels
    svg.append("text")
    .attr("y", 0 - margin.top / 2)
    .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Line Graph of Stat Total by Catch Rate");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 1.5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Stat Total");

    svg.append("text")
        .attr("y", height + margin.bottom / 2)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Catch Rate (lower means harder to catch)");

        /*
    // Add legend
    svg.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Total Stats");
        */
    }).catch(function(error){
        console.log(error);
});

/*
// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Group data by type and calculate average stats
    var statsByType = d3.nest()
        .key(function(d) { return d.Type_1; })
        .rollup(function(v) {
            return {
                averageHeight: d3.mean(v, function(d) { return +d.Height_m; }),
                averageWeight: d3.mean(v, function(d) { return +d.Weight_kg; }),
                averageTotal: d3.mean(v, function(d) { return +d.Total; }),
                averageCatchRate: d3.mean(v, function(d) { return +d.Catch_Rate; })
            };
        })
        .entries(data);

    // Extract types and average stats
    var types = statsByType.map(function(d) { return d.key; });
    var averages = statsByType.map(function(d) { return d.value; });

    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 90 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create the SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales
    var dimensions = ["averageHeight", "averageWeight", "averageTotal", "averageCatchRate"];
    var y = {};
    dimensions.forEach(function(d) {
        y[d] = d3.scaleLinear()
            .domain([0, d3.max(averages, function(e) { return e[d]; })])
            .range([height, 0]);
    });

    // Define paths
    var line = d3.line()
        .defined(function(d) { return !isNaN(d[1]); })
        .x(function(d, i) { return x(dimensions[i]); })
        .y(function(d) { return y[d[1]]; });

    // Define x axis
    var x = d3.scalePoint()
        .domain(dimensions)
        .range([0, width])
        .padding(1);

    // Draw the lines
    svg.selectAll(".type")
        .data(averages)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(dimensions.map(function(p) { return [p, d[p]]; })); })
        .style("stroke", function(d, i) { return d3.schemeCategory10[i]; });

    // Add the x axis
    svg.selectAll("myAxis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Stats");

    svg.append("text")
        .attr("y", height + margin.bottom / 2)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Types");

    // Add legend
    var legend = svg.selectAll(".legend")
        .data(types)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return color([i]); });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
    }).catch(function(error){
        console.log(error);
});
*/
// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 40 },
        width = 450 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Extract unique types
    var types = [...new Set(data.map(d => d.Type_1))];

    // Define scales
    var dimensions = ["Height_m", "Weight_kg", "Total", "Catch_Rate"];
    var y = {};
    dimensions.forEach(function(d) {
        y[d] = d3.scaleLinear()
            .domain([0, d3.max(data, function(e) { return +e[d]; })])
            .range([height, 0]);
    });
    console.log(y);
/*
    // Define line function
    var line = d3.line()
        .defined(function(d) { return !isNaN(d[1]); })
        .x(function(d, i) { return x(dimensions[i]); })
        .y(function(d) { return y[d[1]]; });
*/

    // Define x axis
    var x = d3.scalePoint()
        .domain(dimensions)
        .range([0, width])
        .padding(1);

    function path(d) {
        //console.log(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Create the SVG element
    var svg = d3.select("svg")
        //.append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw the lines
    svg.selectAll("pokemon")
        .data(data)
        .enter().append("path")
        .attr("class", "line")
        //.attr("d", function(d) { return line(dimensions.map(function(p) { return [p, d[p]]; })); })
        .attr("d", path)
        .style("opacity", 0.5)
        .style("fill", "none")
        .style("stroke", function(d) { return color(d.Type_1); });

    // Add the x axis
    svg.selectAll("myAxis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black");

    // Add labels
    svg.append("text")
    .attr("y", 0 - margin.top / 1.5)
    .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Parallel Set Plot of Individual Pokemon Intangibles");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        //.text("Stats");

    svg.append("text")
        .attr("y", height + margin.bottom / 2)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        //.text("Attributes");

    // Add legend
    var legend = svg.selectAll(".legend")
        .data(types)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(10," + (i * 20 + 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 8)
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", function(d) { return color(d); });

    legend.append("text")
        .attr("x", width - 14)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    // Function to get color based on type
    /*function getColor(type) {
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        return colorScale(types.indexOf(type));
    }*/

    }).catch(function(error){
    console.log(error);
});




/*
}).catch(function(error){
    console.log(error);
});
*/
