d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    console.log(data);
    const cgpaDepressedCount = {
        "0 - 1.99": 0,
        "2.00 - 2.49": 0,
        "2.50 - 2.99": 0,
        "3.00 - 3.49": 0,
        "3.50 - 4.00": 0,
    };

    data.forEach(student => {
        const cgpa = parseFloat(student["What is your CGPA?"]);
        const depression = student["Do you have Depression?"] === "Yes";

        if (depression) {
            if (cgpa >= 0 && cgpa < 2) {
                cgpaDepressedCount["0 - 1.99"]++;
            } else if (cgpa >= 2 && cgpa < 2.5) {
                cgpaDepressedCount["2.00 - 2.49"]++;
            } else if (cgpa >= 2.5 && cgpa < 3) {
                cgpaDepressedCount["2.50 - 2.99"]++;
            } else if (cgpa >= 3 && cgpa < 3.5) {
                cgpaDepressedCount["3.00 - 3.49"]++;
            } else if (cgpa >= 3.5 && cgpa <= 4) {
                cgpaDepressedCount["3.50 - 4.00"]++;
            }
        }
    });

    const margin = { top: 70, right: 30, bottom: 120, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 900 - margin.top - margin.bottom;

    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //scale
    const x = d3.scaleBand()
        .range([0, width])
        .domain(Object.keys(cgpaDepressedCount))
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(cgpaDepressedCount))])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));
    
    // bar
    svg.selectAll("bar")
        .data(Object.entries(cgpaDepressedCount))
        .enter().append("rect")
        .style("fill", "#69b3a2")
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); });

    // count bar 
    svg.selectAll("text.bar")
        .data(Object.entries(cgpaDepressedCount))
        .enter()
        .append("text")
        .attr("class", "bar")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d[0]) + x.bandwidth() / 2; })
        .attr("y", function(d) { return y(d[1]) - 5; })
        .text(function(d) { return d[1]; });

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Number of Depressed Students in Each CGPA");

    // x - axis
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 30)
        .attr("text-anchor", "middle")
        .text("CGPA Category");

    // y - axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Depressed Students");

});