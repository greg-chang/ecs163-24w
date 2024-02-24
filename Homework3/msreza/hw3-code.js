
// initializations
let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

// margins and modified width and height
let margin = {top: 100, right: 30, bottom: 30, left: 100},
    modifiedWidth = 400 - margin.left - margin.right,
    modifiedHeight = 350 - margin.top - margin.bottom;

// defining color scheme for future implementation
    const labelColor = d3.scaleOrdinal()
    .domain(["Moisturizer", "Cleanser", "Treatment", "Face Mask", "Eye cream", "Sun protect" ])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"])

// logging CSV data into console
d3.csv("cosmetics.csv").then(rawData =>{
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.Price = Number(d.Price);
        d.Rank = Number(d.Rank)
    });

    // defining SVG object
    const svg = d3.select("svg")
            
    // initializing first visualization: Overview Histogram for Context on Price
    const g1 = svg.append("g")
                .attr("width", modifiedWidth + margin.left + margin.right)
                .attr("height", modifiedHeight + margin.top + margin.bottom)
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
    
    // X axis
    var x = d3.scaleLinear()
    .domain([0, 400])  
    .range([0, modifiedWidth + 500]);
    g1.append("g")
        .attr("transform", `translate(0, ${modifiedHeight})`)
        .call(d3.axisBottom(x));

    // Y axis
    var y = d3.scaleLinear()
        .range([modifiedHeight, 0]);
    var yAxis = g1.append("g")

    // function that builds the graph for nBin bins
    function update(nBin) {

        // set histogram parameters
        var histogram = d3.histogram()
            .value(function(d) { return d.Price; })  
            .domain(x.domain())  
            .thresholds(x.ticks(nBin));
       
        var bins = histogram(rawData);

        // updated y axis
        y.domain([0, d3.max(bins, function(d) { return d.length; })])
        yAxis
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y))

        var u = g1.selectAll("rect")
            .data(bins)

        // manage the existing bars, add new ones
        u
            .enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", 1)
            .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`})
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return modifiedHeight - y(d.length); })
            .style("fill", "blue")

        // delete removed bars if less
        u.exit().remove()
    }

    // initialize with 8 bins
    update(8)

    // button updates, see 'index.html' for more information on #nBin
    d3.select("#nBin").on("input", function() {
        update(+this.value);
    })

    // chart title + axis titles
    g1.append("text")
    .attr("x",  modifiedWidth + 130)
    .attr("y", modifiedHeight - 230)
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .text("Price Histogram")

    g1.append("text")
    .attr("x", 400)
    .attr("y", modifiedHeight + 60)
    .attr("font-size", "25px")
    .attr("text-anchor", "middle")
    .text("Price")
    
    g1.append("text")
    .attr("x", -130)
    .attr("y", -50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Frequency")
    
    
    // initializing second visualization: scatterplot of Price vs Rank with Label filling for in depth focus
    const g2 = svg.append("g")
                .attr("width",  modifiedWidth + margin.left + margin.right)
                .attr("height", modifiedHeight + margin.top + margin.bottom)
                .attr("transform", `translate(${margin.left + 900}, ${margin.top})`)

    // mapping data of axes
    const x2 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Rank)])
    .range([0, modifiedWidth + 250])

    const xAxisCall = d3.axisBottom(x2)
                        .ticks(7)
    g2.append("g")
    .attr("transform", `translate(0, ${modifiedHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    const y2 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Price)])
    .range([modifiedHeight, 0])

    const yAxisCall = d3.axisLeft(y2)
                        .ticks(13)
    g2.append("g").call(yAxisCall)

    // filling the data points based on label
    const plotcircles = g2.selectAll("circle").data(rawData)

    plotcircles.enter().append("circle")
         .attr("cx", function(d){
             return x2(d.Rank);
         })
         .attr("cy", function(d){
             return y2(d.Price);
         })
         .attr("r", 3)
         .attr("fill", function (d) { return labelColor(d.Label) } )   
    
    g2
        .call( d3.brush()                 
        .extent( [ [0, 0], [525, 225] ] )
        .on("start brush", updateChart) 
        )

    // function when brush hovers over point, see 'selected' in index.html
    function updateChart() {
        extent = d3.event.selection
        myCircle.classed("selected", function(d){ return isBrushed(extent, x2(d.Rank), y2(d.Price) ) } )
    }

    // function that returns T/F according if a dot is in the brush
    function isBrushed(brush_coords, cx, cy) {
        var x0 = brush_coords[0][0],
            x1 = brush_coords[1][0],
            y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }
    
    // defining and positioning legend based on scatterplot
    const legend1 = g2.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.left + 500}, ${margin.top - 50})`);

    const legendCircles = legend1.selectAll(".legend-circle")
        .data(labelColor.domain())
        .enter()
        .append("g")
        .attr("class", "legend-circle")
        .attr("transform", (d, i) => "translate(0," + (i * 20) + ")")

    legendCircles.append("circle")
        .attr("cx", 5)
        .attr("cy", 5) 
        .attr("r", 5) 
        .attr("fill", labelColor)

    legendCircles.append("text")
        .attr("x", 20)
        .attr("y", 8)
        .attr("dy", ".35em")
        .text(d => d)
        .attr("font-size", "12px")

    // chart title + axis titles
    g2.append("text")
    .attr("x",  modifiedWidth)
    .attr("y", modifiedHeight - 250)
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .text("Price vs Ranking")
    
    g2.append("text")
    .attr("x",  modifiedWidth)
    .attr("y", modifiedHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Ranking of Cosmetic")
    
    g2.append("text")
    .attr("x", -(modifiedHeight / 2))
    .attr("y", -50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Price (USD)")


    // initializing third visualization: Parallel Coordinates Plot (advanced) for in-depth focus
    // shows relationship between cosmetics for normal skin, rank, and cosmetics for dry skin
    // also has color filling based on label
    const g3 = svg.append("g")
                .attr("width",  modifiedWidth + margin.left + margin.right)
                .attr("height", modifiedHeight + margin.top + margin.bottom)
                .attr("transform", `translate(${margin.left}, ${margin.top + 350})`)
    
    // parsing data for advanced visualization
    d3.csv("cosmetics.csv").then( function(data) {
    
        // defining dimensions + axis range and scale
        dimensions = ["Normal", "Rank", "Dry"]
    
        // defining domain for axes
        const y = {}
        for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain( [0,5] )
            .range([0, height - 600])
        }
    
        // x scale
        x = d3.scalePoint()
        .range([0, width - 500])
        .domain(dimensions);
    
        // function to highlight group when user hovers over them
        const highlight = function(event, d) {
    
            selected_label = d.Label

            d3.selectAll(".line")
                .transition().duration(200)
                .style("stroke", "lightgrey")
                .style("opacity", "0.2")

            d3.selectAll("." + selected_label)
                .transition().duration(200)
                .style("stroke", labelColor(selected_label))
                .style("opacity", "1")
        }

        // function to unhighlight lines when user hovers over another group
        const doNotHighlight = function(event, d){

            d3.selectAll(".line")
                .transition().duration(200).delay(1000)
                .style("stroke", function(d){ return( labelColor(d.Label))} )
                .style("opacity", "1")
        }
    
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }))
        }
    
        // drawing the lines
        g3
        .selectAll("myPath")
        .data(data)
        .join("path")
            .attr("class", function (d) { return "line " + d.Label } ) // 2 classes for each line: 'line' and the group name
            .attr("d",  path)
            .style("fill", "none" )
            .style("stroke", function(d){ return( labelColor(d.Label))} )
            .style("opacity", 0.5)
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight )
    
        g3.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return `translate(${x(d)})`})
        .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
        .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black")    
    })

    // zoom variable/element
    var zoom = d3.zoom()
    .scaleExtent([1, 8]) 
    .translateExtent([[0, 0], [modifiedWidth, modifiedHeight]])
    .on("zoom", zoomed);
    
    // apply zoom
    g3.call(zoom);
    function zoomed(event) {
    
    // Update y scale
    for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain([0, 5].map(d => d3.event.transform.rescaleY(y[name])(d)))
            .range([0, height - 600]);
    }

    // update paths
    g3.selectAll(".line")
        .attr("d", function(d) { return path(d); });

    // update axes
    g3.selectAll(".axis")
        .each(function(d) {
            d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
        });
    }

    // chart title
    g3.append("text")
    .attr("x",  modifiedWidth + 470)
    .attr("y", modifiedHeight + 200)
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .text("Parallel Coordinates Plot of Normal, Rank, Dry")

    // defining and formatting legend based on this plot
    const legend2 = g3.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.left + 1400}, ${margin.top - 20})`)

    const legendLines = legend2.selectAll(".legend-line")
        .data(labelColor.domain())
        .enter()
        .append("g")
        .attr("class", "legend-line")
        .attr("transform", (d, i) => "translate(0," + (i * 20) + ")")

    legendLines.append("line")
        .attr("x1", 0)
        .attr("y1", 5)
        .attr("x2", 20)
        .attr("y2", 5)
        .attr("stroke", labelColor)
        .attr("stroke-width", 2)

    legendLines.append("text")
        .attr("x", 30)
        .attr("y", 8)
        .attr("dy", ".35em")
        .text(d => d)
        .attr("font-size", "15px")
    
    }).catch(function(error){ // error handling
    console.log(error);
});

