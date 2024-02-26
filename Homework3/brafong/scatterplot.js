//SCATTER PLOT
d3.csv("student-mat.csv").then(function (data) {
    // Convert numerical values from strings to numbers
    data.forEach(function (d) {
        d.absences = +d.absences;
        d.G3 = +d.G3;
    });

    // DIMENSION/MARGIN
    var margin = { top: 80, right: 20, bottom: 30, left: 40 },
        width = 750 - margin.left - margin.right,
        height = 560 - margin.top - margin.bottom;

    var zoom = d3.zoom()
        .scaleExtent([1, 40])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // APPEND SVG OBJECT TO DIV
    var svg = d3.select("#scatter-plot") 
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X-AXIS
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.absences; }))
        .range([0, width]);

    var gX = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x axis")
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top - 50})`)
        .style("text-anchor", "middle")
        .text("Absences");

    // Y-AXIS
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.G3; })])
        .range([height, 0]);
    
    var gY = svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("G3 (Final Grade)");

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    // DOTS ON PLOT  
    svg.append("clipPath") // Append a new clipPath element
        .attr("id", "chart-area") // Assign an ID to reference later
        .append("rect") // Append a rectangle to serve as the clipping area
        .attr("width", width) // Set the width to match the chart's width
        .attr("height", height) // Set the height to match the chart's height
        .attr("x", -1.75);

    var circles = svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("clip-path", "url(#chart-area)")
        .attr("cx", function (d) { return x(d.absences); })
        .attr("cy", function (d) { return y(d.G3); })
        .attr("r", 3) // Radius of dots
        .style("fill", function (d) {
            if (d.G3 >= 0 && d.G3 <= 10) return "red";
            else if (d.G3 >= 11 && d.G3 <= 15) return "#d4a10d";
            else if (d.G3 >= 16 && d.G3 <= 20) return "#24cf1b";
            else return "grey";
        })

        // ZOOM FUNCTION
        function zoomed(event) {
            var newX = event.transform.rescaleX(x);
            var newY = event.transform.rescaleY(y);
            
            // UPDATE AXIS + DOT SIZE
            gX.call(d3.axisBottom(newX));
            gY.call(d3.axisLeft(newY));
            var newRadius = Math.sqrt(event.transform.k) * 3;
            
            // UPDATE CIRCLE POSITION
            circles.attr("cx", function(d) { return newX(d.absences); })
                   .attr("cy", function(d) { return newY(d.G3); })
                   .attr("r", newRadius);                
        }

    // LEGEND
    svg.append("text")
        .attr("x", width / 2) // Position at the middle of the width
        .attr("y", 0 - (margin.top / 2)) // Position above the top margin
        .attr("text-anchor", "middle") // Center the text
        .style("font-size", "16px") // Adjust font size as needed
        .style("font-weight", "bold") // Bold font style
        .text("Number of Absences Compared to Final Grade(G3)"); // Your desired title
    
    // MOUSE OVER DOTS FOR MORE INFORMATION
    var tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none");

    circles.on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200) // Smooth transition to visible
            .style("opacity", 0.9); // Make tooltip visible
        tooltip.html("Absences: " + d.absences + "<br/>Grade 1: " + d.G1 + "<br/>Grade 2: " + d.G2 + "<br/>Grade 3 (Final): " + d.G3) // Update tooltip content
            .style("left", (event.pageX + 10) + "px") // Position tooltip to the right of the cursor
            .style("top", (event.pageY - 15) + "px"); // Position tooltip above the cursor
    })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0); // Fade out tooltip
        });

});