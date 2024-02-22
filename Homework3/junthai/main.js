// Justin Thai
let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

let pieLeft = 800, pieTop = 700;
let pieMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    pieWidth = 350,
    pieHeight = 350,
    pieRadius = Math.min(pieWidth, pieHeight)/2;

let scatterLeft = 0, scatterTop = 50;
let scatterMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;


let barLeft = 400, barTop = 450;
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

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", scatterWidth)
    .attr("height", scatterHeight);


const g1 = svg.append("g")
    .attr("width", scatterWidth)
    .attr("height", scatterHeight)
    .attr("transform", `translate(${scatterMargin.left + scatterLeft}, ${scatterTop + scatterMargin.top})`);

    // adding zoom
    const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .extent([[0, 0], [scatterWidth, scatterHeight]])
    .translateExtent([[0, 0], [scatterWidth, scatterHeight]])
    .on("zoom", updateChart);

// creates the boundary of where the user can zoom (scatterplot)
g1.append("rect")
    .attr("width", scatterWidth + 50)
    .attr("height", scatterHeight + 50)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom);

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
    .attr("class", "x-axis")
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
g1.append("g")
    .attr("class", "y-axis")
    .call(yAxisCall);
let circleGroup = g1.append("g")
    .attr("clip-path", "url(#clip)");
    
const dots = circleGroup.selectAll("circle").data(rawData);

    dots.enter().append("circle")
        .attr("cx", function (d) {
            return x1(d.Weight);
        })
        .attr("cy", function (d) {
            return y1(d.Height);
        })
        .attr("r", 2.5)
        .attr("fill", "#5A5AE2");

function updateChart() {
        const newX = d3.event.transform.rescaleX(x1);
        const newY = d3.event.transform.rescaleY(y1);
    
        // updates the scaled axes
        g1.select(".x-axis").call(d3.axisBottom(newX));
        g1.select(".y-axis").call(d3.axisLeft(newY));
    
        // updates the position of the dots
        circleGroup.selectAll("circle")
            .attr("cx", function(d) { return newX(d.Weight); })
            .attr("cy", function(d) { return newY(d.Height); });
    }


// Plot 2 Bar Chart

const typeCounts = rawData.reduce((s, { Type_1 }) => (s[Type_1] = (s[Type_1] || 0) + 1, s), {});
const typeData = Object.keys(typeCounts).map((key, i) => ({ Type_1: key, count: typeCounts[key], originalOrder: i }));
console.log(typeData);
// added the originalOrder for the reset button

const g3 = svg.append("g")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .attr("transform", `translate(${barLeft}, ${barTop})`)

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
    .attr("x", barLeft + barWidth / 2 - 400) 
    .attr("y", barTop - 480)
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

const yAxisG = g3.append("g")
    .attr("class", "y axis")
    .call(yAxisCall2);

yAxisG.selectAll("text")
    .attr("x", "-10")
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

// Inserting bars with animation
bars.enter().append("rect")
    .attr("y", d => y2(d.Type_1))
    .attr("x", 0) 
    .attr("height", y2.bandwidth()) 
    .attr("width", 0) 
    .attr("fill", "lightblue")
    .on("click", function(d) { 
        var text = d3.select(this.parentNode).selectAll("text.value." + d.Type_1.replace(/\s/g, ''));

        if (text.empty()) {
            // If the text doesn't exist, create it
            d3.select(this.parentNode).append("text")
                .attr("class", "value " + d.Type_1.replace(/\s/g, ''))
                .attr("x", x2(d.count) + 10)
                .attr("y", y2(d.Type_1) + y2.bandwidth() / 2)
                .attr("dy", ".35em")
                .text(d.count);
            d3.select(this).attr("fill", "darkblue")
        } else {
            // If the text exists, remove it
            text.remove();
            d3.select(this).attr("fill", "lightblue")
        }
    })
    .transition() 
    .duration(2000) 
    .attr("width", d => x2(d.count));

    // descending button
    function sortBarsDescending() {
        // Sort the data in descending order
        typeData.sort((a, b) => d3.descending(a.count, b.count));
    
        // Update the y-scale domain after sorting the data
        y2.domain(typeData.map(d => d.Type_1));
    
        // Select all bars and update their y-position
        g3.selectAll("rect")
            .sort((a, b) => d3.descending(a.count, b.count)) // Sort the bars
            .transition()
            .duration(1000)
            .attr("y", d => y2(d.Type_1));
    
        // Update the y-axis
        yAxisG.transition()
        .duration(1000)
        .call(yAxisCall2); // update the y-axis with the new y-scale

        g3.selectAll("text.value").remove();

        // Reset the fill color of the bars
        g3.selectAll("rect").attr("fill", "lightblue");
    }
    // ascending button
    function sortBarsAscending() {
        typeData.sort((a, b) => d3.ascending(a.count, b.count));
    
        y2.domain(typeData.map(d => d.Type_1));
    
        g3.selectAll("rect")
            .sort((a, b) => d3.descending(a.count, b.count))
            .transition()
            .duration(1000)
            .attr("y", d => y2(d.Type_1));
    
        yAxisG.transition()
        .duration(1000)
        .call(yAxisCall2); 

        g3.selectAll("text.value").remove();
        g3.selectAll("rect").attr("fill", "lightblue");
    }
    // reset button 
    function resetBars() {
        typeData.sort((a, b) => d3.ascending(a.originalOrder, b.originalOrder));

        y2.domain(typeData.map(d => d.Type_1));
    
        g3.selectAll("rect")
            .sort((a, b) => d3.ascending(a.originalOrder, b.originalOrder))
            .transition()
            .duration(1000)
            .attr("y", d => y2(d.Type_1));
    
        yAxisG.transition()
            .duration(1000)
            .call(yAxisCall2);

            g3.selectAll("text.value").remove();
            g3.selectAll("rect").attr("fill", "lightblue");
    }
    
    
    
    d3.select("#sortButtonDescending").on("click", sortBarsDescending);
    d3.select("#sortButtonAscending").on("click", sortBarsAscending);
    d3.select("#resetButton").on("click", resetBars);

// Plot #3 Dendrogram
dendroSvg = svg.append("g")
    .attr("width", dendrogramWidth * 5)
    .attr("height", dendrogramHeight * 5)
    .attr("transform", `translate(${width - 900}, ${height - 800})`);

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

var dendroGroup = dendroSvg.append("g");

//creating the lines or paths for each node
dendroGroup.selectAll('path')
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
var nodes = dendroGroup.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

// adds the color to the circle
nodes.append("circle")
    .attr("r", 5)
    .style("fill", "#69b3a2")
    .attr("stroke", "black")
    .style("stroke-width", 2);

// text for each node
nodes.append("text")
    .attr("y", -20)
    .text(function(d) { return d.data.name; })
    .attr("text-anchor", "middle") 
    .attr("font-size", "15px") 
    .attr("fill", "black");

// title for dendrogram
svg.append("text")
    .attr("x", (dendrogramWidth / 2) + 455)
    .attr("y", dendrogramHeight - 800)
    .attr("font-size", "24px")
    .attr("text-anchor", "middle")
    .text("Evolution of Pokemon");

}).catch(function (error) {
    console.log(error);
});
