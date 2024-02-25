const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

/*
d3.csv("student-mat.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.AB = Number(d.AB);
        d.H = Number(d.H);
        d.salary = Number(d.salary);
        d.SO = Number(d.SO);
    });

    rawData = rawData.filter(d => d.AB > abFilter);
    rawData = rawData.map(d => {
		  return {
			  "H_AB" : d.H / d.AB,
			  "SO_AB" : d.SO / d.AB,
			  "teamID" : d.teamID,
		  };
	});

    console.log(rawData);

	//Plot one, scatter plot.
	const svg = d3.select("#plot_one")

	const g1 = svg.append("g")
					.attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
					.attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
					.attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

	//X axis label.
	g1.append("text")
		.attr("x", scatterWidth / 2)
		.attr("y", scatterHeight + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Age")

	//Ticks on x axis.
	const x1 = d3.scaleLinear()
		.domain([d3.min(rawData, d => d.age - 1), d3.max(rawData, d => d.age)])
		.range([0, scatterWidth])

	const xAxisCall = d3.axisBottom(x1)
						.ticks(8)

	g1.append("g")
		.attr("transform", `translate(0, ${scatterHeight})`)
		.call(xAxisCall)
		.selectAll("text")
			.attr("y", "10")
			.attr("x", "-5")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-40)")

	//Y axis label.
	g1.append("text")
	.attr("x", -(scatterHeight / 2))
	.attr("y", -40)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Total Alcohol Consumption")

	//Ticks on y axis.
	const y1 = d3.scaleLinear()
		.domain([0, d3.max(rawData, d => d.Dalc + d.Walc)])
		.range([scatterHeight, 0])

	const yAxisCall = d3.axisLeft(y1)
						.ticks(17)
	g1.append("g").call(yAxisCall)

	const rects = g1.selectAll("circle").data(rawData)

	rects.enter().append("circle")
		 .attr("cx", function(d){
			 return x1(d.age);
		 })
		 .attr("cy", function(d){
			 return y1(d.Dalc + d.Walc);
		 })
		 .attr("r", 3)
		 .attr("fill", "#69b3a2")
});
*/

let barLeft = 0, barTop = 0;
let barMargin = {top: 10, right: 30, bottom: 30, left: 60},
    barWidth = 400 - barMargin.left - barMargin.right,
    barHeight = 350 - barMargin.top - barMargin.bottom;

