//PARALLEL COORDINATES
d3.csv("student-mat.csv").then(function (data) {
    // Convert necessary numerical values from strings to numbers
    data.forEach(function (d) {
        d.age = +d.age;
        d.G1 = +d.G1;
        d.G2 = +d.G2;
        d.G3 = +d.G3;
        d.absences = +d.absences;
        d.health = +d.health;
        d.Dalc = +d.Dalc;
        // Convert other necessary fields
    });

    // Colors for each variable
    var colorScale = {
        age: "#1f77b4",
        health: "#ff7f0e",
        Dalc: "#2ca02c",
        G1: "#d62728",
        G2: "#9467bd",
        G3: "#8c564b",
        absences: "#e377c2"
    };

    // Dimensions and margin setup
    var margin = { top: 50, right: 10, bottom: 10, left: 0 },
        width = 1500 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Append the svg object to the div
    var svg = d3.select("#parallel-coordinates")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract the list of dimensions and create a scale for each
    var dimensions = ["age", "health", "Dalc", "G1", "G2", "G3", "absences"];
    var y = {};
    for (i in dimensions) {
        var name = dimensions[i];
        y[name] = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return +d[name]; }))
            .range([height, 0]);
    }

    // Build the X scale -> it find the best position for each Y axis
    var x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    // Draw the lines
    svg.selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", function (d) {
            return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
        })
        .style("fill", "none")
        .style("stroke", "#b866f2")
        .style("opacity", .5);

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset, I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("fill", function (d) { return colorScale[d]; });

    svg.append("text")
        .attr("x", width / 2) // Position at the middle of the width
        .attr("y", 0 - (margin.top / 2)) // Position above the top margin
        .attr("text-anchor", "middle") // Center the text
        .style("font-size", "16px") // Adjust font size as needed
        .style("font-weight", "bold") // Bold font style
        .text("Overview of Important Data"); // Your desired title

    var brush = d3.brushY()
        .extent([[-8, 0], [8, height]])
        .on("brush", brushed);

    dimensions.forEach(function (dimension) {
        svg.append("g")
            .attr("class", "brush")
            .attr("transform", `translate(${x(dimension)},0)`)
            .call(brush);
    });

    function brushed(event) {
        var selection = event.selection || y[dimension].range();
        var newRange = dimensions.map(function (p) {
            return selection.map(y[p].invert, y[p]);
        });
        // Update the display based on the brush selection
    }


});