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
d3.csv("https://media.githubusercontent.com/media/cjaustin-ucd/csvHost/main/globalterrorismdb_0718dist.csv").then((data) => {

    let mapAggregate = new Object()
    let pieAggregate = new Object()
    let animAggregate = new Object()
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

        // For pie animation count deaths per region per year
        let year = +d.iyear
        if (animAggregate[year] === undefined) {
            animAggregate[year] = new Object()
            animAggregate[year][d.region_txt] = +d.nkill
        } else if (animAggregate[year][d.region_txt] === undefined) {
            animAggregate[year][d.region_txt] = +d.nkill
        } else {
            animAggregate[year][d.region_txt] += +d.nkill
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
    Object.keys(animAggregate).forEach((y) => {animAggregate[y] = regions.map((r) => {return {region: r, deaths: animAggregate[y][r] || 0}})})
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

        // Define hover events
        let mapMouseOn = (d) => {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select(d.originalTarget)
                .transition()
                .duration(200)
                .style("opacity", 1)
            let tt = d3.select(".Tooltip")
                .transition()
                .duration(200)
                .style("opacity", 1)
            let countryName = nameMap(d.originalTarget.__data__.properties.name)
            let deaths = mapAggregate[countryName]
            if (deaths === undefined) {
                deaths = "No Data"
            }
            tt.select("text")
                .text(countryName + ": " + deaths)
        }

        let mapMouseOff = (d) => {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)
            d3.select(".Tooltip")
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        let mapMouseMove = (d) => {
            d3.select(".Tooltip")
                .attr("transform", `translate(${d.clientX + 10},${d.clientY + 10})`)
        }

        // Draw the map
        let g = svg.append("g")

        g.selectAll("path")
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
                .attr("class", "Country")
                .style("stroke", "gray")
                .on("mouseover", mapMouseOn)
                .on("mouseleave", mapMouseOff)
                .on("mousemove", mapMouseMove)
        
        // Add data tooltip
        let tooltip = svg.append("g")
            .attr("class", "Tooltip")
        tooltip.append("text")
            .text("Test")
            .style("font-size", "14px")
                
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
        
        // Add title and interaction tip
        svg.append("text")
            .attr("class", "chart-title")
            .attr("transform", 
                `translate(${mapDim.left + (mapDim.width / 2)},${mapDim.top + (mapDim.marginY / 2)})`)
            .attr("text-anchor", "middle")
            .text("Total Terror Attacks per Country (1970-2017)")
            .style("font-size", "24px")
        
        svg.append("text")
            .attr("class", "chart-interaction")
            .attr("transform", 
                `translate(${mapDim.left + (mapDim.width / 2)},${mapDim.top + (0.75 * mapDim.marginY)})`)
            .attr("text-anchor", "middle")
            .text("Hover to see exact attacks for each country")
            .style("font-size", "10px")
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
        .sort((a, b) => d3.ascending(a.region, b.region))
    let path = d3.arc()
        .outerRadius(radius)
        .innerRadius(0)

    svg.append("g")
            .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2)})`)
            .attr("class", "pieG")
        .selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
            .attr("class", "arc")
        .append("path")
            .attr("d", path)
            .attr("fill", (d) => colours(d.data.region))
    
    // Year by year animation
    svg.append("text")
        .attr("class", "yearCount")
        .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2) - 100},${pieDim.top + (pieDim.height / 2) + radius + pieDim.marginY})`)
        .attr("text-anchor", "middle")
        .text("1970")
        .style("font-size", "18px")
        .style("opacity", 0)

    let playAnimation = () => {
        d3.select(".d3Button")
            .transition()
            .duration(100)
            .attr("fill", "gray")
            .transition()
            .duration(100)
            .attr("fill", "white")
        
        let textAnim = svg.select(".yearCount")
            .transition()
            .duration(50)
            .style("opacity", 1)
        
        let counter = 0
        for (let i = 1970; i <= 2017; i++) {
            let thisDataset = animAggregate[i]
            if (thisDataset != undefined) {
                textAnim.transition()
                    .duration(500)
                    .delay(counter * 1000)
                    .text(i)

                let radius = Math.min(pieDim.height - (2 * pieDim.marginY), 
                pieDim.width - (2 * pieDim.marginX)) / 3
                let pie = d3.pie()
                    .value((d) => d.deaths)
                    .sort((a, b) => d3.ascending(a.region, b.region))
                let path = d3.arc()
                    .outerRadius(radius)
                    .innerRadius(0)

                let u = svg.append("g")
                        .attr("transform", 
                        `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2)})`)
                        .attr("class", "pieG")
                    .selectAll(".arc")
                    .data(pie(thisDataset))

                u.enter()
                    .append("g")
                        .attr("class", "arc")
                    .append("path")
                        .merge(u)
                        .transition()
                        .duration(500)
                        .delay(counter * 1000)
                        .attr("d", path)
                        .attr("fill", (d) => colours(d.data.region))
                u.exit().remove()
                counter++
            }
        }

        textAnim.transition()
            .duration(50)
            .delay(counter * 1000)
            .style("opacity", 0)
        
        let radius = Math.min(pieDim.height - (2 * pieDim.marginY), 
            pieDim.width - (2 * pieDim.marginX)) / 3
        let pie = d3.pie()
            .value((d) => d.deaths)
            .sort((a, b) => d3.ascending(a.region, b.region))
        let path = d3.arc()
            .outerRadius(radius)
            .innerRadius(0)
    
        let u = svg.append("g")
                .attr("transform", 
                `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2)})`)
                .attr("class", "pieG")
            .selectAll(".arc")
            .data(pie(pieData))
        u.enter()
            .append("g")
                .attr("class", "arc")
            .append("path")
                .merge(u)
                .transition()
                .duration(500)
                .delay(counter * 1000)
                .attr("d", path)
                .attr("fill", (d) => colours(d.data.region))
    }

    svg.append("rect")
        .attr("class", "d3Button")
        .attr("x", pieDim.left + (pieDim.width / 2) - 30)
        .attr("y", pieDim.top + (pieDim.height / 2) + radius + pieDim.marginY - 20)
        .attr("width", 60)
        .attr("height", 30)
        .attr("stroke", "black")
        .attr("fill", "white")
        .on("click", playAnimation)
    svg.append("text")
        .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2) + radius + pieDim.marginY})`)
        .attr("text-anchor", "middle")
        .text("Play")
        .style("font-size", "14px")
        .on("click", playAnimation)
    
    // Add title and interaction tip
    svg.append("text")
        .attr("class", "chart-title")
        .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2) - radius - pieDim.marginY})`)
        .attr("text-anchor", "middle")
        .text("Total Deaths per Region")
        .style("font-size", "18px")
    
    svg.append("text")
        .attr("class", "chart-interaction")
        .attr("transform", 
            `translate(${pieDim.left + (pieDim.width / 2)},${pieDim.top + (pieDim.height / 2) - radius - (0.5 * pieDim.marginY)})`)
        .attr("text-anchor", "middle")
        .text("Press 'Play' to animate how regional deaths have changed each year")
        .style("font-size", "10px")
    
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
    var x = d3.scaleUtc()
        .domain(d3.extent(streamData, (d) => d.date))
        .range([streamDim.marginX, streamDim.width - streamDim.marginX])

    var y = d3.scaleLinear()
        .domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
        .rangeRound([streamDim.height - streamDim.marginY, streamDim.marginY])

    // Create area
    const area = d3.area()
        .x((d) => x(d.data[0]))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]))

    // Render axes
    var xAxis = svg.append("g")
            .attr("transform", `translate(${streamDim.left},${streamDim.top + streamDim.height - streamDim.marginY})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    var yAxis = svg.append("g")
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
    let displayBound = svg.append("defs")
        .append("clipPath")
        .attr("id", "stackBound")
        .append("rect")
            .attr("x", streamDim.left + streamDim.marginX)
            .attr("y", streamDim.top + streamDim.marginY)
            .attr("width", streamDim.width - streamDim.marginX)
            .attr("height", streamDim.height - streamDim.marginY)

    let streamG = svg.append("g")
        .attr("clip-path", "url(#stackBound)")
    streamG.selectAll()
        .data(stack)
        .join("path")
            .attr("class", "stackLevel")
            .attr("fill", d => colours(d.key))
            .attr("d", area)
            .attr("transform", `translate(${streamDim.left},${streamDim.top})`)
        .append("title")
            .text(d => d.key)
    
    // Add brush
    let reframeChart = (event) => {
        let extent = event.selection
        if (extent) {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            streamG.select(".brush")
                .call(brush.move, null)
        }

        xAxis.transition()
            .duration(200)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        streamG.selectAll(".stackLevel")
            .transition()
            .duration(200)
            .attr("d", area)
    }

    let resetStream = (event) => {
        x.domain(d3.extent(streamData, (d) => d.date))
        xAxis.transition()
            .duration(200)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        streamG.selectAll(".stackLevel")
            .transition()
            .duration(200)
            .attr("d", area)
    }

    var brush = d3.brushX()
        .extent([[streamDim.left + streamDim.marginX, streamDim.top + streamDim.marginY], 
            [streamDim.left + streamDim.width - streamDim.marginX, streamDim.top + streamDim.height - streamDim.marginY]])
        .on("end", reframeChart)
    
    streamG.append("g")
        .attr("class", "brush")
        .call(brush)
    
    streamG.on("dblclick", resetStream)

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

    // Add title and interaction tip
    svg.append("text")
            .attr("class", "chart-title")
            .attr("transform", `translate(${streamDim.left + streamDim.width / 2},${streamDim.top + streamDim.marginY})`)
            .attr("text-anchor", "middle")
        .text("Terror Attacks per Region Over Time")
            .style("font-size", "18px")
    
    svg.append("text")
            .attr("class", "chart-interact")
            .attr("transform", `translate(${streamDim.left + streamDim.width / 2},${streamDim.top + (1.5 * streamDim.marginY)})`)
            .attr("text-anchor", "middle")
        .text("Brush to zoom in on a section. Double click to reset")
            .style("font-size", "10px")
}).catch((err) => {

    console.log(err)
})
