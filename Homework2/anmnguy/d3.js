
// Load the CSV data
d3.csv("studentMentalHealth.csv").then(rawData => {
    console.log(rawData);

    // rawData.forEach(d => {
    //     d["Do you have Depression?"] = d["Do you have Depression?"] === "Yes" ? 1 : 0;
    //     d["Do you have Anxiety?"] = d["Do you have Anxiety?"] === "Yes" ? 1 : 0;
    //     d["Do you have Panic attack?"] = d["Do you have Panic attack?"] === "Yes" ? 1 : 0;
    // });
    let aggregatedData = d3.rollup(rawData, 
        v => ({
          Depression: d3.sum(v, d => d["Do you have Depression?"]),
          Anxiety: d3.sum(v, d => d["Do you have Anxiety?"]),
          PanicAttack: d3.sum(v, d => d["Do you have Panic attack?"])
        }), 
        d => d["Your current year of Study"]);

    let dataArray = Array.from(aggregatedData, ([key, value]) => ({
            category: key,
            Depression: value.Depression,
            Anxiety: value.Anxiety,
            PanicAttack: value.PanicAttack
    }));
        
    let stack = d3.stack().keys(["Depression", "Anxiety", "PanicAttack"]);

    let stackedData = stack(dataArray);

    // Assuming margins are defined, update these as necessary
    const genderCounts = d3.rollup(rawData, v => v.length, d => d["Choose your gender"]);

   // const yearCount = d3.rollup(rawData, v => v.length, d => d["Your current year of Study"]);

    const svg = d3.select("svg")
    // Select the existing SVG and append a 'g' element for the pie chart
    // plot 1
    const g1 = svg.append("g")
                .attr("transform", "translate(300,200)")
    const pie = d3.pie().value(d => d[1]);
    const data_ready = pie(Array.from(genderCounts));

    const arc = d3.arc().innerRadius(0).outerRadius(100);

    const color2 = d3.scaleOrdinal()
        .domain(Array.from(genderCounts, d => d[0]))
        .range(["#6f8ab1", "#f0ab8d"]); // Assigning colors

    // Append slices to the pie chart
    g1.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color2(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add title
    g1.append("text")
       .attr("x", 0) 
       .attr("y", -150) // Adjust based on your SVG's layout
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("Gender Distribution");

    // Add legend
    const legend = g1.selectAll(".legend")
       .data(color2.domain())
       .enter().append("g")
       .attr("class", "legend")
       .attr("transform", (d, i) => "translate(0," + (i * 20 - 100) + ")"); // Adjust for layout

    legend.append("rect")
       .attr("x", -200) // Adjust based on your SVG's layout
       .attr("width", 18)
       .attr("height", 18)
       .style("fill", color2);

    legend.append("text")
       .attr("x", -175) // Adjust based on positioning
       .attr("y", 9)
       .attr("dy", ".35em")
       .style("text-anchor", "start")
       .text(d => d);

    //plot 2
    let margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // Scale for the x-axis
    const x = d3.scaleBand()
    .domain(dataArray.map(d => d.category))
    .rangeRound([0, width])
    .padding(0.1);

    // Scale for the y-axis
    const y = d3.scaleLinear()
    .domain([0, d3.max(dataArray, d => d.Depression + d.Anxiety + d.PanicAttack)])
    .range([height, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
    .domain(["Depression", "Anxiety", "PanicAttack"])
    .range(["#6f8ab1", "#f0ab8d", "#a3a3a3"]);

    // Append groups and draw the bars
    const bars = svg.selectAll(".category")
    .data(stackedData)
    .enter().append("g")
    .attr("class", "category")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => x(d.data.category))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());

    // Add the x-axis
    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

    // Add the y-axis
    svg.append("g")
    .call(d3.axisLeft(y));


}).catch(function(error){
    console.log(error);
});
