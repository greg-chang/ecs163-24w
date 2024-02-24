const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("svg");

svg.append("text")
    .attr("x", 50)
    .attr("y", 50)
    .style("font-size", "36px")
    .style("font-weight", "bold")
    .text("HW3 Visualization Dashboard - Daniel Medina")

svg.append("text")
    .attr("x", 200)
    .attr("y", 150)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("<- Hold and drag brush box onto map to select subset of points and update other visualizations")
svg.append("text")
    .attr("x", 215)
    .attr("y", 170)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("You can also resize the box by adjusting the borders")
svg.append("text")
    .attr("x", 250)
    .attr("y", 225)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("text-decoration", "underline")
    .text("Map of Global Terror Attacks 1990 - 2010 (Brushing Interaction)")
let donutLeft = 1000, donutTop = 0;
let donutMargin = {top: 750, right: 30, bottom: 0, left: 1200},
    donutWidth = 400,
    donutHeight = 400;
let mapLeft = 0, mapTop = 0;
let mapMargin = {top: -100, right: 0, bottom: 0, left: -400},
    mapWidth = mapMargin.left - mapMargin.right,
    mapHeight = 900 - mapMargin.top - mapMargin.bottom;
let parallelLeft = 0, parallelTop = 0;
let parallelMargin = {top: 100, right: 0, bottom: 0, left: 1000},
    parallelWidth = 600,
    parallelHeight = 400;

const projection = d3.geoMercator()
    .scale(100)
    .translate([width/2, height/2*1.3])

const path = d3.geoPath()
    .projection(projection)

async function loadData() {

    const incidentData = await d3.csv("globalterrorism.csv");
    
    const validIncidents = incidentData.filter((incident) => {
        return (incident.longitude != null) && (incident.latitude != null) && (incident.iyear >= 1990 && incident.iyear <= 2010) && (incident.country_txt != null) && (incident.nkill >= 0) && (incident.nwound >= 0);
    }).map((incident) => {
        return {
            eventid: incident.eventid,
            year: incident.iyear,
            deaths: incident.nkill,
            injuries: incident.nwound,
            longitude: incident.longitude,
            latitude: incident.latitude,
            country: incident.country_txt
        }
    })

    generateVisualizations(validIncidents);    
}


function groupByCountry(validIncidents){
    var countries = {}

    validIncidents.forEach(incident => {
        console.log(incident.country);
        if (!countries[incident.country]){
            countries[incident.country] = 1;
        } else {
            countries[incident.country] += 1;
        }
    })

    console.log("COUNTRIES: ", countries);

    return countries;
}

var radius = Math.min(donutWidth, donutHeight) / 2 

const color = d3.scaleOrdinal()
    .range(d3.schemeDark2);

var pie = d3.pie()
    .sort(null)
    .value(d => d[1])

const arc = d3.arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 0.8)

const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)



function reformatCountryName(countryName){
    return countryName.split(' ').join('_')
}

