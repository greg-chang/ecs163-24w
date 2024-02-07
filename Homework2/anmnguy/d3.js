// Assuming you've loaded and processed your data into rawData
d3.csv("studentMentalHealth.csv").then(rawData => {
    console.log(rawData);
    // Example of processing data for pie chart
    // Calculate the number of students with and without depression
    let rawData = d3.nest()
        .key(function(d) { return d['Do you have Depression?']; })
        .rollup(function(v) { return v.length; })
        .entries(rawData);

    // Set dimensions and margins for the pie chart
    let pieWidth = 450, pieHeight = 450;
    let radius = Math.min(pieWidth, pieHeight) / 2;

    // Append a new g element for the pie chart
    const pieSvg = d3.select("svg").append("g")
        .attr("transform", `translate(${pieWidth / 2 + 10}, ${pieHeight / 2 + 10})`); // Adjust position as needed

    // Create a pie and arc generator
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create the pie chart
    const arcs = pieSvg.selectAll(".arc")
        .data(pie(depressionData))
        .enter().append("g")
        .attr("class", "arc");

    const color = d3.scaleOrdinal(["#69b3a2", "#d3d3d3"]); // Example colors

    // Append paths for the pie segments
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d) { return color(d.data.key); }); // Use a color scale or specific colors

    // Append text labels to the pie segments
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => d.data.key);

}).catch(function(error){
    console.log(error);
});

// After loading and processing data for scatter and bar charts

// Set up pie chart dimensions and position
let pieLeft = distrLeft + distrWidth + 100, pieTop = 0; // Adjust based on layout
let pieWidth = 450, pieHeight = 450;
let radius = Math.min(pieWidth, pieHeight) / 2;

// Append a new g element for the pie chart
const pieSvg = d3.select("svg").append("g")
    .attr("transform", `translate(${pieLeft + pieWidth / 2}, ${pieTop + pieHeight / 2})`);

// Example of processing data for pie chart (adapt to your data)
let rawData = d3.nest()
    .key(function(d) { return d['Do you have Depression?']; })
    .rollup(function(v) { return v.length; })
    .entries(rawData);

// Create a pie and arc generator
const pie = d3.pie().value(d => d.value);
const arc = d3.arc().innerRadius(0).outerRadius(radius);

// Define a color scale (adapt to your needs)
const color = d3.scaleOrdinal(["#69b3a2", "#d3d3d3"]); // Example colors

// Create the pie chart
const arcs = pieSvg.selectAll(".arc")
    .data(pie(depressionData))
    .enter().append("g")
    .attr("class", "arc");

// Append paths for the pie segments
arcs.append("path")
    .attr("d", arc)
    .attr("fill", function(d) { return color(d.data.key); });

// Append text labels to the pie segments
arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .text(d => d.data.key);