d3.csv("student-mat.csv").then(rawData => {
	console.log(rawData);


// set the dimensions and margins of the graph
const marginr = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - marginr.left - marginr.right,
    height = 400 - marginr.top - marginr.bottom;

// append the svg object to the body of the page
const svg2 = d3.select("#plot_two")
  .append("g")
    .attr("width", width + marginr.left + marginr.right)
    .attr("height", height + marginr.top + marginr.bottom)
    .attr("transform", `translate(${marginr.left},${marginr.top})`);

// Parse the Data
d3.csv("student-mat.csv").then( function(data) {

	//Take a look at this *disgusting* code.
	let avgPerAge = [];
	for(let i = 0; i < rawData.length; i++){
		let age_idx = -1;
		for(let j = 0; j < avgPerAge.length; j++){
			if(+avgPerAge[j].age === +rawData[i].age){
				age_idx = j;
				break;
			}
		}

		if(age_idx >= 0){
			console.log("Found an existing age group:", avgPerAge[age_idx].age);
			console.log("Adding alcohol content:", +rawData[i].Walc + +rawData[i].Dalc);
			avgPerAge[age_idx].num += 1;
			avgPerAge[age_idx].sumAlc += +rawData[i].Walc + +rawData[i].Dalc;
			console.log("sumAlc is now:", avgPerAge[age_idx].sumAlc);
		}
		else{
			console.log("Making new age group.");
			avgPerAge.push({
				age: +rawData[i].age,
				num: 1,
				sumAlc: +rawData[i].Walc + +rawData[i].Dalc,
				meanAlc: 0,
			});
		}
	}

	//Let's be lazy here -- we're not doing this for efficiency.
	for(let i = 0; i < avgPerAge.length; i++){
		for(let j = 0; j < avgPerAge.length; j++){
			if(i !== j){
				if(avgPerAge[i].age < avgPerAge[j].age){
					let temp = avgPerAge[i];
					avgPerAge[i] = avgPerAge[j];
					avgPerAge[j] = temp;
				}
			}
		}
	}

	for(let i = 0; i < avgPerAge.length; i++){
		avgPerAge[i].meanAlc = avgPerAge[i].sumAlc / avgPerAge[i].num;
	}
	console.log(avgPerAge);
	data = avgPerAge;


// X axis
const x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(d => d.age))
  .padding(0.2);
svg2.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");
//X axis label.
	svg2.append("text")
		.attr("x", barWidth / 2)
		.attr("y", barHeight + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Age")

svg2.append("text")
		.attr("x", (barWidth / 2) + 15)
		.attr("y", barHeight + -320)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Avg Alcohol Consumption Over Age Groups")

// Add Y axis
const y = d3.scaleLinear()
	.domain([0, d3.max(avgPerAge, d => d.meanAlc)])
  .range([ height, 0]);
svg2.append("g")
  .call(d3.axisLeft(y));


	//Y axis label.
	svg2.append("text")
	.attr("x", -(barHeight / 2))
	.attr("y", -40)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Average Alcohol Consumption")

// Bars
svg2.selectAll("mybar")
  .data(data)
  .join("rect")
    .attr("x", d => x(d.age))
    .attr("y", d => y(d.meanAlc))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.meanAlc))
    .attr("fill", "#69b3a2")

})






	//Plot one, bar graph.
	const svg = d3.select("#plot_one")

	const g1 = svg.append("g")
					.attr("width", barWidth + barMargin.left + barMargin.right)
					.attr("height", barHeight + barMargin.top + barMargin.bottom)
					.attr("transform", `translate(${barMargin.left}, ${barMargin.top})`)

	
	//Take a look at this *disgusting* code.
	let avgPerAge = [];
	for(let i = 0; i < rawData.length; i++){
		let age_idx = -1;
		for(let j = 0; j < avgPerAge.length; j++){
			if(+avgPerAge[j].age === +rawData[i].age){
				age_idx = j;
				break;
			}
		}

		if(age_idx >= 0){
			console.log("Found an existing age group:", avgPerAge[age_idx].age);
			console.log("Adding alcohol content:", +rawData[i].Walc + +rawData[i].Dalc);
			avgPerAge[age_idx].num += 1;
			avgPerAge[age_idx].sumAlc += +rawData[i].Walc + +rawData[i].Dalc;
			console.log("sumAlc is now:", avgPerAge[age_idx].sumAlc);
		}
		else{
			console.log("Making new age group.");
			avgPerAge.push({
				age: +rawData[i].age,
				num: 1,
				sumAlc: +rawData[i].Walc + +rawData[i].Dalc,
				meanAlc: 0,
			});
		}
	}

	//Let's be lazy here -- we're not doing this for efficiency.
	for(let i = 0; i < avgPerAge.length; i++){
		for(let j = 0; j < avgPerAge.length; j++){
			if(i !== j){
				if(avgPerAge[i].age < avgPerAge[j].age){
					let temp = avgPerAge[i];
					avgPerAge[i] = avgPerAge[j];
					avgPerAge[j] = temp;
				}
			}
		}
	}

	for(let i = 0; i < avgPerAge.length; i++){
		avgPerAge[i].meanAlc = avgPerAge[i].sumAlc / avgPerAge[i].num;
	}
	console.log(avgPerAge);

	//X axis label.
	g1.append("text")
		.attr("x", barWidth / 2)
		.attr("y", barHeight + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Age")

	//Ticks on x axis.
	const x1 = d3.scaleLinear()
		.domain([d3.min(avgPerAge, d => d.age - 1), d3.max(avgPerAge, d => d.age)])
		.range([0, barWidth])

	const xAxisCall = d3.axisBottom(x1)
						.ticks(8)

	g1.append("g")
		.attr("transform", `translate(0, ${barHeight})`)
		.call(xAxisCall)
		.selectAll("text")
			.attr("y", "10")
			.attr("x", "-5")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-40)")

	//Y axis label.
	g1.append("text")
	.attr("x", -(barHeight / 2))
	.attr("y", -40)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Average Alcohol Consumption")

	//Ticks on y axis.
	const y1 = d3.scaleLinear()
		.domain([0, d3.max(avgPerAge, d => d.meanAlc)])
		.range([barHeight, 0])

	const yAxisCall = d3.axisLeft(y1)
						.ticks(17)
	g1.append("g").call(yAxisCall)


	const rects = g1.selectAll("rect").data(avgPerAge)

	rects.enter().append("rect")
		 .attr("width", 20)
		 .attr("height", function(d){
			return y1(d.meanAlc);
		 })
		 .attr("x", function(d, i){
			return i * 40;
		 })
		 .attr("y", (d, i) => {
			return 0;
		 })
		 .attr("fill", "#69b3a2")



	/*
	// Join cities to rect elements and modify height, width and position
	d3.select('.bars')
		.selectAll('rect')
		.data(cities)
		.join('rect')
		.attr('height', 19)
		.attr('width', function(d) {
			var scaleFactor = 0.00004;
			return d.population * scaleFactor;
		})
		.attr('y', function(d, i) {
			return i * 20;
		})
		.style('fill', 'orange');

	// Join cities to text elements and modify content and position
	d3.select('.labels')
		.selectAll('text')
		.data(cities)
		.join('text')
		.attr('y', function(d, i) {
			return i * 20 + 13;
		})
		.text(function(d) {
			return d.name;
		});
		*/





