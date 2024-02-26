
d3.csv("mxmh_survey_results.csv").then(rawData =>{
    console.log("rawData", rawData); 

    rawData.forEach(function(d){
        d.Anxiety = Number(d["Anxiety"]); 
        d.Depression = Number(d["Depression"]); 
        d.Insomnia = Number(d["Insomnia"]); 
        d.OCD = Number(d["OCD"]); 
        d.Age = Number(d["Age"]); 
        d.HoursPerDay=Number(d["Hours per day"]);
    });

    const margin = {top: 50, right: 180, bottom: 80, left: 100}; 
    const width = window.innerWidth - margin.left - margin.right - 100; 
    const height = 400 - margin.top - margin.bottom; 

    const yScales = new Map(); 

    const keys = ["Age", "HoursPerDay", "Depression", "Anxiety"]; 

    keys.forEach(key => { 
        const scale = d3.scaleLinear()
            .domain(d3.extent(rawData, d => d[key]))
            .range([height, 0]); 

        yScales.set(key, scale); 
    }); 

    const colorScale = d3.scaleOrdinal()
        .domain(rawData.map(d => d["Fav Genre"]))
        .range(d3.schemeCategory10); 

    const svg = d3.select("svg") 
        .attr("width", width + margin.left + margin.right) 
        .attr("height", height + margin.top + margin.bottom) 
        .append("g") 
        .attr("transform", `translate(${margin.left},${margin.top})`); 

    keys.forEach((key, i) => {
        svg.append("g") 
            .attr("class", "axis") 
            .attr("transform", `translate(${i * (width / (keys.length - 1))},0)`)
            .call(d3.axisLeft(yScales.get(key)).ticks(5)); 

        svg.append("text")
            .attr("x", i * (width / (keys.length - 1)))
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text(key); 

    }); 

    const lineScale = d3.scaleLinear()
        .domain([0, keys.length - 1])
        .range([0, width]); 

    const line = d3.line()
        .x((d, i) => lineScale(i))
        .y((d, i) => yScales.get(keys[i])(d))
        .curve(d3.curveLinear);

    svg.selectAll(".line")
        .data(rawData)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", d => line(keys.map(key => d[key])))
        .style("stroke", d => colorScale(d["Fav genre"]))
        .style("fill", "none"); 

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle") 
        .style("font-size", "20px") 
        .text("Overview of Music and Mental Health Scores"); 
    
    // legend for parallel coordinates plot 
    
    const uniqueGenres = [...new Set(rawData.map(d => d["Fav genre"]))];
        
    const legend = svg.selectAll(".legend")
        .data(uniqueGenres)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width + 30)
        .attr("y", -20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width + 55)
        .attr("y", -15)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);
    
    //scatter plot 

    const scatterSvg = d3.select("body").append("svg")
        .attr("width", 300 + margin.left + margin.right)
        .attr("height", 300 + margin.top + margin.bottom)
        .style("position", "absolute")
        .style("left", "50px")
        .style("top", height + 2 * margin.top + margin.bottom + "px")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(rawData, d => d.Depression))
        .range([0, width / 4]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(rawData, d => d.HoursPerDay))
        .range([height / 2, 0]);

    scatterSvg.append("g")
        .attr("class", "scatter")
        .selectAll("circle")
        .data(rawData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.Depression))
        .attr("cy", d => yScale(d.HoursPerDay))
        .attr("r", 2)
        .style("fill", "steelblue");

    const xAxis = d3.axisBottom(xScale);
    scatterSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(xAxis);
        
    const yAxis = d3.axisLeft(yScale);
    scatterSvg.append("g")
        .attr("class", "y-axis")
        .attr("height", 300)
        .call(yAxis);
    
    scatterSvg.append("text")
        .attr("transform", `translate(${40 + margin.left}, ${height / 2 + margin.bottom - 40})`)
        .style("text-anchor", "middle")
        .text("Depression Scores");

    scatterSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 4))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Hours Listened");

    scatterSvg.append("text")
        .attr("x", 30 + margin.left)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Depression Scores vs. Hours Listened");

    // bar chart 

    const barWidth = 750 - margin.left - margin.right;
    const barHeight = 350 - margin.top - margin.bottom;

    const genreCounts = new Map(); 
    rawData.forEach(d => {
        const genre = d["Fav genre"];
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    });

    const improvedCounts = new Map();
    rawData.forEach(d => {
        if (d["Music effects"] === "Improve"){
            const genre = d["Fav genre"];
            improvedCounts.set(genre, (improvedCounts.get(genre) || 0) + 1);
        }
    });

    const relativeFrequencies = Array.from(improvedCounts, ([genre, count]) => ({
        genre, 
        frequency: count / genreCounts.get(genre)
    }));
  
    const barSvg = d3.select("body").append("svg")
        .attr("width", 700 + margin.left + margin.right)
        .attr("height", 200 + margin.top + margin.bottom)
        .style("position", "absolute")
        .style("right", "50px")
        .style("bottom", "50px")
        .append("g")
        .attr("transform", `translate(${margin.left - 10}, ${margin.top})`);

    const x = d3.scaleBand()
        .domain(relativeFrequencies.map(d => d.genre))
        .range([0, width / 1.2])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(relativeFrequencies, d => d.frequency)])
        .nice()
        .range([barHeight, 0]); 
    
    barSvg.selectAll(".bar")
        .data(relativeFrequencies)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.frequency))
        .attr("width", x.bandwidth())
        .attr("height", d => barHeight - y(d.frequency))
        .style("fill", "blue"); 
    
    barSvg.append("g")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(x)); 
    
    barSvg.append("g")
        .call(d3.axisLeft(y)); 
    
    barSvg.append("text")
        .attr("x", (width / 2) - 100 )
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Frequency of 'improved' Responses by Genre")
    barSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 40) // Adjust position as needed
        .attr("x", -(barHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Frequency of Improved Mood");
});
