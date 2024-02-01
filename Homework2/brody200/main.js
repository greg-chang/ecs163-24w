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


d3.csv("data/StudentMentalhealth.csv").then(healthData => {
    console.log("rawData", healthData);

   
    const healthData2 = healthData.map(d => {
    return {
        "dataGenderChoice": d["Choose your gender"],
        "dataAge": +d["Age"], // Convert to a number
        "dataCourse": d["What is your course?"],
        "dataCurYearStudy": d["Your current year of Study"],
        "dataCGPA": +d["What is your CGPA?"], // Convert to a number
        "dataDepression": d["Do you have Depression?"] === "Yes" ? 1 : 0, // Convert to a boolean
        "dataAnxiety": d["Do you have Anxiety?"] === "Yes" ? 1 : 0, // Convert to a boolean
    };
    });

    console.log(healthData2);


    const svg = d3.select("svg")

    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("CGPA")
    

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("DEPRESSION")

   // Create x and y scales
    // Create x and y scales
    const xScale = d3.scaleLinear()
    .domain([d3.min(healthData2, d => d.dataCGPA), d3.max(healthData2, d => d.dataCGPA)])
    .range([0, scatterWidth]);


    const xAxisCall = d3.axisBottom(xScale)
        .ticks(15)

    g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    const yScale = d3.scaleLinear()
        .domain([0, 1]) // Assuming Depression is a binary variable (Yes/No)
        .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(yScale)
        .ticks(1)
    
    g1.append("g").call(yAxisCall)

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes to the SVG
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
        

    const rects = g1.selectAll("circle").data(rawData)

    rects.enter().append("circle")
         .attr("cx", function(d){
             return x1(d.dataCGPA);
         })
         .attr("cy", function(d){
             return y1(d.dataDepression);
         })
         .attr("r", 3)
         .attr("fill", "#69b3a2")

    
}).catch(function(error)
{
    console.log(error);
});



//BREAK POINT DIVIDING MY CODE AND THEIRS





d3.csv("players.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.AB = Number(d.AB);
        d.H = Number(d.H);
        d.salary = Number(d.salary);
        d.SO = Number(d.SO);
    });
    
//filtering data
    rawData = rawData.filter(d=>d.AB>abFilter);
//creaintg the new array of data
    rawData = rawData.map(d=>{
                          return {
                              "H_AB":d.H/d.AB,
                              "SO_AB":d.SO/d.AB,
                              "teamID":d.teamID,
                          };
    });
    console.log(rawData);
    
//plot 1
    // const svg = d3.select("svg")

    // const g1 = svg.append("g")
    //             .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    //             .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    //             .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

    // // X label
    // g1.append("text")
    // .attr("x", scatterWidth / 2)
    // .attr("y", scatterHeight + 50)
    // .attr("font-size", "20px")
    // .attr("text-anchor", "middle")
    // .text("H/AB")
    

    // // Y label
    // g1.append("text")
    // .attr("x", -(scatterHeight / 2))
    // .attr("y", -40)
    // .attr("font-size", "20px")
    // .attr("text-anchor", "middle")
    // .attr("transform", "rotate(-90)")
    // .text("SO/AB")

    // // X ticks
    // const x1 = d3.scaleLinear()
    // .domain([0, d3.max(rawData, d => d.H_AB)])
    // .range([0, scatterWidth])

    // const xAxisCall = d3.axisBottom(x1)
    //                     .ticks(7)
    // g1.append("g")
    // .attr("transform", `translate(0, ${scatterHeight})`)
    // .call(xAxisCall)
    // .selectAll("text")
    //     .attr("y", "10")
    //     .attr("x", "-5")
    //     .attr("text-anchor", "end")
    //     .attr("transform", "rotate(-40)")

    // // Y ticks
    // const y1 = d3.scaleLinear()
    // .domain([0, d3.max(rawData, d => d.SO_AB)])
    // .range([scatterHeight, 0])

    // const yAxisCall = d3.axisLeft(y1)
    //                     .ticks(13)
    // g1.append("g").call(yAxisCall)

    // const rects = g1.selectAll("circle").data(rawData)

    // rects.enter().append("circle")
    //      .attr("cx", function(d){
    //          return x1(d.H_AB);
    //      })
    //      .attr("cy", function(d){
    //          return y1(d.SO_AB);
    //      })
    //      .attr("r", 3)
    //      .attr("fill", "#69b3a2")

//space
    // const g2 = svg.append("g")
    //             .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    //             .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    //             .attr("transform", `translate(${distrLeft}, ${distrTop})`)

//plot 2
    
    q = rawData.reduce((s, { teamID }) => (s[teamID] = (s[teamID] || 0) + 1, s), {});
    r = Object.keys(q).map((key) => ({ teamID: key, count: q[key] }));
    console.log(r);

           
    const g3 = svg.append("g")
                .attr("width", teamWidth + teamMargin.left + teamMargin.right)
                .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
                .attr("transform", `translate(${teamMargin.left}, ${teamTop})`)

    // X label
    g3.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Team")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of players")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(r.map(d => d.teamID))
    .range([0, teamWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g3.append("g")
    .attr("transform", `translate(0, ${teamHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(r, d => d.count)])
    .range([teamHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(r)

    rects2.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", (d) => x2(d.teamID))
    .attr("width", x2.bandwidth)
    .attr("height", d => teamHeight - y2(d.count))
    .attr("fill", "grey")



}).catch(function(error){
    console.log(error);
});

