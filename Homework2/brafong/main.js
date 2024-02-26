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
        .style("fill", function(d) { return colorScale[d]; });

        svg.append("text")
    .attr("x", width / 2) // Position at the middle of the width
    .attr("y", 0 - (margin.top / 2)) // Position above the top margin
    .attr("text-anchor", "middle") // Center the text
    .style("font-size", "16px") // Adjust font size as needed
    .style("font-weight", "bold") // Bold font style
    .text("Overview of Important Data"); // Your desired title
});

//BAR CHART 
d3.csv("student-mat.csv").then(function (data) {
    // Convert numerical values from strings to numbers
    data.forEach(function (d) {
        d.age = +d.age; // Ensure age is treated as a number
    });

    // Aggregate data for bar chart: count per age group
    var ageCounts = d3.rollups(data, v => v.length, d => d.age)
        .sort((a, b) => d3.ascending(a[0], b[0])); // Sort by age

    // Set the dimensions and margins of the graph
    var margin = { top: 80, right: 50, bottom: 70, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    var svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis: scale and draw
    var x = d3.scaleBand()
        .range([0, width])
        .domain(ageCounts.map(d => d[0]))
        .padding(.1);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top - 15})`)
        .style("text-anchor", "middle")
        .text("Age");

    // Y axis: scale and draw
    var y = d3.scaleLinear()
        .domain([0, d3.max(ageCounts, d => d[1])])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Students");

    // Bars
    svg.selectAll("mybar")
        .data(ageCounts)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[1]))
        .attr("fill", "#1873a8");

        svg.append("text")
        .attr("x", width / 2) // Position at the middle of the width
        .attr("y", 0 - (margin.top / 2)) // Position above the top margin
        .attr("text-anchor", "middle") // Center the text
        .style("font-size", "16px") // Adjust font size as needed
        .style("font-weight", "bold") // Bold font style
        .text("Age Demographic of all the Students"); // Your desired title
});

//SCATTER PLOT
d3.csv("student-mat.csv").then(function (data) {
    // Convert numerical values from strings to numbers
    data.forEach(function (d) {
        d.absences = +d.absences;
        d.G3 = +d.G3;
    });

    // Set the dimensions and margins of the graph
    var margin = { top: 80, right: 20, bottom: 30, left: 40 },
        width = 750 - margin.left - margin.right,
        height = 560 - margin.top - margin.bottom;

    // Append the SVG object to the div
    var svg = d3.select("#scatter-plot") // Consider changing the ID to "scatter-plot" or similar for clarity
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.absences; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top - 50})`)
        .style("text-anchor", "middle")
        .text("Absences");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.G3; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("G3 (Final Grade)");


    // Add dots
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.absences); })
        .attr("cy", function (d) { return y(d.G3); })
        .attr("r", 3) // Radius of dots
        .style("fill", function(d) {
            if(d.G3 >= 0 && d.G3 <= 10) return "red";
            else if(d.G3 >= 11 && d.G3 <= 15) return "#d4a10d";
            else if(d.G3 >= 16 && d.G3 <= 20) return "#24cf1b";
            else return "grey";       
    })

    svg.append("text")
    .attr("x", width / 2) // Position at the middle of the width
    .attr("y", 0 - (margin.top / 2)) // Position above the top margin
    .attr("text-anchor", "middle") // Center the text
    .style("font-size", "16px") // Adjust font size as needed
    .style("font-weight", "bold") // Bold font style
    .text("Number of Absences Compared to Final Grade(G3)"); // Your desired title
    
});
