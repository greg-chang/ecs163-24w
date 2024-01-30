// Overall dimension of the canvas
const width = window.innerWidth;
const height = window.innerHeight;

// Dimensions for each individual plot
// Dimensions for the parallel coordinates plot
let parallelLeft = 0, parallelTop = 0;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = 400 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 350 - parallelMargin.top - parallelMargin.bottom;

d3.csv("../data/pokemon_alopez247.csv").then(rawData => {

    // Data Processing
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
    });

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

    // Plot 1: Parallel Coordinates Graph
    const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${parallelMargin.top})`)
    // For plot 1, we only care about these attributes
    let dimensions = ["Total", "HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];

    // store y objects
    const y = {};
    for (i in dimensions) {
        let name = dimensions[i];
        y[name] = d3.scaleLinear()
        .domain( d3.extent(rawData, function(d) { return +d[name]; }))
        .range([height, 0]);
    }
    // Check y
    console.log(y);

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw paths
    svg.selectAll("myPath")
        .data(rawData)
        .join("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5)

    // Set up axis
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
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



}).catch(function(error){
    console.log(error);
});