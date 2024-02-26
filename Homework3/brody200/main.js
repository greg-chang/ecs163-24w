  let abFilter = 25;

  // Adjust the width and height of the SVG element
  const svgWidth = 800;
  const svgHeight = 350;
  const margin = { top: 50, right: 30, bottom: 30, left: 100 };
  const graph_width = svgWidth - margin.left - margin.right - 95;
  const graph_height = svgHeight - margin.top - margin.bottom - 20;

  // Explicitly append the SVG to the body and set its position


d3.csv("data/StudentMentalhealth.csv").then(healthData => {
    console.log("OG DATA: ",healthData);
    const healthData2 = healthData.map(d => {
        return {
            "dataGenderChoice": d["Choose your gender"],
            "dataAge": +d["Age"], // Convert to a number
            "dataCourse": d["What is your course?"],
            "dataCurYearStudy": d["Your current year of Study"],
            "dataCGPA": d["What is your CGPA?"], // Convert to a number
            "dataDepression": (d["Do you have Depression?"] === "Yes") ? 1 : 0, // Convert to a boolean
            "dataAnxiety": (d["Do you have Anxiety?"] === "Yes") ? 1 : 0, // Convert to a boolean
        };
    });
    console.log("DATA: ",healthData2)
    
    // Count the number of people in each GPA range with and without depression
    const rangeCounts = {
        '0 - 1.99': { 'No Depression': 0, 'Depression': 0 },
        '2.00 - 2.49': { 'No Depression': 0, 'Depression': 0 },
        '2.50 - 2.99': { 'No Depression': 0, 'Depression': 0 },
        '3.00 - 3.49': { 'No Depression': 0, 'Depression': 0 },
        '3.50 - 4.00': { 'No Depression': 0, 'Depression': 0 },
    };

    healthData2.forEach(person => {
        const gpaRange = person.dataCGPA;
        const depressionStatus = person.dataDepression ? 'Depression' : 'No Depression';

        if (rangeCounts[gpaRange]) {
            rangeCounts[gpaRange][depressionStatus]++;
        }
    });

    // Convert data to the format suitable for D3 bar chart
    const data = Object.entries(rangeCounts).map(([gpaRange, counts]) => ({
        gpaRange,
        counts,
    }));
    

    // Create SVG element
    const svg = d3.select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    //X TITLE
    svg.append("text")
    .attr("x", graph_width / 2)  // Adjusted to consider the left margin
    .attr("y", 0 + 20)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("CGPA vs DEPRESSION");


    //X LABEL
    svg.append("text")
    .attr("x", graph_width / 2)  // Adjusted to consider the left margin
    .attr("y", graph_height + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("CGPA RANGES");

    // Y label
    svg.append("text")
    .attr("x", -(svgHeight / 2) +30)
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("# of people with depression")
    // Define color scale
    const colorScale = d3.scaleOrdinal()
        .domain(['No Depression', 'Depression'])
        .range(['green', 'red']);

    // Create X and Y scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.gpaRange))
        .range([0, graph_width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.counts['No Depression'], d.counts['Depression']))])
        .range([graph_height, 0]);

    // Create X and Y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append X and Y axes to the SVG
    svg.append("g")
        .attr("transform", "translate(0," + graph_height + ")")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
    
    // X label

    // Create bars
    const bars = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", d => "translate(" + xScale(d.gpaRange) + "," + 0 + ")");

    // Create rectangles within each bar group
    bars.selectAll("rect")
        .data(d => Object.entries(d.counts).map(([status, count]) => ({ status, count })))
        .enter().append("rect")
        .attr("x", (d, i) => xScale.bandwidth() / 2 * i)  // Adjust x position based on index
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth() / 2)  // Divide bandwidth by 2 for each rectangle
        .attr("height", d => graph_height - yScale(d.count))
        .attr("fill", d => colorScale(d.status));


    // Create legend
    const legend = svg.append("g")
        .attr("transform", "translate(" + (graph_width + 10) + "," + 0 + ")");

    // Append colored rectangles
    legend.selectAll("rect")
        .data(['No Depression', 'Depression'])
        .enter().append("rect")
        .attr("y", (d, i) => i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale);

    // Append text to the legend
    legend.selectAll("text")
        .data(['No Depression', 'Depression'])
        .enter().append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => d);

    // Button event handlers
    d3.select("#showDepression").on("click", function() {
        // Select all bars and dynamically set opacity based on dataDepression attribute
        svg.selectAll(".bar rect")
        .transition()
        .duration(500) // Transition duration in milliseconds
        .attr("opacity", d => d.status === "Depression" ? 1 : 0.1); // Highlight depression data
    });
    
    d3.select("#showNoDepression").on("click", function() {
        // Select all bars and dynamically set opacity based on dataDepression attribute
        svg.selectAll(".bar rect")
        .transition()
        .duration(500) // Transition duration in milliseconds
        .attr("opacity", d => d.status === "No Depression" ? 1 : 0.1); // Highlight no depression data
    });
    d3.select("#showAll").on("click", function() {
        // Select all bars and dynamically set opacity based on dataDepression attribute
        svg.selectAll(".bar rect")
        .transition()
        .duration(500) // Transition duration
        .attr("opacity", 1); // Highlight no depression data
    });
  









    //PLOT 2


    const svgWidth2 = 800;
    const svgHeight2 = 400;
    const margin2 = { top: 50, right: 30, bottom: 30, left: 100 };
 
    const radius = 120;
   
    


    const yearCounts = {
        'year 1': { 'No Depression': 0, 'Depression': 0, 'No Anxiety': 0, 'Anxiety': 0, 'Total': 0 },
        'year 2': { 'No Depression': 0, 'Depression': 0, 'No Anxiety': 0, 'Anxiety': 0, 'Total': 0 },
        'year 3': { 'No Depression': 0, 'Depression': 0, 'No Anxiety': 0, 'Anxiety': 0, 'Total': 0 },
        'year 4': { 'No Depression': 0, 'Depression': 0, 'No Anxiety': 0, 'Anxiety': 0, 'Total': 0 },
        'year 5': { 'No Depression': 0, 'Depression': 0, 'No Anxiety': 0, 'Anxiety': 0, 'Total': 0 },
    };
    
    healthData2.forEach(person => {
        const yearOfStudy = person.dataCurYearStudy.toLowerCase();
        const depressionStatus = person.dataDepression ? 'Depression' : 'No Depression';
        const anxietyStatus = person.dataAnxiety ? 'Anxiety' : 'No Anxiety';
    
        if (yearCounts[yearOfStudy]) {
            yearCounts[yearOfStudy][depressionStatus]++;
            yearCounts[yearOfStudy][anxietyStatus]++;
            yearCounts[yearOfStudy]['Total']++;
        }
    });
    
    // Convert data to the format suitable for D3 pie chart
    const pieData = Object.entries(yearCounts).map(([year, counts]) => ({
        year,
        counts,
    }));
    console.log("pieData: ",pieData);
    
    // Create a pie chart
    const pieSvg = d3.select("body")
        .append("svg")
        .attr("width", svgWidth2)
        .attr("height", svgHeight2)
        .style("position", "absolute")
        .style("top", "-30")
        .style("left", "800")  // Adjusted left position for better visibility
        .append("g")
        .attr("transform", "translate(" + svgWidth2 / 2 + "," + svgHeight2 / 2 + ")");

    //X TITLE
    pieSvg.append("text")
    .attr("x", 0)  // Adjusted to consider the left margin
    .attr("y", 160)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("College Acaemic Year Demographic");
    pieSvg.append("text")
    .attr("x", 0)  // Adjusted to consider the left margin
    .attr("y", 180)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("of Depression and Anxiety");


    const pieGenerator = d3.pie().value(d => d.counts.Total);


    const arcs = pieGenerator(pieData);
    const legend2 = d3.select("body")
    .append("div")
    .attr("class", "legend")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "1400px")
    .html(`
        <strong>YEAR 1</strong><br>
        Total Students: ${pieData[0].counts.Total}<br>
        Depression Count: ${pieData[0].counts.Depression}<br>
        Anxiety Count: ${pieData[0].counts.Anxiety}
    `);

