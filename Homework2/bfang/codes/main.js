// Overall dimension of the canvas
const width = window.innerWidth;
const height = window.innerHeight;

// Dimensions for each individual plot
// Dimensions for the parallel coordinates plot
let parallelLeft = 0, parallelTop = 400;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = width - parallelMargin.left - parallelMargin.right,
    parallelHeight = height - 450 - parallelMargin.top - parallelMargin.bottom;

// Plot 1: Parallel Coordinates Graph
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {

    // Data Processing
    allTypeOne = []
    // Print out the data to see what it looks like
    console.log("rawData", rawData);
    // Transform data to number, string, and boolean values
    rawData.forEach(function(d) {  
        d.Number = Number(d.Number);
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
        d.Speed = Number(d.Speed);
        d.isLegendary = d.isLegendary == "TRUE" ? true : false;
        d.hasGender = d.hasGender == "TRUE" ? true : false;
        d.Pr_Male = Number(d.Pr_Male);
        d.hasMegaEvolution = d.hasMegaEvolution == "TRUE" ? true : false;
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
        d.Catch_Rate = Number(d.Catch_Rate);
        if (!(allTypeOne.includes(d.Type_1))) {
            allTypeOne.push(d.Type_1);
        }
    });
    console.log("allTypeOne", allTypeOne);
    // Drop two types that have incomplete and trivial attributes
    rawData.forEach(d => {
        delete d.Type_2;
        delete d.Egg_Group_2;
    });

    // Check is the rawDate is properly processed
    console.log(rawData);
    console.log(rawData.columns);

    // Select svg
    const svg = d3.select("svg")

    const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${height - (parallelHeight + parallelMargin.top + parallelMargin.bottom)})`)

    // For plot 1, we only care about these attributes
    let dimensions = ["Total", "HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
    // Generate different colors for each type
    randomColors = [
        "#440154", "#3e4989", "#31688e", "#26838f", "#1f9e89", "#35b779",
        "#6ece58", "#b5de2b", "#fde725", "#fdae61", "#fd8d3c", "#f16913",
        "#d94801", "#a63603", "#7f2704", "#440154", "#21908d", "#fde725"
      ];
      
    // Color scale: give me a specie name, I return a color
    const color = d3.scaleOrdinal()
        .domain(allTypeOne)
        .range(randomColors);


    // store y objects
    const y = {};
    for (let i in dimensions) {
        let name = dimensions[i];
        y[name] = d3.scaleLinear()
        .domain( d3.extent(rawData, function(d) { return +d[name]; }))
        .range([parallelHeight, 0]);
    }
    // Check y
    console.log(y);

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
        .range([0, parallelWidth])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw paths
    g1.selectAll("myPath")
        .data(rawData)
        .join("path")
        .attr("class", function (d) { return "line " + d.Type_1 } )
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d.Type_1))} )
        .style("opacity", 0.5)

    // Set up axis
    g1.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")

    // Add a title to g1
    g1.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("All Pokemon's Attributes Parallel Coordinates Graph");

    // Add a legend to the side of the parallel coordinates plot
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, ${height - (parallelHeight + parallelMargin.top + parallelMargin.bottom)})`);

    const legendRectSize = 18;
    const legendSpacing = 4;

    // Create legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(allTypeOne)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function (d, i) { return `translate(0, ${i * (legendRectSize + legendSpacing)})`; });

    // Append rectangles to the legend items
    legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", function (d) { return color(d); });

    // Append text to the legend items
    legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(function (d) { return d; });

}).catch(function(error){
    console.log(error);
});

// Plot 2: Pie Chart Interms of each Pokemon's body style
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {

}).catch(function(error){
    console.log(error);
});