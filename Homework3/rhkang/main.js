let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;










        const colours = {
            Normal: '#A8A77A',
            Fire: '#EE8130',
            Water: '#6390F0',
            Electric: '#F7D02C',
            Grass: '#7AC74C',
            Ice: '#96D9D6',
            Fighting: '#C22E28',
            Poison: '#A33EA1',
            Ground: '#E2BF65',
            Flying: '#A98FF3',
            Psychic: '#F95587',
            Bug: '#A6B91A',
            Rock: '#B6A136',
            Ghost: '#735797',
            Dragon: '#6F35FC',
            Dark: '#705746',
            Steel: '#B7B7CE',
            Fairy: '#D685AD',
        };
    const colorkeys = Object.keys(colours)
    const colors = Object.values(colours);
    const color = d3.scaleOrdinal(colorkeys,colors);
    console.log(colorkeys);
    console.log(colors);

// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Group data by type and calculate average stats
    var statsByType = d3.nest()
        .key(function(d) { return d.Type_1; })
        .rollup(function(v) {
            return {
                average: d3.mean(v, function(d) { return +d.Total; }),
            };
        })
        .entries(data);


    // Extract types and average stats
    var types = statsByType.map(function(d) { return d.key; });
    //var types = ["Dragon", "Steel", "Fairy"];
    var averages = statsByType.map(function(d) { return d.value; });
    var averagesIndex = statsByType.map(function(d) { return d.value; });
    averages.sort(function(x,y){
        return d3.descending(x.average, y.average);
    })
    var indexes = [];
    for(i = 0; i < averages.length; i++){
        value = averages[i].average;
        for(x = 0; x < averages.length; x++){
            if(value == averagesIndex[x].average){
                indexes.push(x);
            }
        }
    }
    console.log(indexes);
    types = d3.permute(types, indexes);
    
    
    console.log(types);
    console.log(averages);
    console.log(averagesIndex);

    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 90 },
        width = 400 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Create the SVG element
    var svg = d3.select("svg")
        //.append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        //.attr("width", margin.left + margin.right)
        //.attr("height", margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 400 + ")");

    // Define scales
    var x = d3.scaleBand()
        .domain(types)
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([300,520])
        .range([height, 0]);

    // Create bars
    svg.selectAll(".bar")
        .data(averages)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) { return x(types[i]); })
        .attr("width", x.bandwidth())
        //.attr("y", function(d) { return y(Object.values(d).reduce((a, b) => a + b, 0)); })
        //.attr("height", function(d) { return height - y(Object.values(d).reduce((a, b) => a + b, 0)); })
        .attr("y", function(d, i) { return y(0); })
        .attr("height", function(d, i) { return height - y(0); })
        .attr("fill", function(d, i) { return color(types[i]);});
    
    svg.selectAll("rect")
        .transition()
        .duration(800)
        //.attr("y", function(d) { return y(Object.values(d).reduce((a, b) => a + b, 0)); })
        //.attr("height", function(d) { return height - y(Object.values(d).reduce((a, b) => a + b, 0)); })
        .attr("y", function(d,i) { return y(averages[i].average); })
        .attr("height", function(d,i) { return height - y(averages[i].average); })
        .delay(function(d,i){console.log(i) ; return(i*100);});

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add labels
    svg.append("text")
    .attr("y", 0 - margin.top / 2)
    .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Animated Bar Graph of Stat Total by Type");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 1.5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Stats");

    svg.append("text")
        .attr("y", height + margin.bottom / 2 + 10)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Types");



    // Add legend
    /*
    var legend = svg.selectAll(".legend")
        .data(Object.keys(averages[0]))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return d3.schemeCategory10[i]; });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
        */
    }).catch(function(error){
        console.log(error);
    });

// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Group data by generation and calculate average stats
    var statsByGeneration = d3.nest()
        .key(function(d) { return d.Catch_Rate; })
        .rollup(function(v) {
            return {
                averageTotal: d3.mean(v, function(d) { return +d.Total; })
            };
        })
        .entries(data);

    // Extract generations and average stats
    function compare(a, b) {
        return parseInt(a.key) - parseInt(b.key);
    }
    statsByGeneration.sort(compare)
    var generations = statsByGeneration.map(function(d) { return d.key; });
    console.log(generations);
    var averages = statsByGeneration.map(function(d) { return d.value; });

    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 90 },
        width = 400 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Create the SVG element
    var svg = d3.select("svg")
        //.append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 550 + "," + margin.top + ")");

    // Define scales
    var x = d3.scaleBand()
        .domain(generations)
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([200, d3.max(averages, function(d) { return d.averageTotal; })])
        .range([height, 0]);

    // New Code
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

    // End new code

    // Define line
    /*
    var line = d3.line()
        .x(function(d, i) { return x(generations[i]) + x.bandwidth() / 2; })
        .y(function(d) { return y(d.averageTotal); });*/

    var line = svg.append("g")
        .attr("clip-path", "url(#clip)")


    // Draw the line
    line.append("path")
        .datum(averages)
        .attr("class", "lines")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
        .x(function(d, i) { return x(generations[i]) + x.bandwidth() / 2; })
        .y(function(d) { return y(d.averageTotal); }));

    line
        .append("g")
        .attr("class", "brush")
        .call(brush);
    

    // Add the x Axis
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));


    // More new Code

        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }
        
        // A function that update the chart for given boundaries
        function updateChart() {
        
            // What are the selected boundaries?
            extent = d3.event.selection
        
            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(!extent){
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain([ 4,8])
            }else{
                x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
                line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }
        
            // Update axis and line position
            xAxis.transition().duration(1000).call(d3.axisBottom(x)).selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
            line
                .select('.lines')
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                .x(function(d, i) { return x(generations[i]) + x.bandwidth() / 2; })
                .y(function(d) { return y(d.averageTotal); }))
                  
        }
        
        // If user double click, reinitialize the chart
        svg.on("dblclick",function(){
            x.domain(generations)
            xAxis.transition().call(d3.axisBottom(x)).selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
            line
                .select('.lines')
                .transition()
                .attr("d", d3.line()
                .x(function(d, i) { return x(generations[i]) + x.bandwidth() / 2; })
                .y(function(d) { return y(d.averageTotal); }))
        });

    // End new code

    // Add labels
    svg.append("text")
    .attr("y", 0 - margin.top / 2)
    .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Line Graph with Pan and Zoom (DoubleClick to reset)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 1.5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Stat Total");

    svg.append("text")
        .attr("y", height + margin.bottom / 2)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Catch Rate (lower means harder to catch)");

        /*
    // Add legend
    svg.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Total Stats");
        */
    }).catch(function(error){
        console.log(error);
});


// Load the dataset
d3.csv("pokemon.csv").then(function(data) {
    // Define dimensions for the chart
    var margin = { top: 60, right: 30, bottom: 70, left: 40 },
        width = 450 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Extract unique types
    var types = [...new Set(data.map(d => d.Type_1))];

    // Define scales
    var dimensions = ["Height_m", "Weight_kg", "Total", "Catch_Rate"];
    var y = {};
    dimensions.forEach(function(d) {
        y[d] = d3.scaleLinear()
            .domain([0, d3.max(data, function(e) { return +e[d]; })])
            .range([height, 0]);
    });
    console.log(y);
/*
    // Define line function
    var line = d3.line()
        .defined(function(d) { return !isNaN(d[1]); })
        .x(function(d, i) { return x(dimensions[i]); })
        .y(function(d) { return y[d[1]]; });
*/

    // Define x axis
    var x = d3.scalePoint()
        .domain(dimensions)
        .range([0, width])
        .padding(1);

    var highlight = function(d){

        type = d.Type_1
        
        // first every group turns grey
        d3.selectAll(".line")
            .transition().duration(200)
            .style("stroke", "lightgrey")
            .style("opacity", "0.2")
        // Second the hovered specie takes its color
        d3.selectAll("." + type)
            .transition().duration(200)
            .style("stroke", color(type))
            .style("opacity", "1")
    }
        
    // Unhighlight
    var doNotHighlight = function(d){
        d3.selectAll(".line")
            .transition().duration(200).delay(100)
            .style("stroke", function(d){ return( color(d.Type_1))} )
            .style("opacity", "1")
    }

    function path(d) {
        //console.log(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Create the SVG element
    var svg = d3.select("svg")
        //.append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw the lines
    svg.selectAll("pokemon")
        .data(data)
        .enter().append("path")
        .attr("class", function(d){return "line " + d.Type_1})
        //.attr("d", function(d) { return line(dimensions.map(function(p) { return [p, d[p]]; })); })
        .attr("d", path)
        .style("opacity", 0.5)
        .style("fill", "none")
        .style("stroke", function(d) { return color(d.Type_1); })
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight);

    // Add the x axis
    svg.selectAll("myAxis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black");

    // Add labels
    svg.append("text")
    .attr("y", 0 - margin.top / 1.5)
    .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Parallel Set Plot of Intangibles with Brushing");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        //.text("Stats");

    svg.append("text")
        .attr("y", height + margin.bottom / 2)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        //.text("Attributes");

    // Add legend
    var legend = svg.selectAll(".legend")
        .data(types)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(10," + (i * 20 + 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 8)
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", function(d) { return color(d); });

    legend.append("text")
        .attr("x", width - 14)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    // Function to get color based on type
    /*function getColor(type) {
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        return colorScale(types.indexOf(type));
    }*/

    }).catch(function(error){
    console.log(error);
});




/*
}).catch(function(error){
    console.log(error);
});
*/
