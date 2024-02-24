function updateCategoryCounts(data, category) {
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

    return categoryCounts[category];
}

function updateBarChart(data, category, update) {
    const categoryCounts = updateCategoryCounts(data, category);
    update(Object.entries(categoryCounts));
}

function generateBarChart(data, category) {
    const margin = { top: 60, right: 120, bottom: 120, left: 60 };
    const width = 840 - margin.left - margin.right;
    const height = 840 - margin.top - margin.bottom;

    const svg = d3.select("#barchart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .nice()
        .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top) + ")")
        .style("text-anchor", "middle")
        .text("CGPA");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of Students");

    // title
    svg.append("text")
        .attr("x", ((width / 2) + 20))
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("id", "chart-title") // dynamic title updating
        .text(`Number of Students with ${category} in Each CGPA`);

    function update(data) {
        x.domain(data.map(d => d[0]));
        y.domain([0, d3.max(data, d => d[1])]);

        svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(yAxis);

        const bars = svg.selectAll(".bar")
            .data(data);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d[1]))
            .attr("fill", "#69b3a2");
    }

    update(Object.entries(updateCategoryCounts(data, category)));
    return update;
}

d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const update = generateBarChart(data, "Depression");

    // button event handlers
    document.getElementById("depression-btn").addEventListener("click", function() {
        document.getElementById("chart-title").textContent = `Number of Students with Depression in Each CGPA`;
        updateBarChart(data, "Depression", update);
    });

    document.getElementById("anxiety-btn").addEventListener("click", function() {
        document.getElementById("chart-title").textContent = `Number of Students with Anxiety in Each CGPA`; 
        updateBarChart(data, "Anxiety", update);
    });

    document.getElementById("panic-attack-btn").addEventListener("click", function() {
        document.getElementById("chart-title").textContent = `Number of Students with Panic Attack in Each CGPA`; 
        updateBarChart(data, "Panic Attack", update);
    });
});