// Append paths for the pie chart
pieSvg.selectAll("path")
    .data(arcs)
    .enter().append("path")
    .attr("d", d3.arc().innerRadius(0).outerRadius(radius))
    .attr("fill", (d, i) => d3.schemeCategory10[i])
    .on("mouseover", (event, d) => {
        const year = event.data.year;
        const counts = event.data.counts;

        // Update the legend with information on mouseover
        legend2.html(`
            <strong>${year.toUpperCase()}</strong><br>
            Total Students: ${counts.Total}<br>
            Depression Count: ${counts.Depression}<br>
            Anxiety Count: ${counts.Anxiety}
        `);
    })
    .on("mouseout", () => {
       //do nothing on mouse out
       
    });



// plot 3

//part 1 data
const students = healthData;
  
  // Initialize a counter object for each year
  const yearCount = {
    "year 1": 0,
    "year 2": 0,
    "year 3": 0,
    "year 4": 0,
  };
  
  // Iterate over the dataset to count students in each year
  students.forEach(student => {
    const year = student["Your current year of Study"].toLowerCase(); // Normalize to lowercase for consistency
  
    if (yearCount.hasOwnProperty(year)) {
      yearCount[year]++;
    }
  });
  
  // Initialize the Sankey data array
  const sankeyData = [];
  
  // Add the Total Number of Students in Survey for each year to the Sankey data array
  Object.keys(yearCount).forEach(year => {
    sankeyData.push({
      source: "Total Number of Students in Survey",
      target: year,
      value: yearCount[year],
    });
  });
  
