d3.csv("globalterrordb.csv").then(function(data) {
    var incidentsByCountry = d3.rollup(data, v => v.length, d => d.country_txt);

    var countries = Array.from(incidentsByCountry, ([country, count]) => ({ country, count}));

    countries.sort((a, b) => b.count - a.count);

    countries = countries.slice(0, 20);

    var margin= { top: 60, right: 20, bottom: 80, left: 90 };
    var width = 800 - margin.left - margin.right; 
    var height = 400 - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(countries.map(d => d.country)); 
    
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(countries, d => d.count)]);
    
    var svg = d3.select("#bar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);


    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .attr("font-size", "12px");

    svg.append("g")
        .call(yAxis)
        
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2) - 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle)")
        .text("Number of Incidents")
        .attr("font-size", "14px");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Countries With the Most Terrorist Incidents Globally")
    
    svg.selectAll(".bar")
        .data(countries)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.country))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).attr('opacity', 0.5);
            var barX = parseFloat(d3.select(this).attr("x")); 
            var barWidth = parseFloat(d3.select(this).attr("width")); 
            var barHeight = parseFloat(d3.select(this).attr("height")); 
            var mouseX = event.pageX; 
            var mouseY = event.pageY; 
            var textX = barX + barWidth / 2; 
            var textY = y(d.count) - 5; 
            svg.append("text")
                .attr("class", "tooltip")
                .attr("x", textX)
                .attr("y", textY)
                .attr("text-anchor", "middle")
                .style("fill", "black")
                .style("font-size", "12px")
                .text(d.count);
        })
        .on("mouseout", function() {
            d3.select(this).attr('opacity', 1);
            d3.selectAll(".tooltip").remove();
        });

    
    zoom(svg, x, xAxis, margin, width, height);

    function zoom(svg, x, xAxis, margin, width, height){
        const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];
        svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed)); 
        function zoomed(event){
            x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
            svg.selectAll(".bar")
                .attr("x", d => x(d.country))
                .attr("width", x.bandwidth())
                .style("display", d => x(d.country) <= 0 ? "none" : null);
            const xAxisVisible = x.domain().some(country => x(country) >= 0);
            svg.selectAll(".x-axis")
                .style("display", xAxisVisible ? null : "none")
                .call(xAxis);
        }
    }
});
d3.csv("globalterrordb.csv").then(function(data) {
 
    var filteredData = data.filter(function(d) {
        return d.country_txt === "United States" && +d.iyear >= 2010 && +d.iyear <= 2017;
    });


    var dimensions = ["success", "extended", "nkill"];


    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);


    var margin = { top: 50, right: 90, bottom: 50, left: 90 };
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var x = d3.scalePoint()
        .domain(dimensions)
        .range([0, width]);


    var parallelSvg = d3.select("#parallel-coordinates")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var y = {};
    dimensions.forEach(function(dimension) {
        y[dimension] = d3.scaleLinear()
            .domain(d3.extent(filteredData, function(d) { return +d[dimension]; }))
            .range([height, 0]);
    });


    var paths = parallelSvg.selectAll("myPath")
        .data(filteredData)
        .enter().append("path")
        .attr("d", function(d) {
            return d3.line()(dimensions.map(function(dim) {
                return [x(dim), y[dim](+d[dim])];
            }));
        })
        .style("fill", "none")
        .style("stroke", function(d) { return colorScale(+d.iyear); })
        .style("opacity", 1)

        .on("mouseover", function(event, d) {
            d3.select(this).style("stroke-width", "3px")
                .transition()
                .duration(1200);
            var tooltip = parallelSvg.append("text")
                .attr("class", "tooltip")
                .attr("x", width - 10)
                .attr("y", 10)
                .style("text-anchor", "end")
                .style("font-size", "12px")
                .text(function() {
                    var tooltipText = "";
                    dimensions.forEach(function(dim) {
                        tooltipText += dim + ": " + d[dim] + "\n";
                    });
                    return tooltipText;
                });
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke-width", "1px")
                .transition()
                .duration(1200);
            d3.select(".tooltip").remove();
        });

    parallelSvg.selectAll("myAxis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "translate(" + x(d) + ",0)"; })
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black");


    var legend = parallelSvg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width + 5)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale)

    legend.append("text")
        .attr("x", width + 75)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
    
    parallelSvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2) - 10)
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .text("Parallel Coordinates Plot of Terrorism Incidents in the US (2010-2017)");
        
});
d3.csv("globalterrordb.csv").then(function(data) {
  
    var usData = data.filter(function(d) {
        return d.country_txt === "United States";
    });


    var incidentsByCity = d3.rollup(usData, v => v.length, d => d.city);


    var cities = Array.from(incidentsByCity, ([city, count]) => ({ city, count }));

    
    cities.sort((a, b) => b.count - a.count);
    var topCities = cities.slice(0, 10);

    
    var width = 500;
    var height = 1000;
    var radius = Math.min(width, height) / 4;

    
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    
    var pieSvg = d3.select("#pie")
        .append("svg")
        .attr("width", width + 1800)
        .attr("height", height + 1500)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2 - 200) + ")")
    
    var pieContent = pieSvg.append("g")
        .attr("transform", "translate(0," + (-500) + ")");
   
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);


    var pie = d3.pie()
        .value(function(d) { return d.count; });


    var arcs = pieSvg.selectAll("arc")
        .data(pie(topCities))
        .enter()
        .append("g")
        .on("mouseover", function(event, d) {
            d3.select(this).select("path")
                .transition()
                .duration(1200)
                .attr("d", arcOver); 
            var tooltip = pieSvg.append("text")
                .attr("class", "tooltip")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dy", -radius - 10)
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text(d.data.city + ": " + d.data.count + " (" + Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + "%)");
        })
        .on("mouseout", function() {
            d3.select(this).select("path")
                .transition()
                .duration(1200)
                .attr("d", arc);
            d3.select(".tooltip").remove();
        });
        


    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) {
            return color(i);
        });
    
    var arcOver = d3.arc()
        .innerRadius(0)
        .outerRadius(radius + 10);


    pieSvg.append("text")
        .attr("x", 45)
        .attr("y", -150)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Top 10 Cities with the Most Terrorist Incidents in the US");


    var legend = pieSvg.selectAll(".legend")
        .data(topCities)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(" + (width / 2 + radius + 50) + "," + (i * 20 + 20) + ")";
        });

    legend.append("rect")
        .attr("x", -300)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {
            return color(i);
        });

    legend.append("text")
        .attr("x", -275)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d.city;
        });


});
