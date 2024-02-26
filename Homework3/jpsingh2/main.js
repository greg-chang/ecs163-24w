// Define window dimensions
const width = window.innerWidth;
const height = window.innerHeight;

// Define margins and dimensions for the scatter plot
const scatterMargin = {
    top : 10,
    right : 30,
    bottom : 30,
    left : 60
};
const scatterWidth = 750 - scatterMargin.left - scatterMargin.right;
const scatterHeight = 450 - scatterMargin.top - scatterMargin.bottom;
const scatterRight = 1400;
const scatterTop = 75;

// Define margins and dimensions for the bar chart
const barMargin = {
    top : 10,
    right : 30,
    bottom : 30,
    left : 60
};
const barWidth = 700 - barMargin.left - barMargin.right;
const barHeight = 450 - barMargin.top - barMargin.bottom;
const barLeft = 250;
const barTop = 75;

// Define margins and dimensions for the Parallel Coordinates Chart
const parallelMargin = {
    top : 20,
    right : 10,
    bottom : 10,
    left : 0
};
const parallelWidth = width - parallelMargin.left - parallelMargin.right;
const parallelHeight =
    height / 2 - parallelMargin.top - parallelMargin.bottom - 50;
const parallelTop = 75 + barHeight + 100;

// Legend setup
const legendSpacing = 12;
const legendRectSize = 10;

// Legend Creation Function
const highlightOpacity = 1;
const dimOpacity = 0.1;

let globalState = {
    selectedDataPoints : new Set(),
    activeGraph : null, // Identifier for the active graph (e.g., 'graph1',
                        // 'graph2', 'graph3')
};

function createLegend(selector, colorMap, position) {
    // Create SVG element for the legend
    const legendSvg = d3.select(selector)
                          .append("svg")
                          .attr("width", 200)
                          .attr("height", Object.keys(colorMap).length *
                                              (legendRectSize + legendSpacing))
                          .style("position", "absolute")
                          .style("left", `${position.left}px`)
                          .style("top", `${position.top}px`);

    // Create legend items
    const legend =
        legendSvg.selectAll(".legend")
            .data(Object.entries(colorMap))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform",
                  (d, i) =>
                      `translate(0, ${i * (legendRectSize + legendSpacing)})`);

    legend.append("rect")
        .attr("x", 10)
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", d => d[1]);

    legend.append("text")
        .attr("x", 10 + legendRectSize + 5)
        .attr("y", legendRectSize / 2)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d[0]);
}

