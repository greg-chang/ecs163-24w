d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const categoryCounts = {
        "Depression": {
            "0 - 1.99": 0,
            "2.00 - 2.49": 0,
            "2.50 - 2.99": 0,
            "3.00 - 3.49": 0,
            "3.50 - 4.00": 0,
        },
        "Anxiety": {
            "0 - 1.99": 0,
            "2.00 - 2.49": 0,
            "2.50 - 2.99": 0,
            "3.00 - 3.49": 0,
            "3.50 - 4.00": 0,
        },
        "Panic Attack": {
            "0 - 1.99": 0,
            "2.00 - 2.49": 0,
            "2.50 - 2.99": 0,
            "3.00 - 3.49": 0,
            "3.50 - 4.00": 0,
        }
    };

    data.forEach(student => {
        const cgpa = parseFloat(student["What is your CGPA?"]);
        const depression = student["Do you have Depression?"] === "Yes";
        const anxiety = student["Do you have Anxiety?"] === "Yes";
        const panicAttack = student["Do you have Panic attack?"] === "Yes";

        if (depression) {
            if (cgpa >= 0 && cgpa < 2) {
                categoryCounts["Depression"]["0 - 1.99"]++;
            } else if (cgpa >= 2 && cgpa < 2.5) {
                categoryCounts["Depression"]["2.00 - 2.49"]++;
            } else if (cgpa >= 2.5 && cgpa < 3) {
                categoryCounts["Depression"]["2.50 - 2.99"]++;
            } else if (cgpa >= 3 && cgpa < 3.5) {
                categoryCounts["Depression"]["3.00 - 3.49"]++;
            } else if (cgpa >= 3.5 && cgpa <= 4) {
                categoryCounts["Depression"]["3.50 - 4.00"]++;
            }
        }

        if (anxiety) {
            if (cgpa >= 0 && cgpa < 2) {
                categoryCounts["Anxiety"]["0 - 1.99"]++;
            } else if (cgpa >= 2 && cgpa < 2.5) {
                categoryCounts["Anxiety"]["2.00 - 2.49"]++;
            } else if (cgpa >= 2.5 && cgpa < 3) {
                categoryCounts["Anxiety"]["2.50 - 2.99"]++;
            } else if (cgpa >= 3 && cgpa < 3.5) {
                categoryCounts["Anxiety"]["3.00 - 3.49"]++;
            } else if (cgpa >= 3.5 && cgpa <= 4) {
                categoryCounts["Anxiety"]["3.50 - 4.00"]++;
            }
        }

        if (panicAttack) {
            if (cgpa >= 0 && cgpa < 2) {
                categoryCounts["Panic Attack"]["0 - 1.99"]++;
            } else if (cgpa >= 2 && cgpa < 2.5) {
                categoryCounts["Panic Attack"]["2.00 - 2.49"]++;
            } else if (cgpa >= 2.5 && cgpa < 3) {
                categoryCounts["Panic Attack"]["2.50 - 2.99"]++;
            } else if (cgpa >= 3 && cgpa < 3.5) {
                categoryCounts["Panic Attack"]["3.00 - 3.49"]++;
            } else if (cgpa >= 3.5 && cgpa <= 4) {
                categoryCounts["Panic Attack"]["3.50 - 4.00"]++;
            }
        }
    });

    const margin = { top: 60, right: 120, bottom: 120, left: 60 };
    const width = 840 - margin.left - margin.right;
    const height = 840 - margin.top - margin.bottom;

    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // scale
    const x = d3.scaleBand()
        .range([0, width])
        .domain(Object.keys(categoryCounts["Depression"]))
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(categoryCounts["Depression"]))])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    // bars for depression
    svg.selectAll(".bar-depression")
        .data(Object.entries(categoryCounts["Depression"]))
        .enter().append("rect")
        .attr("class", "bar-depression")
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", x.bandwidth() / 3)
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); })
        .style("fill", "#69b3a2");

    // bars for anxiety
    svg.selectAll(".bar-anxiety")
        .data(Object.entries(categoryCounts["Anxiety"]))
        .enter().append("rect")
        .attr("class", "bar-anxiety")
        .attr("x", function(d) { return x(d[0]) + x.bandwidth() / 3; })
        .attr("width", x.bandwidth() / 3)
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); })
        .style("fill", "#ff9900");

    // bars for panic attack
    svg.selectAll(".bar-panic-attack")
        .data(Object.entries(categoryCounts["Panic Attack"]))
        .enter().append("rect")
        .attr("class", "bar-panic-attack")
        .attr("x", function(d) { return x(d[0]) + (2 * x.bandwidth()) / 3; })
        .attr("width", x.bandwidth() / 3)
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); })
        .style("fill", "#ff0000");

    // count - bar for depression
    svg.selectAll(".text-depression")
        .data(Object.entries(categoryCounts["Depression"]))
        .enter()
        .append("text")
        .attr("class", "text-depression")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d[0]) + x.bandwidth() / 6; })
        .attr("y", function(d) { return y(d[1]) - 5; })
        .text(function(d) { return d[1]; });

    // count - bar for anxiety
    svg.selectAll(".text-anxiety")
        .data(Object.entries(categoryCounts["Anxiety"]))
        .enter()
        .append("text")
        .attr("class", "text-anxiety")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d[0]) + x.bandwidth() / 2; })
        .attr("y", function(d) { return y(d[1]) - 5; })
        .text(function(d) { return d[1]; });

    // count - bar for panic attack
    svg.selectAll(".text-panic-attack")
        .data(Object.entries(categoryCounts["Panic Attack"]))
        .enter()
        .append("text")
        .attr("class", "text-panic-attack")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d[0]) + (5 * x.bandwidth()) / 6; })
        .attr("y", function(d) { return y(d[1]) - 5; })
        .text(function(d) { return d[1]; });

    // title
    svg.append("text")
        .attr("x", ((width / 2) + 20))
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Number of Students with Depression, Anxiety, and Panic Attack in Each CGPA");

    // x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 30)
        .attr("text-anchor", "middle")
        .text("CGPA Category");

    // y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Students");

    // legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width + 10 ) + "," + (height - margin.left) + ")");

    const legendItems = [
        { label: "Depression", color: "#69b3a2" },
        { label: "Anxiety", color: "#ff9900" },
        { label: "Panic Attack", color: "#ff0000" }
        ];

    const legendSpacing = 20;
    const legendRectSize = 10;

    legend.selectAll("rect")
        .data(legendItems)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) { return i * legendSpacing; })
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", function(d) { return d.color; });

    legend.selectAll("text")
        .data(legendItems)
        .enter()
        .append("text")
        .attr("x", legendRectSize + 5)
        .attr("y", function(d, i) { return i * legendSpacing + legendRectSize / 2; })
        .attr("dy", "0.35em")
        .text(function(d) { return d.label; });
});
