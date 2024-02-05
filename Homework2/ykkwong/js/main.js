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
// d3.select("body").append("h1").text("Hello World!");
// get the data
d3.csv("ds_salaries.csv.csv").then(rawData => {
  console.log("rawData", rawData);
    
  // shove all the data vis here
  // do parallel coordinates diagram for overview
  // make the overview one quarter of screen space
  // https://d3-graph-gallery.com/graph/parallel_basic.html
  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  dimensions = d3.keys(data[0]).filter(function(d) { return d })

  // For each dimension, I build a linear scale. I store all in a y object
  var y = {}
  for (i in dimensions) {
    dim = dimensions[i]
    y[dim] = d3.scaleLinear()
      .domain( d3.extent(data, function(d) { return +d[dim]; }) )
      .range([height, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
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
              .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
              .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
              .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)


  
}).catch(function(error){
  console.log(error);
});
