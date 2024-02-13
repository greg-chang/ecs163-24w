// Overall dimension of the canvas
const width = window.innerWidth;
const height = window.innerHeight;
let pieRadius = 0;

// Dimensions for each individual plot
// Dimensions for the parallel coordinates plot
let parallelLeft = 0, parallelTop = 400;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = width - parallelMargin.left - parallelMargin.right,
    parallelHeight = height - 450 - parallelMargin.top - parallelMargin.bottom;

// Dimensions for the pie chart
let pieLeft = 200, pieTop = 0;
let pieMargin = {top: 60, right: 30, bottom: 30, left: 80},
    pieWidth = 400 - pieMargin.left - pieMargin.right,
    pieHeight = 350 - pieMargin.top - pieMargin.bottom;

// Dimensions for the Scatter Plot
let scatterLeft = 1300, scatterTop = 50;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let colors = [
    '#78C850', // Grass
    '#F08030', // Fire
    '#6890F0', // Water
    '#A8B820', // Bug
    '#008080', // Normal
    '#A040A0', // Poison
    '#F8D030', // Electric
    '#E0C068', // Ground
    '#EE99AC', // Fairy
    '#C03028', // Fighting
    '#F85888', // Psychic
    '#B8A038', // Rock
    '#705898', // Ghost
    '#98D8D8', // Ice
    '#7038F8', // Dragon
    '#705848', // Dark
    '#B8B8D0', // Steel
    '#A890F0', // Flying
];

function processingData(rawData) {
    // Data Processing
    allTypeOne = []
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

    // Drop two types that have incomplete and trivial attributes
    rawData.forEach(d => {
        delete d.Type_2;
        delete d.Egg_Group_2;
    });

    return [allTypeOne, rawData];
}

// Plot 1: Parallel Coordinates Graph
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {

    // Data Processing
    allTypeOne = [];
    [allTypeOne, rawData] = processingData(rawData);

    // Select svg
    const svg = d3.select("svg");

    const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${height - (parallelHeight + parallelMargin.top + parallelMargin.bottom)})`);

    // For plot 1, we only care about these attributes
    let dimensions = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];

    const color = d3.scaleOrdinal()
        .range(colors);

    // store y objects
    const y = {};
    for (let i in dimensions) {
        let name = dimensions[i];
        y[name] = d3.scaleLinear()
        .domain( d3.extent(rawData, function(d) { return +d[name]; }))
        .range([parallelHeight, 0]);
    }

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
        .range([0, parallelWidth])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Highlight the one that is hovered
    var highlight = function(d){

    selected_type = d.Type_1;

    // first every group turns grey
    d3.selectAll(".line")
        .transition().duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")
    // Second the hovered specie takes its color
    d3.select(this)
        .transition().duration(200)
        .style("stroke", color(selected_type))
        .style("opacity", "1")
    }

    // Unhighlight
    var doNotHighlight = function(d){
    d3.selectAll(".line")
        .transition().duration(200).delay(1000)
        .style("stroke", function(d){ return( color(d.Type_1))} )
        .style("opacity", "1")
    }

    // Draw paths
    g1.selectAll("myPath")
        .data(rawData)
        .join("path")
        .attr("class", function (d) { return "line " + d.Type_1 } )
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d.Type_1))} )
        .style("opacity", 1)
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight );

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
          .style("font-size", "12px")
          .text(function(d) { return d; })
          .style("fill", "black");

    // Add a title to g1
    g1.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("All Pokemon's Base Battle Stats Parallel Coordinates Plot");

    // Add a legend to the side of the parallel coordinates plot
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 200}, ${height - (parallelHeight + parallelMargin.top + parallelMargin.bottom)})`);

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

