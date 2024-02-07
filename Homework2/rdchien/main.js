// 2D heat map: average salary by job title and experience level
d3.csv("ds_salaries.csv", d => {
    d.salary_in_usd = +d.salary_in_usd; // convert salary to number
    return d;
}).then(data => {
    let groupedData = d3.group(data, d => d.job_title, d => d.experience_level);
    // average salary for each job title and experience level
    let averages = [];
    groupedData.forEach((expLevelMap, jobTitle) => {
        expLevelMap.forEach((values, expLevel) => {
            let avgSalary = d3.mean(values, v => v.salary_in_usd);
            averages.push({
                jobTitle: jobTitle,
                experienceLevel: expLevel,
                averageSalary: avgSalary
            });
        });
    });

    // adjust margins as needed for labels and legend 
    const margin = { top: 60, right: 30, bottom: 180, left: 150 },
        width = 1500 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append svg to corresponding div
    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // job titles
    const myGroups = Array.from(new Set(averages.map(d => d.jobTitle)));
    // experience levels
    const myVars = Array.from(new Set(averages.map(d => d.experienceLevel)));

    // x axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.05);

    // x axis scale labels
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-60)") // rotate the labels so they don't overlap
        .style("text-anchor", "end");

    // x axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Job Title");

    // remove the x-axis line
    svg.select(".domain").remove();

    // sort experience levels in order
    const experienceOrder = ["EN", "MI", "SE", "EX"];
    myVars.sort((a, b) => experienceOrder.indexOf(a) - experienceOrder.indexOf(b));

    // y axis
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.05);
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove();
    // y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Experience Level");

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Interactive Data Science Salary Heatmap");

    // color scale for heatmap
    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, d3.max(averages, d => d.averageSalary)]);

    // create a tooltip for interactivity
    const tooltip = d3.select("#heatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // highlight cell when moused over
    const mouseover = function (event, d) {
        tooltip.style("opacity", 1);
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);
    };

    // dictionary to map experience level to longer word
    const experienceLabels = {
        "EN": "Entry Level",
        "MI": "Mid-Level",
        "SE": "Senior Level",
        "EX": "Executive Level"
    };

    // show tooltip with average salary when moused over
    const mousemove = function (event, d) {
        const experienceLabel = experienceLabels[d.experienceLevel] || d.experienceLevel;
        tooltip.html(`The average salary of a ${experienceLabel} ${d.jobTitle} is: $${d.averageSalary.toFixed(0)}`)
            .style("text-align", "center")
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 - 30 + "px");
    };

    // remove highlight and tooltip when moused out
    const mouseleave = function (event, d) {
        tooltip.style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8);
    };

    // add the heatmap cells
    svg.selectAll()
        .data(averages, function (d) { return d.jobTitle + ':' + d.experienceLevel; })
        .join("rect")
        .attr("x", function (d) { return x(d.jobTitle); })
        .attr("y", function (d) { return y(d.experienceLevel); })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) { return myColor(d.averageSalary); })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // legend data
    const experienceLevels = [
        { label: "Legend" },
        { label: "EX: Executive" },
        { label: "SE: Senior" },
        { label: "MI: Mid" },
        { label: "EN: Entry" }
    ];

    // legend for experience levels 
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(-120,-30)");

    experienceLevels.forEach((level, index) => {
        legend.append("text")
            .attr("x", 0)
            .attr("y", index * 20)
            .style("font-weight", "bold")
            .style("text-decoration", level.label === "Legend" ? "underline" : "none")
            .text(level.label);
    });

    const lwidth = 300;
    const lheight = 20;

    // linear gradient for salary legend
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
        .data(d3.range(0, 1, 0.01))
        .enter().append("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => d3.interpolateInferno(d));

    svg.append("rect")
        .attr("width", lwidth)
        .attr("height", lheight)
        .style("fill", "url(#linear-gradient)")
        .attr("transform", "translate(10,-50)");

    // start of gradient label
    svg.append("text")
        .attr("x", 10)
        .attr("y", 40)
        .attr("transform", "translate(0,-50)")
        .style("font-weight", "bold")
        .text("$5k-45k"); // low end salary label

    // middle of gradient label
    svg.append("text")
        .attr("x", 120)
        .attr("y", 40)
        .attr("transform", "translate(0,-50)")
        .style("font-weight", "bold")
        .text("$100k-150k"); // middle end salary label

    // end of gradient label
    svg.append("text")
        .attr("x", 260)
        .attr("y", 40)
        .attr("transform", "translate(0,-50)")
        .style("font-weight", "bold")
        .text("$275k+"); // high end salary label 
});

