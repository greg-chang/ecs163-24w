
// Load the CSV data
d3.csv("studentMentalHealth.csv").then(rawData => {
    console.log(rawData);

    rawData.forEach(function(d) {
        d["Do you have Depression?"] = d["Do you have Depression?"].toLowerCase() === "yes" ? 1 : 0;
    });

    // Aggregate and prepare data for the bar chart
    var barChartData = d3.rollups(rawData,
        function(v) { return d3.sum(v, function(d) { return d["Do you have Depression?"]; }); },
        function(d) { return d["Your current year of Study"]; }
    ).map(function(d) { return { year: d[0], depression: d[1] }; });

    // Sort years properly
    barChartData.sort(function(a, b) {
        return d3.ascending(parseInt(a.year.match(/\d+/)), parseInt(b.year.match(/\d+/)));
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
    const margin = {top: 10, right: 30, bottom: 40, left: 600},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const g2 = svg.append("g")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(barChartData.map(function(d) { return d.year; }))
      .padding(0.2);

    g2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(barChartData, function(d) { return d.depression; })])
      .range([ height, 0]);

    g2.append("g")
      .call(d3.axisLeft(y));

    // Bars
    g2.selectAll("mybar")
      .data(barChartData)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", function(d) { return y(d.depression); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.depression); })
        .attr("fill", "#69b3a2")

    // Title
    g2.append("text")
        .attr("x", (width / 2))             
        .attr("y", 20)
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .text("Depression Levels by Year");

    legend2.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#69b3a2");

    legend2.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

}).catch(function(error){
    console.log(error);
});
