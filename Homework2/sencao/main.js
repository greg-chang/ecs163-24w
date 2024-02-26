let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 30, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 600;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 200},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

let parallelLeft = 0, parallelTop = 800;
let parallelMargin = {top: 10, right: 40, bottom: 30, left: 60},
    parallelWidth = 400 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 350 - parallelMargin.top - parallelMargin.bottom;

let distrLeft2 = 800, distrTop2 = 0;
let distrMargin2 = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth2 = 400 - distrMargin.left - distrMargin.right,
    distrHeigh2 = 350 - distrMargin.top - distrMargin.bottom;




d3.csv("Student Mental health.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.Depression = d['Do you have Depression?'].toLowerCase() === 'yes' ? 1 : 0;
        d.Anxiety = d['Do you have Anxiety?'].toLowerCase() === 'yes' ? 1 : 0;
        d.Panic = d['Do you have Panic attack?'].toLowerCase() === 'yes' ? 1 : 0;
        d.MentalIssue = (d.Depression === 1 || d.Anxiety === 1 || d.Panic === 1) ? 1 : 0;

    });

    let depressionAgeCount = d3.rollup(
        rawData,
        (v) => d3.sum(v, d => d.MentalIssue),
        d => d.Age
    );

    let depressionAgeCountData = Array.from(depressionAgeCount, ([Age, Depression]) => ({Age, Depression}));
    depressionAgeCountData.sort((a, b) => a.Age - b.Age);
    depressionAgeCountData = depressionAgeCountData.filter(d => d.Age !== "");

    console.log("depressionAgeCount", depressionAgeCount);
    
    console.log(rawData);




    
    //plot 1 Line Graph
    const svg = d3.select("svg")

    const g1 = svg.append("g")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

    // Title
    g1.append("text")
        .attr("x", scatterWidth / 2 + 30)
        .attr("y", -10)
        .attr("text-anchor", "middle") // Centers the text
        .style("font-size", "16px") // Adjust font size as needed
        .text("Number of People that has mental issue by Age (Line Chart)"); // Replace with your actual title

    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Age")
    
    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Depression")

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([18, 24])
    .range([10, scatterWidth])

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(7)
    g1.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "5")
        .attr("text-anchor", "end")

    // Y ticks
    const y1 = d3.scaleLinear()
    .domain([0, 25])
    .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13)
    g1.append("g").call(yAxisCall)
    
    // Connecting Lines
    const lineGenerator = d3.line()
        .x(d => x1(d.Age))
        .y(d => y1(d.Depression))
        .curve(d3.curveLinear);

    g1.append("path")
        .datum(depressionAgeCountData)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);

    const rects = g1.selectAll("circle").data(depressionAgeCountData)

    rects.enter().append("circle")
         .attr("cx", function(d){return x1(d.Age);})
         .attr("cy", function(d){return y1(d.Depression);})
         .attr("r", 3)
         .attr("fill", "#ff0000")
    




    //space
    const g2 = svg.append("g")
    .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    .attr("transform", `translate(${distrLeft}, ${distrTop})`)





    //plot 2 Bar Chart

    // Add new columns
    rawData.forEach(function(d){
        d.TakeTreatment = d['Did you seek any specialist for a treatment?'].toLowerCase() === 'yes' ? 1 : 0;
        d.Gender = d['Choose your gender']
    });

    console.log(rawData);

    let takeTreatmentGenderCount = d3.rollup(
        rawData,
        (v) => d3.sum(v, d => d.TakeTreatment),
        d => d.Gender
    );

    let takeTreatmentGenderCountData = Array.from(takeTreatmentGenderCount, ([Gender, TakeTreatment]) => ({Gender, TakeTreatment}));
    
    console.log(takeTreatmentGenderCountData)

    const g3 = svg.append("g")
                .attr("width", teamWidth + teamMargin.left + teamMargin.right)
                .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
                .attr("transform", `translate(${teamMargin.left}, ${teamTop})`)

    const color = d3.scaleOrdinal()
                    .domain(takeTreatmentGenderCountData.map(d => d.Gender))
                    .range(d3.schemeCategory10);
    
    const pie = d3.pie()
                .sort(null)
                .value(d => d.TakeTreatment);

    const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(120);

    const arcs = g3.selectAll(".arc")
                .data(pie(takeTreatmentGenderCountData))
                .enter().append("g")
                .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.Gender));

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .text(d => `${d.data.Gender}: ${d.data.TakeTreatment}`)
        .style("text-anchor", "middle")
        .style("font-size", "12px");

    g3.append("text")
        .attr("x", 0) // Position in the middle of the pie chart
        .attr("y", -teamHeight/1.5 + teamMargin.top) // Position above the pie chart
        .attr("text-anchor", "middle") // Center the text
        .style("font-size", "16px")
        .text("People Who Took Treatment by Gender (Bar Chart)"); // Customize your title here
    
    const legendRectSize = 20; // Size of the legend's colored squares
    const legendSpacing = 4; // Space between squares and their labels
        
    const legend = g3.selectAll('.legend') // Selecting elements of class 'legend'
                    .data(color.domain()) // Using the color scale's domain
                    .enter()
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', (d, i) => `translate(200,${-150 + i * (legendRectSize + legendSpacing)})`)
                    
        
    legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);
        
    legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(d => d);
        

    
    
    
    
    d3.select("svg").attr("height", parallelHeight + parallelTop + 300);

    //space
    const g4 = svg.append("g")
        .attr("transform", `translate(${parallelLeft + parallelMargin.left}, ${parallelTop+100})`)
        .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
        .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom+ 500);
    
    const dimensions = ['Age', 'Year', 'Depression', 'Anxiety', 'Panic'];

    rawData.forEach(function(d){
        const yearString = d['Your current year of Study'];
        if(yearString) {
            const yearNumber = parseInt(yearString.match(/\d+/));
            d.Year = yearNumber;
        }
        
    });

    rawData.forEach(d => {
        const year = +d['Year']; // Ensure 'Year' is numeric
        if (year < 1 || year > 4) { // Assuming 'Year' should be within 1 to 4
            console.log('Unexpected Year value:', d);
        }
    });
    console.log(rawData)



    const yScales = {};
    dimensions.forEach(dimension => {
        let domain = [0, 1];
        if (dimension === 'Age') domain = [17, 25];
        if (dimension === 'Year') domain = [1, 4];
        yScales[dimension] = d3.scaleLinear()
                            .domain(domain)
                            .range([parallelHeight, 0])
                            
    });

    rawData = rawData.filter(d => d['Age'] >= 18 && d['Age'] <= 24);


    console.log(dimensions)
    console.log(yScales)

    const xScale = d3.scalePoint()
        .domain(dimensions)
        .range([0, 600])
        .padding(0.5);

    dimensions.forEach(function(dimension) {
        g4.append("g")
            .attr("transform", `translate(${xScale(dimension)},0)`)
            .call(d3.axisLeft(yScales[dimension]))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(dimension)
            .style("fill", "black")
            
    });

    // Define a color scale using one of D3's categorical color schemes
    // Define an ordinal color scale for "Year"
    // Assuming the "Year" values are 1, 2, 3, and 4
    const yearColorScale = d3.scaleOrdinal()
        .domain([1, 2, 3, 4]) // Set the domain as the distinct "Year" values
        .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]); // Example: Set your own range of colors

    g4.selectAll(".line")
        .data(rawData)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", d => d3.line()
            .x(dim => xScale(dim))
            .y(dim => yScales[dim](d[dim]))
            (dimensions))
        .attr("fill", "none")
        .attr("stroke", d => yearColorScale(d['Year'])) // Use the color scale to set the line color
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8);
    
    const legendDataParallel = [1, 2, 3, 4].map(year => ({
    year: year,
    color: yearColorScale(year)
    }));

    // Determine the positioning for your legend
