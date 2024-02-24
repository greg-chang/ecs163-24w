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

const average = array => array.reduce((a, b) => a + b) / array.length;

d3.csv("cosmetics.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.Price = Number(d.Price);
        d.Rank = Number(d.Rank);
        d.Combination = Number(d.Combination);
        d.Dry = Number(d.Dry);
        d.Normal = Number(d.Normal);
        d.Oily = Number(d.Oily);
        d.Sensitive = Number(d.Sensitive);
    });

    
    let Moisturizer = [];
    let Cleanser = [];
    let Face_Mask = [];
    let Treatment = [];
    let Eye_cream = [];

    for(let i = 0; i < rawData.length; i++) {
        if (rawData[i].Label == "Moisturizer") {
            Moisturizer.push(rawData[i].Price);
        } else if (rawData[i].Label == "Cleanser") {
            Cleanser.push(rawData[i].Price);
        } else if (rawData[i].Label == "Face Mask") {
            Face_Mask.push(rawData[i].Price);
        } else if (rawData[i].Label == "Treatment") {
            Treatment.push(rawData[i].Price);
        } else {
            Eye_cream.push(rawData[i].Price);
        }
    }
    
    let mean_prices = [
        {
            label: "Moisturizer",
            price: average(Moisturizer)
        },
        {
            label: "Cleanser",
            price: average(Cleanser)
        },
        {
            label: "Face Mask",
            price: average(Face_Mask)
        },
        {
            label: "Treatment",
            price: average(Treatment)
        },
        {
            label: "Eye cream",
            price: average(Eye_cream)
        },
    ];

    console.log(mean_prices);



    
// bar plot
const svg = d3.select("svg");

const g1 = svg
  .append("g")
  .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
  .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
  .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);
  
// X label
g1.append("text")
  .attr("x", scatterWidth / 2)
  .attr("y", scatterHeight + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Type of Cosmetic");

// Y label
g1.append("text")
  .attr("x", -(scatterHeight / 2))
  .attr("y", -40)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Average Price");

// X ticks
const x1 = d3
  .scaleBand()
  .domain(mean_prices.map((d) => d.label))
  .range([0, scatterWidth])
  .padding(0.3);

const xAxisCall = d3.axisBottom(x1).ticks(7);

g1.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${scatterHeight})`)
  .call(xAxisCall)
  .selectAll("text")
  .attr("y", "10")
  .attr("x", "-5");

// Y ticks
const y1 = d3
  .scaleLinear()
  .domain([0, d3.max(mean_prices, (d) => d.price)])
  .range([scatterHeight, 0]);

const yAxisCall = d3.axisLeft(y1).ticks(13);

g1.append("g").call(yAxisCall);

const rects = g1.selectAll("rect").data(mean_prices);

rects
  .enter()
  .append("rect")
  .attr("y", (d) => y1(d.price))
  .attr("x", (d) => x1(d.label))
  .attr("width", x1.bandwidth())
  .attr("height", (d) => scatterHeight - y1(d.price))
  .attr("fill", "steelblue");

// Add zoom and pan functionality
const zoomBehavior = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", zoomed);

g1.call(zoomBehavior);

function zoomed() {
  const transform = d3.event.transform;
  g1.attr("transform", transform);
  g1.select(".x-axis").call(xAxisCall.scale(transform.rescaleX(x1)));
}



  



//space
    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`)

