
// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page


const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          `translate(${margin.left},${margin.top})`);

// get the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv").then( function(data) {
    console.log(data);

    data.forEach(function(d) {
        d.price = Number(d.price);
    });

    data = data.map(d => {
        return{
            "Price":d.price
        }
    });
    // X axis: scale and draw:
    const x = d3.scaleLinear()
        .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // set the parameters for the histogram
    const histogram = d3.histogram()
        .value(function(d) { return d.price; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins = histogram(data);
    
    // Y axis: scale and draw:
    const y = d3.scaleLinear()
    .range([height, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
    .call(d3.axisLeft(y));
    
    // append the bar rectangles to the svg element
    svg.selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", 1)
    .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
    .attr("width", function(d) { return x(d.x1) - x(d.x0) -1})
    .attr("height", function(d) { return height - y(d.length); })
    .style("fill", "#69b3a2")
    
});



// // Copyright 2021-2023 Observable, Inc.
// // Released under the ISC license.
// // https://observablehq.com/@d3/force-directed-graph
// function ForceGraph({
//     nodes, // an iterable of node objects (typically [{id}, …])
//     links // an iterable of link objects (typically [{source, target}, …])
//   }, {
//     nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
//     nodeGroup, // given d in nodes, returns an (ordinal) value for color
//     nodeGroups, // an array of ordinal values representing the node groups
//     nodeTitle, // given d in nodes, a title string
//     nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
//     nodeStroke = "#fff", // node stroke color
//     nodeStrokeWidth = 1.5, // node stroke width, in pixels
//     nodeStrokeOpacity = 1, // node stroke opacity
//     nodeRadius = 5, // node radius, in pixels
//     nodeStrength,
//     linkSource = ({source}) => source, // given d in links, returns a node identifier string
//     linkTarget = ({target}) => target, // given d in links, returns a node identifier string
//     linkStroke = "#999", // link stroke color
//     linkStrokeOpacity = 0.6, // link stroke opacity
//     linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
//     linkStrokeLinecap = "round", // link stroke linecap
//     linkStrength,
//     colors = d3.schemeTableau10, // an array of color strings, for the node groups
//     width = 640, // outer width, in pixels
//     height = 400, // outer height, in pixels
//     invalidation // when this promise resolves, stop the simulation
//   } = {}) {
//     // Compute values.
//     const N = d3.map(nodes, nodeId).map(intern);
//     const LS = d3.map(links, linkSource).map(intern);
//     const LT = d3.map(links, linkTarget).map(intern);
//     if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
//     const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
//     const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
//     const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
//     const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
  
//     // Replace the input nodes and links with mutable objects for the simulation.
//     nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
//     links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));
  
//     // Compute default domains.
//     if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);
  
//     // Construct the scales.
//     const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
  
//     // Construct the forces.
//     const forceNode = d3.forceManyBody();
//     const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
//     if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
//     if (linkStrength !== undefined) forceLink.strength(linkStrength);
  
//     const simulation = d3.forceSimulation(nodes)
//         .force("link", forceLink)
//         .force("charge", forceNode)
//         .force("center",  d3.forceCenter())
//         .on("tick", ticked);
  
//     const svg = d3.create("svg")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("viewBox", [-width / 2, -height / 2, width, height])
//         .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
//     const link = svg.append("g")
//         .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
//         .attr("stroke-opacity", linkStrokeOpacity)
//         .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
//         .attr("stroke-linecap", linkStrokeLinecap)
//       .selectAll("line")
//       .data(links)
//       .join("line");
  
//     const node = svg.append("g")
//         .attr("fill", nodeFill)
//         .attr("stroke", nodeStroke)
//         .attr("stroke-opacity", nodeStrokeOpacity)
//         .attr("stroke-width", nodeStrokeWidth)
//       .selectAll("circle")
//       .data(nodes)
//       .join("circle")
//         .attr("r", nodeRadius)
//         .call(drag(simulation));
  
//     if (W) link.attr("stroke-width", ({index: i}) => W[i]);
//     if (L) link.attr("stroke", ({index: i}) => L[i]);
//     if (G) node.attr("fill", ({index: i}) => color(G[i]));
//     if (T) node.append("title").text(({index: i}) => T[i]);
//     if (invalidation != null) invalidation.then(() => simulation.stop());
  
//     function intern(value) {
//       return value !== null && typeof value === "object" ? value.valueOf() : value;
//     }
  
//     function ticked() {
//       link
//         .attr("x1", d => d.source.x)
//         .attr("y1", d => d.source.y)
//         .attr("x2", d => d.target.x)
//         .attr("y2", d => d.target.y);
  
//       node
//         .attr("cx", d => d.x)
//         .attr("cy", d => d.y);
//     }
  
//     function drag(simulation) {    
//       function dragstarted(event) {
//         if (!event.active) simulation.alphaTarget(0.3).restart();
//         event.subject.fx = event.subject.x;
//         event.subject.fy = event.subject.y;
//       }
      
//       function dragged(event) {
//         event.subject.fx = event.x;
//         event.subject.fy = event.y;
//       }
      
//       function dragended(event) {
//         if (!event.active) simulation.alphaTarget(0);
//         event.subject.fx = null;
//         event.subject.fy = null;
//       }
      
//       return d3.drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended);
//     }
  
//     return Object.assign(svg.node(), {scales: {color}});
//   }

// chart = ForceGraph(rawdata, {
//     nodeId: d => d.Type_1,
//     nodeGroup: d => d.Attack,
//     nodeTitle: d => `${d.Type_1}\n${d.Attack}`,
//     linkStrokeWidth: l => Math.sqrt(l.value),
//     width,
//     height: 600,
//     invalidation // a promise to stop the simulation when the cell is re-run
//   })
