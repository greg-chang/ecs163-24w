d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const categoryCounts = {
        "Depression": {
            "Depression": 0,
            "Depression and Anxiety": 0,
            "Depression and Panic Attack": 0,
            "Depression and Anxiety and Panic Attack": 0
        },
        "Anxiety": {
            "Anxiety": 0,
            "Depression and Anxiety": 0,
            "Anxiety and Panic Attack": 0,
            "Depression and Anxiety and Panic Attack": 0
        },
        "Panic Attack": {
            "Panic Attack": 0,
            "Depression and Panic Attack": 0,
            "Anxiety and Panic Attack": 0,
            "Depression and Anxiety and Panic Attack": 0
        }
    };

    data.forEach(student => {
        const depression = student["Do you have Depression?"] === "Yes";
        const anxiety = student["Do you have Anxiety?"] === "Yes";
        const panicAttack = student["Do you have Panic attack?"] === "Yes";

        // iterate through each category and its combinations of conditions
        Object.keys(categoryCounts).forEach(category => {
            const conditions = [depression, anxiety, panicAttack];
            const conditionsStr = ["Depression", "Anxiety", "Panic Attack"].filter((_, i) => conditions[i]).join(" and ");

            categoryCounts[category][conditionsStr]++;
        });
    });

    function generatePieChart(category) {
        document.getElementById("piechart-containers").innerHTML = "";

        const countsData = Object.entries(categoryCounts[category]).map(([name, value]) => ({ name, value }));
        const filteredData = countsData.filter(d => d.value > 0);
        const arcs = d3.pie().sort(null).value(d => d.value)(filteredData);

        const color = d3.scaleOrdinal()
            .domain(filteredData.map(d => d.name))
            .range(d3.schemeCategory10);

        // append svg
        const svg = d3.create("svg")
            .attr("width", 860)
            .attr("height", 750)
            .attr("viewBox", [-640 / 2, -460 / 2, 640, 460])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        svg.append("text")
            .attr("x", -80)
            .attr("y", -250)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .text(`Distribution of ${category} Among Students`);

        const arc = d3.arc().innerRadius(0).outerRadius(Math.min(540, 400) / 2);

        svg.selectAll("path")
            .data(arcs)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.name))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("transform", "translate(0,0)") 

            // transitions
            .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const i = d3.interpolate(d.startAngle, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return arc(d);
                };
            });

        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(arcs)
            .enter()
            .append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .selectAll("tspan")
            .data(d => {
                const lines = `${d.data.name}\n${d.data.value}`; 
                return lines.split(/\n/);
            })
            .enter()
            .append("tspan")
            .attr("x", 0)
            .attr("dy", (_, i) => i === 0 ? "-0.7em" : "1.1em") 
            .text(d => d);

        // legend
        const legend = svg.append("g")
            .attr("transform", "translate(-300, 190)")
            .selectAll("g")
            .data(filteredData)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => color(d.name));

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d.name);

        // append to container
        document.getElementById("piechart-containers").appendChild(svg.node());
    }

    generatePieChart("Depression");

    // button event handlers
    document.getElementById("depression-btns").addEventListener("click", function() {
        generatePieChart("Depression");
    });

    document.getElementById("anxiety-btns").addEventListener("click", function() {
        generatePieChart("Anxiety");
    });

    document.getElementById("panic-attack-btns").addEventListener("click", function() {
        generatePieChart("Panic Attack");
    });
});