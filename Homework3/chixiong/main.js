// Chiyou Xiong, ECS 163 Information Interfaces, Homework 3
// Goal is to implement transitions and animations to the various data visualizations


// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * .9;
const height = 1080 * .7; 

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 50, bottom: 50, left: 100},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 50, bottom: 50, left: 100},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

// read the raw data from csv to plot
d3.csv("ds_salaries.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.workyear = Number(d.work_year);
        d.usdsalary = Number(d.salary_in_usd);
        d.experience = String(d.experience_level); 
        d.employment_type = String(d.employment_type);
        d.job_title = String(d.job_title);
        d.company_location = String(d.company_location);
        d.remote_ratio = Number(d.remote_ratio);
        d.employee_residence = String(d.employee_residence);
    }); 

    /* SE : Senior.
    EN : Entry level.
    EX : Executive level.
    MI : Mid/Intermediate level.
    */


   // want to calculate the sum and amount of entries for job title
    const sumAndCount = {};
    rawData.forEach(d => {
        const jobTitle = d.job_title;
        const salary = d.usdsalary;
        if (!sumAndCount[jobTitle]) {
            sumAndCount[jobTitle] = { sum: salary, count: 1 };
        } else {
        sumAndCount[jobTitle].sum += salary;
        sumAndCount[jobTitle].count++;
        }
    });

    // calculate average salary for each job title
    const averageSalary = {};
    for (const jobTitle in sumAndCount) {
        averageSalary[jobTitle] = sumAndCount[jobTitle].sum / sumAndCount[jobTitle].count;
    }

    // assigning average salary to each data point
    rawData.forEach(d => {
        d.avg_usdsalary = Number(averageSalary[d.job_title]);
    });

    const remoteWork = {
        count100: 0,
        count0: 0,
        totalcount: 0
    };
    rawData.forEach(d => {
        const remote = d.remote_ratio;
        if (remote == 100) {
            remoteWork.count100++;
        } else if ( remote == 0){
            remoteWork.count0++;
        }
    });

    console.log(remoteWork.count100); 
    console.log(remoteWork.count0);  
   

    console.log(rawData); 

    // plot 1 - bar plot - correlating usd salary with job title
    // barplot transition and animation idea: add a filter to the bar chart that changes and compresses
    // the plot according to the filter, meaning that if you wanted only 150k+ salaries, the bar chart
    // would only show them in a concise bar char instead of the entire range.

    const svg = d3.select("svg") // initialize the svg only in first plot never again
        .attr("width", width)
        .attr("height", height);


    r = Object.keys(averageSalary).map((key) => ({ job_title: key, avg_usdSalary: averageSalary[key] }));
    console.log(r);



    const g1 = svg.append("g")
        .attr("transform", `translate(${width * .05}, ${height * .55})`);

    // x axis label
    g1.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamHeight + 70) 
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")  
    .text("Job Title")

    // y axis label
    g1.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Average Salary")

    // graph label
    g1.append("text")
    .attr("x", width / 2.1)
    .attr("y", height / 1000 + 10)
    .attr("text-anchor", "middle")
    .text("Average Data Science Salary per Job Title")
    .attr("font-size", "20px");


    // x ticks
    const x2 = d3.scaleBand()
    .domain(Object.keys(averageSalary))
    .range([0, teamWidth])  
    .paddingInner(0.1)
    .paddingOuter(0.1)  

    const xAxisCall2 = d3.axisBottom(x2)    
    g1.append("g")
    .attr("transform", `translate(0, ${teamHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("font-size", "5px")
        .attr("transform", "rotate(-40)")

    // y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(Object.values(averageSalary))])
    .range([teamHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g1.append("g").call(yAxisCall2)



    

    const rects2 = g1.selectAll("rect")
        .data(r)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x2(d.job_title))
        .attr("y", d => y2(d.avg_usdSalary)) 
        .attr("width", x2.bandwidth())
        .attr("height", d => teamHeight - y2(d.avg_usdSalary))
        .attr("fill", "grey");

    
    // Define the zoom behavior (initially disabled)
    let zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .on("zoom", null);

    // Call the zoom function on the SVG element (initially disabled)
    svg.call(zoom);

    // Create a button to enable zoom
    const enableZoomButton = d3.select("body")
        .append("button")
        .text("Enable Zoom for Bar Chart");

    // Event listener for the button to enable zoom
    enableZoomButton.on("click", function() {
        // Define the zoom behavior (enabled)
        zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .on("zoom", zoomed);
        // Call the zoom function on the SVG element (enabled)
        svg.call(zoom);
    });

    // Define the zoomed function
    function zoomed() {
        g1.attr("transform", d3.event.transform);
    }
    

    // Create filter dropdown box using D3
    const filterOptions = [75000, 100000, 150000, 200000];
    const filterDropdown = d3.select("body")
    .append("select")
    .attr("id", "salaryFilter")
    .on("change", function() {
        const selectedValue = +this.value; // convert selected value to number
        const bars = g1.selectAll(".bar"); // reselect bars after filtering
        bars.attr("fill", d => d.avg_usdSalary > selectedValue ? "green" : "grey");
    });

    // default option text
    filterDropdown.append("option")
    .attr("selected", "selected")
    .text("Filter for Average Salaries per Job Title");

    // filter options
    filterDropdown.selectAll("option.filter-option")
    .data(filterOptions)
    .enter()
    .append("option")
    .attr("class", "filter-option")
    .attr("value", d => d)
    .text(d => `Average Salaries > ${d.toLocaleString()}`);



    
    // space
    
    const g2 = svg.append("g")
    .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    .attr("transform", `translate(${distrLeft}, ${distrTop})`)
 

    // plot 2 - pie chart - percentage of employees that work remotely vs not remotely
    // transition and animation idea: make the pie chart change into a bar chart that represents the
    // percentage of employees that work remotely vs not remotely 



    function drawPieChart() {
        const pieData = [
            { label: "Remote", count: remoteWork.count100 },
            { label: "Not Remote", count: remoteWork.count0 }
        ];
    
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.label))
        .range(["red", "blue"]);
    
    const pie = d3.pie()
        .value(d => d.count);
    
    const path = d3.arc()
        .outerRadius(width / 15 - 10)
        .innerRadius(0);
        
    
    const arc = g3.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", d => color(d.data.label))
        .append("title")
        .text(d => `${d.data.label}: ${d.data.count}`);

    arc.append("text")
        .attr("transform", d => `translate(${path.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text(d => {
            const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
            return `${percentage.toFixed(2)}%`; // where converted to percentage
        });
  
    const legendData = pieData.map(d => d.label);   // what is causing issues is this legend data and colors
    const legendColors = color.range();

    const legend = g3.append("g")
        .attr("transform", `translate(${width * .19}, ${height / 4})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d,i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
        .attr("x", -200)
        .attr("y", -210)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d,i) => legendColors[i]);

    legendItems.append("text")
        .attr("x", -180)
        .attr("y", -209.5)
        .attr("dy", "0.75em")
        .text(d => d)
        .attr("font-size", "10px");
    const title = g3.append("text")
        .attr("x", width / 66)
        .attr("y", height /  - 6)
        .attr("text-anchor", "middle")
        .text("Percentage of Remote Work vs Non-Remote Work")
        .attr("font-size", "10px");
 
    
    }

    function drawBarChart() {
        // clear the existing contents
        g3.selectAll(".bar, .bar-label").remove();

        // data for the bar chart
        const barData = [
            { label: "Remote", count: remoteWork.count100 },
            { label: "Not Remote", count: remoteWork.count0 }
        ];
        // scales for x and y axes
        const xScale = d3.scaleBand()
            .domain(barData.map(d => d.label))
            .range([0, teamWidth])
            .paddingInner(0.1)
            .paddingOuter(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(barData, d => d.count)])
            .range([teamHeight, 0]);

        // draw x-axis
        const xAxis = d3.axisBottom(xScale);
        g3.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${teamHeight})`)
            .call(xAxis);

        // draw y-axis
        const yAxis = d3.axisLeft(yScale);
        g3.append("g")
            .attr("class", "y-axis")
            .call(yAxis);
        // color scale to match the pie chart
        const g3colorScale = d3.scaleOrdinal()
            .domain(barData.map(d => d.label))
            .range(["red", "blue"]);
        // draw bars
        const bars = g3.selectAll(".bar")
            .data(barData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.label))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => teamHeight - yScale(d.count))
            .attr("fill", (d,i) => g3colorScale(d.label));

        // axis labels
        g3.selectAll(".bar-label")
            .data(barData)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.count) - 5)
            .attr("text-anchor", "middle")
            .text(d => d.count);
            // x axis label
        g3.append("text")
            .attr("x", teamWidth / 2)
            .attr("y", teamHeight + 70) 
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")  
            .text("Work Location")

        // y axis label
        g3.append("text")
            .attr("x", -(teamHeight / 2))
            .attr("y", -50)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Number of Employees")

        // graph label
        g3.append("text")
            .attr("x", width / 2.1)
            .attr("y", height * -.05)
            .attr("text-anchor", "middle")
            .text("Work Location of Data Science Employees")
            .attr("font-size", "20px");


            
    }

    const g3 = svg.append("g")
        .attr("transform", `translate(${width * .1}, ${height / 4})`);


    let currentChart = drawPieChart();
    chartCount = 1; 

    const button = d3.select("body").append("button")
        .text("Toggle Remote vs Non-Remote Work Chart Type")
    

    // button to change from pi chart to bar chart 
    button.on("click", function() {
        g3.selectAll("*").remove();
        if (chartCount === 1) {
            currentChart = drawBarChart();
            chartCount = 0;
        } else {
            currentChart = drawPieChart();
            chartCount = 1;
        }
    });

    // space
    const g4 = svg.append("g")
    .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    .attr("transform", `translate(${distrLeft}, ${distrTop})`)

    

    // plot 3 - parallel coordinates plot - start with workyear, experiencce, job title, then salary
    // transition and animation idea: filtering the parallel coordinates plot by the main categories and
    // can apply multiple filterslike salary and year of experience. Integrate zooming and panning to the
    // dashboard to allow for more detailed exploration of data and reading clarity. 
    // also add that selecting a line of the parellel cooridnates plot will highlight the line 
    // and show the the following lines resulting from that


    // location scales for each axis to put parallel coordinates plots exactly wher you want
    const pcWidth = width * .8 - distrMargin.left - distrMargin.right;
    const pcHeight = height * 0.6 - distrMargin.top - distrMargin.bottom;

    const g5 = svg.append("g")
    .attr("transform", `translate(${width * .25 + distrMargin.left}, ${distrTop + distrMargin.top})`);

    function drawParallelCoordinates() {
        //  the order of variables for the parallel coordinates plot
        const dimensions = ['workyear', 'employment_type', 'company_location', 'employee_residence', 'experience', 'job_title', 'avg_usdsalary'];

        // the x and y scales for the parallel coordinates plot
        const pcX = d3.scalePoint().range([0, pcWidth]).padding(.4).domain(dimensions);

        const pcY = {};
        dimensions.forEach(dim => {
            if (dim === 'avg_usdsalary') {
                pcY[dim] = d3.scaleLinear()
                    .domain(d3.extent(rawData, d => d[dim]))
                    .range([pcHeight, 0]);
            } else if (dim === 'job_title') {
                pcY[dim] = d3.scalePoint()
                    .domain([...new Set(rawData.map(d => d[dim]))])
                    .range([pcHeight, 0])
                    .padding(-.8); // padding to make the lines more spread out for dense job_title parallel line
            } else {
                pcY[dim] = d3.scalePoint()
                    .domain([...new Set(rawData.map(d => d[dim]))])
                    .range([pcHeight, 0]);
            }
        });

        // line function for parallel coordinates plot
        const pcLine = d3.line()
            .defined(d => !isNaN(pcY[d[0]](d[1])))
            .x((d, i) => pcX(dimensions[i]))
            .y(d => pcY[d[0]](d[1]));

        // set a constant font per parallel coordinate dimension
        const fontSizePerDimension = {
            "workyear": "12px",
            "employment_type": "10px",
            "company_location": "5px",
            "employee_residence": "5px",
            "experience": "12px",
            "job_title": "3px",
            "avg_usdsalary": "10px"
        };

        // draw the axes for the parallel coordinates plot
        g5.selectAll(".axis")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${pcX(d)}, 0)`)
            .each(function (d) {
                if (d === 'avg_usdsalary') {
                    d3.select(this).call(d3.axisLeft().scale(pcY[d]));
                } else {
                    const fontSize = fontSizePerDimension[d] || "10px"; // Default font size if not found in the map
                    d3.select(this).call(d3.axisLeft().scale(pcY[d])).selectAll('text').style('text-anchor', 'start').attr('transform', 'rotate(45)').style("font-size", fontSize);
                }
            });

        
        //  where the color is defined to have pretty lines that are different colors
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(rawData.map(d => d.job_title));

        // drawing lines for the parallel coordinates plot
        const lines = g5.selectAll(".line")
            .data(rawData)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", d => pcLine(dimensions.map(dim => [dim, d[dim]])))
            .attr("stroke", d => colorScale(d.job_title))
            .attr("stroke-opacity", 0.2)
            .attr("fill", "none")

            .on("click", handleLineClick); // hw3 click event listener
        
        function handleLineClick(d) {
            // hide all lines if line is clicked
            g5.selectAll(".line")
                .style("display", "none");
            g5.selectAll(".line")
                .filter(e => e.job_title === d.job_title)
                .style("display", "block");
        }
    }

    // Call the function to draw the parallel coordinates plot
    drawParallelCoordinates();


}).catch(function(error){
        console.log(error);
    }); 
