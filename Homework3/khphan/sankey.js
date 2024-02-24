const colorMapping = {
    "Male": "#9E2A2B",
    "Female": "#F0D3F7",
    "Year 1": "#FFF3B0",
    "Year 2": "#335C67",
    "Year 3": "#CDE7BE",
    "Year 4": "#0FF4C6",
    "CGPA: 0 - 1.99": "#4C2B36",
    "CGPA: 2.00 - 2.49": "#5465FF",
    "CGPA: 2.50 - 2.99": "#96C0B7",
    "CGPA: 3.00 - 3.49": "#C81D25",
    "CGPA: 3.50 - 4.00": "#BFC0C0",
};

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
            categoryCounts[gender][yearOfStudy][cgpa] = { "Mental Health": { "Yes": 0, "No": 0 } };
        }

        const depression = student["Do you have Depression?"];
        const anxiety = student["Do you have Anxiety?"];
        const panicAttack = student["Do you have Panic attack?"];

        categoryCounts[gender][yearOfStudy][cgpa]["Mental Health"]["Yes"] += (depression === "Yes" ? 1 : 0) + (anxiety === "Yes" ? 1 : 0) + (panicAttack === "Yes" ? 1 : 0);
        categoryCounts[gender][yearOfStudy][cgpa]["Mental Health"]["No"] += (depression === "No" ? 1 : 0) + (anxiety === "No" ? 1 : 0) + (panicAttack === "No" ? 1 : 0);
    });

    const sankeyData = [];

    Object.entries(categoryCounts).forEach(([gender, genderData]) => {
        Object.entries(genderData).forEach(([yearOfStudy, yearData]) => {
            Object.entries(yearData).forEach(([cgpa, cgpaData]) => {
                const totalDepression = cgpaData["Mental Health"]["Yes"];
                const totalAnxiety = cgpaData["Mental Health"]["Yes"];
                const totalPanicAttack = cgpaData["Mental Health"]["Yes"];
    
                // create a link for each combination
                sankeyData.push({
                    source: gender,
                    target: yearOfStudy,
                    value: totalDepression + totalAnxiety + totalPanicAttack
                });
                sankeyData.push({
                    source: yearOfStudy,
                    target: cgpa,
                    value: totalDepression + totalAnxiety + totalPanicAttack
                });
            });
        });
    });
    
    const { nodes, links } = generateSankeyData(sankeyData);
    const color = d3.scaleOrdinal().domain(Object.keys(colorMapping)).range(Object.values(colorMapping));

    const svg = d3.select("body")
        .append("svg")
        .attr("width", 1300)
        .attr("height", 900);

    // title
    svg.append("text")
        .attr("x", 435)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Students' Gender, Year of Study, and CGPA Influence on Mental Health Conditions");

    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 60], [1250 - 100, 850 - 5]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey({ nodes, links });

    // tooltip for displaying values
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // append links
    svg.append("g")
        .lower()
        .selectAll("path")
        .data(sankeyLinks)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => color(d.source.name))
        .attr("stroke-opacity", 0.5)
        .attr("fill", "none")
        .attr("stroke-width", d => Math.max(1, d.width));

    // append nodes
    svg.append("g")
        .selectAll("rect")
        .data(sankeyNodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => color(d.name))

    // append text nodes
    svg.append("g")
        .selectAll("text")
        .data(sankeyNodes)
        .join("text")
        .attr("x", d => (d.x0 < 400) ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 < 400) ? "start" : "end")
        .text(d => d.name)
        .attr("font-weight", "bold")
        .style("font-size", "16px");

    const uniqueCategories = [...new Set(Object.keys(colorMapping).concat(sankeyData.map(data => data.target)))];
    const categoryColors = {};
    uniqueCategories.forEach((category, index) => {
        categoryColors[category] = colorMapping[category] || color(category);
    });
    
    const parsedCategories = uniqueCategories.map(category => {
        let [gender, year, cgpa, condition] = category.split(" > ");
        if (condition !== "Depression" && condition !== "Anxiety" && condition !== "Panic Attack") {
            condition = "Mental Health";
        }
        return { category, gender, year, cgpa, condition };
    });
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(1160,60)")
        .selectAll("g")
        .data(parsedCategories)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => categoryColors[d.category]);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d.category);
        
    const brush = d3.brush()
    .extent([[0, 0], [1250, 850]]) 
    .on("start brush", brushed) 
    .on("end", brushended); 


    svg.append("g")
    .attr("class", "brush")
    .call(brush);

    // linking brush with tooltip
    function brushed(event) {
        const selection = event.selection;
        if (selection === null) return;

        const [[x0, y0], [x1, y1]] = selection;

        let totalValue = 0;
        svg.selectAll("path")
            .attr("stroke-opacity", 0.1) 
            .filter(d => {
                const xMid = (d.source.x1 + d.target.x0) / 2; 
                const yMid = (d.source.y0 + d.target.y1) / 2; 
                return x0 <= xMid && xMid <= x1 && y0 <= yMid && yMid <= y1;
            })
            .attr("stroke-opacity", 0.8) 
            .each(d => totalValue += d.value); 
        const [mouseX, mouseY] = d3.pointer(event);

    
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Total: ${totalValue}`)
            .style("left", (mouseX + 10) + "px") 
            .style("top", (mouseY - 28) + "px"); 
    }

    function brushended(event) {
        if (event.selection === null) {
            svg.selectAll("path").attr("stroke-opacity", 0.5); 
            tooltip.transition()
                .duration(500)
                .style("opacity", 0); 
        }
    }
        
});

function generateSankeyData(data) {
    const nodesMap = new Map();
    let id = 0;

    const nodes = [];
    const links = data.map(({ source, target, value }) => ({
        source: nodesMap.get(source) !== undefined ? nodesMap.get(source) : nodesMap.set(source, id++).get(source),
        target: nodesMap.get(target) !== undefined ? nodesMap.get(target) : nodesMap.set(target, id++).get(target),
        value,
    }));

    nodesMap.forEach((index, name) => {
        nodes.push({ name });
    });

    return { nodes, links };
}

function capitalize(word) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
}