// Plot 2: Pie Chart Interms of each Pokemon's Type_1
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {
    // Data Processing
    allTypeOne = [];
    [allTypeOne, rawData] = processingData(rawData);
    processedData = {}
    rawData.forEach(d => {
        if (d.Type_1 in processedData) {
            processedData[d.Type_1] += 1;
        } else {
            processedData[d.Type_1] = 1;
        }
    })

    // Select svg
    const svg = d3.select("svg");

    const radius = Math.min(pieWidth + pieMargin.left + pieMargin.right, pieHeight + pieMargin.top + pieMargin.bottom) / 2 - pieMargin.right;
    pieRadius = radius;

    const g2 = svg.append("g")
                .attr("width", pieWidth + pieMargin.left + pieMargin.right)
                .attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
                .attr("transform", `translate(${pieMargin.left + radius + pieLeft + 100}, ${pieMargin.top + radius})`);

    // set the color scale
    const color = d3.scaleOrdinal()
    .range(colors);

    // Compute the position of each group on the pie:
    const pie = d3.pie()
    .value(function(d) {return d[1]})
    const data_ready = pie(Object.entries(processedData))
    // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    const arcGenerator = d3.arc()
                            .innerRadius(0)
                            .outerRadius(radius)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    g2
        .selectAll('mySlices')
        .data(data_ready)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color(d.data[0])) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // Add a legend to the side of the parallel coordinates plot
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${pieMargin.left + 200}, ${pieMargin.top})`);

    const legendRectSize = 12;
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

    // Query the leftmost and rightmost position to location the title
    const legendLeftPosition = pieMargin.left;
    const pieRightPosition = pieMargin.left + radius * 2 + pieLeft;

    // Add title
    svg.append("text")
        .attr("x", ((legendLeftPosition + pieRightPosition) / 2) + 150)
        .attr("y", pieMargin.top * 2 / 3)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("The Number of Each Type of Pokemon's Composition");

}).catch(function(error){
    console.log(error);
});

// Plot 3: Scatter plot for Water Type Pokemon
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {
    // Data Processing
    allTypeOne = [];
    [allTypeOne, rawData] = processingData(rawData);
    processedData = [];
    rawData.forEach(d => {
        if (d.Type_1 == "Water") {
            processedData.push(d);
        }
    });

    const svg = d3.select("svg");

    const g3 = svg.append("g")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .attr("transform", `translate(${scatterMargin.left + scatterLeft}, ${scatterMargin.top + scatterTop})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(processedData, function(d) { return d.Weight_kg; })])
        .range([ 0, scatterWidth ])

    g3.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(x))
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("transform", `translate(${scatterWidth + 40}, ${0})`)
          .attr("y", -10)
          .style("font-size", "12px")
          .text("Weight in Kg")
          .style("fill", "black");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([d3.min(processedData, function(d) { return d.Total; }) - 50, d3.max(processedData, function(d) { return d.Total; })])
        .range([ scatterHeight, 0]);

    g3.append("g")
        .call(d3.axisLeft(y))
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("transform", `translate(${0}, ${0})`)
          .attr("y", -9)
          .style("font-size", "12px")
          .text("Total")
          .style("fill", "black");

    // Add dots
    g3.append('g')
    .selectAll("dot")
    .data(processedData)
    .join("circle")
        .attr("cx", function (d) { return x(d.Weight_kg); } )
        .attr("cy", function (d) { return y(d.Total); } )
        .attr("r", 1.5)
        .style("fill", "#6890F0");

    // Add a title to g3
    g3.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Water Type Pokemon's Total Base Battle Stats vs Weight");

    // Add legend for Water type Pokemon
    const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (scatterMargin.left + scatterLeft + scatterWidth + 70) + "," + (60) + ")");

    // Add colored circle for Water type Pokemon
    legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 5)
    .style("fill", "#6890F0");

    // Add text label for Water type Pokemon
    legend.append("text")
    .attr("x", 10)
    .attr("y", 5)
    .text("Water Type Pokemon");

}).catch(function(error){
    console.log(error);
});