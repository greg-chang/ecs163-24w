let abFilter = 25
const width = window.innerWidth;
const height = window.innerHeight;

let parallelLeft = 0, parallelTop = 0;
let parallelMargin = {top: 40, right: 0, bottom: 10, left: 0},
    parallelWidth = width,
    parallelHeight = 350 - parallelMargin.top;

let barLeft = 130, barTop = 450 + parallelHeight;
let barMargin = {top: parallelHeight, right: 30, bottom: 30, left: 30},
    barWidth = width/2 - 200,
    barHeight = 350 - height - parallelHeight;

let lineLeft = barLeft + 100, lineTop = 40;
let lineMargin = {top: parallelHeight, right: 30, bottom: 30, left: 30},
    lineWidth = width/2 - 200,
    lineHeight = 350 - height - parallelHeight;

// get the data
d3.csv("ds_salaries.csv").then(data => {
  
  const svg = d3.select("svg")
  // parallel plot
  
  const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${parallelMargin.top})`)
  // https://d3-graph-gallery.com/graph/parallel_basic.html
  // Extract the list of dimensions we want to keep in the plot. Keep all except the categoricals with too many unique values (>50).
  allDimensions = Object.keys(data[0])
  dimensions = allDimensions.filter(function (d) {
    return (d != "job_title" &&
      d != "employee_residence" && d != "company_location" && d != "salary")
  });
  
  // For each dimension, build a linear scale if numerical, else ordinal scale. Store all in a y object
  var y1 = {}
  for (i in dimensions) {
    dim = dimensions[i]
    if (dim != 'salary' && dim != 'salary_in_usd') {
      const uniqueDimVals = [...new Set(data.map(item => item[dim]))].sort();
      // console.log(uniqueDimVals)
      y1[dim] = d3.scalePoint()
        .domain( uniqueDimVals )
        .range([parallelHeight, 0])
    }    
    else {
      y1[dim] = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { return +d[dim]; }) )
        .range([parallelHeight, 0])
    }
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, parallelWidth])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y1[p](d[p])]; }));
  }  

  // Draw the lines
  g1
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

  // Draw the axis:
  g1.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y1[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
  
  g1.append("text")
    .attr("x", (width / 2))             
    .attr("y", -25)
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Overview of Data Scientist Work Aspects");
  
  // ----------------------------------------------------------------------------------
  // add zoom
  // bar graph: average salary per experience level
  
  const g2 = svg.append("g")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .attr("transform", `translate(${barMargin.left}, ${barTop})`)
    // .call(zoom);
    
  
  function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }
  
  
  let experience_level_groups = groupBy(data, "experience_level");
  let formattedData = [];
  Object.keys(experience_level_groups).forEach(d => {
    let initialValue = 0;
    let cumulativeSalary = experience_level_groups[d].reduce((acc, curvalue) => acc + Number(curvalue.salary_in_usd), initialValue);
    let average = cumulativeSalary / experience_level_groups[d].length ;
    
    let processedObj = {
      exp_lvl: d,
      average: average
    }
    formattedData.push(processedObj);
  });
  
  let y_axis_start = (barHeight+barMargin.top+210);

  // X axis
  var x = d3.scaleLinear()
    .domain([0, 200000])
    .range([0, barWidth]);
  
  g2.append("g")
    .attr("transform", "translate(" + barLeft + ',' + (barHeight+barMargin.top+210) + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
      
  // Y axis
  var y = d3.scaleBand()
    .range([ 0, barHeight/3 ])
    .domain([...new Set(data.map(item => item['experience_level']))])
    .padding(0.05);
  
  g2.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", "translate(" + barLeft + ',' + y_axis_start + ")")
  
  g2
    .selectAll("rect") 
    .data(formattedData)
    .join("rect")
    .attr("x", x(0) )
    .attr("y", d => y(d.exp_lvl))
    .attr("width", d => x(d.average))
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .attr("transform", "translate(" + barLeft + ',' + y_axis_start + ")")
    
  g2.append("text")
    .attr("transform", "translate(" + (barLeft + barMargin.left + 150) + ',' + (barHeight + parallelHeight - 20) + ")")
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Average Salary in USD by Experience Level");
  
  // axes labels
  g2.append("text")
    .attr("transform", "translate(" + (barLeft + barMargin.left - 70) + ',' + (barHeight + parallelHeight + 125) + ")rotate(-90)")
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Experience Level");
  
  g2.append("text")
    .attr("transform", "translate(" + ((barLeft + barMargin.left)*2.3) + ',' + (barHeight + parallelHeight * 1.85) + ")")
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Salary in USD");
  
  // function zoom(g2) {
  //   const extent = [[barLeft, barMargin.top], [barWidth - barMargin.right, barHeight - barMargin.top]];

  //   g2.call(d3.zoom()
  //       .scaleExtent([1, 8])
  //       .translateExtent(extent)
  //       .extent(extent)
  //       .on("zoom", zoomed));

  //   function zoomed(event) {
  //     y.range([barMargin.left, barWidth - barMargin.right].map(d => event.transform.applyX(d)));
  //     g2.selectAll("rect").attr("x", d => x(d.average)).attr("width", x.bandwidth());
  //     g2.selectAll("x").call(x);
  //   }
  // }
  //-----------------------------------------------------------------------------------
  // add brush tooltip over data points
  // animate line stroke?
  // line chart year vs average salary
  const g3 = svg.append("g")
    .attr("width", lineWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
    .attr("transform", `translate(${lineMargin.left + 50 + barWidth + 200}, ${lineTop})`)
              
  let years = groupBy(data, "work_year");
  formattedData = [];
  Object.keys(years).forEach(d => {
    let initialValue = 0;
    let cumulativeSalary = years[d].reduce((acc, curvalue) => acc + Number(curvalue.salary_in_usd), initialValue);
    let average = cumulativeSalary / years[d].length ;
    
    let processedObj = {
      year: d,
      average: average
    }
    formattedData.push(processedObj);
  });
  
  x = d3.scalePoint()
      .domain([...new Set(data.map(item => item['work_year']))].sort())
      .range([ lineMargin.left, lineWidth-50 ]);
  g3.append("g")
    .attr("transform", "translate(0," + (height/2 + 255) + ")")
    .call(d3.axisBottom(x));
      
  y = d3.scaleLinear()
    .domain( [90000, 160000])
    .range([ height-100, height/2 ]);
  g3.append("g")
    .call(d3.axisLeft(y));
  
  // Add the line
  // Function to animate the line stroke
  function animateLineStroke() {
    // Add the line with stroke animation
    g3.append("path")
      .datum(formattedData)
      .attr("class", "animated-path") // Add a specific class to prevent removal of axes lines
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => x(d.year))
        .y(d => y(d.average))
    )
    
      .each(function() {
        const path = this;
        const totalLength = path.getTotalLength();
        d3.select(path)
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(2000) // Duration of animation in milliseconds
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      });
    }

    // Call animateLineStroke function initially
    animateLineStroke();

    g3.append("g")
      .attr("class", "replay-button")
      .append("rect")
      .attr("x", 50)
      .attr("y", parallelHeight+100)
      .attr("width", 120)
      .attr("height", 30)
      .attr("fill", "#ddd")
      .attr("rx", 5)
      .on("click", function() {
        // Clear existing paths
        g3.selectAll(".animated-path").remove();
        // Re-run the animation
        animateLineStroke();
      }); 
      
  var tooltip = d3.select('body')
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
  // Add the points
  g3.append("g")
    .selectAll("dot")
    .data(formattedData)
    .join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.average))
      .attr("r", 5)
      .attr("fill", "#69b3a2")
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("Y-value: " + d3.format(",.2f")(d.average))
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
      // console.log(event.pageX+ ', ' + event.pageY)
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
  
  
  // chart title
  g3.append("text")
    .attr("transform", "translate(" + (200) + ',' + (350) + ")")
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Average salary in USD across years");
  
  // axes labels
  g3.append("text")
    .attr("transform", "translate(" + (-80) + ',' + (parallelHeight + 150) + ")rotate(-90)")
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("USD");
  
  g3.append("text")
    .attr("transform", "translate(" + (lineWidth/2 - 30) + ',' + (parallelHeight + 330) + ")")
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Year");
  
  g3.select(".replay-button")
    .append("text")
    .style("font-size","12px")
    .attr("x", 110)
    .attr("y", parallelHeight+120)
    .attr("text-anchor", "middle")
    .text("Click me!");
  
  
}).catch(function(error){
  console.log(error);
});
