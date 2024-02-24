// set the attributes and margins of the graph
const margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const parallel_svg = d3.select("#plot_one")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left},${margin.top})`);

const grid_svg = d3.select("#plot_two")
	//.attr("viewBox", [0, 0, width, height])
	//.attr("stroke-width", 2)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left},${margin.top})`);
	//.attr("style", "outline: 2px solid black;");

// Parse the Data
d3.csv("penguins.csv").then( function(data) {
  //Filter out attributes that aren't quantitative.
  attributes = Object.keys(data[0]).filter(function(d) { return d != "species" && d != "island" && d != "sex" })

	//Y axis; each attribute gets its own scale.
	const y = {};
	for(i in attributes){
		name = attributes[i]
		y[name] = d3.scaleLinear()
			.domain( d3.extent(data, function(d) { return +d[name]; }))
			.range([0, height])
	}

	//X axis.
	x = d3.scalePoint()
		.range([0, width])
		.padding(0.5)
		.domain(attributes);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(attributes.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  //Draw the lines.
  const lines = parallel_svg
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

	//Draw the axes.
	const axes = parallel_svg.append("g")
		.selectAll("g")
		.data(attributes)
		.join("g")
		  .attr("transform", d => `translate(${x(d)})`)
    		.each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
		  .call(g => g.append("text")
			.attr("x", margin.left)
			.attr("y", -6)
			.attr("text-anchor", "start")
			.attr("fill", "currentColor")
			.text(d => d))
		  .call(g => g.selectAll("text")
			.clone(true).lower()
			.attr("fill", "none")
			.attr("stroke-width", 5)
			.attr("stroke-linejoin", "round")
			.attr("stroke", "white"));

	//Put the WHY in y_map.
	const y_map = new Map(Array.from(attributes, key => [key, d3.scaleLinear(d3.extent(data, d => d[key]), [margin.top, height - margin.bottom])]));

	// --------------------------------------------- PLOT 2 -------------------------------------------------
	let radius = 7;
	let num_circles_in_row = 21;
	let padding = 1.1;

	const circles = d3.range(data.length).map(i => ({
		x: ((i % num_circles_in_row) * radius * 2 * padding) + radius,
		y: ((Math.floor(i / num_circles_in_row)) * radius * 2 * padding) + radius,
		index: i
	}));

	const points = grid_svg.selectAll("circle")
		.data(data)
		.join("circle")
		.attr("cx", (d, i) => ((i % num_circles_in_row) * radius * 2 * padding) + radius)
		.attr("cy", (d, i) => ((Math.floor(i / num_circles_in_row)) * radius * 2 * padding) + radius)
		.attr("r", radius)
		.attr("fill", d => "steelblue")
		//.call(drag)
		//.on("click", clicked);

	function clicked(event, d) {
		if (event.defaultPrevented) return; // dragged

		d3.select(this).transition()
		.attr("fill", "black")
		.attr("r", radius * 2)
		.transition()
		.attr("r", radius)
		.attr("fill", "steelblue");
	}

	/*drag = {
		function dragstarted() {
			d3.select(this).attr("stroke", "black");
		}

		function dragged(event, d) {
			d3.select(this).raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
		}

		function dragended() {
			d3.select(this).attr("stroke", null);
		}

		return d3.drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended);
	}*/

	// ------------------------------------ BRUSH BEHAVIOR FOR PLOT 1 ---------------------------------------
	const brushWidth = 50;
	const brush = d3.brushY()
		.extent([[-(brushWidth / 2), margin.top], [brushWidth / 2, height - margin.bottom]])
		.on("start brush end", brushed);

	axes.call(brush);

	const selections = new Map();
	let num_selected = 0;

	function brushed({selection}, key) {
		if (selection === null) selections.delete(key);
		else selections.set(key, selection.map(y_map.get(key).invert));

		const selected = [];
		lines.each(function(d) {
		  const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
		  d3.select(this).style("stroke", active ? "steelblue" : "gray")
			.style("opacity", active ? 1 : 0.2);
		  if (active) {
			d3.select(this).raise();
			selected.push(d);
		  }
		});

		points.each(function(d) {
		  const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
		  d3.select(this).attr("fill", active ? "steelblue" : "gray")
			.style("opacity", active ? 1 : 0.2);
		  if (active) {
			d3.select(this).raise();
			//selected.push(d);
		  }
		});


			//parallel_svg.property("value", selected).dispatch("input");
	  }
	
		// --------------------------- ATTEMPT AT PLOT 3 -------------------------------------
	/*
		var num_penguins = [num_selected];
var chart = d3.select("#plot_three")

var rects = chart.selectAll('rect')
  .data(num_penguins).enter()
  .append('rect')
  .attr('x', 0)
  .attr('y', function(d,i) {return i * 15})
  .attr('width', function(d) {return d})
  .attr('height', 14)

var labels = chart.selectAll("text")
  .data(num_penguins)
  .enter()
  .append("text")
  .text(function(d) {return d})
  .attr("y", function(d,i) {return i*15 + 10})
  .attr("x", function(d) {return d - 20})
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "white")
  */
		

})
