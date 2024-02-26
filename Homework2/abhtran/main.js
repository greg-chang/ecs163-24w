const globalMargin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 960 - globalMargin.left - globalMargin.right,
      height = 500 - globalMargin.top - globalMargin.bottom;

// Parallel Coordinates Chart
d3.csv("cosmetics.csv").then(function(data) {
    const margin = {top: 50, right: 10, bottom: 10, left: 10},
          pcWidth = width - margin.left - margin.right,
          pcHeight = 300 - margin.top - margin.bottom; 

    const svg = d3.select("#parallel-coordinates")
        .append("svg")
        .attr("width", pcWidth + margin.left + margin.right)
        .attr("height", pcHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    const dimensions = ["Label", "Price", "Rank"];
    const y = {};
    dimensions.forEach(function(d) {
        y[d] = d === "Label" ? 
               d3.scalePoint().domain(data.map(function(p) { return p[d]; })).range([pcHeight, 0]) :
               d3.scaleLinear().domain(d3.extent(data, function(p) { return +p[d]; })).range([pcHeight, 0]);
    });

    const x = d3.scalePoint()
        .range([0, pcWidth])
        .padding(1)
        .domain(dimensions);

    svg.selectAll("myPath")
        .data(data)
        .enter().append("path")
            .attr("d", function(d) {
                return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            })
            .style("fill", "none")
            .style("stroke", "#69b3a2")
            .style("opacity", 0.5)
            .on("mouseover", function() {
                d3.select(this)
                .style("stroke-width", "3")
                .style("opacity", 1);
            })
            .on("mouseout", function() {
                d3.select(this)
                .style("stroke-width", "1")
                .style("opacity", 0.5);
            });

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
    

});

// Pie Chart
d3.csv("cosmetics.csv").then(function(data) {
    const pieWidth = 400, pieHeight = 400, pieRadius = Math.min(pieWidth, pieHeight) / 2;
    const pieSvg = d3.select("#pieChart")
        .append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

    const labelCounts = d3.rollup(data, v => v.length, d => d.Label);
    const dataset = Array.from(labelCounts, ([key, value]) => ({ label: key, count: value }));
    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(pieRadius);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    pieSvg.selectAll("path")
        .data(pie(dataset))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    pieSvg.selectAll("text")
        .data(pie(dataset))
        .enter()
        .append("text")
        .text(d => `${d.data.label}`)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "10px");

        pieSvg.selectAll("path")
  .on("mouseover", function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("stroke", "black")
      .attr("stroke-width", 3);
    d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 1)
      .html(`Label: ${d.data.label}<br>Count: ${d.data.count}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px");
  })
  .on("mouseout", function() {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("stroke", "none");
    d3.select(".tooltip").remove();
  });


});

// Scatter Plot
d3.csv("cosmetics.csv").then(function(data) {
    const scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
          scatterWidth = 800 - scatterMargin.left - scatterMargin.right,
          scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.Price)])
        .range([0, scatterWidth]);

    svg.append("g")
        .attr("transform", `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
        .domain([0, 5]) 
        .range([scatterHeight, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Price))
        .attr("cy", d => y(d.Rank))
        .attr("r", 5)
        .style("fill", d => color(d.Brand));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", scatterWidth / 2 + scatterMargin.left)
        .attr("y", scatterHeight + scatterMargin.top + 20)
        .text("Price");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -scatterMargin.left + 20)
        .attr("x", -scatterMargin.top - scatterHeight / 2 + 20)
        .text("Rank");
        svg.selectAll("circle")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8);
          d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 1)
            .html(`Brand: ${d.Brand}<br>Price: $${d.Price}<br>Rank: ${d.Rank}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5);
          d3.select(".tooltip").remove();
        });
    
});