// Load and Parse Pokemon data
d3.csv("data/pokemon.csv")
    .then(data => {
        data.forEach(d => {
            Object.keys(d).forEach(
                key => { d[key] = !isNaN(d[key]) ? +d[key] : d[key]; });
        });

        // Colors for each type
        const typeColorMap = {
            "Normal" : "#A8A878",
            "Fire" : "#F08030",
            "Water" : "#6890F0",
            "Electric" : "#F8D030",
            "Grass" : "#78C850",
            "Ice" : "#98D8D8",
            "Fighting" : "#C03028",
            "Poison" : "#A040A0",
            "Ground" : "#E0C068",
            "Flying" : "#A890F0",
            "Psychic" : "#F85888",
            "Bug" : "#A8B820",
            "Rock" : "#B8A038",
            "Ghost" : "#705898",
            "Dragon" : "#7038F8",
            "Dark" : "#705848",
            "Steel" : "#B8B8D0",
            "Fairy" : "#EE99AC"
        };

        // Plot 1: Bar Chart
        const barSvg =
            d3.select("body")
                .append("svg")
                // Set SVG width and height
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .style("position", "absolute")
                // Set SVG position
                .style("left", `${barLeft}px`)
                .style("top", `${barTop}px`);

        // Calculate type counts
        const typeCounts = d3.rollup(data, v => v.length, d => d.Type_1);

        // Create scales for x and y axes
        const xScale =
            d3.scaleBand()
                .domain(Array.from(typeCounts.keys()))
                .range([ barMargin.left, barWidth - barMargin.right ])
                .padding(0.1);

        const yScale =
            d3.scaleLinear()
                .domain([ 0, d3.max(Array.from(typeCounts.values())) ])
                .range([ barHeight - barMargin.bottom, barMargin.top ]);

        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale);

        // Append x axis to the SVG
        barSvg.append("g")
            .attr("transform", `translate(0, ${barHeight - barMargin.bottom})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        // Append y axis to the SVG
        barSvg.append("g")
            .attr("transform", `translate(${barMargin.left}, 0)`)
            .call(yAxis);

        // Append bars to the SVG
        barSvg.selectAll("rect")
            .data(Array.from(typeCounts.entries()))
            .enter()
            .append("rect")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => barHeight - barMargin.bottom - yScale(d[1]))
            .attr("fill", d => typeColorMap[d[0]]);

        // Append x axis label
        barSvg.append("text")
            .attr("transform", `translate(${barWidth / 2}, ${barHeight + 30})`)
            .attr("text-anchor", "middle")
            .text("Type")
            .style("font-size", "18px");

        // Append y axis label
        barSvg.append("text")
            .attr("transform", `rotate(-90) translate(${- barHeight / 2}, ${
                                   barMargin.left / 3})`)
            .attr("text-anchor", "middle")
            .text("Number of Pokémon")
            .style("font-size", "18px");

        // Append chart title
        barSvg.append("text")
            .attr("x", (barWidth + barMargin.left + barMargin.right) / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Pokemon Type 1 Distribution");

        // Add Legend to Bar Chart
        createLegend("body", typeColorMap,
                     {left : barLeft + barWidth + 50, top : barTop});

        // Plot 2: Scatter Plot
        const scatterSvg =
            d3.select("body")
                .append("svg")
                .attr("width",
                      scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height",
                      scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .style("position", "absolute")
                .style("left", `${scatterRight}px`)
                .style("top", `${scatterTop}px`);

        const xScaleScatter =
            d3.scaleLinear()
                .domain([ 0, d3.max(data, d => d.Attack) ])
                .nice()
                .range(
                    [ scatterMargin.left, scatterWidth - scatterMargin.right ]);

        const yScaleScatter =
            d3.scaleLinear()
                .domain([ 0, d3.max(data, d => d.Defense) ])
                .nice()
                .range([
                    scatterHeight - scatterMargin.bottom, scatterMargin.top
                ]);

        // Append circles to the scatter plot with an initial grow animation
        scatterSvg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScaleScatter(d.Attack))
            .attr("cy", d => yScaleScatter(d.Defense))
            .attr("r", 0)
            .attr("fill", d => typeColorMap[d.Type_1])
            .attr("opacity", 0.8)
            .transition()
            .duration(1000)
            .attr("r", 5);

        // Hover interaction on scatter plot circles
        scatterSvg.selectAll("circle")
            .on("mouseover",
                function(event, d) {
                    const hoveredType = d.Type_1;

                    scatterSvg.selectAll("circle")
                        .transition()
                        .duration(500)
                        .style("opacity",
                               circleData => circleData.Type_1 === hoveredType
                                                 ? 1
                                                 : 0.05);

                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr("r", 10)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2);

                    // Adjust legends' opacity based on hovered circle
                    legend.selectAll("rect").transition().duration(500).style(
                        "opacity",
                        legendData => legendData[0] === hoveredType ? 1 : 0.1);

                    legend.selectAll("text").transition().duration(500).style(
                        "opacity",
                        legendData => legendData[0] === hoveredType ? 1 : 0.1);

                    // Show tooltip
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip
                        .html(`${d.Name} (Type: ${d.Type_1})<br/>Attack: ${
                            d.Attack}<br/>Defense: ${d.Defense}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
            .on("mouseout", function() {
                scatterSvg.selectAll("circle")
                    .transition()
                    .duration(500)
                    .style("opacity", 0.8)
                    .attr("r", 5)
                    .attr("stroke", "none");

                legend.selectAll("rect").transition().duration(500).style(
                    "opacity", 1);

                legend.selectAll("text").transition().duration(500).style(
                    "opacity", 1);

                tooltip.transition().duration(500).style("opacity", 0);
            });

        scatterSvg.append("g")
            .attr("transform",
                  `translate(0, ${scatterHeight - scatterMargin.bottom})`)
            .call(d3.axisBottom(xScaleScatter));

        scatterSvg.append("g")
            .attr("transform", `translate(${scatterMargin.left}, 0)`)
            .call(d3.axisLeft(yScaleScatter));

        scatterSvg.append("text")
            .attr("transform",
                  `translate(${scatterWidth / 2}, ${scatterHeight + 20})`)
            .attr("text-anchor", "middle")
            .text("Attack");

        scatterSvg.append("text")
            .attr("transform", `rotate(-90) translate(${- scatterHeight / 2}, ${
                                   scatterMargin.left / 3})`)
            .attr("text-anchor", "middle")
            .text("Defense")
            .style("font-size", "18px");

        scatterSvg.append("text")
            .attr("x",
                  (scatterWidth + scatterMargin.left + scatterMargin.right) / 2)
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Pokemon Attack vs Defense(hover to focus)");

        // Create Legend directly within the scatter plot setup
        const legend =
            scatterSvg.selectAll(".legend")
                .data(Object.entries(typeColorMap))
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform",
                      (d, i) => `translate(${scatterWidth}, ${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => d[1]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d[0]);

        // Interaction: Change opacity based on legend hover
        legend
            .on("mouseover",
                function(event, typePair) {
                    scatterSvg.selectAll("circle")
                        .transition()
                        .duration(500)
                        .style("opacity",
                               d => d.Type_1 === typePair[0] ? 1 : 0.05);

                    legend.selectAll("rect").transition().duration(500).style(
                        "opacity", d => d[0] === typePair[0] ? 1 : 0.2);

                    legend.selectAll("text").transition().duration(500).style(
                        "opacity", d => d[0] === typePair[0] ? 1 : 0.2);
                })
            .on("mouseout", function() {
                scatterSvg.selectAll("circle").transition().duration(500).style(
                    "opacity", 0.8);

                legend.selectAll("rect").transition().duration(500).style(
                    "opacity", 1);

                legend.selectAll("text").transition().duration(500).style(
                    "opacity", 1);
            });

        // Plot 3: Parallel Coordinates Chart
        const parallelSvg =
            d3.select("body")
                .append("svg")
                .attr("width", parallelWidth + parallelMargin.left +
                                   parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top +
                                    parallelMargin.bottom)
                .style("position", "absolute")
                .style("left", `0px`)
                .style("top", `${parallelTop}px`)
                .append("g")
                .attr(
                    "transform",
                    `translate(${parallelMargin.left}, ${parallelMargin.top})`);

        const dimensions =
            [ 'HP', 'Attack', 'Defense', 'Sp_Atk', 'Sp_Def', 'Speed' ];

        const yScales = {};
        dimensions.forEach(function(dimension) {
            yScales[dimension] =
                d3.scaleLinear()
                    .domain(
                        d3.extent(data, function(d) { return +d[dimension]; }))
                    .range([ parallelHeight, 0 ]);
        });

        const xScaleparallel = d3.scalePoint()
                                   .range([ 0, parallelWidth ])
                                   .padding(1)
                                   .domain(dimensions);

        function path(d) {
            return d3.line()(dimensions.map(function(p) {
                return [ xScaleparallel(p), yScales[p](d[p]) ];
            }));
        }

        parallelSvg.selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", d => typeColorMap[d.Type_1])
            .style("opacity", 0.08);

        dimensions.forEach(function(dimension) {
            parallelSvg.append("g")
                .attr("class", "axis")
                .attr("transform",
                      "translate(" + xScaleparallel(dimension) + ")")
                .each(function(d) {
                    d3.select(this).call(
                        d3.axisLeft().scale(yScales[dimension]));
                })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(dimension)
                .style("fill", "black")
                .style("font-size", "15px");
        });

        parallelSvg.append("text")
            .attr("x",
                  (parallelWidth + parallelMargin.left + parallelMargin.right) /
                      2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Pokemon Stats Comparison");

        const legendWidth = 200;
        const legendHeight =
            Object.keys(typeColorMap).length * (legendRectSize + legendSpacing);
        const legendPosX = width - 300;
        const legendPosY = parallelTop + 70;

        const legendSvg = d3.select("body")
                              .append("svg")
                              .attr("width", legendWidth)
                              .attr("height", legendHeight)
                              .style("position", "absolute")
                              .style("left", `${legendPosX}px`)
                              .style("top", `${legendPosY}px`)
                              .attr("id", "parallel-plot-legend");

        const parallellegend =
            legendSvg.selectAll(".legend")
                .data(Object.entries(typeColorMap))
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(0, ${
                                       i * (legendRectSize + legendSpacing)})`);

        parallellegend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => d[1])
            .on("click", function(event, d) { highlightLines(d[0]); });

        parallellegend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d[0]);

        let selectedDataPoints = new Set();

        function updateVisualization() {
            parallelSvg.selectAll(".line")
                .style("opacity", d => selectedDataPoints.has(d) ? 1 : 0.005)
                .style("stroke-width",
                       d => selectedDataPoints.has(d) ? 1.5 : 1);

            d3.selectAll("#parallel-plot-legend .legend").each(function(d) {
                const legendType = d[0];
                const isSelectedType =
                    Array.from(selectedDataPoints)
                        .some(dp => dp.Type_1 === legendType);

                d3.select(this)
                    .selectAll("rect, text")
                    .style("opacity",
                           isSelectedType || selectedDataPoints.size === 0
                               ? 1
                               : 0.05);
            });
        }

        let lastClickedType = null;

        function highlightLines(clickedType) {
            if (lastClickedType === clickedType) {
                parallelSvg.selectAll(".line")
                    .style("opacity", 0.3)
                    .style("stroke-width", "1");
                lastClickedType = null;
            } else {
                parallelSvg.selectAll(".line")
                    .style("opacity", 0.01)
                    .style("stroke-width", "1");

                parallelSvg.selectAll(".line")
                    .filter(d => d.Type_1 === clickedType)
                    .style("opacity", 1)
                    .style("stroke-width", "2");

                lastClickedType = clickedType;
            }
        }

        parallelSvg.selectAll(".line")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", d => typeColorMap[d.Type_1])
            .style("opacity", 0.3)
            .on("click", function(_, d) {
                if (selectedDataPoints.has(d)) {
                    selectedDataPoints.delete(d);
                } else {
                    selectedDataPoints.add(d);
                }
                updateVisualization();
            });

        parallelSvg.on("dblclick", function() {
            var confirmReset =
                window.confirm("Do you want to reset the chart?");

            if (confirmReset) {
                selectedDataPoints.clear();
                parallelSvg.selectAll(".line")
                    .style("opacity", 0.3)
                    .style("stroke-width", "1");

                lastClickedType = null;

                d3.selectAll(
                      "#parallel-plot-legend .legend rect, #parallel-plot-legend .legend text")
                    .style("opacity", 1);
            }
        });
    })
    .catch(error => { console.log("Error loading data:", error); });
