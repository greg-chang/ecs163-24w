const width = window.innerWidth * .9;
const height = window.innerHeight * .7;

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
        count0: 0
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
    const svg = d3.select("svg") // initialize the svg only in first plot never again
        .attr("width", width)
        .attr("height", height);

    r = Object.keys(averageSalary).map((key) => ({ job_title: key, avg_usdSalary: averageSalary[key] }));
    console.log(r);



    const g1 = svg.append("g")
        .attr("transform", `translate(${width * .05}, ${height * .65})`);

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

    const rects2 = g1.selectAll("rect").data(r)
    
    rects2.enter().append("rect")
    .attr("x", (d) => x2(d.job_title))
    .attr("y", d => y2(d.avg_usdSalary)) 
    .attr("width", x2.bandwidth)
    .attr("height", d => (teamHeight - y2(d.avg_usdSalary)))
    .attr("fill", "grey")






    
    // space
    
    const g2 = svg.append("g")
    .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    .attr("transform", `translate(${distrLeft}, ${distrTop})`)
 

    // plot 2 - pie chart - percentage of employees that work remotely vs not remotely
    
    const pieData = [
        { label: "Remote", count: remoteWork.count100 },
        { label: "Not Remote", count: remoteWork.count0 }
    ];

    const g3 = svg.append("g")
        .attr("transform", `translate(${width * .1}, ${height / 4})`);
    
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
            return `${percentage.toFixed(2)}%`;
        });
  
    const legendData = pieData.map(d => d.label);   
    const legendColors = color.range();

    const legend = svg.append("g")
        .attr("transform", `translate(${width * .19}, ${height / 4})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d,i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
        .attr("x", -6)
        .attr("y", -10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d,i) => legendColors[i]);

    legendItems.append("text")
        .attr("x", 11)
        .attr("y", -10)
        .attr("dy", "0.75em")
        .text(d => d)
        .attr("font-size", "10px");
    const title = svg.append("text")
        .attr("x", width * .1)
        .attr("y", height / 15)
        .attr("text-anchor", "middle")
        .text("Where Work is Done (3755 Employees)")
        .attr("font-size", "10px");
 
    // space
    const g4 = svg.append("g")
    .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    .attr("transform", `translate(${distrLeft}, ${distrTop})`)

    

    // plot 3 - parallel coordinates plot - start with workyear, experiencce, job title, then salary
    
    // location scales for each axis to put parallel coordinates plots exactly wher you want
    const pcWidth = width * .8 - distrMargin.left - distrMargin.right;
    const pcHeight = height * 0.8 - distrMargin.top - distrMargin.bottom;

    const g5 = svg.append("g")
    .attr("transform", `translate(${width * 0.15}, ${distrTop})`);

    const pcSVG = g5.append("svg")
    .attr("width", pcWidth + distrMargin.left + distrMargin.right)
    .attr("height", pcHeight + distrMargin.top + distrMargin.bottom)
    .append("g")
    .attr("transform", `translate(${distrMargin.left}, ${distrMargin.top})`);

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
    "avg_usdsalary": "10px"};

// draw the axes for the parallel coordinates plot
pcSVG.selectAll(".axis")
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
pcSVG.selectAll(".line")
    .data(rawData)
    .enter().append("path")
    .attr("class", "line")
    .attr("d", d => pcLine(dimensions.map(dim => [dim, d[dim]])))
    .attr("stroke", d => colorScale(d.job_title))
    .attr("stroke-opacity", 0.2)
    .attr("fill", "none");

}).catch(function(error){
    console.log(error);
}); 
