//By: @Nilesh Thiagarajan
// EVERYTHING HERE IS FORMATTED AND TAKES HEAVILY FROM THE TEMPLATE WE WERE GIVEN

//Setting up variables for height, width, margins for rest of project

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

//Filter  by 2 columns -- this is a modified version of the groupBy I used in project 1
//It takes inspiration from the example Observable notebook we were provided for project 1
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

    //Extracting average total stats by type for our bar graph 
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
    //Extracting only the flying types, and then isolating their name, weight, and speed
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
      

//MY PROJECT 3 IS JUST PROJECT 2 WITH MODIFICATIONS
//I GOT A LOT OF IDEAS FOR MY INTERACTIONS/ANIMATIONS FROM D3 GRAPH GALLERY
//https://d3-graph-gallery.com/graph/interactivity_zoom.html - zoom
//https://d3-graph-gallery.com/graph/parallel_custom.html - selection of multiple data points
//bar graph was more just from my knowledge but I still used d3 graph gallery to figure out how to have it initally animate in
      

    
//plot 1 -- Scatter Plot (Uses a bunch of code from template)
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

    
    svg.call(d3.zoom()
    .scaleExtent([1, 1.5])
    .on("zoom", function () {
        g1.attr("transform", d3.event.transform)
        }))

                
    

      
    

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

    

//plot 3 -- Parallel Plot -- Takes heavy inspiration from D3.js graph gallery website which is a work by Yan Holtz
//https://d3-graph-gallery.com/parallel

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
                .data("Parallel Plot of HP vs. Sp_Atk vs Sp_Def for Dragon vs. Bug Types *use bar chart for legend".split(" "))
                .enter().append("tspan")
        .text(function(d) { return d + " "; })
        .attr("fill", function(d) { return d === "Dragon" ? colours["Dragon"] : "black"; })
        


    // Extract the dimensions we want'
  delete rawData.columns;
  const dragdata = temp5["Bug"].concat(temp5["Dragon"])
  dimensions = Object.keys(dragdata[0]).filter(function(d) { return d == "HP" || d == "Sp_Atk" || d == "Sp_Def"})
  console.log(dimensions)
  console.log(dragdata)

  // Build Y scales
  const y = {}
  for (i in dimensions) {
    let name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain( d3.extent(dragdata, function(d) { return +d[name]; }) )
      .range([distrHeight, 0])
  }

  // Build the X scale 
  x = d3.scalePoint()
    .range([0, distrWidth])
    .padding(1)
    .domain(dimensions);

  //Create highlight function

  

    for (let i = 0; i < dragdata.length; i++){
        if (dragdata[i].Type_1 == "Dragon" || dragdata[i].Type_2 == "Dragon"){
            dragdata[i]["drag"]="dragon";
        }
        
            
        else{
            dragdata[i]["drag"]="none";
        }
    }

    console.log(dragdata);
    
  const temp = {"dragon": colours["Dragon"], "none": colours["Bug"]}

  const highlight = function(event,d){
    let curr = dragdata[d].drag;
    console.log(curr);
    
    d3
    .selectAll(".line")
    .transition().duration(200)
    .style("stroke","lightgrey")
    .style("opacity","0.1");
    
    
    d3
    .selectAll("." + curr)
    .transition().duration(200)
    .style("stroke", temp[curr])
    .style("opacity", "1");
    



  }

  //unhighlight
  
  const unhighlight = function(event,d){
    
    g2.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", colours["Fire"])
      .style("opacity", "1")


  }
  

  // The path function takes a row of the csv as input, and return x and y coordinates
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  // Draw the lines

  
  g2
    .selectAll("myPath")
    .data(dragdata)
    .join("path")
    .attr("class", function (d) { return "line " + d.drag} )
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", colours["Fire"])
    .style("opacity", 0.5)
    .on("mouseover",highlight)
    .on("mouseleave",unhighlight)

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
            
         
    
            


//plot 2 Bar Graph -- Inspired by the template code
    
    
    
           
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
    .attr("class", "x-axis")
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
    .attr("y", d => y2(0))
    .attr("x", (d) => x2(d.name))
    .attr("width", x2.bandwidth)
    .attr("height", d => teamHeight - y2(0))
    .attr("fill", function(d){
        return(color(d.name))
    })

    g3.selectAll("rect")
    .transition()
    .duration(800)
    .attr("y", d => y2(d.total))
    .attr("height", d => teamHeight - y2(d.total))
    .delay((d,i) => {console.log(i); return i*100})


    g3.append("text")
    .attr("x", 0)
    .attr("y", -(teamHeight / 10))
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    .attr("fill", "red")
    .style("cursor", "pointer")  // Add pointer cursor for better interaction
    .text("Sort desc")
    .style("stroke", "red")      // Border color
    .style("stroke-width", "1px") // Border width;
    .on("click", function() {
        stat_total.sort(function(a, b) {
            return b.total - a.total;
        });
    
        
        
        //Reset X scales so names shift over
        x2.domain(stat_total.map(d => d.name))
        xAxisCall2.scale(x2)

        //Run everything all over again
        g3.select(".x-axis") 
        .attr("transform", `translate(0, ${teamHeight})`)
        .call(xAxisCall2)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");
    
        // Transition the bars to their new positions
        g3.selectAll("rect")
            .data(stat_total) 
            .transition()
            .duration(1000)
            .attr("y", d => y2(d.total))
            .attr("height", d => teamHeight - y2(d.total))
            .attr("fill", function(d){
                return(color(d.name))
            })

    })

    g3.append("text")
    .attr("x", teamWidth/8)
    .attr("y", -(teamHeight / 10))
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    .attr("fill", "red")
    .style("cursor", "pointer")  // Add pointer cursor for better interaction
    .text("Sort asc")
    .style("stroke", "red")      // Border color
    .style("stroke-width", "1px") // Border width;
    .on("click", function() {
        stat_total.sort(function(a, b) {
            return a.total - b.total;
        });
    
        
        
        //Reset X scales so names shift over
        x2.domain(stat_total.map(d => d.name))
        xAxisCall2.scale(x2)

        //Run everything all over again
        g3.select(".x-axis") 
        .attr("transform", `translate(0, ${teamHeight})`)
        .call(xAxisCall2)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");
    
        // Transition the bars to their new positions
        g3.selectAll("rect")
            .data(stat_total) 
            .transition()
            .duration(1000)
            .attr("y", d => y2(d.total))
            .attr("height", d => teamHeight - y2(d.total))
            .attr("fill", function(d){
                return(color(d.name))
            })

    })


   

    console.log(stat_total)

      


    





























}).catch(function(error){
    console.log(error);
});
