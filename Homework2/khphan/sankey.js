function capitalize(word) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
}

d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const categoryCounts = {};

    data.forEach(student => {
        const gender = student["Choose your gender"];
        const yearOfStudy = capitalize(student["Your current year of Study"]);
        const cgpa = `CGPA: ${student["What is your CGPA?"]}`;

        if (!categoryCounts[gender]) {
            categoryCounts[gender] = {};
        }
        if (!categoryCounts[gender][yearOfStudy]) {
            categoryCounts[gender][yearOfStudy] = {};
        }
        if (!categoryCounts[gender][yearOfStudy][cgpa]) {
            categoryCounts[gender][yearOfStudy][cgpa] = { "Depression": { "Yes": 0, "No": 0 }, "Anxiety": { "Yes": 0, "No": 0 }, "Panic Attack": { "Yes": 0, "No": 0 } };
        }

        const depression = student["Do you have Depression?"];
        const anxiety = student["Do you have Anxiety?"];
        const panicAttack = student["Do you have Panic attack?"];

        categoryCounts[gender][yearOfStudy][cgpa]["Depression"][depression]++;
        categoryCounts[gender][yearOfStudy][cgpa]["Anxiety"][anxiety]++;
        categoryCounts[gender][yearOfStudy][cgpa]["Panic Attack"][panicAttack]++;
    });

    const sankeyData = [];

    // Sankey format
    Object.entries(categoryCounts).forEach(([gender, genderData]) => {
        Object.entries(genderData).forEach(([yearOfStudy, yearData]) => {
            Object.entries(yearData).forEach(([cgpa, cgpaData]) => {
                Object.entries(cgpaData).forEach(([category, values]) => {
                    Object.entries(values).forEach(([value, count]) => {
                        sankeyData.push({
                            source: gender,
                            target: yearOfStudy,
                            value: 1
                        }, {
                            source: yearOfStudy,
                            target: cgpa,
                            value: 1
                        }, {
                            source: cgpa,
                            target: `${category}: ${value}`,
                            value: count
                        });
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
        .attr("height", 700)

    // Title
    svg.append("text")
        .attr("x", 435)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Students' Gender, Year of Study, and CGPA Influence on Mental Health Conditions");

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

    
    // Extract categories and corresponding colors
    const uniqueCategories = [...new Set(sankeyData.map(data => data.target))];
    const categoryColors = {};
    uniqueCategories.forEach((category, index) => {
        categoryColors[category] = color(category);
    });

    // Parse categories 
    const parsedCategories = uniqueCategories.map(category => {
        let [gender, year, cgpa, condition] = category.split(" > ");
        if (condition !== "Depression" && condition !== "Anxiety" && condition !== "Panic Attack") {
            condition = "Mental Health";
        }
        return { category, gender, year, cgpa, condition };
    });

    // Sort parsed categories
    parsedCategories.sort((a, b) => {
        if (a.gender !== b.gender) {
            return a.gender.localeCompare(b.gender);
        }
        if (a.year !== b.year) {
            return a.year.localeCompare(b.year);
        }
        if (a.cgpa !== b.cgpa) {
            return a.cgpa.localeCompare(b.cgpa);
        }
        return a.condition.localeCompare(b.condition);
    });

    // legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(730,60)")
        .selectAll("g")
        .data(parsedCategories)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", d => categoryColors[d.category]);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d.category);

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