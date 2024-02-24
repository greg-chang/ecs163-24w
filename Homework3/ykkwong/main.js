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
  // select only certain lines?
  
  const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${parallelMargin.top})`)
  
  // var x = d3.scalePoint().range([0, parallelWidth]).padding(1);
  // y = {};

  var line = d3.line(),
    axis_g1 = d3.axisLeft();
                // .attr("class", "brush")
                // .call(d3.brush().on("brush", brushed));
  // https://d3-graph-gallery.com/graph/parallel_basic.html
  // Extract the list of dimensions we want to keep in the plot. Keep all except the categoricals with too many unique values (>50).
  allDimensions = Object.keys(data[0]);
  dimensions = allDimensions.filter(function (d) {
    return (d != "job_title" &&
      d != "employee_residence" && d != "company_location" && d != "salary")
  });
  
  // For each dimension, build a linear scale if numerical, else ordinal scale. Store all in a y object
  var y1 = {}
  for (i in Object.keys(data[0])) {
    dim = Object.keys(data[0])[i]
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
  x_g1 = d3.scalePoint()
    .range([0, parallelWidth])
    .padding(1)
    .domain(dimensions);
/*
  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x_g1(p), y1[p](d[p])]; }));
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
    // .onmousehover(brush())
    
  // Draw the axis:
  g1.selectAll("myAxis")
    // For each dimension of the dataset, add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // Translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x_g1(d) + ")"; })
    // Build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y1[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
  */
  g1.append("text")
    .attr("x", (width / 2))             
    .attr("y", -25)
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Overview of Data Scientist Work Aspects");
  /*
  
    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }
    
  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
        extents = actives.map(function(p) { return y[p].brush.extent(); });
    foreground.style("display", function(d) {
      return actives.every(function(p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
      }) ? null : "none";
    });
    
    // highlight brushed axes
    allDimensions.forEach(function(dimension) {
      svg.select('g[data-id="'+dimension+'"]').classed('selected', actives.indexOf(dimension) > -1);
    });
  }
   */
  // Extract the list of dimensions and create a scale for each.
  // x.domain(dimensions = Object.keys(data[0]).filter(function(d) {
  //   return d != "name" && (y[d] = d3.scaleLinear()
  //       .domain(d3.extent(data, function(p) { return +p[d]; }))
  //       .range([parallelHeight, 0]));
  // }));

  // Add grey background lines for context.
  g1//.append("g")
      // .attr("class", "background")
      .selectAll("myPath")
      .data(data)
      .join("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", "#ddd")
    .style("opacity", 0.5)
  // console.log(path)

  // Add blue foreground lines for focus.
  foreground = g1.append("g")
      .attr("class", "foreground")
      .selectAll("myPath")
      .data(data)
      .join("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)

  // Add a group element for each dimension.
  var g = g1.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x_g1(d) + ")"; });

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis_g1.scale(y1[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) { 
          d3.select(this).call(y1[d].brush = d3.brushY()
            .extent([[-10,0], [10,parallelHeight]])
            .on("brush", brush)           
            .on("end", brush)
            )
        })
    .selectAll("rect")
      .attr("x", -8)
    .attr("width", 16);
  // Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [x_g1(p), y1[p](d[p])]; }));
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {  
  var actives = [];
  svg.selectAll(".brush")
    .filter(function(d) {
          y1[d].brushSelectionValue = d3.brushSelection(this);
          return d3.brushSelection(this);
    })
    .each(function(d) {
        // Get extents of brush along each active selection axis (the Y axes)
          actives.push({
              dimension: d,
              extent: d3.brushSelection(this).map(y1[d].invert)
          });
    });

  // Update foreground to only display selected values
  foreground.style("display", function(d) {
      return actives.every(function(active) {
          return active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
      }) ? null : "none";
  });
}
  // ----------------------------------------------------------------------------------
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
  var x_g2 = d3.scaleLinear()
    .domain([0, 200000])
    .range([0, barWidth]);
  
  let axis = d3.axisBottom(x_g2)

  g2.append("g")
    .attr("transform", "translate(" + barLeft + ',' + (barHeight+barMargin.top+210) + ")")
    .call(axis)
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
  
  
  // Y axis
  var y = d3.scaleBand()
    .range([0, barHeight / 3])
    .domain([...new Set(data.map(item => item['experience_level']))])
    .padding(0.05)
  
  g2.append("g")
    .attr("class", "y_axis_g2")
    .call(d3.axisLeft(y))
    .attr("transform", "translate(" + barLeft + ',' + y_axis_start + ")")
  
  g2
    .selectAll("rect") 
    .data(formattedData)
    .join("rect")
    .attr("x", x_g2(0) )
    .attr("y", d => y(d.exp_lvl))
    .attr("width", d => x_g2(d.average))
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
  
  x_g2 = d3.scalePoint()
      .domain([...new Set(data.map(item => item['work_year']))].sort())
      .range([ lineMargin.left, lineWidth-50 ]);
  g3.append("g")
    .attr("transform", "translate(0," + (height/2 + 255) + ")")
    .call(d3.axisBottom(x_g2));
      
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
        .x(d => x_g2(d.year))
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
      .attr("cx", d => x_g2(d.year))
      .attr("cy", d => y(d.average))
      .attr("r", 5)
      .attr("fill", "#69b3a2")
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("Salary: " + d3.format(",.2f")(d.average))
        .style("left", (event.pageX + 10) + "px")
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
