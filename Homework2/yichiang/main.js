d3.csv("Student Mental health.csv").then(function(data) {
    processData(data);
    drawBarChart(data);
    drawMentalHealthIssuesPieChart(data);
});

function processData(data) {
    const normalizedCGPARanges = {};
    data.forEach(function(d) {
        d.CGPA_Range = d['What is your CGPA?'].trim(); 
        const range = d.CGPA_Range.split(' - ').map(Number);
        d.CGPA = (range[0] + range[1]) / 2;

        const normalizedRange = `${range[0].toFixed(2)} - ${range[1].toFixed(2)}`;
        if (!normalizedCGPARanges[normalizedRange]) {
            normalizedCGPARanges[normalizedRange] = 0;
        }
        normalizedCGPARanges[normalizedRange] += 1;

        const yesNoToNum = (value) => value === 'Yes' ? 1 : 0;
        d.Depression = yesNoToNum(d['Do you have Depression?']);
        d.Anxiety = yesNoToNum(d['Do you have Anxiety?']);
        d.PanicAttack = yesNoToNum(d['Do you have Panic attack?']);
        d.Treatment = yesNoToNum(d['Did you seek any specialist for a treatment?']);
    });

    data.forEach(d => {
        const range = `${parseFloat(d.CGPA).toFixed(2)} - ${parseFloat(d.CGPA + 0.49).toFixed(2)}`;
        d.CGPA_Range_Count = normalizedCGPARanges[range] || 0;
    });

    data.forEach(function(d) {
        d.Age = +d.Age; 
    });

    data.forEach(function(d) {
        d.mentalHealthIssuesCount = ['Depression', 'Anxiety', 'PanicAttack']
            .map(issue => d[issue] === 1 ? 1 : 0) 
            .reduce((total, current) => total + current, 0); 
    });
}


function drawBarChart(data) {
    const margin = {top: 30, right: 30, bottom: 50, left: 60},
        width = 480 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        const tempCounts = {};
        data.forEach(d => {
            tempCounts[d.CGPA_Range] = (tempCounts[d.CGPA_Range] || 0) + 1;
        });
    
        const countPerCGPA = Object.entries(tempCounts).map(([key, value]) => ({
            CGPA_Range: key,
            count: value
        })).sort((a, b) => parseFloat(b.CGPA_Range.split(" - ")[0]) - parseFloat(a.CGPA_Range.split(" - ")[0]));


    const x = d3.scaleBand()
      .range([0, width])
      .domain(countPerCGPA.map(d => d.CGPA_Range))
      .padding(0.2);
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    const y = d3.scaleLinear()
      .domain([0, d3.max(countPerCGPA, d => d.count)])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll("mybar")
      .data(countPerCGPA)
      .join("rect")
        .attr("x", d => x(d.CGPA_Range))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#69b3a2");

    svg.append("text")             
      .attr("transform", `translate(${width/2}, ${height + margin.top + 55})`)
      .style("text-anchor", "middle")
      .text("CGPA Range");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left / 1)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Count");  

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 4))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline") 
        .style("font-weight", "bold")
        .text("Distribution of Students by CGPA Range");
}


