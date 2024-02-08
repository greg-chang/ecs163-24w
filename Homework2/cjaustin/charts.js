// Dimensions of screen and visualisations
const width = window.innerWidth
const height = window.innerHeight
const padding = 20

let pieDim = {
    top: 0, 
    left: 0, 
    width: width / 4, 
    height: 2 * height / 3,
    marginX: 60, 
    marginY: 50
}
let mapDim = {
    top: 0, 
    left: pieDim.width, 
    width: 3 * width / 4, 
    height: 2 * height / 3, 
    marginX: 5, 
    marginY: 50
}
let streamDim = {
    top: 2 * height / 3, 
    left: 0, 
    width: width,
    height: height / 3, 
    marginX: 50, 
    marginY: 50
}

// Configure svg
let svg = d3.select("svg")

// Add load label for data parsing
svg.append("text")
    .attr("id", "loadText")
    .attr("transform", 
        `translate(${width / 2},${height / 2})`)
    .attr("text-anchor", "middle")
    .text("The dataset is very large, please wait for it to finish loading...")
    .style("font-size", "18px")

// Country name mapping function
function nameMap(n) {
    if (n === "USA") {
        return "United States"
    } else if (n === "England") {
        return "United Kingdom"
    } else if (n === "Slovakia") {
        return "Slovak Republic"
    } else if (n === "West Bank") {
        return "West Bank and Gaza Strip"
    } else {
        return n
    }
}