// set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 30, left: 60},
    wwidth = 900 - margin.left - margin.right,
    hheight = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg3 = d3.select("#plot_three")
  .append("g")
    .attr("width", wwidth + margin.left + margin.right)
    .attr("height", hheight + margin.top + margin.bottom)
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);


	

// Parse the Data
d3.csv("student-mat.csv").then( function(data) {
	console.log(data);
	
	//Take a look at this *disgusting* code.
	let avgPerAge = [];
	for(let i = 0; i < data.length; i++){
		let age_idx = -1;
		for(let j = 0; j < avgPerAge.length; j++){
			if(+avgPerAge[j].age === +data[i].age){
				age_idx = j;
				break;
			}
		}

		if(age_idx >= 0){
			console.log("Found an existing age group:", avgPerAge[age_idx].age);
			avgPerAge[age_idx].num += 1;
			avgPerAge[age_idx].sumMedu += +data[i].Medu;
			avgPerAge[age_idx].sumFedu += +data[i].Fedu;
			avgPerAge[age_idx].sumTraveltime += +data[i].traveltime;
			avgPerAge[age_idx].sumStudytime += +data[i].studytime;
			avgPerAge[age_idx].sumFailures += +data[i].failures;
			avgPerAge[age_idx].sumFamrel += +data[i].famrel;
			avgPerAge[age_idx].sumFreetime += +data[i].freetime;
			avgPerAge[age_idx].sumGoout += +data[i].goout;
			avgPerAge[age_idx].sumDalc += +data[i].Dalc;
			avgPerAge[age_idx].sumWalc += +data[i].Walc;
			avgPerAge[age_idx].sumHealth += +data[i].health;
			avgPerAge[age_idx].sumAbsences += +data[i].absences;
		}
		else{
			console.log("Making new age group.");
   const keys = ["Medu", "Fedu", "traveltime", "studytime", "failures", "famrel", "freetime", "goout", "Dalc", "Walc", "health", "absences"]
			avgPerAge.push({
				age: +data[i].age,
				num: 1,
				sumMedu: +data[i].Medu,
				Medu: 0,
				sumFedu: +data[i].Fedu,
				Fedu: 0,
				sumTraveltime: +data[i].traveltime,
				traveltime: 0,
				sumStudytime: +data[i].studytime,
				studytime: 0,
				sumFailures: +data[i].failures,
				failures: 0,
				sumFamrel: +data[i].famrel,
				famrel: 0,
				sumGoout: +data[i].goout,
				goout: 0,
				sumDalc: +data[i].Dalc,
				Dalc: 0,
				sumWalc: +data[i].Walc,
				Walc: 0,
				sumHealth: +data[i].health,
				health: 0,
				sumAbsences: +data[i].absences,
				absences: 0,
			});
		}
	}

	//Let's be lazy here -- we're not doing this for efficiency.
	for(let i = 0; i < avgPerAge.length; i++){
		for(let j = 0; j < avgPerAge.length; j++){
			if(i !== j){
				if(avgPerAge[i].age < avgPerAge[j].age){
					let temp = avgPerAge[i];
					avgPerAge[i] = avgPerAge[j];
					avgPerAge[j] = temp;
				}
			}
		}
	}

	for(let i = 0; i < avgPerAge.length; i++){
		avgPerAge[i].Medu = avgPerAge[i].sumMedu / avgPerAge[i].num;
		avgPerAge[i].Fedu = avgPerAge[i].sumFedu / avgPerAge[i].num;
		avgPerAge[i].traveltime = avgPerAge[i].sumTraveltime / avgPerAge[i].num;
		avgPerAge[i].studytime = avgPerAge[i].sumStudytime / avgPerAge[i].num;
		avgPerAge[i].failures = avgPerAge[i].sumFailures / avgPerAge[i].num;
		avgPerAge[i].famrel = avgPerAge[i].sumFamrel / avgPerAge[i].num;
		avgPerAge[i].freetime = avgPerAge[i].sumFreetime / avgPerAge[i].num;
		avgPerAge[i].goout = avgPerAge[i].sumGoout / avgPerAge[i].num;
		avgPerAge[i].Walc = avgPerAge[i].sumWalc / avgPerAge[i].num;
		avgPerAge[i].Dalc = avgPerAge[i].sumDalc / avgPerAge[i].num;
		avgPerAge[i].health = avgPerAge[i].sumHealth / avgPerAge[i].num;
		avgPerAge[i].absences = avgPerAge[i].sumAbsences / avgPerAge[i].num;
	}
	console.log(avgPerAge);
	data = avgPerAge;
	console.log(data);

  // List of groups = header of the csv files
	//const keys = ["Dalc", "Walc"]
   const keys = ["Medu", "Fedu", "studytime", "failures", "freetime", "goout", "Dalc", "Walc", "health", "absences"]

  // Add X axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.age; }))
    .range([ 0, wwidth ]);
  svg3.append("g")
    .attr("transform", `translate(0, ${hheight})`)
    .call(d3.axisBottom(x).ticks(5));

	//X axis label.
	svg3.append("text")
		.attr("x", wwidth / 2)
		.attr("y", hheight + 90)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Age Group")

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([-24, 24])
    .range([ hheight, 0 ]);
  svg3.append("g")
    .call(d3.axisLeft(y));

  // color palette
  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#00aaaa','#aa00aa','#337722','#773322','#a65628','#f3810f','#ff0f00','#443366','#a65693','#f250bf'])

  //stack the data?
  const stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys)
    (data)

  // Show the areas
  svg3
    .selectAll("mylayers")
    .data(stackedData)
    .join("path")
      .style("fill", function(d) { return color(d.key); })
      .attr("d", d3.area()
        .x(function(d, i) { return x(d.data.age); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    )


	
svg3.append("circle").attr("cx",80).attr("cy",310).attr("r", 6).style("fill", "#00aaaa")
svg3.append("text").attr("x", 100).attr("y", 315).text("Medu").style("font-size", "15px").attr("alignment-baseline","middle")

svg3.append("circle").attr("cx",80).attr("cy",290).attr("r", 6).style("fill", "#aa00aa")
svg3.append("text").attr("x", 100).attr("y", 295).text("Fedu").style("font-size", "15px").attr("alignment-baseline","middle")


svg3.append("circle").attr("cx",180).attr("cy",290).attr("r", 6).style("fill", "#337722")
svg3.append("text").attr("x", 200).attr("y", 295).text("Study time").style("font-size", "15px").attr("alignment-baseline","middle")

svg3.append("circle").attr("cx",180).attr("cy",310).attr("r", 6).style("fill", "#773322")
svg3.append("text").attr("x", 200).attr("y", 315).text("failures").style("font-size", "15px").attr("alignment-baseline","middle")



   //const keys = ["Medu", "Fedu", "studytime", "failures", "freetime", "goout", "Dalc", "Walc", "health", "absences"]
    //.range(['#00aaaa','#aa00aa','#337722','#773322','#a65628','#f3810f','#ff0f00','#443366','#a65693','#f250bf'])

svg3.append("circle").attr("cx",80).attr("cy",30).attr("r", 6).style("fill", "#a65628")
svg3.append("text").attr("x", 100).attr("y", 35).text("Freetime").style("font-size", "15px").attr("alignment-baseline","middle")

svg3.append("circle").attr("cx",80).attr("cy",60).attr("r", 6).style("fill", "#f3810f")
svg3.append("text").attr("x", 100).attr("y", 65).text("goout").style("font-size", "15px").attr("alignment-baseline","middle")


svg3.append("circle").attr("cx",180).attr("cy",30).attr("r", 6).style("fill", "#ff0f00")
svg3.append("text").attr("x", 200).attr("y", 35).text("Alcohol during week").style("font-size", "15px").attr("alignment-baseline","middle")

svg3.append("circle").attr("cx",180).attr("cy",60).attr("r", 6).style("fill", "#443366")
svg3.append("text").attr("x", 200).attr("y", 65).text("Alcohol during weekend").style("font-size", "15px").attr("alignment-baseline","middle")


svg3.append("circle").attr("cx",480).attr("cy",30).attr("r", 6).style("fill", "#a65693")
svg3.append("text").attr("x", 500).attr("y", 35).text("Health").style("font-size", "15px").attr("alignment-baseline","middle")

svg3.append("circle").attr("cx",480).attr("cy",60).attr("r", 6).style("fill", "#f250bf")
svg3.append("text").attr("x", 500).attr("y", 65).text("Number of Absences").style("font-size", "15px").attr("alignment-baseline","middle")

svg3.append("text").attr("x", 20).attr("y", 0).text("Data over Age Groups").style("font-size", "19px").attr("alignment-baseline","middle")
svg3.append("text").attr("x", 250).attr("y", 0).text("(Numbers scaled from 1 to 5, excl. absences)").style("font-size", "15px").attr("alignment-baseline","middle")





})


});
