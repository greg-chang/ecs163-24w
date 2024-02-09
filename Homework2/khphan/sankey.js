d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const students = data;
    const categoryCounts = {
        "Gender": {
            "Male": {
                "Depression": { "Yes": 0, "No": 0 },
                "Anxiety": { "Yes": 0, "No": 0 },
                "Panic Attack": { "Yes": 0, "No": 0 }
            },
            "Female": {
                "Depression": { "Yes": 0, "No": 0 },
                "Anxiety": { "Yes": 0, "No": 0 },
                "Panic Attack": { "Yes": 0, "No": 0 }
            }
        }
    };

    students.forEach(student => {
        const gender = student["Choose your gender"];
        if (categoryCounts["Gender"].hasOwnProperty(gender)) {
            const depression = student["Do you have Depression?"];
            if (categoryCounts["Gender"][gender]["Depression"].hasOwnProperty(depression)) {
                categoryCounts["Gender"][gender]["Depression"][depression]++;
            }

            const anxiety = student["Do you have Anxiety?"];
            if (categoryCounts["Gender"][gender]["Anxiety"].hasOwnProperty(anxiety)) {
                categoryCounts["Gender"][gender]["Anxiety"][anxiety]++;
            }

            const panicAttack = student["Do you have Panic attack?"];
            if (categoryCounts["Gender"][gender]["Panic Attack"].hasOwnProperty(panicAttack)) {
                categoryCounts["Gender"][gender]["Panic Attack"][panicAttack]++;
            }
        }
    });

    const sankeyData = [];
    // sankey format
    Object.entries(categoryCounts["Gender"]).forEach(([gender, counts]) => {
        Object.entries(counts).forEach(([category, values]) => {
            Object.entries(values).forEach(([value, count]) => {
                sankeyData.push({
                    source: gender,
                    target: `${category}: ${value}`,
                    value: count
                });
            });
        });
    });

    const { nodes, links } = generateSankeyData(sankeyData);
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select("body")
        .append("svg")
        .attr("width", 900)
        .attr("height", 700);

    // title
    svg.append("text")
        .attr("x", 400)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Students' Gender Influence on Mental Health Conditions");

    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 60], [900 - 200, 700 - 5]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey({ nodes, links });

    svg.append("g")
        .selectAll("rect")
        .data(sankeyNodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => color(d.name));

    svg.append("g")
        .selectAll("text")
        .data(sankeyNodes)
        .join("text")
        .attr("x", d => (d.x0 < 400) ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 < 400) ? "start" : "end")
        .text(d => d.name)
        .style("font-size", "14px");

    svg.append("g")
        .selectAll("path")
        .data(sankeyLinks)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .attr("fill", "none")
        .attr("stroke-width", d => Math.max(1, d.width));

    // legends
    const legend = svg.append("g")
        .attr("transform", "translate(720, 425)");
    let offsetY = 0;
    Object.entries(categoryCounts["Gender"]).forEach(([gender, counts]) => {
        legend.append("text")
            .attr("x", 0)
            .attr("y", offsetY)
            .text(gender)
            .attr("font-weight", "bold");

        offsetY += 20;

        Object.entries(counts).forEach(([category, values]) => {
            Object.entries(values).forEach(([value, count]) => {
                legend.append("text")
                    .attr("x", 00)
                    .attr("y", offsetY)
                    .text(`${category}: ${value} (${count})`);

                offsetY += 20;
            });
        });

        offsetY += 10;
    });
});

// sankey data structure
function generateSankeyData(data) {
    const nodesMap = new Map();
    let id = 0;

    const nodes = [];
    const links = data.map(({ source, target, value }) => ({
        source: nodesMap.get(source) !== undefined ? nodesMap.get(source) : nodesMap.set(source, id++).get(source),
        target: nodesMap.get(target) !== undefined ? nodesMap.get(target) : nodesMap.set(target, id++).get(target),
        value
    }));

    nodesMap.forEach((index, name) => {
        nodes.push({ name });
    });

    return { nodes, links };
}