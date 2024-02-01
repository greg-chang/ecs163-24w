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

}).catch(function (error) {
    console.log(error);
});
