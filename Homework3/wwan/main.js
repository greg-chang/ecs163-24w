const width = window.innerWidth;
const height = window.innerHeight;

let pieLeft = 0, pieTop = 0;
let pieMargin = { top: 200, right: 10, bottom: 30, left: 250 },
    pieWidth = 400 - pieMargin.left - pieMargin.right,
    pieHeight = 350 - pieMargin.top - pieMargin.bottom;

let parallelLeft = 300, parallelTop = 25;
let parallelMargin = { top: 10, right: 400, bottom: 30, left: 200 },
    parallelWidth = 400 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 350 - parallelMargin.top - parallelMargin.bottom;

let hourLeft = 0, hourTop = 425;
let hourMargin = { top: 10, right: 500, bottom: 30, left: 60 },
    hourWidth = width - hourMargin.left - hourMargin.right,
    hourHeight = height - 450 - hourMargin.top - hourMargin.bottom;


d3.csv("MusicMentalHealth.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function (d) {
        d.Age = Number(d.Age)
        d.HoursPerDay = Number(d.HoursPerDay)
    });

    // process data for most common listening time
    hoursContext = rawData.reduce((s, { HoursPerDay }) => (s[HoursPerDay] = (s[HoursPerDay] || 0) + 1, s), {})
    r = Object.keys(hoursContext).map((key) => ({ hours: Number(key), count: hoursContext[key] }))

    // Sort data in ascending order
    r.sort(function (x, y) {
        return d3.ascending(x.hours, y.hours)
    })

    console.log(r)

    // for the most common listening time, process most common platform
    mostComHours = rawData.filter(d => d.HoursPerDay == 2);
    mostUsedService = mostComHours.reduce((s, { PrimaryService }) => (s[PrimaryService] = (s[PrimaryService] || 0) + 1, s), {})

    // process data for parallel plot
    parallelFilter = rawData.filter(d => (d.BPM < 400))
    parallelData = parallelFilter.map(d => { return { "Age": d.Age, "HoursPerDay": d.HoursPerDay, "BPM": d.BPM, "Depression": d.Depression } })


    //context chart - most common listening time for all people
    const svg = d3.select("svg")

    const g1 = svg.append("g")
        .attr("width", hourWidth + hourMargin.left + hourMargin.right)
        .attr("height", hourHeight + hourMargin.top + hourMargin.bottom)
        .attr("transform", `translate(${hourMargin.left}, ${hourTop})`)

    // X label
    g1.append("text")
        .attr("x", hourWidth / 2)
        .attr("y", hourHeight + 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Hours Per Day")

    // Y label
    g1.append("text")
        .attr("x", -(hourHeight / 2))
        .attr("y", -40)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of participants")

    // X ticks
    const x2 = d3.scaleBand()
        .domain(r.map(d => d.hours))
        .range([0, hourWidth])
        .paddingInner(0.3)
        .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g1.append("g")
        .attr("transform", `translate(0, ${hourHeight})`)
        .call(xAxisCall2)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(r, d => d.count)])
        .range([hourHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
        .ticks(6)
    g1.append("g").call(yAxisCall2)

    const rects2 = g1.selectAll("rect").data(r)

    rects2.enter().append("rect")
        .attr("y", d => y2(d.count))
        .attr("x", (d) => x2(d.hours))
        .attr("width", x2.bandwidth)
        .attr("height", d => hourHeight - y2(d.count))
        .attr("fill", "#2b6ed9")

    // title
    g1.append("text")
        .attr("x", (hourWidth / 2))
        .attr("y", 15 - (hourMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("How Long Do People Listen To Music?");

    //plot 2

    const radius = Math.min(width, height) / 2.3 - pieMargin.left;
    var keys2 = Object.keys(mostUsedService)

    var color = d3.scaleOrdinal()
        .domain(keys2)
        .range(["#1b65de", "#bd1bde", "#1bde89", "#de1b3b", "#9dde1b", "#1bdede"]);

    // Set up pie and arcs
    var pie = d3.pie()
        .value(function (d) { return d[1] })

    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    var pieData = pie(Object.entries(mostUsedService))

    console.log(d3.entries(mostUsedService))

    const g2 = svg.append("g")
        .attr("width", pieWidth + pieMargin.left + pieMargin.right)
        .attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
        .attr("transform", `translate(${pieMargin.left}, ${pieMargin.top})`)

    // pie chart
    // reference: https://d3-graph-gallery.com/graph/pie_annotation.html
    g2
        .selectAll('slices')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) { return (color(d.data[1])) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // labels
    g2
        .selectAll('mySlices')
        .data(pieData)
        .enter()
        .append('text')
        .text(function (d) { return d.value })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 25)


    // legend
    // reference: https://d3-graph-gallery.com/graph/custom_legend.html
    var size = 15
    g2.selectAll("mydots")
        .data(keys2)
        .enter()
        .append("rect")
        .attr("x", 200)
        .attr("y", function (d, i) { return -125 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })

    // Add one dot in the legend for each name.
    g2.selectAll("mylabels")
        .data(keys2)
        .enter()
        .append("text")
        .attr("x", 200 + size * 1.2)
        .attr("y", function (d, i) { return -125 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    // title
    g2.append("text")
        .attr("x", 70 - (pieWidth / 2))
        .attr("y", -70 - (pieMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Most Popular Service For 2 Hour Listeners");


    // plot 3: parallel plot
    // https://d3-graph-gallery.com/graph/parallel_basic.html

    dimensions = d3.keys(parallelData[0])
    console.log(dimensions)

    var y = {}
    for (i in dimensions) {
        key = dimensions[i]
        y[key] = d3.scaleLinear()
            .domain(d3.extent(parallelData, function (d) { return +d[key]; }))
            .range([height / 2.5, 0])
    }

    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    const g3 = svg.append("g")
        .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
        .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
        .attr("transform", `translate(${parallelLeft}, ${parallelTop})`)

    g3
        .selectAll("myPath")
        .data(parallelData)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5)

    g3.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("fill", "black")



}).catch(function (error) {
    console.log(error);
});

