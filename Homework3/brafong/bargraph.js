//BAR CHART 
d3.csv("student-mat.csv").then(function (data) {
    data.forEach(function (d) {
        d.age = +d.age;
        d.G3 = +d.G3;
    });

    // AGGREGATE DATA
    var ageCounts = d3.rollups(data, v => v.length, d => d.age)
        .sort((a, b) => d3.ascending(a[0], b[0])); // Sort by age

    // DIMENSION/MARGIN
    var margin = { top: 80, right: 50, bottom: 70, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // APPEND SVG OBJECT TO DIV
    var svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X-AXIS
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
        .attr("transform", `translate(${width / 2}, ${height + margin.top - 45})`)
        .style("text-anchor", "middle")
        .text("Age");

    // Y-AXIS
    var y = d3.scaleLinear()
        .domain([0, d3.max(ageCounts, d => d[1])])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Students");

    // BARS
    svg.selectAll(".bar")
        .data(ageCounts)
        .join("rect")
        .attr("class", "bar") // Use class for styling and selection
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

    // HIGHLIGHT BARS
    const highlightClass = "highlighted-bar";
    let highlightedData = [];

    function updateComparativeAnalysis() {
        if (highlightedData.length > 0) {
            const totalStudents = highlightedData.reduce((acc, curr) => acc + curr.count, 0);
            const averageStudyTime = highlightedData.reduce((acc, curr) => acc + (curr.avgStudyTime * curr.count), 0) / totalStudents;
    
            document.getElementById("comparative-analysis").textContent =
                `Comparative Analysis: Total Highlighted Students = ${totalStudents}, Average Study Time = ${averageStudyTime.toFixed(2)}`;
        } 
        else {
            document.getElementById("comparative-analysis").textContent = "Select bars to see detailed information.";
        }
    }

    // CLICK EVENT LISTENER
    svg.selectAll(".bar")
        .on("click", function (event, d) {
            const currentBar = d3.select(this);
            const isHighlighted = currentBar.classed(highlightClass);
            const age = d[0];

            // TOGGLE HIGHLIGHT
            currentBar.classed(highlightClass, !isHighlighted);
            currentBar.style("fill", isHighlighted ? "#1873a8" : "orange");

            // UPDATE HIGHLIGHT
            if (!isHighlighted) {
                const studentsInAgeGroup = data.filter(student => student.age === age);
                const averageStudyTime = d3.mean(studentsInAgeGroup, student => student.studytime);
                highlightedData.push({ age: age, count: studentsInAgeGroup.length, avgStudyTime: averageStudyTime });
            } else {
                highlightedData = highlightedData.filter(item => item.age !== d[0]);
            }

            updateComparativeAnalysis();
        });

});