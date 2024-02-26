d3.csv("data/StudentMentalHealth.csv").then(function(data) {
    const counts = {
        "Depression": 0,
        "Depression and Anxiety": 0,
        "Depression and Anxiety and Panic Attack": 0,
        "Anxiety": 0,
        "Anxiety and Panic Attack": 0,
        "Panic Attack": 0
    };
    data.forEach(student => {
        const depression = student["Do you have Depression?"] === "Yes";
        const anxiety = student["Do you have Anxiety?"] === "Yes";
        const panicAttack = student["Do you have Panic attack?"] === "Yes";

        if (depression && anxiety && panicAttack) {
            counts["Depression and Anxiety and Panic Attack"]++;
        } else if (depression && anxiety) {
            counts["Depression and Anxiety"]++;
        } else if (anxiety && panicAttack) {
            counts["Anxiety and Panic Attack"]++;
        } else if (depression) {
            counts["Depression"]++;
        } else if (anxiety) {
            counts["Anxiety"]++;
        } else if (panicAttack) {
            counts["Panic Attack"]++;
        }
    });
    const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));

    // sot by occurences
    pieData.sort((a, b) => b.value - a.value);

    // compute values
    const N = d3.map(pieData, d => d.name);
    const V = d3.map(pieData, d => d.value);
    const I = d3.range(N.length).filter(i => !isNaN(V[i]));

    const names = N;
    const colors = d3.schemeCategory10;

    // scales.
    const color = d3.scaleOrdinal(names, colors);

    // titles
    const title = i => `${N[i]}\n${V[i]}`;

    // arc
    const arcs = d3.pie().padAngle(0).sort(null).value(i => V[i])(I);
    const arc = d3.arc().innerRadius(0).outerRadius(Math.min(540, 400) / 2);

    const svg = d3.create("svg")
        .attr("width", 860)
        .attr("height", 900) 
        .attr("viewBox", [-640 / 2, -460 / 2, 640, 460])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    // title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -220) 
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Distbution of Student's Mental Health Conditions");

    // total count
    const totalCount = Object.values(counts).reduce((acc, cur) => acc + cur, 0);

    // legend 
    const legend = svg.append("g")
        .attr("transform", "translate(-260, 180)"); 

    names.forEach((name, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("x", -15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color(name));

        // count with name and color
        const count = counts[name];
        legendItem.append("text")
            .attr("x", 5) 
            .attr("y", -1.5) 
            .attr("dy", "0.7em")
            .text(`${name}: ${count}/${totalCount}`);
    });

    // slices
    svg.append("g")
        .selectAll("path")
        .data(arcs)
        .join("path")
        .attr("fill", d => color(N[d.data]))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("d", arc)
        .append("title")
        .text(d => title(d.data));

    // labels inside slice
    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .selectAll("tspan")
        .data(d => {
            const lines = `${title(d.data)}`.split(/\n/);
            return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
        })
        .join("tspan")
        .attr("x", 0)
        .attr("y", (_, i) => `${i * 1.1}em`)
        .attr("font-weight", (_, i) => i ? null : "bold")
        .text(d => d);

    document.body.appendChild(svg.node());
});