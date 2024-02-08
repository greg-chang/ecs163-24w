const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 10, bottom: 10, left: 65},
    scatterWidth = ((2 * width)/5) - scatterMargin.left - scatterMargin.right,
    scatterHeight = 250 - scatterMargin.top - scatterMargin.bottom;

let jobsLeft = 0, jobsTop = 350;
let jobsMargin = {top: 10, right: 30, bottom: 10, left: 65},
    jobsWidth = width - jobsMargin.left - jobsMargin.right,
    jobsHeight = height - 435 - jobsMargin.top - jobsMargin.bottom;


d3.csv("ds_salaries.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.salary_in_usd = Number(d.salary_in_usd);
        d.remote_ratio = Number(d.remote_ratio);
    });
    

    //rawData = rawData.filter(d=>d.AB>abFilter);
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
                .attr("style", "outline: thin solid red;")   // Test Border

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



// Plot 3 - Overview
           
    const g3 = svg.append("g")
                .attr("width", jobsWidth + jobsMargin.left + jobsMargin.right)
                .attr("height", jobsHeight + jobsMargin.top + jobsMargin.bottom)
                .attr("transform", `translate(${jobsMargin.left}, ${jobsTop})`)
                .attr("border", 1)
                .attr("style", "outline: thin solid red;")   // Test Border

    // X label
    
    g3.append("text")
    .attr("x", jobsWidth / 2)
    .attr("y", jobsHeight + 90)
    .attr("font-size", "24px")
    .attr("text-anchor", "middle")
    .text("Job Title")
    

    // Y label
    g3.append("text")
    .attr("x", -(jobsHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Employees")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(r.map(d => d.job_title))
    .range([0, jobsWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g3.append("g")
    .attr("transform", `translate(0, ${jobsHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-35)")

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(r, d => d.count)])
    .range([jobsHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(r)

    rects2.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", (d) => x2(d.job_title))
    .attr("width", x2.bandwidth)
    .attr("height", d => jobsHeight - y2(d.count))
    .attr("fill", "orange")






























}).catch(function(error){
    console.log(error);
});