// scatter plot
           
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
    .text("Price")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Rank")

    // X ticks
    const x2 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.Price)])
    .range([0, teamWidth])


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
    .domain([0, d3.max(rawData, d => d.Rank)])
    .range([teamHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    color = d3.scaleOrdinal()
    .domain(["Moisturizer", "Cleanser", "Face Mask", "Treatment", "Eye cream" ])
    .range([ "#ac92eb", "#4fc1e8", "#a0d568", "#ffce54", "#ed5564"])



    const circles = g3
    .selectAll("circle")
    .data(rawData)
    .enter()
    .append("circle")
    .attr("cx", (d) => x2(d.Price))
    .attr("cy", (d) => y2(d.Rank))
    .attr("r", 4)
    .style("fill", (d) => color(d.Label));
  
    const brushed = () => {
        if (d3.event.selection) {
          const [[x0, y0], [x1, y1]] = d3.event.selection;
      
          circles.each(function (d) {
            const cx = x2(d.Price);
            const cy = y2(d.Rank);
      
            d3.select(this)
              .classed("selected", cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1)
              .classed("not-selected", !(cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1))
              .style("fill", cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1 ? color(d.Label) : "grey");
          });
        }
      };
      
      const brushended = () => {
        if (!d3.event.selection) {
          circles.classed("selected", false).classed("not-selected", false).style("fill", (d) => color(d.Label));
        }
      };
      
      const brush = d3.brush()
        .extent([[0, 0], [teamWidth, teamHeight]])
        .on("start brush", brushed)
        .on("end", brushended);
      
      // Append a group element for the brush
      const brushGroup = g3.append("g")
        .attr("class", "brush")
        .call(brush);
      
      brushGroup.selectAll(".overlay") // This is to prevent the brush from being triggered outside the actual plot area
        .style("pointer-events", "all");
  


  let currentFilter = ""; // Keeps track of the current filter

  function toggleFilter(itemLabel) {
    // Check if the current filter is already applied
    if (currentFilter !== itemLabel) {
      // Filter data for the specified item label
      let filteredData = rawData.filter((sub) => sub.Label == itemLabel);
          
      // Log the filtered data
      console.log(filteredData);
    
      // Remove all existing circles
      g3.selectAll('circle').remove();
    
      // Bind the filtered data to the new selection of circles
      const newCircles = g3.selectAll('circle').data(filteredData);
    
      // Enter new data points
      newCircles.enter()
        .append('circle')
        .attr("cx", (d) => x2(d.Price))
        .attr("cy", (d) => y2(d.Rank))
        .attr("r", 4)
        .style("fill", (d) => color(d.Label));
        
      // Update the current filter
      currentFilter = itemLabel;
    }
    else {
      // Reset to show all items if the current filter is clicked again
      g3.selectAll('circle').remove();
    
      // Bind the original data to the new selection of circles
      const newCircles = g3.selectAll('circle').data(rawData);
    
      // Enter new data points
      newCircles.enter()
        .append('circle')
        .attr("cx", (d) => x2(d.Price))
        .attr("cy", (d) => y2(d.Rank))
        .attr("r", 4)
        .style("fill", (d) => color(d.Label));
        
      // Clear the current filter
      currentFilter = "";
    }
  }
  
svg.append("circle")
.attr("cx", teamWidth - 200)
.attr("cy", teamHeight + 150)
.attr("r", 6)
.style("fill", "#ac92eb")
.on("click", function() {
  toggleFilter("Moisturizer");
});

    // Filter the data first
    

    // If you used alert for debugging, consider using console.log or removing it for production

    svg.append("circle").attr("cx",teamWidth - 200).attr("cy", teamHeight + 180).attr("r", 6).style("fill", "#4fc1e8").on("click", function() {
      toggleFilter("Cleanser");
    })
    svg.append("circle").attr("cx",teamWidth - 200).attr("cy", teamHeight + 210).attr("r", 6).style("fill", "#a0d568").on("click", function() {
      toggleFilter("Face Mask");
    })
    svg.append("circle").attr("cx",teamWidth - 200).attr("cy", teamHeight + 240).attr("r", 6).style("fill", "#ffce54").on("click", function() {
      toggleFilter("Treatment");
    })
    svg.append("circle").attr("cx",teamWidth - 200).attr("cy", teamHeight + 270).attr("r", 6).style("fill", "#ed5564").on("click", function() {
      toggleFilter("Eye cream");
    })

    svg.append("text").attr("x", teamWidth - 180).attr("y", teamHeight + 150).text("Moisturizer").style("font-size", "15px").attr("alignment-baseline","middle").on("click", function() {
      toggleFilter("Moisturizer");
    })
    svg.append("text").attr("x", teamWidth - 180).attr("y", teamHeight + 180).text("Cleanser").style("font-size", "15px").attr("alignment-baseline","middle").on("click", function() {
      toggleFilter("Cleanser");
    })
    svg.append("text").attr("x", teamWidth - 180).attr("y", teamHeight + 210).text("Face Mask").style("font-size", "15px").attr("alignment-baseline","middle").on("click", function() {
      toggleFilter("Face Mask");
    })
    svg.append("text").attr("x", teamWidth - 180).attr("y", teamHeight + 240).text("Treatment").style("font-size", "15px").attr("alignment-baseline","middle").on("click", function() {
      toggleFilter("Treatment");
    })
    svg.append("text").attr("x", teamWidth - 180).attr("y", teamHeight + 270).text("Eye cream").style("font-size", "15px").attr("alignment-baseline","middle").on("click", function() {
      toggleFilter("Eye cream");
    })

        
    // Array of variable names
    const variables = ['Combination', 'Dry', 'Normal', 'Oily', 'Sensitive'];
    
    // Set dimensions of the plot
    const width = 400;
    const height = 350;
    const margin = { top: 30, right: 100, bottom: 30, left: 500 };
    const totalWidth = width + margin.left + margin.right;
    
    // Create an SVG container
    const g4 = svg.append("g")
    .attr("width", totalWidth)
    .attr("height", height)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Define scales for each variable
    const scales = {};
    variables.forEach((variable, index) => {
    scales[variable] = d3.scaleLinear()
        .domain([0,1])
        .range([0, height]);
    });


    
    // Create a path generator
    const path = d3.line()
    .x((d, i) => (i * (width / (variables.length - 1))))
    .y((d) => scales[d.variable](d.value))
    .curve(d3.curveLinear);
    
    // Draw the lines
    g4.selectAll("path")
    .data(rawData)
    .enter()
    .append("path")
    .attr("d", (d) =>
        path(variables.map((variable) => ({ variable, value: d[variable] })))
    )
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);
    
    // Draw the axes
    g4.selectAll("axis")
    .data(variables)
    .enter()
    .append("g")
    .attr("class", "axis")
    .attr("transform", (d, i) => "translate(" + i * (width / (variables.length - 1)) + ")")
    .each(function (d) {
        d3.select(this).call(d3.axisLeft(scales[d]))
        .append("text")
        .attr("class", "axis-title")
        .attr("x", 0)
        .attr("y", -10)
        .text(d);
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "black");














}).catch(function(error){
    console.log(error);
});

