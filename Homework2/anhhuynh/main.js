const width = window.innerWidth;
const height = window.innerHeight;

let jobLeft = 0, jobTop = 20;
let jobMargin = { top: 50, right: 100, bottom: 30, left: 200 },
    jobWidth = width - 800 - jobMargin.left - jobMargin.right,
    jobHeight = height + 25 - jobMargin.top - jobMargin.bottom;

let lineLeft = 0, lineTop = 0;
let lineMargin = { top: 50, right: 100, bottom: 370, left: 900 },
    lineWidth = width - lineMargin.left - lineMargin.right,
    lineHeight = height - 100 - lineMargin.top - lineMargin.bottom;

let dendroLeft = 0, dendroTop = 450;
let dendroMargin = { top: 100, right: 700, bottom: -630, left: 750 },
    dendroWidth = width - dendroMargin.left - dendroMargin.right,
    dendroHeight = height - dendroTop - dendroMargin.top - dendroMargin.bottom;


d3.csv("ds_salaries.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function (d) {
        d.job_title = String(d.job_title);
        d.company_location = String(d.company_location);
        d.experience_level = String(d.experience_level);
        d.employment_type = String(d.employment_type);
        d.salary_in_usd = Number(d.salary_in_usd);
        d.remote_ratio = Number(d.remote_ratio);
        d.year = Number(d.work_year);
    });

    const svg = d3.select("svg")



// Plot 1: Bar Chart Average Salary for all Job Titles
    let jobSalaryData = {};
    rawData.forEach(function (d) {
        if (jobSalaryData[d.job_title]) {
            jobSalaryData[d.job_title].totalSalary += d.salary_in_usd;
            jobSalaryData[d.job_title].count += 1;
        } else {
            jobSalaryData[d.job_title] = { totalSalary: d.salary_in_usd, count: 1 };
        }
    });

    let r1 = Object.keys(jobSalaryData).map(job => {
        return { job: job, averageSalary: jobSalaryData[job].totalSalary / jobSalaryData[job].count };
    });

    r1.sort((a, b) => b.averageSalary - a.averageSalary);


    const g1 = svg.append("g")
        .attr("width", jobWidth + jobMargin.left + jobMargin.right)
        .attr("height", jobHeight + jobMargin.top + jobMargin.bottom)
        .attr("transform", `translate(${jobMargin.left}, ${jobTop})`)

    // Chart title
    g1.append("text")
        .attr("x", jobWidth / 2)
        .attr("y", jobHeight - 752)
        .attr("font-size", "22px")
        .attr("text-anchor", "middle")
        .text("Average Salary for all Job Titles");

    // X label
    g1.append("text")
        .attr("x", jobWidth / 2)
        .attr("y", jobHeight + 30)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Average Salary (USD)");

    // Y label
    g1.append("text")
        .attr("x", -(jobHeight / 2))
        .attr("y", -180)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Job Title");

    // X ticks
    const x1 = d3.scaleLinear()
        .domain([0, 375000])
        .range([0, jobWidth]);

    const xAxis1 = d3.axisBottom(x1);
    g1.append("g")
        .attr("transform", `translate(0, ${jobHeight})`)
        .call(xAxis1);

    // Y ticks
    const y1 = d3.scaleBand()
        .domain(r1.map(d => d.job))
        .range([0, jobHeight])
        .paddingInner(0.3)
        .paddingOuter(0.2);

    const yAxis1 = d3.axisLeft(y1);
    g1.append("g").call(yAxis1);

    // Bar
    const rects1 = g1.selectAll("rect").data(r1)
    rects1.enter().append("rect")
        .attr("x", 0)
        .attr("y", d => y1(d.job))
        .attr("height", y1.bandwidth())
        .attr("width", d => x1(d.averageSalary))
        .attr("fill", "pink");

    rects1.enter().append("text")
        .attr("class", "bar-text")
        .attr("x", d => x1(d.averageSalary) + 5)
        .attr("y", d => y1(d.job) + y1.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => `$${d.averageSalary.toFixed(2)}`)
        .attr("font-size", "8px")
        .attr("fill", "black");

    // Legends
    const legendMargin1 = { top: 500, right: 500 };
    const legend1 = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendMargin1.right}, ${legendMargin1.top})`);

    // Rectangle Legend
    legend1.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 15)
        .attr('fill', 'pink');

    // Legend label
    legend1.append('text')
        .attr('x', 45)
        .attr('y', 13)
        .text('Average Salary (USD)');



// Plot 2: Line Chart Annual Sum of Remote Work Ratio from 2020 to 2023
    let lineData = {};
    rawData.forEach(function (d) {
        if (d.year >= 2020 && d.year <= 2023) {
            if (lineData[d.year]) {
                lineData[d.year].totalRemoteRatio += d.remote_ratio;
            } else {
                lineData[d.year] = { totalRemoteRatio: d.remote_ratio };
            }
        }
    });

    let sumRemoteRatioPerYear = [];
    for (let year in lineData) {
        sumRemoteRatioPerYear.push({
            year: year,
            sumRemoteRatio: lineData[year].totalRemoteRatio
        });
    }

    let maxRemoteRatio = Math.max(...sumRemoteRatioPerYear.map(d => d.sumRemoteRatio));
    let highestPoint = sumRemoteRatioPerYear.find(d => d.sumRemoteRatio === maxRemoteRatio);


    const g2 = svg.append("g")
        .attr("width", lineWidth + lineMargin.left + lineMargin.right)
        .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
        .attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)

    // Chart title
    g2.append("text")
        .attr("x", lineWidth / 2)
        .attr("y", lineHeight - 300)
        .attr("font-size", "22px")
        .attr("text-anchor", "middle")
        .text("Annual Sum of Remote Work Ratio from 2020 to 2023");

    // X label
    g2.append("text")
        .attr("x", lineWidth / 2)
        .attr("y", lineHeight + 30)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Year");

    // Y label
    g2.append("text")
        .attr("x", -(lineHeight / 2))
        .attr("y", -50)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Remote Ratio (Thousands)");

    // X ticks
    const x2 = d3.scalePoint()
        .domain([2020, 2021, 2022, 2023])
        .range([0, lineWidth])

    const xAxis2 = d3.axisBottom(x2);
    g2.append("g")
        .attr("transform", `translate(0, ${lineHeight})`)
        .call(xAxis2);

    // Y ticks
    const y2 = d3.scaleLinear()
        .domain([0, 100])
        .range([lineHeight, 0]);

    const yAxis2 = d3.axisLeft(y2);
    g2.append("g").call(yAxis2);

    // Line
    const line = d3.line()
        .x(d => x2(d.year))
        .y(d => y2(d.sumRemoteRatio / 1000));

    g2.append("path")
        .datum(sumRemoteRatioPerYear)
        .attr("fill", "none")
        .attr("stroke", "skyblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Dot on highest point
    g2.append("circle")
        .attr("cx", x2(highestPoint.year))
        .attr("cy", y2(highestPoint.sumRemoteRatio / 1000))
        .attr("r", 5)
        .style("fill", "orange");

    // Legends
    const legendMargin2 = { top: 100, right: 950 };
    const legend2 = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendMargin2.right}, ${legendMargin2.top})`);

    // Line legend
    legend2.append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', 10)
        .attr('y2', 10)
        .attr('stroke', 'skyblue')
        .attr('stroke-width', 1.5);

    // Line label
    legend2.append('text')
        .attr('x', 35)
        .attr('y', 10)
        .attr('dominant-baseline', 'middle')
        .text('Remote Work Ratio');

    // Dot Legend
    legend2.append('circle')
        .attr('cx', 15)
        .attr('cy', 30)
        .attr('r', 5)
        .style('fill', 'orange');

    // Dot label
    legend2.append('text')
        .attr('x', 35)
        .attr('y', 30)
        .attr('dominant-baseline', 'middle')
        .text('Highest Point');



