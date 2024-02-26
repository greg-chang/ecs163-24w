//
let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

let pieLeft = 800, pieTop = 700;
let pieMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    pieWidth = 350,
    pieHeight = 350,
    pieRadius = Math.min(pieWidth, pieHeight)/2;

let scatterLeft = 0, scatterTop = 550;
let scatterMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;


let barLeft = 100, barTop = 30;
let barMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    barWidth = 500,
    barHeight = height - 500 - barMargin.top - barMargin.bottom;

let dendrogramLeft = 0, dendrogramTop = 0;
let dendroMargin = { top: 300, right: 600, bottom: -250, left: 700 },
    dendrogramWidth = width - 100,
    dendrogramHeight = height - dendroMargin.bottom - dendroMargin.top; 


//loading the data
d3.csv("pokemon.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function (d) {
        d.Total = Number(d.Total);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
    });

    rawData = rawData.filter(d => d.Total > abFilter);
    rawData = rawData.map(d => {
        return {
            "Attack": d.Attack,
            "Defense": d.Defense,
            "Weight": d.Weight_kg,
            "Height": d.Height_m,
            "Type_1": d.Type_1,
            "Color": d.Color,
            "Name": d.Name,
        };

});

// Plot 1
const svg = d3.select("svg");

const g1 = svg.append("g")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    .attr("transform", `translate(${scatterMargin.left}, ${scatterTop})`);

// X label
g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Weight (kg)");

// Y label
g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Height (m)");

// X ticks
const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Weight)])
    .range([0, scatterWidth]);

const xAxisCall = d3.axisBottom(x1)
    .ticks(7);

g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)");

g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Height vs Weight of Pokemon");

// Y ticks
const y1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Height)])
    .range([scatterHeight, 0]);

const yAxisCall = d3.axisLeft(y1)
    .ticks(13);
g1.append("g").call(yAxisCall);

const dots = g1.selectAll("circle").data(rawData);

dots.enter().append("circle")
    .attr("cx", function (d) {
        return x1(d.Weight);
    })
    .attr("cy", function (d) {
        return y1(d.Height);
    })
    .attr("r", 2.5)
    .attr("fill", "#5A5AE2");


// Plot 2 Bar Chart
const typeCounts = rawData.reduce((s, { Type_1 }) => (s[Type_1] = (s[Type_1] || 0) + 1, s), {});
const typeData = Object.keys(typeCounts).map((key) => ({ Type_1: key, count: typeCounts[key] }));
console.log(typeData);

const g3 = svg.append("g")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .attr("transform", `translate(${barLeft}, ${barTop})`);