// Code for donut chart adapted from: (https://d3-graph-gallery.com/graph/donut_label.html) (2/23/24)
function updateDonutChart(selectedIncidents, svg){
    var countryData = groupByCountry(selectedIncidents);
    const countryPieData = pie(Object.entries(countryData))
   
    svg.selectAll('.donut-chart')
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

    const donutSVG = svg.append("g")
        .attr("class", "donut-chart")
        .attr("transform", "translate(" + donutMargin.left + "," + donutMargin.top + ")")

    donutSVG.selectAll('slice')
        .data(countryPieData)
        .join('path')
        .attr("id", (d) => {
            var reformattedCountryName = reformatCountryName(d.data[0]);
            return `donut_slice_${reformattedCountryName}`;
        })
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("click", function(event, d){
            var reformattedCountryName = reformatCountryName(d.data[0]);
            const label = donutSVG.select(`#donut_label_${reformattedCountryName}`);
            const line = donutSVG.select(`#donut_line_${reformattedCountryName}`);
            const slice = donutSVG.select(`#donut_slice_${reformattedCountryName}`);
            const isVisible = label.style("opacity") == 1;
            label.transition().duration(300).style("opacity", isVisible ? 0 : 1);
            line.transition().duration(300).style("opacity", isVisible ? 0 : 1);
            slice.transition().duration(300).style("opacity", isVisible ? 0.7 : 1);

        });
      

    donutSVG.selectAll('polylines')
        .data(countryPieData)
        .join('polyline')
            .attr("id", (d) => {
                var reformattedCountryName = reformatCountryName(d.data[0]);
                return `donut_line_${reformattedCountryName}`;
            })
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', (d) => {
                const posA = arc.centroid(d)
                const posB = outerArc.centroid(d)
                const posC = outerArc.centroid(d)
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1)
                return [posA, posB, posC]
            })
            .style("opacity", 0);

    donutSVG.selectAll('labels')
        .data(countryPieData)
        .join('text')
            .attr("id", (d) => {
                var reformattedCountryName = reformatCountryName(d.data[0])
                return `donut_label_${reformattedCountryName}`;
            })
            .text(d => d.data[0])
            .attr('transform', (d) => {
                const pos = outerArc.centroid(d)
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
                return `translate(${pos})`
            })
            .style('text-anchor', (d) => {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
            .style("opacity", 0);
    
    donutSVG.append("text")
        .attr("x", -165)
        .attr("y", -190)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text("Distribution of Attacks for each Country (Focus View)")
    donutSVG.append("text")
        .attr("x", -165)
        .attr("y", -170)
        .style("font-size", "12px")
        .text("Select slices to identify countries (Selection Interaction)")
}

// Code for parallel coordinate plot adapted from: (https://d3-graph-gallery.com/graph/parallel_custom.html) (2/23/24)
function updateParallelPlot(selectedIncidents, svg) {
    svg.selectAll('.parallel-chart')
        .remove();
    
    const parallelSVG = svg.append("g")
        .attr("class", "parallel-chart")
        .attr("transform", "translate(" + parallelMargin.left + "," + parallelMargin.top + ")")

    dimensions = ["year", "injuries", "deaths"];

    const y = {}

    for (i in dimensions) {
        var name = dimensions[i]
        if (i < 1) {
            y[name] = d3.scalePoint()
                .domain(selectedIncidents.map(d => d[name]))
                .range([parallelHeight, 0]);
        } else {
            y[name] = d3.scaleLinear()
            .domain([0, d3.max(selectedIncidents, function(d) {
                return +d[name];
            })])
            .range([parallelHeight, 0])
        }

    }

    x = d3.scalePoint()
        .range([0, parallelWidth])
        .domain(dimensions);

    const highlight = function(event, d) {
        selected_country = d.country

        parallelSVG.selectAll(".line")
            .transition().duration(200)
            .style("stroke", "lightgrey")
            .style("opacity", 0.2)
        parallelSVG.selectAll("." + selected_country)
            .transition().duration(200)
            .style("stroke", color(selected_country))
            .style("opacity", 1)
    }

    const unHighlight = function(event, d) {
        parallelSVG.selectAll(".line")
            .transition().duration(200).delay(1000)
            .style("stroke", function(d) {
                return(color(d.country))
            })
            .style("opacity", 1)
    }
    
    function path(d) {
        return d3.line()(dimensions.map(function (p) {
            return [x(p), y[p](d[p])];
        }))
    }

    parallelSVG.selectAll("paths")
        .data(selectedIncidents)
        .join("path")
        .attr("class", function (d) {
            return "line " + d.country
        })
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", function(d) {
            return (color(d.country))
        })
        .style("opacity", 0.5)
        .style("stroke-width", 1.5)
        .on("mouseover", highlight)
        .on("mouseleave", unHighlight)

    parallelSVG.selectAll("axis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function(d) {
            return `translate(${x(d)})`
        })
        .each(function(d) {
            if (dimensions.indexOf(d) < 1) {
                d3.select(this).call(d3.axisLeft().scale(y[d]));
            } else {
                d3.select(this).call(d3.axisLeft().scale(y[d]));
            }
        })
        .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text((d) => {
                switch(d) {
                    case "year":
                        return "Year"
                    case "deaths":
                        return "Deaths"
                    case "injuries":
                        return "Injuries"
                    default:
                        return d
                }
            })
            .style("fill", "black")
    parallelSVG.append("text")
        .attr("x", 100)
        .attr("y", -40)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text("Parallel Coordinate Plot for Selected Attacks(Focus View)")
    parallelSVG.append("text")
        .attr("x", 100)
        .attr("y", -20)
        .style("font-size", "12px")
        .text("Hover cursor over line to filter lines for selected country (Filtering Transition)")
}

function generateVisualizations(validIncidents) {
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data){

        // Code for geographic map adapted from (https://d3-graph-gallery.com/graph/connectionmap_basic.html) (2/23/24)
        const mapSVG = svg.append("g")
            .attr("transform", `translate(${mapMargin.left},${mapMargin.top})`)
            .selectAll("path")
            .data(data.features)
            .join("path")
                .attr("fill", "#b8b8b8")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", 0.1)
        
        

        // Code for brush box functionality adapted from (https://observablehq.com/@d3/brush-filter?collection=@d3/d3-brush) (2/23/24)
        const brush = d3.brush()
        .filter(event => !event.ctrlKey
            && !event.button
            && (event.metaKey
            || event.target.__data__.type !== "overlay"))
        .on("end", brushed);

        const circle = svg.append("g")
            .attr("fill-opacity", 0.5)
            .selectAll("circle")
            .data(validIncidents)
            .join("circle")
            .attr("transform", d => {
                const[x, y] = projection([d.longitude, d.latitude]);
                return `translate(${x + mapMargin.left}, ${y + mapMargin.top})`;
            })
            .attr("r", 1);
        

        svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [[100, 100], [200, 200]])
        .call(g => g.select(".overlay").style("cursor", "default"));

        

        function brushed({selection}) {
            if (selection === null) {
                circle.attr("fill", "black");
                updateDonutChart([], svg);
                updateParallelPlot([], svg);
            } else {
                const [[x0, y0], [x1, y1]] = selection;
                const selectedIncidents = validIncidents.filter((incident) => {
                    var [x, y] = projection([incident.longitude, incident.latitude]);
                    x += mapMargin.left;
                    y += mapMargin.top;
                    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                });

                circle.attr("fill", d => {
                    var [x, y] = projection([d.longitude, d.latitude]);
                    x += mapMargin.left;
                    y += mapMargin.top;
                    return x0 <= x && x <= x1 && y0 <= y && y <= y1 ? "red" : "black";
                })

                updateDonutChart(selectedIncidents, svg);
                updateParallelPlot(selectedIncidents, svg);
            }
        }

        

    })
}

loadData();