// Plot 3: Dendrogram Average Job Salary by Experience
    const dendroData = {
        name: "Job Titles",
        children: [
            {
                name: "Machine Learning Scientist",
                children: [
                    {

                        name: "Average Salary <br> for Experience",
                        children: [
                            { name: "Entry $129,836" },
                            { name: "Mid $139,554" },
                            { name: "Senior $188,086" },
                            { name: "Executive $190,000" }
                        ]

                    }
                ]
            },
            {
                name: "Data Scientist",
                children: [
                    {
                        name: "Average Salary <br> for Experience",
                        children: [
                            { name: "Entry $74,085" },
                            { name: "Mid $93,945" },
                            { name: "Senior $158,991" },
                            { name: "Executive $180,645" }
                        ]

                    }
                ]
            },
            {
                name: "Data Engineer",
                children: [
                    {

                        name: "Average Salary <br> for Experience",
                        children: [
                            { name: "Entry $91,526" },
                            { name: "Mid $106,074" },
                            { name: "Senior $153,210" },
                            { name: "Executive $209,921" }
                        ]

                    }
                ]
            },
            {
                name: "Data Manager",
                children: [
                    {

                        name: "Average Salary <br> for Experience",
                        children: [
                            { name: "Entry $61,450" },
                            { name: "Mid $119,833" },
                            { name: "Senior $120,695" },
                            { name: "Executive $125,976" }
                        ]

                    }
                ]
            },
            {
                name: "Data Analyst",
                children: [
                    {

                        name: "Average Salary <br> for Experience",
                        children: [
                            { name: "Entry $59,802" },
                            { name: "Mid $101,516" },
                            { name: "Senior $119,930" },
                            { name: "Executive $120,000" }
                        ]

                    }
                ]
            },
        ]
    };

    const root = d3.hierarchy(dendroData);
    const dendroLayout = d3.tree().size([dendroHeight, dendroWidth]);
    dendroLayout(root);


    const g3 = svg.append("g")
        .attr("width", dendroWidth + dendroMargin.left + dendroMargin.right)
        .attr("height", dendroHeight + dendroMargin.top + dendroMargin.bottom)
        .attr("transform", `translate(${dendroMargin.left}, ${dendroTop})`)

    // Chart title
    g3.append("text")
        .attr("x", dendroWidth + 235)
        .attr("y", dendroHeight - 920)
        .attr("font-size", "22px")
        .attr("text-anchor", "middle")
        .text("Average Job Salary by Experience");

    // Links
    const links = g3.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .style("fill", "none")
        .style("stroke", "green")
        .style("stroke-width", "1px")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );

    // Nodes
    const nodes = g3.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes.append("circle")
        .attr("r", 5);

    nodes.each(function (d) {
        var node = d3.select(this);
        var lines = d.data.name.split("<br>");
        lines.forEach(function (line, i) {
            node.append("text")
                .attr("dy", `${i * 1.2}em`)
                .attr("y", d => (d.children ? 2 : 5))
                .attr("x", d => (d.children ? 9 : -115))
                .text(line)
                .attr("transform", d => (d.children ? "rotate(0)" : "rotate(-90)"))
                .style("font-size", "13px");
        });
    })

}).catch(function (error) {
    console.log(error);
});