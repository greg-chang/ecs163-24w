// Load the CSV data
d3.csv("studentMentalHealth.csv").then(rawData => {
    console.log(rawData);

    rawData.forEach(function(d) {
        d["Do you have Depression?"] = d["Do you have Depression?"] === "Yes" ? 1 : 0;
        d["Do you have Anxiety?"] = d["Do you have Anxiety?"] === "Yes" ? 1 : 0;
        d["Do you have Panic attack?"] = d["Do you have Panic attack?"] === "Yes" ? 1 : 0;
    });
    const genderCounts = d3.rollup(rawData, v => v.length, d => d["Choose your gender"]);

    // Select the existing SVG and append a 'g' element for the pie chart
    const svg = d3.select("svg").append("g")
        .attr("transform", "translate(200,200)"); // Center the pie chart

    const pie = d3.pie().value(d => d[1]);
    const data_ready = pie(Array.from(genderCounts));

    const arc = d3.arc().innerRadius(0).outerRadius(100);

    const color = d3.scaleOrdinal()
        .domain(Array.from(genderCounts, d => d[0]))
        .range(["#6f8ab1", "#f0ab8d"]); // Assigning colors

    // Append slices to the pie chart
    svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add title
    svg.append("text")
       .attr("x", 0) 
       .attr("y", -130) // Adjust based on your SVG's layout
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("Gender Distribution");

    // Add legend
    const legend = svg.selectAll(".legend")
       .data(color.domain())
       .enter().append("g")
       .attr("class", "legend")
       .attr("transform", (d, i) => "translate(0," + (i * 20 - 100) + ")"); // Adjust for layout

    legend.append("rect")
       .attr("x", -180) // Adjust based on your SVG's layout
       .attr("width", 18)
       .attr("height", 18)
       .style("fill", color);

    legend.append("text")
       .attr("x", -155) // Adjust based on positioning
       .attr("y", 9)
       .attr("dy", ".35em")
       .style("text-anchor", "start")
       .text(d => d);
}).catch(function(error){
    console.log(error);
});