// X label
g3.append("text")
    .attr("x", barWidth / 2)
    .attr("y", barHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Number of Pokemon");

// Y label
g3.append("text")
    .attr("x", -(barHeight / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Types of Pokémon");

//title
g3.append("text")
    .attr("x", barLeft + barWidth / 2 - 70)
    .attr("y", barTop - 35)
    .attr("font-size", "24px")
    .attr("text-anchor", "middle")
    .text("Number of Pokemon by Type");

// Y ticks
const y2 = d3.scaleBand()
    .domain(typeData.map(d => d.Type_1))
    .range([0, barHeight])
    .paddingInner(0.1)
    .paddingOuter(0.2);

const yAxisCall2 = d3.axisLeft(y2);
g3.append("g")
    .call(yAxisCall2)
    .selectAll("text")
    .attr("x", "-5")
    .attr("text-anchor", "end");

// X ticks
const x2 = d3.scaleLinear()
    .domain([0, d3.max(typeData, d => d.count)])
    .range([0, barWidth]);

const xAxisCall2 = d3.axisBottom(x2)
    .ticks(6);

g3.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(xAxisCall2);

const bars = g3.selectAll("rect").data(typeData);

//inserting bars
bars.enter().append("rect")
    .attr("y", d => y2(d.Type_1))
    .attr("x", 0) 
    .attr("height", y2.bandwidth()) 
    .attr("width", d => x2(d.count)) 
    .attr("fill", "lightblue");

//pieChart plot 3
const colorCounts = rawData.reduce((s, { Color }) => (s[Color] = (s[Color] || 0) + 1, s), {});
const colorData = Object.keys(colorCounts).map((key) => ({ color: key, count: colorCounts[key] }));
console.log(colorData);


const pieSvg = d3.select("#pieChartContainer").append("svg")
    .attr("width", pieWidth*4)
    .attr("height", pieHeight*4)
    .append("g")
    .attr("transform", `translate(${pieLeft},${pieTop})`);

// Create a pie chart
const pie = d3.pie().value(d => d.count);

// Define an arc for the pie chart
const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(pieRadius);

// Create pie chart segments
const arcs = pieSvg.selectAll("arc")
    .data(pie(colorData))
    .enter()
    .append("g");

// Fill the pie chart with color
arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => d.data.color)
    .attr("stroke", "black")
    .style("stroke-width", "3px")
    .style("opacity", 0.7);


// Add labels for each color segment
arcs.append("text")
    .attr("transform", d => {
        const [x, y] = arc.centroid(d);
        const angle = Math.atan2(y, x);
        const radius = pieRadius * 1.24;
        const xPos = Math.cos(angle) * radius;
        const yPos = Math.sin(angle) * radius;
        return `translate(${xPos},${yPos})`;
    })
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", 15)
    .text(d => {
        const percentage = (d.data.count / d3.sum(colorData, d => d.count) * 100).toFixed(1);
        return `${d.data.color}: ${percentage}%`;
    });
//pie chart title
pieSvg.append("text")
    .attr("x", 0)
    .attr("y", -pieRadius * 1.5)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Pokemon Color Percentage");

//dendrogram plot 4
dendroSvg = svg.append("g")
    .attr("width", dendrogramWidth * 5)
    .attr("height", dendrogramHeight * 5)
    .attr("transform", `translate(${width - 900}, ${height - 800})`);

//parsed data for Dendrogram
const dendroData = {
    name: "Pokemon",
        children: [
            {name: "Grass",
                children:[
                    {name: "Venusaur", children: [{name: "Ivysaur", children: [{name: "Bulbasaur"}]}]},
                    {name: "Vileplume", children: [{name: "Gloom", children: [{name: "Oddish"}]}]},

                ]
        
            },
            {name: "Water",
                children:[
                    {name: "Blastoise", children: [{name: "Wartortle", children: [{name: "Squirtle"}]}]},
                    {name: "Poliwrath", children: [{name: "Polywhirl", children: [{name: "Poliwag"}]}]},
                ]
        
            },
            {name: "Bug",
                children:[
                    {name: "Butterfree", children: [{name: "Metapod", children: [{name: "Caterpie"}]}]},
                    {name: "Beedrill", children: [{name: "Kakuna", children: [{name: "Weedle"}]}]},
                ]
        
            },
            {name: "Fire",
                children:[
                    {name: "Charizard", children: [{name: "Charmeleon", children: [{name: "Charmander"}]}]},
                    {name: "Typhlosion", children: [{name: "Quilava", children: [{name: "Cynaquil"}]}]},
                ]
        
            },

            {name: "Electric",
                children:[
                    {name: "Raichu", children: [{name: "Pikachu"}]},
                    {name: "Magnemite", children: [{name: "Magneton"}]},
                ]
        
            },
        ]
};

//creating the tree
cluster = d3.cluster().size([dendrogramHeight - 200, dendrogramWidth - 1500]);

//adding the root
root = d3.hierarchy(dendroData, function(d) {
    return d.children;
});
cluster(root);

//creating the lines or paths for each node
dendroSvg.selectAll('path')
    .data(root.descendants().slice(1))
    .enter()
    .append('path')
    .attr("d", function(d){
        return "M" + d.x + "," + d.y +
               "C" + (d.parent.x + (d.x - d.parent.x)) + "," + d.y +
               " " + (d.parent.x + (d.x - d.parent.x)) + "," + d.parent.y +
               " " + d.parent.x + "," + d.parent.y;
    })
    .style("fill", 'none')
    .attr("stroke", '#007eff')
    .attr("stroke-size", "2px");

//creating the circles for each node
dendroSvg.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    })
    .append("circle")
    .attr("r", 5)
    .style("fill", "#69b3a2")
    .attr("stroke", "black")
    .style("stroke-width", 2);

//labels for each node
dendroSvg.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("text")
    .attr("x", function(d) { return d.x;}) 
    .attr("y", function(d) { return d.y - 20; })
    .text(function(d) { return d.data.name; })
    .attr("text-anchor", "middle") 
    .attr("font-size", "15px") 
    .attr("fill", "black");

//title for dendrogram
svg.append("text")
    .attr("x", (dendrogramWidth / 2) + 455)
    .attr("y", dendrogramHeight - 800)
    .attr("font-size", "24px")
    .attr("text-anchor", "middle")
    .text("Evolution of Pokemon");

}).catch(function (error) {
    console.log(error);
});