function drawMentalHealthIssuesPieChart(data) {
    const issuesCount = { '0': 0, '1': 0, '2': 0, '3': 0 };
    data.forEach(d => {
        const count = d.mentalHealthIssuesCount.toString(); 
        issuesCount[count] = (issuesCount[count] || 0) + 1;
    });
    const margin = {top: 60, right: 30, bottom: 50, left: 60},
        width = 960 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2; 
    
    const svg = d3.select("#mental-health-pie-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left + (width / 2)}, ${margin.top + (height / 2)})`);

    const color = d3.scaleOrdinal()
        .domain(Object.keys(issuesCount))
        .range(["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728"]);
        // .range(d3.schemeCategory10);

    const pie = d3.pie().value(d => d[1]); 
    const data_ready = pie(Object.entries(issuesCount)); 

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

        svg
        .selectAll('pieces')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0])) 
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

        const legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`); 

    legend.append("rect")
        .attr("x", width / 2 - 18) 
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width / 2 - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => {
            switch(d) {
                case '0': return 'No Issues';
                case '1': return '1 Issue';
                case '2': return '2 Issues';
                case '3': return '3 Issues';
                default: return 'Unknown';
            }
        });
    
    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 28) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("Mental Health Issue Distribution");
    
    svg.selectAll('text.slice-percentage')
    .data(data_ready)
    .enter()
    .append('text')
    .attr('class', 'slice-percentage')
    .attr('transform', function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(function(d) {
        const percentage = ((d.value / d3.sum(data_ready, d => d.value)) * 100).toFixed(1);
        return percentage + '%';
    })
    .style("fill", "white") 
    .style("font-size", "12px"); 
    
}


function drawStreamChart(data) {
    const dimensions = ["CGPA", "Depression", "Anxiety", "PanicAttack"];

    const margin = {top: 10, right: 10, bottom: 10, left: 50},
    width = 960 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

    const svg = d3.select("#stream-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = {};
    for (const dim of dimensions) {
        y[dim] = d3.scaleLinear().domain(d3.extent(data, d => +d[dim])).range([height, 0]);
    }

    const x = d3.scaleLinear().range([0, width]).padding(1).domain(dimensions);

    dimensions.forEach(function(dim) {
        svg.append("g")
           .attr("transform", `translate(${x(dim)})`)
           .call(d3.axisLeft(y[dim]))
           .append("text")
           .style("text-anchor", "middle")
           .attr("y", -9)
           .attr("fill", "#000")
           .text(dim);
    });

    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3]) 
        .range(["#2ca02c", "#ff7f0e", "#d62728", "#9467bd"]); 

    data.forEach(d => {
        d.totalIssues = ['Depression', 'Anxiety', 'PanicAttack']
            .map(issue => +d[issue]) 
            .reduce((sum, current) => sum + current, 0);
    });
    svg.selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", d => {
        return d3.line()(dimensions.map(dim => [x(dim), y[dim](d[dim])]));
    })
    .attr("stroke", d => colorScale(d.totalIssues))
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

    svg.selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", function(d) {
            return d3.line()(dimensions.map(function(dim) { 
                return [x(dim), y[dim](d[dim])]; 
            }));
        })
        .style("fill", "none")
        .style("stroke", function(d) { 
            const numIssues = ['Depression', 'Anxiety', 'PanicAttack']
                .map(issue => d[issue])
                .reduce((sum, current) => sum + current, 0);
            return colorScale(numIssues);
        })
        .style("opacity", 0.7);
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("front-size", "20px")
        .text("Student Mental Health Analysis");
}

var data = [
    {"year": 1, "Depression": 14, "Anxiety": 14, "PanicAttack": 14},
    {"year": 2, "Depression": 10, "Anxiety": 10, "PanicAttack": 8},
    {"year": 3, "Depression": 10, "Anxiety": 8, "PanicAttack": 10},
    {"year": 4, "Depression": 1, "Anxiety": 2, "PanicAttack": 1}
];

var svg = d3.select("svg"),
    margin = {top: 50, right: 0, bottom: 20, left: 100}, 
    width = +svg.attr("width") - margin.left - margin.right ,
    height = +svg.attr("height") - margin.top - margin.bottom;

    svg.append("rect")
    .attr("width", 1200)
    .attr("height", 1000)
    .attr("x", 0 - margin.left) 
    .attr("y", 0 - margin.top) 
    .attr("fill", "white")
    .attr("transform", `translate(${margin.left},${margin.top})`);

var customColors = {
    "Depression": "#1f77b4", 
    "Anxiety": "#ff7f0e", 
    "PanicAttack": "red" 
    };

    var keys = ["Depression", "Anxiety", "PanicAttack"];

    var customColors = {
        "Depression": d3.schemeCategory10[0], 
        "Anxiety": d3.schemeCategory10[1], 
        "PanicAttack": d3.schemeCategory10[3] 
    };

var x = d3.scaleLinear().range([100, width]),
    y = d3.scaleLinear().range([height, 25]),
    z = d3.scaleOrdinal();

var stack = d3.stack();

var area = d3.area()
    .x(function(d, i) { return x(d.data.year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

console.table(d3.schemeCategory10[3]);

x.domain(d3.extent(data, function(d) { return d.year; }));
y.domain([0, d3.max(data, function(d) { return d.Depression + d.Anxiety + d.PanicAttack; })]);
var keys = ["Depression", "Anxiety", "PanicAttack"];
z.domain(keys).range([customColors["Depression"], customColors["Anxiety"], customColors["PanicAttack"]]);

var series = stack.keys(keys)(data);
var xAxis = d3.axisBottom(x).tickValues(d3.range(1, 5));

svg.selectAll(".layer")
    .data(series)
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", area)
    .attr("fill", function(d) { return z(d.key); });

svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    var yAxis = svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(y));

yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 8 - margin.left)
    .attr("x", 0 - (height / 2)) 
    .attr("dy", "1em")
    .attr("text-anchor", "middle") 
    .text("Incidence");

    svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left + width / 2.3) 
    .attr("y", margin.top / 1) 
    .attr("text-anchor", "middle") 
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("text-decoration", "underline")
    .text("Incidence of Psychological Issues Over 4 Years");

svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 30)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text("Incidence");

svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom / 2 + 20)
    .attr("text-anchor", "middle")
    .text("Year");

var legendSpacing = 20;
var legendX = width - margin.right;
var legendY = margin.top;

var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + legendX + "," + legendY + ")");

var legendItem = legend.selectAll(".legend-item")
    .data(keys)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", function(d, i) { return "translate(0," + i * legendSpacing + ")"; });

legendItem.append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", z);

legendItem.append("text")
    .attr("x", -5)
    .attr("y", 9)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(function(d) {return d;});

