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
        "Sp_Atk": +d.Sp_Atk, 
        "Defense": +d.Defense, 
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
        .text("Overview: Body Style vs Average Attack");

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
        .attr("y", bodystyle_Height) // Set initial y position below the chart
        .attr("x", d => x2(d.Body_Style))
        .attr("width", x2.bandwidth())
        .attr("height", 0) // Set initial height to 0
        .attr("fill", d => colorScale(d.averageAttack))
        .transition() // Add transition
        .duration(1000) // Set the duration of the animation in milliseconds
        .attr("y", d => y2(d.averageAttack)) // Final y position
        .attr("height", d => bodystyle_Height - y2(d.averageAttack)); // Final height
    

    // Create a legend for the color scale
    const legend = g1.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${bodystyle_Width + 20}, 10)`);

    // Create legend color gradient (#a50026 to #fcb067)
    legend.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", 0)
    .attr("x2", 0).attr("y2", 100)
    .selectAll("stop")
    .data([
        { offset: "0%", color: "#a50026" },
        { offset: "100%", color: "#fcb067" }
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

    // Append the legend color bar
    legend.append("rect")
    .attr("width", 20)
    .attr("height", 100)
    .style("fill", "url(#legend-gradient)");

    // Add legend labels (High and Low)
    legend.append("text")
    .attr("x", 25)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .text("High Attack");

    legend.append("text")
    .attr("x", 25)
    .attr("y", 100)
    .attr("dy", "0.35em")
    .text("Low Attack");




    // Graph 2
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight);
    
    
    const g2 = svg.append("g")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom )
        .attr("transform", `translate(${width - scatterWidth - scatterMargin.right}, ${scatterMargin.top + 25})`);
        
    const zoom = d3.zoom()
        .scaleExtent([1, 40])
        .extent([[0, 0], [scatterWidth, scatterHeight]])
        .translateExtent([[0, 0], [scatterWidth, scatterHeight]])
        .on("zoom", updateChart);
    
    g2.append("rect")
        .attr("width", scatterWidth + 50)
        .attr("height", scatterHeight + 50)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);
    
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
        
    // Instructions
    svg.append("text")
        .attr("x", 975)
        .attr("y", 50)
        .text("Click to show Pokemon!")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
    svg.append("text")
        .attr("x", 975)
        .attr("y", 70)
        .text("Scroll and drag around too!")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    // X ticks
    const x1 = d3.scaleLinear()
        .domain([0, d3.max(bipedalTailedData, d => d.HP)])
        .range([0, scatterWidth]);
    
    const xAxisCall = d3.axisBottom(x1)
        .ticks(13);
    
    // Title
    g2.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Focus: HP vs Attack - Bipedal Tailed Data");
    
    g2.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");
    
    // Y ticks
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(bipedalTailedData, d => d.Attack)])
        .range([scatterHeight, 0]);
    
    const yAxisCall = d3.axisLeft(y1)
        .ticks(13);
    g2.append("g")
        .attr("class", "y-axis")
        .call(yAxisCall);
        let circleGroup = g2.append("g")
        .attr("clip-path", "url(#clip)");

    
    const dots = circleGroup.selectAll("circle").data(bipedalTailedData);
    dots.enter().append("circle")
        .attr("cx", function (d) {
            return x1(d.HP);
        })
        .attr("cy", function (d) {
            return y1(d.Attack);
        })
        .attr("r", 2.5)
        .attr("fill", "#a50026");

    // Update the dots creation to include click event
    const textLabels = circleGroup.selectAll("text")
        .data(bipedalTailedData)
        .enter().append("text")
        .attr("x", function (d) {
            return x1(d.HP);
        })
        .attr("y", function (d) {
            return y1(d.Attack);
        })
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .style("pointer-events", "all") // Ensure that pointer events are captured by the text
        .text(function (d) { return d.Name; }) 
        .style("visibility", "hidden")  // Initially hide the text labels
        .on("click", function (d) {
            // Toggle visibility on click
            const isVisible = d3.select(this).style("visibility") === "visible";
            d3.select(this).style("visibility", isVisible ? "hidden" : "visible");
            console.log("Clicked on " + d.Name);
        });

    // Update the position of text labels in the updateChart function
    function updateChart() {
        const newX = d3.event.transform.rescaleX(x1);
        const newY = d3.event.transform.rescaleY(y1);

        // updates the scaled axes
        g2.select(".x-axis").call(d3.axisBottom(newX));
        g2.select(".y-axis").call(d3.axisLeft(newY));

        // updates the position of the dots
        circleGroup.selectAll("circle")
            .attr("cx", function(d) { return newX(d.HP); })
            .attr("cy", function(d) { return newY(d.Attack); });

        // updates the position of the text labels
        textLabels
            .attr("x", function (d) { return newX(d.HP); })
            .attr("y", function (d) { return newY(d.Attack); });
    }




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
        .text("Focus: Parallel Coordinates - Bipedal Tailed Data");

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
    // adding color to the bar chart 
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