// Parse data
d3.csv("globalterrorismdb_0718dist.csv").then((data) => {

    let mapAggregate = new Object()
    let pieAggregate = new Object()
    let streamAggregate = new Object()

    data.forEach((d) => {

        // For map count number of instances per country
        if (mapAggregate[d.country_txt] === undefined) {
            mapAggregate[d.country_txt] = 0
        } else {
            mapAggregate[d.country_txt]++
        }

        // For pie count number of deaths per region
        if (pieAggregate[d.region_txt] === undefined) {
            pieAggregate[d.region_txt] = +d.nkill
        } else {
            pieAggregate[d.region_txt] += +d.nkill
        }

        // For stream count instances per region per unit time
        let date = new Date(+d.iyear, +d.imonth)
        if (streamAggregate[date] === undefined) {
            streamAggregate[date] = new Object()
            streamAggregate[date][d.region_txt] = 1
        } else if (streamAggregate[date][d.region_txt] === undefined) {
            streamAggregate[date][d.region_txt] = 1
        } else {
            streamAggregate[date][d.region_txt]++
        }
    })

    let mapData = Object.keys(mapAggregate).map((c) => {return {country: c, instances: mapAggregate[c]}})
    let regions = Object.keys(pieAggregate)
    let pieData = regions.map((r) => {return {region: r, deaths: pieAggregate[r]}})
    let streamData = Object.keys(streamAggregate).map((d) => 
        Object.keys(streamAggregate[d]).map((r) => {return {date: new Date(d), region: r, instances: streamAggregate[d][r]}})).flat()

    // Remove loading text
    d3.select("#loadText").remove()

    // Choropleth
    // Load JSON with map structure
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((mapShape) => {
        // Create map object
        let projection = d3.geoNaturalEarth1()
            .fitExtent([[mapDim.marginX, mapDim.marginY], [mapDim.width, mapDim.height]], mapShape)

        // Define colour scales
        let mapColour = d3.scaleQuantile()
            .domain(d3.extent(mapData, (d) => d.instances))
            .range(d3.schemeReds[9])

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(mapShape.features)
            .enter()
            .append("path")
                .attr("transform", 
                `translate(${mapDim.left},${mapDim.top})`)
                .attr("fill", (d) => {
                    let name = nameMap(d.properties.name)  // Fixes errors with different country names
                    let countryTotal = mapAggregate[name]
                    if (countryTotal === undefined) {
                        return "gray"
                    } else {
                        return mapColour(countryTotal)
                    }
                })
                .attr("d", d3.geoPath().projection(projection))
                .style("stroke", "black")
        
        // Add legend
        svg.append('defs')
            .append('linearGradient')
                .attr('id', 'grad')
                .attr('x1', '0%')
                .attr('x2', '0%')
                .attr('y1', '0%')
                .attr('y2', '100%')
            .selectAll('stop')
            .data(d3.schemeReds[9])
            .enter()
            .append('stop')
                .style('stop-color', (d) => d)
                .attr('offset', (d,i) => 100 * (i / 8) + '%')

        svg.append('rect')
            .attr('x', mapDim.left + (mapDim.width / 5))
            .attr('y', mapDim.top + (mapDim.height / 2))
            .attr('width', 30)
            .attr('height', 100)
            .style('fill', 'url(#grad)')

        svg.append("text")
            .attr("transform", 
                `translate(${mapDim.left + (mapDim.width / 5) + 15},${mapDim.top + (mapDim.height / 2) - 10})`)
            .attr("text-anchor", "middle")
            .text(d3.min(mapData, (d) => d.instances))
            .style("font-size", "12px")
        
        svg.append("text")
            .attr("transform", 
                `translate(${mapDim.left + (mapDim.width / 5) + 15},${mapDim.top + (mapDim.height / 2) + 110})`)
            .attr("text-anchor", "middle")
            .text(d3.max(mapData, (d) => d.instances))
            .style("font-size", "12px")
        
        // Add title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("transform", 
                `translate(${mapDim.left + (mapDim.width / 2)},${mapDim.top + (mapDim.marginY / 2)})`)
            .attr("text-anchor", "middle")
            .text("Total Terror Attacks per Country (1970-2017)")
            .style("font-size", "24px")
    }).catch((err) => {

        console.log(err)
    })

    // Pie
    // Create colour scale
    let colours = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemePaired)
    
    // Create pie
    let radius = Math.min(pieDim.height - (2 * pieDim.marginY), 
        pieDim.width - (2 * pieDim.marginX)) / 3
    let pie = d3.pie()
        .value((d) => d.deaths)
    let path = d3.arc()
        .outerRadius(radius)
        .innerRadius(0)
    let label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius)

    svg.append("g")
            .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2)})`)
        .selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
            .attr("class", "arc")
        .append("path")
            .attr("d", path)
            .attr("fill", (d) => colours(d.data.region))
    
    // Render labels
    /*svg.selectAll('allPolylines')
        .data(pie(pieData))
        .enter()
        .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', (d) => {
                let posA = path.centroid(d)
                let posB = label.centroid(d)
                let posC = label.centroid(d)
                let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1) 
                return [posA, posB, posC]
            })
            .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2)})`)

    svg.selectAll('allLabels')
        .data(pie(pieData))
        .enter()
        .append('text')
            .text((d) => d.data.region + ": " + d.data.deaths)
            .attr('transform', (d) => {
                let pos = label.centroid(d)
                let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
                return 'translate(' + (pos[0] + pieDim.left + (pieDim.width / 2)) + "," + (pos[1] + pieDim.top + (pieDim.height / 2)) + ')'
            })
            .style('text-anchor', (d) => {
                let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
            .style("font-size", "10px")*/
    
    // Add title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2) - radius - pieDim.marginY})`)
        .attr("text-anchor", "middle")
        .text("Total Deaths per Region")
        .style("font-size", "18px")
    
    // Stream
    // Create stack
    let stack = d3.stack()
        .keys(d3.union(streamData.map(d => d.region)))
        .value(([, D], key) => {{
            let entry = D.get(key)
            if (entry === undefined) {
              return 0
            } else {
              return entry.instances
            }}})(d3.index(streamData, (d) => d.date, (d) => d.region))

    // Create axes
    let x = d3.scaleUtc()
        .domain(d3.extent(streamData, (d) => d.date))
        .range([streamDim.marginX, streamDim.width - streamDim.marginX])

    let y = d3.scaleLinear()
        .domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
        .rangeRound([streamDim.height - streamDim.marginY, streamDim.marginY])

    // Create area
    const area = d3.area()
        .x((d) => x(d.data[0]))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]))

    // Render axes
    svg.append("g")
            .attr("transform", `translate(${streamDim.left},${streamDim.top + streamDim.height - streamDim.marginY})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    svg.append("g")
            .attr("transform", `translate(${streamDim.left + streamDim.marginX},${streamDim.top})`)
        .call(d3.axisLeft(y))
        .call(g => g.append("text")
            .attr("x", -streamDim.marginX + 10)
            .attr("y", streamDim.marginY - 10)
            .attr("fill", "black")
            .attr("text-anchor", "start")
            .text("Number of Attacks"))
        .call(g => g.append("text")
            .attr("x", streamDim.width / 2)
            .attr("y", streamDim.height - 10)
            .attr("fill", "black")
            .attr("text-anchor", "start")
            .text("Date"))

    // Render areas
    svg.append("g")
        .selectAll()
        .data(stack)
        .join("path")
            .attr("fill", d => colours(d.key))
            .attr("d", area)
            .attr("transform", `translate(${streamDim.left},${streamDim.top})`)
        .append("title")
            .text(d => d.key)

    // Add legend
    svg.selectAll("mydots")
        .data(stack.map((d) => d.key))
        .enter()
        .append("rect")
            .attr("x", streamDim.left + (streamDim.width / 4))
            .attr("y", (d,i) => streamDim.top + i*25 - (pieDim.height / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", (d) => colours(d))
            .style("stroke", "black")
    svg.selectAll("mylabels")
        .data(stack.map((d) => d.key))
        .enter()
        .append("text")
            .attr("x", streamDim.left + (streamDim.width / 4) + 30)
            .attr("y", (d,i) => streamDim.top + i*25 + 10 - (pieDim.height / 2))
            .style("fill", "black")
            .text((d) => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", "14px")

    // Add title
    svg.append("text")
            .attr("class", "chart-title")
            .attr("transform", `translate(${streamDim.left + streamDim.width / 2},${streamDim.top + streamDim.marginY})`)
            .attr("text-anchor", "middle")
        .text("Terror Attacks per Region Over Time")
            .style("font-size", "18px")
}).catch((err) => {

    console.log(err)
})