//part 2
const yearCGPACount = {
    'year 1': {'0 - 1.99': 0, '2.00 - 2.49': 0, '2.50 - 2.99': 0, '3.00 - 3.49': 0, '3.50 - 4.00': 0},
    'year 2': {'0 - 1.99': 0, '2.00 - 2.49': 0, '2.50 - 2.99': 0, '3.00 - 3.49': 0, '3.50 - 4.00': 0},
    'year 3': {'0 - 1.99': 0, '2.00 - 2.49': 0, '2.50 - 2.99': 0, '3.00 - 3.49': 0, '3.50 - 4.00': 0},
    'year 4': {'0 - 1.99': 0, '2.00 - 2.49': 0, '2.50 - 2.99': 0, '3.00 - 3.49': 0, '3.50 - 4.00': 0},
  };
  
  // Iterate over the dataset to count students in each year and CGPA range

  students.forEach(student => {
    const year = student["Your current year of Study"].toLowerCase(); // Normalize to lowercase for consistency
    const cgpa = student["What is your CGPA?"];
    // console.log(year, "CGPA: ",cgpa);
    
    if (yearCGPACount.hasOwnProperty(year)) {
      // Determine the CGPA range



      let cgpaRange = "";
      if (cgpa.includes("0 - 1.99")) {
        cgpaRange = "0 - 1.99";
      } else if (cgpa.includes("2.00 - 2.49")) {
        cgpaRange = "2.00 - 2.49";
      } else if (cgpa.includes("2.50 - 2.99") ){
        cgpaRange = "2.50 - 2.99";
      } else if (cgpa.includes("3.00 - 3.49")) {
        cgpaRange = "3.00 - 3.49";
      } else if (cgpa.includes("3.50 - 4.00")) {
        cgpaRange = "3.50 - 4.00";
      }
  
      // Increment the count for the corresponding year and CGPA range
      if (yearCGPACount[year].hasOwnProperty(cgpaRange)) {
        yearCGPACount[year][cgpaRange]++;
        // console.log("YENTERED YEAR: ",year, "CGPA: ",cgpa)
      }else{
        console.log("NENTERED YEAR: ",year, "CGPA: ",cgpa)
      }
    }
  });
  console.log("YearCGPACount",yearCGPACount);
  // Convert the count data to the specified format
