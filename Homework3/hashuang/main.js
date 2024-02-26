let abFilter = 25;
let selectedData = [];
let filteredData;
const width = window.innerWidth;
const height = window.innerHeight;


let scatterLeft = 0, scatterTop = 500;
let scatterMargin = {top: 100, right: 20, bottom: 30, left: 100},
    scatterWidth = 1200 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let histLeft = 0, histTop = 100;
let histMargin = {top: 10, right: 60, bottom: 30, left: 120},
    histWidth = 600 - histMargin.left - histMargin.right,
    histHeight = height- 450 - histMargin.top - histMargin.bottom;

const svg = d3.select("svg");

d3.csv("salaries.csv").then(rawData => {
    console.log("rawData", rawData);
        
       
    rawData.forEach(function(d){
            
        d.salary = Number(d.salary);
        d.salary_in_usd = Number(d.salary_in_usd);
        d.work_year = Number(d.work_year);
        d.remote_ratio = Number(d.remote_ratio);
            
    });

    let filteredData = rawData.filter(d => d.salary <= 1000000);
    
        
    
    let transformedData = rawData.map(d => {
        return {
            salary: d.salary,
            employee_residence: d.employee_residence,
            salary_in_usd: d.salary_in_usd,
            experience_level: d.experience_level,
            remote_ratio: d.remote_ratio
        };
    });
    console.log(transformedData);

    let aggregatedData = d3.nest()
    .key(function(d) { return d.experience_level; })
    .rollup(function(v) { return d3.sum(v, d => +d.salary_in_usd); })
    .entries(transformedData)
    .map(function(d) {
        return { experience_level: d.key, total_salary: d.value };
    });

    dimensions = ['salary', 'salary_in_usd', 'remote_ratio'];

      

    
// Scatter Plot

    const g1 = svg.append("g")
                  .attr("transform", `translate(${scatterMargin.left}, ${scatterTop})`);
    
    const brushG = svg.append("g")
                  .attr("class", "brush")
                  .attr("transform", `translate(${scatterMargin.left}, ${scatterTop})`);



    // Tittle
    g1.append('text')
     .attr('x', scatterWidth / 2) 
     .attr('y', -20) 
     .attr('text-anchor', 'middle') 
     .style('font-size', '17px')
     .style('font-weight', 'bold')
     .text('Salary by Region under 1,000,000');                           

    // X label
    g1.append("text")
      .attr("x", scatterWidth + 45)
      .attr("y", 230)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Region");

    // Y label
    g1.append("text")
      .attr("x", -(scatterHeight / 2))
      .attr("y", -60)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Salary");

    // X ticks
    const x1 = d3.scaleBand()
                  .domain(rawData.map(d => d.employee_residence))
                  .range([0, scatterWidth])
                  .padding(1.0);

    const xAxisCall = d3.axisBottom(x1);
    g1.append("g")
      .attr("transform", `translate(0, ${scatterHeight})`)
      .call(xAxisCall)
      .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    const y1 = d3.scaleLinear()
                 .domain([0, 1000000])
                 .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(y1);
    g1.append("g").call(yAxisCall);

    // Draw circles
    g1.selectAll("circle").data(filteredData)
      .enter().append("circle")
        .attr("cx", function(d) { return x1(d.employee_residence); })
        .attr("cy", function(d) { return y1(d.salary); })
        .attr("r", 3)
        .attr("fill", "none") 
        .attr("stroke", "steelblue") 
        .attr("stroke-width", 1.5); 
    
    
        const brush = d3.brush().on("start brush end", function() {
          const selection = d3.event.selection;
          if (selection) {
              const [[x0, y0], [x2, y2]] = selection;
              selectedData = filteredData.filter(d => {
                  const dx = x1(d.employee_residence); 
                  const dy = y1(d.salary); 
                  return x0 <= dx && dx <= x2 && y0 <= dy && dy <= y2; 
              });
              g1.selectAll("circle")
                  .style("stroke", (d) => {
                      const dx = x1(d.employee_residence);
                      const dy = y1(d.salary);
                      return (x0 <= dx && dx <= x2 && y0 <= dy && dy <= y2) ? "orange" : "gray"; 
                  });
              updateHistogram(selectedData, true); 
          } else {
              selectedData = [];
              g1.selectAll("circle").style("stroke", "steelblue"); 
              updateHistogram(filteredData, false); 
          }
      });
      
      brushG.call(brush);
      



        

// Histogram
const g3 = svg.append("g")
    .attr("transform", `translate(${histMargin.left}, ${histTop})`);

// Tittle
g3.append('text')
.attr('x', 300) 
.attr('y', 0) 
.attr('text-anchor', 'middle') 
.style('font-size', '17px')
.style('font-weight', 'bold')
.text('Experience Level vs Salary(In USD)');    

// X label 
g3.append("text")
.attr("x", histWidth / 2)
.attr("y", histHeight + 50)
.attr("font-size", "20px")
.attr("text-anchor", "middle")
.text("Experience Level")

// Y label
g3.append("text")
.attr("x", -35)
.attr("y", -10)
.attr("font-size", "12px")
.attr("text-anchor", "middle")
.text("Salary in USD")


const x = d3.scaleBand()
            .rangeRound([0, histWidth])
            .padding(0.1)
            .domain(aggregatedData.map(d => d.experience_level));


const y = d3.scaleLinear()
            .rangeRound([histHeight, 0])
            .domain([0, d3.max(aggregatedData, d => d.total_salary)]);
g3.append("g")
  .attr("class", "y-axis")
  .call(d3.axisLeft(y));


                    
g3.append("g")
  .attr("transform", `translate(0,${histHeight})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-40)");
  
          
g3.selectAll(".bar")
  .data(aggregatedData)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d.experience_level))
  .attr("y", d => y(d.total_salary))
  .attr("width", x.bandwidth())
  .attr("height", d => histHeight - y(d.total_salary))
  .attr("fill", "grey");

  function updateHistogram(data) {
    let aggregatedData = d3.nest()
      .key(function(d) { return d.experience_level; })
      .rollup(function(v) { return d3.sum(v, d => +d.salary_in_usd); })
      .entries(data)
      .map(function(d) {
        return { experience_level: d.key, total_salary: d.value };
      });
    
    g3.select(".y-axis").remove();
    y.domain([0, d3.max(aggregatedData, d => d.total_salary)]).nice();
    g3.select(".y-axis").call(d3.axisLeft(y));
  
    // Remove existing bars before adding new ones
    g3.selectAll(".bar").remove();
  
    g3.selectAll(".bar")
      .data(aggregatedData, d => d.experience_level)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.experience_level))
      .attr("y", d => y(d.total_salary))
      .attr("width", x.bandwidth())
      .attr("height", d => histHeight - y(d.total_salary))
      .attr("fill", "grey");
    
    g3.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
  }
});

// Paralelle Graph
let parallelLeft = 1000, parallelTop = 0;
let parallelMargin = {top: -100, right: 80, bottom: 100, left: 0},
      parallelWidth = 1000 - parallelMargin.left - parallelMargin.right,
      parallelHeight = 1000 - parallelMargin.top - parallelMargin.bottom;

const g2 = svg.append("g")
    .attr("transform", `translate(${parallelMargin.left}, ${parallelTop})`);

var color = d3.scaleOrdinal(d3.schemeCategory10);

  var dimensions = ['salary', 'salary_in_usd', 'remote_ratio', ];
    
    //tittle
    g2.append("text")
    .attr("x",  1000) 
    .attr("y", 20) 
    .attr("text-anchor", "middle") 
    .style("font-size", "16px") 
    .style('font-weight', 'bold')
    .text("Salaries Distribution"); 

    // dimensions
    g2.append("text")
    .attr("x", 750)
    .attr("y", 35)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("salaries")
    
    g2.append("text")
    .attr("x", 1000)
    .attr("y", 35)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("salaries_in_usd")

    g2.append("text")
    .attr("x", 1250)
    .attr("y", 35)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("remote_rate")

// Load and process the CSV data
d3.csv("salaries.csv").then(data => {
  // Filtering out unnecessary properties
  let filteredData = data.map(d => ({
      job_title: d.job_title,
      salary: +d.salary,
      salary_in_usd: +d.salary_in_usd,
      remote_ratio: +d.remote_ratio
  }));

var y = {};
dimensions.forEach(function(dimension) {
  y[dimension] = d3.scaleLinear()
    .domain(d3.extent(filteredData, function(d) { return +d[dimension]; }))
    .range([450, 50]);
});

var x = d3.scalePoint()
  .range([500, 1500])
  .padding(1)
  .domain(dimensions);

function path(d) {
  return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}

// Draw the lines
g2.selectAll("myPath")
  .data(filteredData)
  .enter().append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", function(d) { return color(d.job_title); }) // Color by job_title
    .style("opacity", 0.5);

// Draw the axis
svg.selectAll("myAxis")
  .data(dimensions).enter()
  .append("g")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
  .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "black");    

  // Function to redraw paths with animation
  function replayParallelGraph() {
    // Remove existing paths
    g2.selectAll("path").remove();

    // Redraw paths with a transition
    g2.selectAll("myPath")
      .data(filteredData)
      .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", function(d) { return color(d.job_title); }) 
        .style("opacity", 0.5)
        .attr("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function() {
            return this.getTotalLength();
        })
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
}

d3.select("#replayButton").on("click", replayParallelGraph);

});