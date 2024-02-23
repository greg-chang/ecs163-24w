const width = window.innerWidth;
const height = window.innerHeight - 50;

let scatterMargin = {top: 15, right: 10, bottom: 10, left: 35},
    scatterWidth = 100 + ((2 * width)/5) - scatterMargin.left - scatterMargin.right,
    scatterHeight = 250 - scatterMargin.top - scatterMargin.bottom;

let parallelLeft = scatterWidth;
let parallelMargin = {top: 60, right: 10, bottom: 0, left: 0},
    parallelWidth = 1000 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 300 - parallelMargin.top - parallelMargin.bottom;

let barTop = 320;
let barMargin = {top: 10, right: 30, bottom: 10, left: 65},
    barWidth = width - barMargin.left - barMargin.right,
    barHeight = height - 435 - barMargin.top - barMargin.bottom;

// Get the button element
const reorderButton = document.getElementById("reorderButton");


d3.csv("ds_salaries.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    let parRawData = rawData;

    rawData.forEach(function(d){
        d.salary_in_usd = Number(d.salary_in_usd);
        d.remote_ratio = Number(d.remote_ratio);
    });
    

    rawData = rawData.map(d=>{
                          return {
                              "salary_in_usd":d.salary_in_usd,
                              "job_title":d.job_title,
                              "remote_ratio":d.remote_ratio,
                              "company_location":d.company_location
                          };
    });
    console.log(rawData);

    q = rawData.reduce((s, { job_title }) => (s[job_title] = (s[job_title] || 0) + 1, s), {});
    r = Object.keys(q).map((key) => ({ job_title: key, count: q[key] }));
    r = r.filter(d=> d.count>15);

    console.log(r);
    
    const svg = d3.select("svg")

    // Define clipping path for scatter plot
    svg.append("defs").append("clipPath")
        .attr("id", "scatter-clip")
        .append("rect")
        .attr("width", scatterWidth + 30)
        .attr("height", scatterHeight + 70);

// Plot 1 - Salary(USD) vs Ratio of Remote
    
    const g1 = svg.append("g")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)
        .attr("clip-path", "url(#scatter-clip)")
        //.attr("style", "outline: thin solid red;");  // Test Border

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 10]) // adjust the scale extent as needed
        .on('zoom', zoomed);

    svg.call(zoom);

    // Zoomed function
    function zoomed(event) {
        
        const [mouseX, mouseY] = d3.pointer(event, g1.node());
        
        if (mouseX >= 0 && mouseX <= scatterWidth && mouseY >= 0 && mouseY <= scatterHeight) {
            const { transform } = event;

            // Update the scale of the circles representing data points
            g1.selectAll('circle')
                .attr('transform', transform)
                .attr('r', 5 / transform.k); // adjust the size of circles based on the zoom scale
            
            // Update the x and y axis
            g1.select(".x-axis").call(xAxisCall.scale(transform.rescaleX(x1)));
            g1.select(".y-axis").call(yAxisCall.scale(transform.rescaleY(y1)));
        }
    }

    // Add the zoom behavior to the scatter plot group
    g1.call(zoom);

    // Chart Title
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", 20)
        .attr("font-size", "28px")
        .attr("text-anchor", "middle")
        .text("Remote Ratio vs Salary(USD) - Scatter Plot (Pan and Zoomable)")

    // X label
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Salary (USD)")
    

    // Y label
    g1.append("text")
        .attr("x", -(scatterHeight / 2 + 40))
        .attr("y", + 20)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Ratio of Remote")

    // X ticks
    const x1 = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.salary_in_usd)])
        .range([45, scatterWidth])

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(7)
    g1.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall)

    // Y ticks
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.remote_ratio)])
        .range([scatterHeight, 30])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(3)
    g1.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(45,0)`)
        .call(yAxisCall);

    const rects = g1.selectAll("circle").data(rawData)

    rects.enter().append("circle")
         .attr("cx", function(d){
             return x1(d.salary_in_usd);
         })
         .attr("cy", function(d){
             return y1(d.remote_ratio);
         })
         .attr("r", 5)
         .attr("fill", "black")

         


// Plot 2

const g2 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform",`translate(${parallelLeft},${parallelMargin.top})`)
                //.attr("style", "outline: thin solid red;")  // Test Border


dimensions = Object.keys(parRawData[0])
    .filter(function(d) 
    { return (d != "work_year") && (d != "job_title") && (d != "employment_type") && (d != "remote_ratio") && (d != "salary") && (d != "salary_currency") && (d != "employee_residence") && (d != "company_location") })

console.log(dimensions);

let keys1 = {}
let counter1 = 5
parRawData.forEach(item => {
    const levels = item.experience_level;
    let key = 0;
    if(keys1.hasOwnProperty(levels))
        key = keys1[levels];
    else {
        key = --counter1;
        keys1[levels] = key;
    }
    item.experience_level = key;
})

let keys2 = {}
let counter2 = 0
parRawData.forEach(item => {
    const jobs = item.company_size;
    let key = 0;
    if(keys2.hasOwnProperty(jobs))
        key = keys2[jobs];
    else {
        key = ++counter2;
        keys2[jobs] = key;
    }
    item.company_size = key;
})


console.log(dimensions);

// Scales

const y = {}
for (i in dimensions) {
    scaleName = dimensions[i]
    y[scaleName] = d3.scaleLinear()
    .domain( d3.extent(parRawData, function(d) { return +d[scaleName]; }) )
    .range([parallelHeight, 0])
}

x = d3.scalePoint()
    .range([0, parallelWidth])
    .padding(1)
    .domain(dimensions);

function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}

// Chart Title
g2.append("text")
.attr("x", parallelWidth / 2)
.attr("y", -40)
.attr("font-size", "20px")
.attr("text-anchor", "middle")
.text("Job Specs Comparison - Parallel Plot")

// Size Key
g2.append("text")
.attr("x", parallelWidth - 300)
.attr("y", -20)
.attr("font-size", "12px")
.attr("text-anchor", "middle")
.text("Size- 3: Medium 2: Small 1: Large")

// Experience Key
g2.append("text")
.attr("x", 300)
.attr("y", -20)
.attr("font-size", "12px")
.attr("text-anchor", "middle")
.text("Experience- 4: SE 3: MI 2: EN 1: EX")

// Draw the lines
g2.selectAll("myPath")
    .data(parRawData)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

// Draw the axis:
g2.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

// Plot 3 - Overview

    function reorderBars() {

        // Sort the 'r' array based on count in descending order
        r.sort((a, b) => b.count - a.count);

        // Update x scale domain
        x2.domain(r.slice(0, 5).map(d => d.job_title)); // Only the first 5 bars
        // Update y scale domain
        y2.domain([0, d3.max(r.slice(0, 5), d => d.count)]); // Adjust y scale to fit the biggest bars

        // Select only the first 5 bars
        const bars = g3.selectAll("rect")
            .data(r.slice(0, 5)); // Only the first 5 bars

        // Transition existing bars to new positions
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
                .duration(1000) // Transition duration
                .attr("x", d => x2(d.job_title))
                .attr("y", d => y2(d.count))
                .attr("height", d => barHeight - y2(d.count))
                .attr("width", x2.bandwidth());

        // Remove bars beyond the first 5
        bars.exit().remove();
        
        // Reordered Bar Labels
        g3.append("text")
            .attr("x", (barWidth / 2) - 720)
            .attr("y", barHeight - 125)
            .attr("font-size", "24px")
            .attr("text-anchor", "middle")
            .text("1. Data Engineer") 

            g3.append("text")
                .attr("x", (barWidth / 2) - 360)
                .attr("y", barHeight - 125)
                .attr("font-size", "24px")
                .attr("text-anchor", "middle")
                .text("2. Data Scientist") 

            g3.append("text")
                .attr("x", barWidth / 2)
                .attr("y", barHeight - 125)
                .attr("font-size", "24px")
                .attr("text-anchor", "middle")
                .text("3. Data Analyst") 

            g3.append("text")
                .attr("x", (barWidth / 2) + 360)
                .attr("y", barHeight - 125)
                .attr("font-size", "24px")
                .attr("text-anchor", "middle")
                .text("4. Machine Learning Engineer") 

            g3.append("text")
                .attr("x", (barWidth / 2) + 720)
                .attr("y", barHeight - 125)
                .attr("font-size", "24px")
                .attr("text-anchor", "middle")
                .text("5. Analytics Engineer") 
    }

    const g3 = svg.append("g")
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .attr("transform", `translate(${barMargin.left}, ${barTop})`)
                .attr("border", 1)
                //.attr("style", "outline: thin solid red;")   // Test Border
    
    // Chart Title
    g3.append("text")
        .attr("x", (barWidth / 2) + 200)
        .attr("y", 50)
        .attr("font-size", "28px")
        .attr("text-anchor", "middle")
        .text("Employees Per Job - Bar Graph ( Reordarable)")
    
    // X label
    g3.append("text")
        .attr("x", barWidth / 2)
        .attr("y", barHeight + 90)
        .attr("font-size", "24px")
        .attr("text-anchor", "middle")
        .text("Job Title")
    

    // Y label
    g3.append("text")
        .attr("x", -(barHeight / 2))
        .attr("y", -40)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Employees")

    // X ticks
    const x2 = d3.scaleBand()
        .domain(r.map(d => d.job_title))
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
            .attr("transform", "rotate(-35)")

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
        .attr("x", (d) => x2(d.job_title))
        .attr("width", x2.bandwidth)
        .attr("height", d => barHeight - y2(d.count))
        .attr("fill", "orange")

    // Add click event listener to the button
    reorderButton.addEventListener("click", function() {
        // Call reorderBars function when the button is clicked
        reorderBars();

        reorderButton.innerText = "Reordering..."; // Change button text temporarily
        setTimeout(function() {
                reorderButton.innerText = "Finished"; // Change button text back after a delay
            }, 1500);
    });

}).catch(function(error){
    console.log(error);
});



