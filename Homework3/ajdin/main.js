let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 50, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 50, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 50, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;


d3.csv("student-mat.csv").then(rawData =>{
    console.log("rawData", rawData);

    const AgeData = {};
    const TotalAgeData = [];
    const FinalAgeData = [];

    rawData.forEach(point => {
        const age = point.age;
        const dalc = +point.Dalc;

        if(!AgeData[age]) {
            AgeData[age] = {sum: 0, count: 0};
        };

        AgeData[age].sum += dalc;
        AgeData[age].count++;
    });
    console.log(AgeData);

    Object.keys(AgeData).forEach(age => {
        TotalAgeData.push({age: age});
    });
    console.log(TotalAgeData);

    Object.keys(AgeData).forEach(age => {
        const avg = AgeData[age].sum / AgeData[age].count;
        FinalAgeData.push({age: age, avg: avg})
    });
    console.log(FinalAgeData);

    for(i = 0; i < 3; i++) {
        FinalAgeData.pop();
    }
    console.log(FinalAgeData);

//plot 1
    const svg = d3.select("svg")
    
    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)
    
    console.log(scatterMargin.left)


    // title
    g1.append("text")
    .attr("x", scatterWidth / 1.5)
    .attr("y", scatterMargin.top - 70)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Relationship between Grade and Workday Alcohol Consumption")
    
    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Workday Alcohol Consumption (Dalc)")
    

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Final Grade (G3)")

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Dalc)])
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
    .domain([0, d3.max(rawData, d => +d.G3)])
    .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13)
    g1.append("g").call(yAxisCall)

    const rects = g1.selectAll("circle").data(rawData)

    rects.enter().append("circle")
         .attr("cx", function(d){
             return x1(d.Dalc);
         })
         .attr("cy", function(d){
             return y1(d.G3);
         })
         .attr("r", 3)
         .attr("fill", "#69b3a2")


    // Allows for zoom on plot 1
    g1.append("rect")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all");
     
     
    let zoom = d3.zoom()
        .scaleExtent([1, 2]) 
        .on('zoom', handleZoom);
 
    function handleZoom(e) {
        g1.attr('transform', e.transform)
    }
 
    function initZoom() {
        g1.select("rect").call(zoom)
 
    }
 
         initZoom();

//space
    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`)

//plot 2
    
    const g3 = svg.append("g")
                .attr("width", teamWidth + teamMargin.left + teamMargin.right)
                .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
                .attr("transform", `translate(${teamMargin.left}, ${teamTop + 100})`)
    

    // title
    g3.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamMargin.top - 80)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Average Workday Alcohol Consumption vs Age")

    // X label
    g3.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Age")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Average Workday Alcohol Consumption")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(FinalAgeData.map(d => d.age))
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
    const ColorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const y2 = d3.scaleLinear()
    .domain([0, d3.max(FinalAgeData, d => d.avg)])
    .range([teamHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
    .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(FinalAgeData)

    rects2.enter().append("rect")
    .attr("y", teamHeight)
    .attr("x", (d) => x2(d.age))
    .attr("width", x2.bandwidth)
    //set height to 0 for transition
    .attr("height", 0)
    .attr("fill", d => ColorScale(d.age))
    //transition, each bar appears one after another 
    .transition()
    .duration(1250)
    .delay((d, i) => i * 200)
    .attr("y", d => y2(d.avg))
    .attr("height", d => teamHeight - y2(d.avg));


// plot 3
    
    d3.select("svg").attr("height", 1800);
    
    let topPlot3 = 900;

    const g4 = svg.append("g")
                .attr("width", teamWidth + teamMargin.left + teamMargin.right)
                .attr("height", teamHeight + teamMargin.top + teamMargin.bottom + 1000)
                .attr("transform", `translate(${teamMargin.left - 60}, ${topPlot3})`)

    var color = d3.scaleOrdinal()
    .domain(TotalAgeData.map(d => d.age))
    .range(d3.schemeCategory10);
    
    // title
    g4.append("text")
    .attr("x", teamWidth / 1.85)
    .attr("y", teamMargin.top - 80)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Student Alcohol Consumption Parallel Coordinate Graph")

    // Extract the list of dimensions we want to keep in the plot.
    const dimensions = ['G3', 'Dalc', 'absences']
    // For each dimension, I build a linear scale. I store all in a y object
    var y = {}
    dimensions.forEach(dim => {
        y[dim] = d3.scaleLinear()
            .domain(d3.extent(rawData, d => +d[dim]))
            .range([height, 0]);
    }); 

    // Building the X scale
    x = d3.scalePoint()
    .range([0, width])  
    .padding(1)
    .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }
        // Draw the lines
    g4.selectAll("myPath")
    .data(rawData)
    .enter().append("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", function(d){ return color(d.age)})
    .style("opacity", 0.5)

    // Selection
    const lines = g4.selectAll("path");

    // Increases size of line that you are mousing over
    lines.on("mouseover", function(d) {
        d3.select(this)
            .style("stroke-width", 3)
    });
    
    // Returns them to original size after done mousing over
    lines.on("mouseout", function(d) {
        d3.select(this)
            .style("stroke-width", 1.5)
    });

    // When a line is clicked, all of the other lines disappear, click on it again and they reappear
    lines.on("click", function(d) {
        const ClickedLine = d3.select(this);
        const IsClicked = ClickedLine.attr("data-clicked");

        if (IsClicked === "true") {
            lines.style("opacity", 1);
            ClickedLine.attr("data-clicked", "false");
        } else {
            lines.style("opacity", 0);
            ClickedLine.style("opacity", 1);
            ClickedLine.attr("data-clicked", "true");
        }


    });

    // Draw the axis:
    g4.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")


    // creating the legend
    // select the svg area
    var Svg = d3.select("svg")

    // Add one dot in the legend for each name.
    Svg.selectAll("mydots")
    .data(TotalAgeData)
    .enter()
    .append("circle")
        .attr("cx", 1150)
        .attr("cy", function(d,i){ return topPlot3 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d.age)})

    // Add one dot in the legend for each name.
    Svg.selectAll("mylabels")
    .data(TotalAgeData)
    .enter()
    .append("text")
        .attr("x", 1170)
        .attr("y", function(d,i){ return topPlot3 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d.age)})
        .text(function(d){ return 'Age ' + d.age})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")    

   

        // console.log("ColorScale Domain:", ColorScale.domain());
        // console.log("ColorScale Range:", ColorScale.range());

        // console.log("Age Data in plot2:", FinalAgeData);
        // console.log("Colors in plot2:", FinalAgeData.map(d => ColorScale(d.age)));






}).catch(function(error){
    console.log(error);
});

