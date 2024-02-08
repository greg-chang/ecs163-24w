const width = window.innerWidth;
const height = window.innerHeight;

let pieLeft = 100, pieTop = 0;
let pieMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    pieWidth = 400 - pieMargin.left - pieMargin.right,
    pieHeight = 350 - pieMargin.top - pieMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let hourLeft = 0, hourTop = 400;
let hourMargin = { top: 10, right: 500, bottom: 30, left: 60 },
    hourWidth = width - hourMargin.left - hourMargin.right,
    hourHeight = height - 450 - hourMargin.top - hourMargin.bottom;


d3.csv("MusicMentalHealth.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function (d) {
        d.Age = Number(d.Age);
        d.HoursPerDay = Number(d.HoursPerDay);
    });

    // process data for most common listening time
    hoursContext = rawData.reduce((s, { HoursPerDay }) => (s[HoursPerDay] = (s[HoursPerDay] || 0) + 1, s), {});
    console.log(hoursContext)
    r = Object.keys(hoursContext).map((key) => ({ hours: Number(key), count: hoursContext[key] }));

    // Sort data in ascending order
    r.sort(function (x, y) {
        return d3.ascending(x.hours, y.hours)
    })

    console.log(r)

    // for the most common listening time, process most common platform
    mostComHours = rawData.filter(d => d.HoursPerDay == 2);
    mostUsedService = mostComHours.reduce((s, { PrimaryService }) => (s[PrimaryService] = (s[PrimaryService] || 0) + 1, s), {});
    mostUsedServiceObj = Object.keys(mostUsedService).map((key) => ({ Service: key, count: mostUsedService[key] }));


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
        .attr("fill", "grey")

    g1.append("text")
        .attr("x", (hourWidth / 2))
        .attr("y", 0 - (hourMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("How Long Do People Listen To Music?");

    // space
    const g2 = svg.append("g")
        .attr("width", distrWidth + distrMargin.left + distrMargin.right)
        .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
        .attr("transform", `translate(${distrLeft}, ${distrTop})`)

    //plot 2 - pie chart

    // Set up pie and arcs
    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.75;

    // For creating labels
    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(mostUsedServiceObj);
    console.log(mostUsedServiceObj)

    arcs.sort((a, b) => a.data.Service.localeCompare(b.data.Service));

    const g3 = svg.append("g")
        .attr("width", pieWidth + pieMargin.left + pieMargin.right)
        .attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
        .attr("transform", `translate(${pieMargin.left}, ${pieMargin.top})`)

    // Create the color scale.


    // Add a sector path for each value.
    g3.append("g")
        .attr("stroke", "white")
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", "grey")
        .attr("d", arc)
        .append("title")
        .text(d => `${d.data.Service}: ${d.data.count.toLocaleString("en-US")}`);

    // Create a new arc generator to place a label close to the edge.
    // The label shows the value if there is enough room.
    g3.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.Service))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.count.toLocaleString("en-US")));


}).catch(function (error) {
    console.log(error);
});

