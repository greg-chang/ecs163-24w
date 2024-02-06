let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let parallelLeft = 0, parallelTop = 0;
let parallelMargin = {top: 40, right: 0, bottom: 10, left: 0},
    parallelWidth = width,
    parallelHeight = 350 - parallelMargin.top;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 30},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

// let teamLeft = 0, teamTop = 400;
// let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
//     teamWidth = width - teamMargin.left - teamMargin.right,
//     teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

// get the data
d3.csv("ds_salaries.csv").then(data => {
  
  const svg = d3.select("svg")
  // parallel plot
  
  const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${parallelMargin.top})`)
  // https://d3-graph-gallery.com/graph/parallel_basic.html
  // Extract the list of dimensions we want to keep in the plot. Keep all except the categoricals with too many unique values (>50).
  dimensions = Object.keys(data[0]).filter(function (d) {
    return (d != "job_title" &&
      d != "employee_residence" && d != "company_location" && d != "salary")
  });
  
  // For each dimension, build a linear scale if numerical, else ordinal scale. Store all in a y object
  var y1 = {}
  for (i in dimensions) {
    dim = dimensions[i]
    if (dim != 'salary' && dim != 'salary_in_usd') {
      const uniqueDimVals = [...new Set(data.map(item => item[dim]))];
      console.log(uniqueDimVals)
      y1[dim] = d3.scalePoint()
        .domain( uniqueDimVals )
        .range([parallelHeight, 0])
    }    
    else {
      y1[dim] = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { return +d[dim]; }) )
        .range([parallelHeight, 0])
    }
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, parallelWidth])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y1[p](d[p])]; }));
  }
  

  // Draw the lines
  g1
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

  // Draw the axis:
  g1.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y1[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
  
  g1.append("text")
    .attr("x", (width / 2))             
    .attr("y", -25)
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Annual Data Scientist Salaries");
  
}).catch(function(error){
  console.log(error);
});
