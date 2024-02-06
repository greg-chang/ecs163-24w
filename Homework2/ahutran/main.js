//Resources Visited:
//https://www.visualcinnamon.com/2015/09/placing-text-on-arcs/

//Site width/height
const screenwidth = window.innerWidth;
const screenheight = window.innerHeight;

//Scatter plot dimensions/params
d3.csv("ds_salaries.csv").then(rawData =>{
    rawData.forEach(function(d){
        d.work_year = Number(d.work_year);
        d.experience_level = String(d.experience_level);
        d.employment_type = String(d.employment_type);
        d.job_title = String(d.job_title);
        d.salary = Number(d.salary);
        d.salary_currency = String(d.salary_currency);
        d.salary_in_usd = Number(d.salary_in_usd);
        d.employee_residence = String(d.employee_residence);
        d.remote_ratio = Number(d.remote_ratio);
        d.company_location = String(d.company_location);
        d.company_size = String(d.company_size);
    });
    //rawData is an array that contains each row as an object now
    console.log(rawData);
    //First plot will be an interactive pie chart? This will serve as overview
    //Original idea of data is salary of different data science fields
    //Marks: slices of pie chart
    //Channels: color (unimportant, used for differentiation),
    //          angle/area (important, used for comparison),
    //Slice of pie will represent percentage of people in that field
    //Hovering over will reveal average salary of that field

    //Data process for Plot 1
    //Create a dictionary for our data where the key is each job_title and the value is an array of salaries
    let jobSalaries = {};
    rawData.forEach(function(d){
        if (!jobSalaries[d.job_title]){
            jobSalaries[d.job_title] = [];
        }
        jobSalaries[d.job_title].push(d.salary_in_usd);
    });
    //console.log(jobSalaries);
    //Since the job titles can differ slightly, we will simply look at jobs with more than 50 people.
    let jobSalariesFiltered = {};
    for (const [key, value] of Object.entries(jobSalaries)){
        if (value.length > 50){
            jobSalariesFiltered[key] = value;
        }
    }
    //console.log(jobSalariesFiltered);
    //Now we will take jobSalariesFiltered and calculate the average salary for each job rounding to the nearest integer.
    //The new array will be an array of objects with the job title and the average salary as well as the number of people in that job
    let jobSalariesAvg = [];
    for (const [key, value] of Object.entries(jobSalariesFiltered)){
        let sum = value.reduce((a, b) => a + b, 0);
        let avg = Math.round(sum / value.length);
        jobSalariesAvg.push({"job_title": key, "avg_salary": avg, "num_people": value.length});
    }
    console.log("Data for Plot 1");
    console.log(jobSalariesAvg);

    //Second plot will be a simple scatter plot mapping ratio of remote work to salary
    //Marks: points
    //Channels: x (remote work ratio), y (salary), color (job title)
    //Include legend for colors
    //Data process for Plot 2
    //We will take the rawData and remove rows where the job_title appears less than 50 times
    console.log("Data for Plot 2");
    let jobSalariesFiltered2 = rawData.filter(function(d){
        return jobSalariesFiltered[d.job_title];
    });
    console.log(jobSalariesFiltered2);

    //We will then create a dictionary where the key is the job_title and the value is an array of remote_ratio and salary_in_usd
    let jobSalaries2 = {};
    jobSalariesFiltered2.forEach(function(d){
        if (!jobSalaries2[d.job_title]){
            jobSalaries2[d.job_title] = [];
        }
        jobSalaries2[d.job_title].push({"remote_ratio": d.remote_ratio, "salary": d.salary_in_usd});
    });
    console.log(jobSalaries2);
    

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------//
    //Plot 1 - Pie Chart
    var margin1 = {left: 20, top: 20, right: 20, bottom: 20},
			width1 = Math.min(screenwidth, 500) - margin1.left - margin1.right,
			height1 = Math.min(screenwidth, 500) - margin1.top - margin1.bottom;
    var svg = d3.select("#chart").append("svg")
        .attr("width", (width1 + margin1.left + margin1.right))
        .attr("height", (height1 + margin1.top + margin1.bottom))
        .append("g").attr("class", "wrapper")
        .attr("transform", "translate(" + (width1 / 2 + margin1.left) + "," + (height1 / 2 + margin1.top) + ")");

    var colorScale = d3.scaleOrdinal(d3.schemeSet3);

    var arc = d3.arc()
        .outerRadius(width1*0.75/2 + 30)
        .innerRadius(width1*0.75/2 - 10);

    var pie = d3.pie()
        .startAngle(-90 * (Math.PI/180))
        .endAngle(-90 * Math.PI/180 + 2*Math.PI)
        .value(function(d) {return d.num_people;})
        .padAngle(.01)
        .sort(null);
    
        svg.selectAll(".donutArcSlices")
            .data(pie(jobSalariesAvg))
            .enter().append("path")
            .attr("class", "donutArcSlices")
            .attr("d", arc)
            .style("fill", function(d,i) {
                return colorScale(i);
            })
            .on("mouseover", function(d){
                svg.append("text")
                    .attr("class", "donutTitle")
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(d.data.job_title + " Average Salary: $" + d.data.avg_salary)
                    .attr("transform", "translate(0, -10)");
            }
            ).on("mouseout", function(d){
                svg.select(".donutTitle").remove();
            },"select")
            .each(function(d,i) {
                var firstArcSection = /(^.+?)L/;
                var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
                newArc = newArc.replace(/,/g , " ");
                svg.append("path")
                    .attr("class", "hiddenDonutArcs")
                    .attr("id", "donutArc"+i)
                    .attr("d", newArc)
                    .style("fill", "none");
            });
        
            svg.selectAll(".donutText")
            .data(jobSalariesAvg)
            .enter().append("text")
            .attr("class", "donutText")
            .attr("dy", -13)
            .append("textPath")
            .attr("startOffset", "50%")
            .style("text-anchor","middle")
            .attr("xlink:href",function(d,i){return "#donutArc"+i;})
            .text(function(d){return d.job_title;
            });
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------//
    //Plot 2 - 
});