const legendX = parallelLeft + parallelWidth + 400; // For example, to the right of the plot
const legendY = parallelTop;

// Create a group for the legend
const legendPara = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${legendX}, ${legendY})`);

// Add colored rectangles
legendPara.selectAll(".legend-rect")
    .data(legendDataParallel)
    .enter().append("rect")
    .attr("class", "legend-rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * legendSpacing*5 + 190)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => d.color);

// Add labels
legendPara.selectAll(".legend-text")
    .data(legendDataParallel)
    .enter().append("text")
    .attr("class", "legend-text")
    .attr("x", 15) // Offset from the colored rectangle
    .attr("y", (d, i) => i * legendSpacing *5 + 200) // Align text with rectangles
    .text(d => `Year ${d.year}`);



    // Append a text element as the title
    g4.append("text")
    .attr("class", "chart-title") // For styling via CSS if desired
    .attr("x", width / 2-100) // Position the title in the center of the SVG
    .attr("y", scatterTop - 50) // Adjust the y-position based on your layout; place it above your chart
    .attr("text-anchor", "middle") // Center the text horizontally
    .style("font-size", "24px") // Set the font size
    .text("Student Mental Health Analysis (Advanced graph: parallel coordinate graph)"); // Your title text




    // process the data
    

}).catch(function(error){
    console.log(error);
});

