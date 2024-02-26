document.addEventListener('DOMContentLoaded', function() {
    // Bar chart data
    const barChartData = [
        { skinType: 'Sensitive', count: 756 },
        { skinType: 'Dry', count: 904 },
        { skinType: 'Normal', count: 960 },
        { skinType: 'Oily', count: 894 },
        { skinType: 'Combination', count: 966 },
    ];
    renderBarChart(barChartData);

    // Pie chart data
    const pieChartData = [
        { brand: "CLINIQUE", count: 79 },
        { brand: "SEPHORA COLLECTION", count: 66 },
        { brand: "SHISEIDO", count: 63 },
        { brand: "ORIGINS", count: 54 },
        { brand: "MURAD", count: 47 },
        { brand: "PETER THOMAS ROTH", count: 46 },
        { brand: "KIEHL'S SINCE 1851", count: 46 },
        { brand: "FRESH", count: 44 },
        { brand: "DR. JART+", count: 41 },
        { brand: "KATE SOMERVILLE", count: 35 }
    ];
    renderPieChart(pieChartData);

     d3.csv("cosmetics.csv").then(data => {
        renderParallelCoordinatesPlot(data);
    });

});

//BAR CHART
function renderBarChart(data) {
    const margin = {top: 20, right: 20, bottom: 80, left: 80},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const x = d3.scaleBand()
                .range([0, width])
                .padding(0.1);
    const y = d3.scaleLinear()
                .range([height, 0]);

    const svg = d3.select("#bar-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.skinType; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    const bars = svg.selectAll(".bar")
        .data(data, function(d) { return d.skinType; }); 

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.skinType); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
    .attr("transform", "translate(-35," + (height/2) + ") rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Count");

    svg.append("text")
    .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 20) + ")") 
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Skin Type");

    function sortBars() {
        data.sort(function(a, b) {
            return b.count - a.count; 
        });

        x.domain(data.map(function(d) { return d.skinType; }));

        svg.selectAll(".bar")
            .data(data, function(d) { return d.skinType; }) 
            .transition()
            .duration(750)
            .attr("x", function(d) { return x(d.skinType); }); 

        svg.select("g").transition().duration(750).call(d3.axisBottom(x));
    }

    d3.select("#sortButton").on("click", sortBars);
}

//PIE CHART
function renderPieChart(data) {
    const width = 1080, height = 600; 
    const radius = Math.min(width, height) / 2 - 50; 

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcHover = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 1.1); 

    const arcForText = d3.arc()
        .innerRadius(radius * 0.7) 
        .outerRadius(radius * 0.7); 

    const svg = d3.select("#pie-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const arcs = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.brand))
        .on("mouseover", function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("d", arcHover(d));
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("d", arc(d));
        });

    arcs.append("text")
        .attr("transform", d => `translate(${arcForText.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "9.5px")
        .each(function(d) {
            d3.select(this).append("tspan")
                .attr("x", 0)
                .attr("dy", "-0.5em")
                .text(d.data.brand);

            d3.select(this).append("tspan")
                .attr("x", 0)
                .attr("dy", "1.2em")
                .text(`${Math.round((d.data.count / d3.sum(data, d => d.count)) * 100)}%`);
        });
}

// PARALLEL COORDINATES PLOT
function renderParallelCoordinatesPlot(data) {
    const brands = [...new Set(data.map(d => d.Brand))];
    const color = d3.scaleOrdinal()
        .domain(brands)
        .range(d3.schemeTableau10); 

    const margin = {top: 30, right: 50, bottom: 30, left: 0}, 
        width = window.innerWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#parallel-coordinates-plot")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const dimensions = ["Label", "Price"];

    const x = d3.scalePoint()
      .range([0, width])
      .padding(1)
      .domain(dimensions);

    const priceDomain = [0, d3.max(data, d => +d.Price)];

    const background = svg.append("g")
      .attr("class", "background")
      .selectAll("path")
      .data(data)
      .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#eee")
        .style("opacity", 0.5);

    const foreground = svg.append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(data)
      .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", d => color(d.Brand))
        .style("opacity", 0.5)
        .style("stroke-width", "1px");

    function path(d) {
        return d3.line()(dimensions.map(function(p) {
            const scale = (p === "Price") ? 
                d3.scaleLinear().domain(priceDomain).range([height, 0]) : 
                d3.scalePoint().domain([...new Set(data.map(item => item[p]))]).range([height, 0]);
            return [x(p), scale(d[p])];
        }));
    }

    const brush = d3.brushY()
        .extent([[0, 0], [width, height]])
        .on("brush end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        const selection = event.selection || d3.scaleLinear().range([height, 0]);
        foreground.style("display", function(d) {
            return dimensions.every(function(p) {
                const scale = (p === "Price") ? 
                    d3.scaleLinear().domain(priceDomain).range([height, 0]) : 
                    d3.scalePoint().domain([...new Set(data.map(item => item[p]))]).range([height, 0]);
                const pos = scale(d[p]);
                return selection[0] <= pos && pos <= selection[1];
            }) ? null : "none";
        });
    }

    const axis = d3.axisLeft();
    svg.selectAll("myAxis")
      .data(dimensions).enter()
      .append("g")
      .attr("transform", d => `translate(${x(d)},0)`)
      .each(function(d) {
          if (d === "Price") {
              d3.select(this).call(axis.scale(d3.scaleLinear().domain(priceDomain).range([height, 0])));
          } else {
              d3.select(this).call(axis.scale(d3.scalePoint().domain([...new Set(data.map(item => item[d]))]).range([height, 0])));
          }
      })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15) 
      .text(d => d)
      .style("fill", "black");
}