// parallel coordinates plot 
d3.csv("ds_salaries.csv").then(function (data) {
    data.forEach(function (d) {
        d.work_year = +d.work_year;
        d.salary_in_usd = +d.salary_in_usd;
        d.remote_ratio = +d.remote_ratio;

        // map experience_level to numeric scale
        const experienceLevels = { "EN": 1, "MI": 2, "SE": 3, "EX": 4 };
        d.experience_level = experienceLevels[d.experience_level] || 0;

        // map company_size to numeric scale
        const companySizes = { "S": 1, "M": 2, "L": 3 };
        d.company_size = companySizes[d.company_size] || 0;
    });

    // adjust margins as needed for labels and legend 
    var margin = { top: 30, right: 10, bottom: 30, left: 10 },
        width = 960 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    var svg = d3.select("#parallel-coordinates").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dimensions = ['experience_level', 'remote_ratio', 'company_size'];

    // y axis scales
    var yScales = {};
    dimensions.forEach(function (dimension) {
        yScales[dimension] = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return +d[dimension]; }))
            .range([height, 0]);
    });

    // x axis 
    var xScale = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    // dictionary to map experience levels to custom labels
    const experienceLabels = {
        "experience_level": "Experience Level",
        "remote_ratio": "Remote Ratio",
        "company_size": "Company Size"
    };

    // axis labels
    svg.selectAll(".axis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + xScale(d) + ")"; })
        .each(function (d) {
            d3.select(this).call(d3.axisLeft(yScales[d]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", height + margin.bottom - 10)
        .text(function (d) { return experienceLabels[d]; })
        .style("font-weight", "bold")
        .style("fill", "black")
        .style("font-size", "14px");

    // draw lines between coordinates
    svg.selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return d3.line()(dimensions.map(function (p) { return [xScale(p), yScales[p](d[p])]; }));
        })
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("opacity", 0.5);

    // legend data
    const leftLegendData = [
        { label: "Legend" },
        { label: "Executive = 4" },
        { label: "Senior = 3" },
        { label: "Mid = 2" },
        { label: "Entry = 1" }
    ];
    const rightLegendData = [
        { label: "Legend" },
        { label: "Large = 3" },
        { label: "Medium = 2" },
        { label: "Small = 1" }
    ];

    const legendWidth = 20;
    const legendHeight = 22;

    // legend for experience level
    const leftLegend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50,300)");
    leftLegend.selectAll("text")
        .data(leftLegendData)
        .enter()
        .append("text")
        .attr("x", legendWidth)
        .attr("y", (d, i) => i * legendHeight - 2)
        .attr("dy", "0.35em")
        .text(d => d.label)
        .style("font-weight", "bold")
        .style("text-decoration", d => d.label === "Legend" ? "underline" : "none");

    // legend for company size
    const rightLegend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(730,300)");
    rightLegend.selectAll("text")
        .data(rightLegendData)
        .enter()
        .append("text")
        .attr("x", legendWidth)
        .attr("y", (d, i) => i * legendHeight - 2)
        .attr("dy", "0.35em")
        .text(d => d.label)
        .style("text-decoration", d => d.label === "Legend" ? "underline" : "none")
        .style("font-weight", "bold");

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Data Science Salary by Experience, Remote Ratio, and Company Size");
});

// bar chart
d3.csv("ds_salaries.csv", d => {
    d.salary_in_usd = +d.salary_in_usd;
    return d;
}).then(function (data) {

    // get average salary for each experience level
    var avgSalaries = Array.from(d3.rollup(data,
        v => d3.mean(v, d => d.salary_in_usd),
        d => d.experience_level
    ), ([key, value]) => ({ key, value }));

    // adjust margins as needed for labels and legend 
    var margin = { top: 30, right: 140, bottom: 60, left: 90 },
        width = 550 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

    // append svg to corresponding div
    var svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")");

    // Sort the data according to the specified order
    avgSalaries.sort((a, b) => {
        return ["EN", "MI", "SE", "EX"].indexOf(a.key) - ["EN", "MI", "SE", "EX"].indexOf(b.key);
    });

    // x axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(avgSalaries.map(function (d) { return d.key; }))
        .padding(0.2);

    // sort x-axis from least to most experience
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // x axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width - 100)
        .attr("y", height + margin.top + 20)
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .text("Experience Level");

    // y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(avgSalaries, function (d) { return d.value; })])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // y axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - 20)
        .attr("transform", "rotate(-90)")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .text("Average Salary (USD)");

    // color scale for bars
    const colorScale = d3.scaleOrdinal()
        .domain(avgSalaries.map(d => d.key))
        .range(d3.schemeCategory10);

    // bars
    svg.selectAll("mybar")
        .data(avgSalaries)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", function (d) { return colorScale(d.key); });

    // legend color scale
    const legendColorScale = d3.scaleOrdinal()
        .domain(avgSalaries.map(d => d.key))
        .range(d3.schemeCategory10);

    // legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width + margin.right / 2) + "," + (margin.top) + ")");

    // add colored rectangles for each experience level 
    legend.selectAll("legend-rect")
        .data(avgSalaries)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function (d, i) { return i * 20; })
        .attr("width", 20)
        .attr("height", 10)
        .style("fill", function (d) { return legendColorScale(d.key); });

    const experienceLabels = {
        "EN": "Entry",
        "MI": "Mid",
        "SE": "Senior",
        "EX": "Exec"
    };

    // add text labels for each experience level
    legend.selectAll("legend-label")
        .data(avgSalaries)
        .enter()
        .append("text")
        .attr("x", 25)
        .attr("y", function (d, i) { return i * 20 + 10; })
        .text(function (d) { return experienceLabels[d.key]; })
        .attr("text-anchor", "start")
        .style("alignment-baseline", "middle");

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Average Data Science Salary by Experience Level");
});