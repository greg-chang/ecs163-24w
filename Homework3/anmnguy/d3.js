
// Load the CSV data
d3.csv("studentMentalHealth.csv").then(rawData => {
    console.log(rawData);

    rawData.forEach(function(d) {
        d["Do you have Depression?"] = d["Do you have Depression?"].toLowerCase() === "yes" ? 1 : 0;
        d["Your current year of Study"] = d["Your current year of Study"].charAt(0).toUpperCase() + d["Your current year of Study"].slice(1).toLowerCase();
    });

    // Aggregate the data
    var barChartData = d3.rollups(rawData,
        function(v) { return d3.sum(v, function(d) { return d["Do you have Depression?"]; }); },
        function(d) { return d["Your current year of Study"]; }
    ).map(function(d) { return { year: d[0], depression: d[1] }; });

    // Sort the data by year
    barChartData.sort(function(a, b) {
        return d3.ascending(a.year, b.year);
    });

    const genderCounts = d3.rollup(rawData, v => v.length, d => d["Choose your gender"]);

    const svg = d3.select("svg")

    // Select the existing SVG and append a 'g' element for the pie chart
    // plot 1
    const g1 = svg.append("g")
                .attr("transform", "translate(300,200)")
    const pie = d3.pie().value(d => d[1]);
    const data_ready = pie(Array.from(genderCounts));

    const arc = d3.arc().innerRadius(0).outerRadius(100);

    const color2 = d3.scaleOrdinal()
        .domain(Array.from(genderCounts, d => d[0]))
        .range(["#6f8ab1", "#f0ab8d"]); // Assigning colors

    // Append slices to the pie chart
    g1.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color2(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add title
    g1.append("text")
       .attr("x", 0) 
       .attr("y", -140) // Adjust based on your SVG's layout
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("Gender Distribution");

    // Add legend
    const legend = g1.selectAll(".legend")
       .data(color2.domain())
       .enter().append("g")
       .attr("class", "legend")
       .attr("transform", (d, i) => "translate(0," + (i * 20 - 100) + ")"); // Adjust for layout

    legend.append("rect")
       .attr("x", -200) // Adjust based on your SVG's layout
       .attr("width", 18)
       .attr("height", 18)
       .style("fill", color2);

    legend.append("text")
       .attr("x", -175) // Adjust based on positioning
       .attr("y", 9)
       .attr("dy", ".35em")
       .style("text-anchor", "start")
       .text(d => d);

    //plot 2 - Bar chart dimensions
    // Set up the dimensions and margins for the bar chart
    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 20, bottom: 60, left: 550},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Append a 'g' element for the bar chart

    const g2 = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up the x scale
    const x = d3.scaleBand()
              .rangeRound([0, width])
              .padding(0.1)
              .domain(barChartData.map(function(d) { return d.year; }));

    // Set up the y scale
    const y = d3.scaleLinear()
              .domain([0, d3.max(barChartData, function(d) { return d.depression; })])
              .range([height, 0]);
    
    // Define the brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed);

    // Add the X Axis
    g2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add the Y Axis
    g2.append("g")
      .call(d3.axisLeft(y));

    // Apply the brush to the bar chart
    g2.append("g")
      .attr("class", "brush")
      .call(brush);

    function brushed(event) {
      if (event.selection) {
        const [x0, x1] = event.selection.map(x.invert);
        const filteredData = barChartData.filter(d => x0 <= d.year && d.year <= x1);
        updateBarChart(filteredData); // Redraw bar chart with filtered data
      }
    }

    // Add a title to the bar chart
    g2.append("text")
      .attr("x", width / 2)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Depression Counts by Year");

    g2.append('text')
      .attr('x', 150)
      .attr('y', 480)
      .attr('dy', '0.35em')
      .text('Year of Study');

    g2.append('text')
      .attr('x', -120)
      .attr('y', 200)
      .attr('dy', '0.35em')
      .text('Student Counts');

    function updateBarChart(data) {
      // Bind data to bars
      const bars = g2.selectAll('.bar')
        .data(data, d => d.year);
    
      // Enter new bars
      bars.enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.year))
        .attr('width', x.bandwidth())
        .attr('y', height)
        .attr('height', 0) // Start with height 0 and transition to the correct height
        .attr('fill', '#69b3a2')
        .transition().duration(750)
        .attr('y', d => y(d.depression))
        .attr('height', d => height - y(d.depression));
    
      // Update existing bars
      bars.transition().duration(750)
        .attr('y', d => y(d.depression))
        .attr('height', d => height - y(d.depression));
    
      // Remove old bars
      bars.exit().transition().duration(750)
        .attr('y', height)
        .attr('height', 0)
        .remove();
    }
    
    // Call this function with new data to animate the bar chart
    updateBarChart(barChartData);

    // Define zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 3])  // Limit the zoom scale
      .translateExtent([[1, 0], [width, height]])
      .on("zoom", zoomed);

    // Apply the zoom behavior to the pie chart
    g1.call(zoomBehavior);

    function zoomed(event) {
      g1.attr("transform", event.transform);  // Zoom and pan the pie chart
    }
    // const zoomBehavior = d3.zoom()
    //   .scaleExtent([0.5, 5])
    //   .on('zoom', (event) => {
    //     g1.attr('transform', event.transform);
    //     g2.attr('transform', event.transform);
    //   });

      g2.call(zoomBehavior);

    // After aggregating and sorting your data
    const dimensions = Object.keys(barChartData[0]).filter(d => d !== 'year');

    // Define the y scale for each dimension
    const yScales = {};
    for (const dim of dimensions) {
      yScales[dim] = d3.scaleLinear()
        .domain(d3.extent(barChartData, d => d[dim]))
        .range([height, 0]);
    }

    // Define the path for each line
    function path(d) {
      return d3.line()(dimensions.map(p => [x(p), yScales[p](d[p])]));
    }

    // Add lines
    g3.selectAll('myPath')
      .data(barChartData)
      .enter().append('path')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#69b3a2')
      .style('opacity', 0.5);
  
}).catch(function(error){
    console.log(error);
});
