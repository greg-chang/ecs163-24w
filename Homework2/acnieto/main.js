const width = window.innerWidth;
const height = window.innerHeight;

let scatterMargin = {top: 10, right: 10, bottom: 10, left: 65},
    scatterWidth = ((2 * width)/5) - scatterMargin.left - scatterMargin.right,
    scatterHeight = 250 - scatterMargin.top - scatterMargin.bottom;

let parallelLeft = 700;
let parallelMargin = {top: 25, right: 10, bottom: 0, left: 0},
    parallelWidth = 1500 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 600 - parallelMargin.top - parallelMargin.bottom;

let barTop = 350;
let barMargin = {top: 10, right: 30, bottom: 10, left: 65},
    barWidth = width - barMargin.left - barMargin.right,
    barHeight = height - 435 - barMargin.top - barMargin.bottom;


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
    
// Plot 1 - Salary(USD) vs Ratio of Remote
    const svg = d3.select("svg")
    
    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)
                //.attr("style", "outline: thin solid red;")   // Test Border

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
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Ratio of Remote")

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.salary_in_usd)])
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
    .domain([0, d3.max(rawData, d => d.remote_ratio)])
    .range([scatterHeight, 30])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(3)
    g1.append("g").call(yAxisCall)

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

// append the svg object to the body of the page
const g4 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform",`translate(${parallelLeft},${parallelMargin.top})`)
                .attr("style", "outline: thin solid red;")  // Test Border

    
// Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
dimensions = Object.keys(parRawData[0])
    .filter(function(d) 
    { return (d != "work_year") && (d != "job_title") && (d != "employment_type") && (d != "remote_ratio") && (d != "salary") && (d != "salary_currency") && (d != "employee_residence") && (d != "company_location") })

    console.log(dimensions);


let keys1 = {}
let counter1 = 4
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
// For each dimension, I build a linear scale. I store all in a y object
const y = {}
for (i in dimensions) {
    scaleName = dimensions[i]
    y[scaleName] = d3.scaleLinear()
    .domain( d3.extent(parRawData, function(d) { return +d[scaleName]; }) )
    .range([parallelHeight, 0])
}

// Build the X scale -> it find the best position for each Y axis
x = d3.scalePoint()
    .range([0, parallelWidth])
    .padding(1)
    .domain(dimensions);

// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}

// Draw the lines
g4.selectAll("myPath")
    .data(parRawData)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

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

// Plot 3 - Overview
           
    const g3 = svg.append("g")
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .attr("transform", `translate(${barMargin.left}, ${barTop})`)
                .attr("border", 1)
                //.attr("style", "outline: thin solid red;")   // Test Border

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




}).catch(function(error){
    console.log(error);
});