Object.keys(yearCGPACount).forEach(year => {
    Object.keys(yearCGPACount[year]).forEach(cgpaRange => {
      sankeyData.push({
        source: year,
        target: cgpaRange,
        value: yearCGPACount[year][cgpaRange],
      });
    });
  });
//part 3
const cgpaDepressedCount = {
    "0 - 1.99": 0,
    "2.00 - 2.49": 0,
    "2.50 - 2.99": 0,
    "3.00 - 3.49": 0,
    "3.50 - 4.00": 0,
  };
students.forEach(student => {
    const cgpa = student["What is your CGPA?"];
    const hasDepression = student["Do you have Depression?"].toLowerCase().includes("yes");

    // Determine the CGPA range
    let cgpaRange = "";
    if (cgpa.includes("0 - 1.99")) {
        cgpaRange = "0 - 1.99";
    } else if (cgpa.includes("2.00 - 2.49")) {
        cgpaRange = "2.00 - 2.49";
    } else if (cgpa.includes("2.50 - 2.99")) {
        cgpaRange = "2.50 - 2.99";
    } else if (cgpa.includes("3.00 - 3.49")) {
        cgpaRange = "3.00 - 3.49";
    } else if (cgpa.includes("3.50 - 4.00")) {
        cgpaRange = "3.50 - 4.00";
    }

    // Increment the count for the corresponding CGPA range and depression status
    if (cgpaDepressedCount.hasOwnProperty(cgpaRange) && hasDepression === true) {
        // console.log("ENTER::");
        cgpaDepressedCount[cgpaRange]++;
    }
    });

    console.log("cgpaDEPRESSCOUNT: ",cgpaDepressedCount);

    // Convert the count data to the specified format
    Object.keys(cgpaDepressedCount).forEach(cgpaRange => {
    sankeyData.push({
        source: cgpaRange,
        target: "Depressed",
        value: cgpaDepressedCount[cgpaRange],
    });
    });

    console.log(sankeyData); // DATA HAS NOW BEEN FINISHED


    //CREATE SANKEY DATA SETUP
    sankeyDataStruc = {nodes: [], links: []};
    sankeyData.forEach((d) => {
        const nodesList = sankeyDataStruc.nodes.map((n) => n.name);
        if(!nodesList.includes(d.source) ){
            sankeyDataStruc.nodes.push({ name: d.source});
        }
        if(!nodesList.includes(d.target)){
            sankeyDataStruc.nodes.push({ name: d.target});
        }
        sankeyDataStruc.links.push({
            source: d.source,
            target: d.target,
            value: d.value
        });
    });
    sankeyDataStruc.links.forEach((l, lNdx) => {
        sankeyDataStruc.links[lNdx].source = sankeyDataStruc.nodes.indexOf(
            sankeyDataStruc.nodes.find((n) => n.name === l.source)
            );
        sankeyDataStruc.links[lNdx].target = sankeyDataStruc.nodes.indexOf(
            sankeyDataStruc.nodes.find((n) => n.name === l.target)
            );
    })
    const dimensions = {
        width: 1400, // Adjust based on available space
        height: 500, // Adjust based on the number of nodes and links
        margins: 10
      };

    // const sankey = d3.sankey()  
    //     .nodeWidth(15)
    //     .nodePadding(10)
    //     .size([dimensions.width, dimensions.height]);

    // const { nodes, links } = sankey(sankeyDataStruc);



    const svg3 = d3.select("body")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .style("position", "absolute")
        .style("top", "400")
        .style("left", "50");
        // .append("g")
        // .attr("overflow", "visible");
    
    const contentGroup = svg3.append('g');

    // Define the zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 4])
        .on('zoom', (d) => {
            // Apply the zoom transformation to the content group
            contentGroup.attr('transform', d3.event.transform);
        });
    
    // Apply the zoom behavior to the SVG container
    svg3.call(zoom);
    
      const sankeyViz = d3
        .sankey()
        .nodes(sankeyDataStruc.nodes)
        .links(sankeyDataStruc.links)
        .nodeAlign(d3.sankeyLeft)
        .nodeWidth(175)
        
        .extent([
        [0, 60],
        [
            dimensions.width - dimensions.margins * 2,
            dimensions.height - 20  * 2
        ]
        ]);
    sankeyViz();
    console.log("sankeyviz:: ",sankeyDataStruc);
    
    
    
    
    
    const colorScale2 = d3
        .scaleOrdinal()
        .domain(sankeyDataStruc.nodes.map((n) => n.name))
        .range([
          "#00008B",
          "#008B8B",
          "#B8860B",
          "#8B008B",
          "#483D8B",
          "#B22222",
          "#8B0000",
          "#DAA520",
          "#006600",
          "#00cc00",
          "992"
        ])
    console.log("SANKEY:",sankeyDataStruc);


  contentGroup
    .append("g")
    .style("position", "absolute")
    .style("top", "400")
    .style("left", "800")
    .attr("transform", `translate(${dimensions.margins},${dimensions.margins})`)
    .attr("height", dimensions.height - dimensions.margins * 2)
    .attr("width", dimensions.width - dimensions.margins * 2)
    .attr("overflow", "visible");

  const adjustor = (i) => {
    if (i === 8) {
      return 30;
    } else if (i === 6) {
      return -30;
    } else return 0;
  };

    contentGroup
    .append("text")
    .text("Sankey Chart of University Depression")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "31.25")
    .attr("font-weight", "600")
    .attr("y", "30");


  contentGroup // nodes
    .append("g")
    .selectAll("rect")
    .data(sankeyDataStruc.nodes)
    .join("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("fill", (d) => colorScale2(d.name))
    .attr("height", (d) => d.y1 - (d.y0))
    .attr("width", (d) => d.x1 - d.x0);

  contentGroup // linkspaths things
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.1)
    .selectAll("path")
    .data(sankeyDataStruc.links)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", function (d) {
      return d.width;
    });

  contentGroup //label names
    .append("g")
    .selectAll("text")
    .data(sankeyDataStruc.nodes)
    .join("text")
    .text((d) => d.name)
    .attr("class", (d) => d.depth)
    .attr("x", (d) => d3.mean([d.x0, d.x1]))
    .attr("y", (d) => d3.mean([d.y0, d.y1]))
    .attr("dy", (d) => `${-5 + adjustor(d.index)}px`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", (d) => (d.y1 - d.y0 < 20 ? "black" : "white"))
    .attr("font-family", "helvetica")
    .attr("font-weight", "400")
    .attr("font-size", "16")
    .style("text-shadow", ".5px .5px 2px #222");

  contentGroup // label values
    .append("g")
    .selectAll("text")
    .data(sankeyDataStruc.nodes)
    .join("text")
    .text((d) => `${d3.format("~s")(d.value)}`)
    .attr("x", (d) => d3.mean([d.x0, d.x1]))
    .attr("y", (d) => d3.mean([d.y0, d.y1]))
    .attr("dy", (d) => `${15 + adjustor(d.index)}px`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", (d) => (d.y1 - d.y0 < 20 ? "black" : "white"))
    .attr("font-family", "helvetica")
    .attr("font-weight", "200")
    .attr("font-size", "24")
    .style("text-shadow", ".5px .5px 2px #222");


    const legend3 = d3.select("body")
    .append("div")
    .attr("class", "legend")
    .style("position", "absolute")
    .style("top", "750px")
    .style("left", "1250px")
    .html(`
        <strong>Sankey Legened</strong><br>
        Column 1: Total Number of Students<br>
        Column 2: Academic Years<br>
        Column 3: CGPA Ranges and Number of students in the range<br>
        Column 4: Students with Depression
    `);

    TITLE3 = d3.select("body")
    .append("div")
    .attr("class", "legend")
    .style("position", "absolute")
    .style("top", "875px")
    .style("left", "100px")
    .style("font-size","30px")
    .html(`
        <strong>Number of Students -> Academic Year -> CGPA Ranges -> Depression </strong><br>
        
    `);




}).catch(function (error) {
    console.log(error);
});
