let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let parallelLeft = 0, scatterTop = 0;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = 400 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 350 - parallelMargin.top - parallelMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

// helper method to get all unique values of keys:
// https://stackoverflow.com/questions/15125920/how-to-get-distinct-values-from-an-array-of-objects-in-javascript
// const unique = [...new Set(data.map(item => item.group))];    


  // var unique = [];
  // var distinct = [];
  // for( let i = 0; i < data.length; i++ ) {
  //   if( !unique[data[i].age]){
  //     distinct.push(data[i].age);
  //     unique[data[i].age] = 1;
  //   }
  // }
  // return distinct;

// get the data
d3.csv("ds_salaries.csv").then(data => {
  // console.log("rawData", data);
  // console.log(Object.keys(data[0]));
    
  // shove all the data vis here
  // do parallel coordinates diagram for overview
  // make the overview one quarter of screen space
  // Enumerate all keys
  // for (i = 0; i < data.length; i++) {
  //   for (key = 0; key < data[0].length; key++) {
  //     Object.keys(data[i])
  //   }
  // }
  
  // https://d3-graph-gallery.com/graph/parallel_basic.html
  // Extract the list of dimensions we want to keep in the plot. Keep all.
  dimensions = Object.keys(data[0]);
  // for (i in dimensions) {
  //   dim = dimensions[i]
  //   const uniqueYears = [...new Set(data.map(item => item[dim]))];
  //   console.log(uniqueYears)
  // }
  
  // For each dimension, build a linear scale if numerical, else ordinal scale. Store all in a y object
  var y = {}
  for (i in dimensions) {
    dim = dimensions[i].toString()
    if (dim != 'salary' || dim != 'salary_in_usd') {
      const uniqueDimVals = [...new Set(data.map(item => item[dim]))];
      y[dim] = d3.scaleOrdinal()
        .domain( uniqueDimVals )
        .range([height, 0])
    }    
    else {
      y[dim] = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { return +d[dim]; }) )
        .range([height, 0])
    }
  }
  console.log(y)

  // Build the X scale -> find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }
  const svg = d3.select("svg")

  const g1 = svg.append("g")
              .attr("width", (parallelWidth + parallelMargin.left + parallelMargin.right/2))
              .attr("height", (parallelHeight + parallelMargin.top + parallelMargin.bottom)/2)
              .attr("transform", `translate(${parallelMargin.left}, ${parallelMargin.top})`)

              svg
              .selectAll("myPath")
              .data(data)
              .enter().append("path")
              .attr("d",  path)
              .style("fill", "none")
              .style("stroke", "#69b3a2")
              .style("opacity", 0.5)
            
            // Draw the axis:
            svg.selectAll("myAxis")
              // For each dimension of the dataset, add a 'g' element:
              .data(dimensions).enter()
              .append("g")
              // Translate this element to its right position on the x axis
              .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
              // And build the axis with the call function
              .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
              // Add axis title
              .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9 /*, <height specified>*/)
                .text(function(d) { return d; })
              .style("fill", "black")
  
  
}).catch(function(error){
  console.log(error);
});
