const globalMargin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 1000 - globalMargin.left - globalMargin.right,
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

    const dimensions = ["Label", "Price"];
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

    const brush = d3.brushY()
        .extent([[0, 0], [pcWidth, pcHeight]])
        .on("brush end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    const path = svg.selectAll("myPath")
        .data(data)
        .enter().append("path")
            .attr("d", function(d) {
                return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            })
            .style("fill", "none")
            .style("stroke", "#69b3a2")
            .style("opacity", 0.5);

    path.on("mouseover", function() {
            d3.select(this)
            .style("stroke-width", "3")
            .style("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
            .style("stroke-width", "1")
            .style("opacity", 0.5);
        });

    function brushed(event) {
        const selection = event.selection || pcHeight;
        path.style("display", function(d) {
            return dimensions.every(function(p) {
                const pos = y[p](d[p]);
                return selection[0] <= pos && pos <= selection[1];
            }) ? null : "none";
        });
    }

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


//Bar Graph
d3.csv("cosmetics.csv").then(function(data) {
    let sortedByCount = false; 

    const brandCounts = d3.rollup(data, v => v.length, d => d.Brand);
    let processedData = Array.from(brandCounts, ([Brand, Count]) => ({Brand, Count}));

    const margin = {top: 50, right: 10, bottom: 175, left: 70},
          width = 1000 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#bar-graph")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
      .range([ 0, width ])
      .padding(0.2);
    const xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")");

    const y = d3.scaleLinear()
      .range([ height, 0]);
    const yAxis = svg.append("g");

    function update(processedData) {
        x.domain(processedData.map(d => d.Brand));
        y.domain([0, d3.max(processedData, d => d.Count)]);

        xAxis.call(d3.axisBottom(x)).selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-65)")
          .style("text-anchor", "end")
          .style("font-size", "6px")
          .attr("dy", "13px");
        yAxis.call(d3.axisLeft(y));

        const bars = svg.selectAll(".bar")
          .data(processedData, d => d.Brand);

        bars.enter().append("rect")
          .attr("class", "bar")
          .merge(bars) 
          .attr("x", d => x(d.Brand))
          .attr("y", d => y(d.Count))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.Count))
          .attr("fill", "#69b3a2")
          
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("fill", "orange"); 
            svg.append("text")
              .attr("class", "value")
              .attr("x", x(d.Brand) + x.bandwidth() / 2)
              .attr("y", y(d.Count) - 5)
              .attr("text-anchor", "middle")
              .text(`${d.Brand}: ${d.Count}`);
              
          })
          .on("mouseout", function(d) {
            d3.select(this)
              .attr("fill", "#69b3a2"); 
            svg.selectAll(".value").remove(); 
          });

        bars.exit().remove();
    }
    update(processedData);
    d3.select("#sortBarGraph").on("click", function() {
        sortedByCount = !sortedByCount;
        processedData.sort(sortedByCount
          ? (a, b) => b.Count - a.Count
          : (a, b) => d3.ascending(a.Brand, b.Brand));
        update(processedData);
    });
});





