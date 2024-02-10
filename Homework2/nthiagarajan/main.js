let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = width/2 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = width/2, distrTop = 40;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = width/2 + 200 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 450;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height - 500 - teamMargin.top - teamMargin.bottom;

//Filter  by 2 columns
function groupBy(objectArray, property, property2) {
    return objectArray.reduce(function (acc, obj) {
      let key = obj[property]
      let key2 = obj[property2]
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj)
      if (key2 !== "") {
        if (!acc[key2]) {
            acc[key2] = []
        }
        acc[key2].push(obj)
      }
      return acc
    }, {})
}

d3.csv("data/pokemon.csv").then(rawData =>{
    console.log("rawData", rawData);
    

    /*
    rawData.forEach(function(d){
        
        
    });
    */

    
    
    

    
    temp5 = groupBy(rawData,"Type_1","Type_2");
    console.log(temp5);
    const typestotal = () => {
        let type = groupBy(rawData, "Type_1","Type_2");
        let result = [];
        Object.keys(type).forEach(d => {
          // A lot of this code is inspired by the example
          
          let temp = 0;
          for (let i = 0; i < type[d].length;i++){
            temp += Number(type[d][i].Total);
            
          }
          
          result.push({
            name: d,
            total: temp / type[d].length,
          });
        });
      
        return result;
        
      }
      const flying = () => {
        let result = [];
        temp5["Flying"].forEach(curr => {
            result.push({
                name: curr.Name,
                weight: Number(curr.Weight_kg),
                speed: Number(curr.Speed),
            });
        });
        return result;
    }

    

        

      const stat_total = typestotal();
      console.log(stat_total);
      const fly_stat = flying();
      console.log(fly_stat);
      


      

    
//plot 1
    const colours = {
    Normal: '#A8A77A',
    Fire: '#EE8130',
    Water: '#6390F0',
    Electric: '#F7D02C',
    Grass: '#7AC74C',
    Ice: '#96D9D6',
    Fighting: '#C22E28',
    Poison: '#A33EA1',
    Ground: '#E2BF65',
    Flying: '#A98FF3',
    Psychic: '#F95587',
    Bug: '#A6B91A',
    Rock: '#B6A136',
    Ghost: '#735797',
    Dragon: '#6F35FC',
    Dark: '#705746',
    Steel: '#B7B7CE',
    Fairy: '#D685AD',
    };
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
    .text("Pokemon weight (kg)")
    

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Speed stat")

    svg.append("text")
    .attr("x", scatterWidth / 2 + scatterMargin.left + 10)
    .attr("y", 20)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .selectAll("tspan")
    .data("Weight(kg) vs. Speed of Flying type pokemon".split(" "))
                .enter().append("tspan")
                .text(function(d) { return d + " "; })
                .attr("fill", function(d) { return d === "Flying" ? colours["Flying"] : "black"; });

   



    

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(fly_stat, d => d.weight)])
    .range([0, scatterWidth])

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(7)
    g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y1 = d3.scaleLinear()
    .domain([0, d3.max(fly_stat, d => d.speed)])
    .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13)
    g1.append("g").call(yAxisCall)

    const rects = g1.selectAll("circle").data(fly_stat)

    rects.enter().append("circle")
         .attr("cx", function(d){
             return x1(d.weight);
         })
         .attr("cy", function(d){
             return y1(d.speed);
         })
         .attr("r", 2)
         .attr("fill", colours["Flying"])

//plot 3
    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`)
    g2.append("text")
                .attr("x", distrWidth / 2)
                .attr("y", distrHeight + 50)
                .attr("font-size", "16px")
                .attr("text-anchor", "middle")
                .attr("fill","blue")
                .selectAll("tspan")
                .data("Parallel Plot of HP vs. Sp_Atk vs Sp_Def for Dragon Types".split(" "))
                .enter().append("tspan")
        .text(function(d) { return d + " "; })
        .attr("fill", function(d) { return d === "Dragon" ? colours["Dragon"] : "black"; });


    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  const dragdata = temp5["Dragon"]
  dimensions = Object.keys(dragdata[0]).filter(function(d) { return d == "HP" || d == "Sp_Atk" || d == "Sp_Def"})
  console.log(dimensions)
  console.log(dragdata)

  // For each dimension, I build a linear scale. I store all in a y object
  const y = {}
  for (i in dimensions) {
    let name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain( d3.extent(dragdata, function(d) { return +d[name]; }) )
      .range([distrHeight, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, distrWidth])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  // Draw the lines
  g2
    .selectAll("myPath")
    .data(dragdata)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", colours["Dragon"])
    .style("opacity", 0.5)

  // Draw the axis:
  g2.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
            
         
    
            


//plot 2
    
    

           
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
    .text("Type")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Average total stats")

    g3.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamHeight + 80)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .attr("fill","Blue")
    .selectAll("tspan")
                .data("Average total stats of a pokemon categorized by type".split(" "))
                .enter().append("tspan")
                .text(function(d) { return d + " "; })
                .attr("fill", function(d) { return (d === "pokemon") ? colours["Water"] : (d === "type") ? colours["Fire"] : "black"; });

   

    // X ticks
    const x2 = d3.scaleBand()
    .domain(stat_total.map(d => d.name))
    .range([0, teamWidth])
    .paddingInner(0.3)
    .paddingOuter(0.4)

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
    
    const color = d3.scaleOrdinal()
    .domain(Object.keys(colours))
    .range(Object.values(colours));
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(stat_total, d => d.total)])
    .range([teamHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(stat_total)


    rects2.enter().append("rect")
    .attr("y", d => y2(d.total))
    .attr("x", (d) => x2(d.name))
    .attr("width", x2.bandwidth)
    .attr("height", d => teamHeight - y2(d.total))
    .attr("fill", function(d){
        return(color(d.name))
    })

    





























}).catch(function(error){
    console.log(error);
});
