d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const categoryCounts = {
        "Gender": {
            "Male": {
                "Year 1": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } },
                "Year 2": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } },
                "Year 3": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } },
                "Year 4": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } }
            },
            "Female": {
                "Year 1": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } },
                "Year 2": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } },
                "Year 3": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } },
                "Year 4": { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } }
            }
        }
    };

    data.forEach(student => {
        const gender = student["Choose your gender"];
        const yearOfStudy = student["Your current year of Study"];
        if (categoryCounts["Gender"].hasOwnProperty(gender) && categoryCounts["Gender"][gender].hasOwnProperty(yearOfStudy)) {
            const depression = student["Do you have Depression?"];
            if (categoryCounts["Gender"][gender][yearOfStudy]["Depression"].hasOwnProperty(depression)) {
                categoryCounts["Gender"][gender][yearOfStudy]["Depression"][depression]++;
            }

            const anxiety = student["Do you have Anxiety?"];
            if (categoryCounts["Gender"][gender][yearOfStudy]["Anxiety"].hasOwnProperty(anxiety)) {
                categoryCounts["Gender"][gender][yearOfStudy]["Anxiety"][anxiety]++;
            }

            const panicAttack = student["Do you have Panic attack?"];
            if (categoryCounts["Gender"][gender][yearOfStudy]["Panic Attack"].hasOwnProperty(panicAttack)) {
                categoryCounts["Gender"][gender][yearOfStudy]["Panic Attack"][panicAttack]++;
            }
        }
    });

    const sankeyData = [];
    // Sankey format
    Object.entries(categoryCounts["Gender"]).forEach(([gender, yearData]) => {
        Object.entries(yearData).forEach(([year, mentalHealthData]) => {
            Object.entries(mentalHealthData).forEach(([category, values]) => {
                Object.entries(values).forEach(([value, count]) => {
                    sankeyData.push({
                        source: gender,
                        target: year,
                        value: 1
                    }, {
                        source: year,
                        target: `${category}: ${value}`,
                        value: count
                    });
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

    // Title
    svg.append("text")
        .attr("x", 400)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Students' Gender and Year of Study Influence on Mental Health Conditions");

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
          
});

// Sankey data structure
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
