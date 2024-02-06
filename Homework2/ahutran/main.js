//Site width/height
const width = window.innerWidth;
const height = window.innerHeight;

//Plot 1 variables
var width1 = 450;
var height1 = 450;
var margin1 = 40;

var radius1 = Math.min(width, height) / 2 - margin1;

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

    //Data process
    //Create a dictionary for our data where the key is each job_title and the value is an array of salaries
    let jobSalaries = {};
    rawData.forEach(function(d){
        if (!jobSalaries[d.job_title]){
            jobSalaries[d.job_title] = [];
        }
        jobSalaries[d.job_title].push(d.salary_in_usd);
    });
    console.log(jobSalaries);
    //Since the job titles can differ slightly, we will simply look jobs with more than 50 people.
    let jobSalariesFiltered = {};
    for (const [key, value] of Object.entries(jobSalaries)){
        if (value.length > 50){
            jobSalariesFiltered[key] = value;
        }
    }
    console.log(jobSalariesFiltered);
    //Now we will take jobSalariesFiltered and calculate the average salary for each job rounding to the nearest integer.
    //The new array will be an array of objects with the job title and the average salary as well as the number of people in that job
    let jobSalariesAvg = [];
    for (const [key, value] of Object.entries(jobSalariesFiltered)){
        let sum = value.reduce((a, b) => a + b, 0);
        let avg = Math.round(sum / value.length);
        jobSalariesAvg.push({"job_title": key, "avg_salary": avg, "num_people": value.length});
    }
    console.log(jobSalariesAvg);
    
    var svg = d3.select("plt1")
        .append("svg")
        .attr("width", width1)
        .attr("height", height1)
        .append("g")
        .attr("transform", "translate(" + width1 / 2 + "," + height1 / 2 + ")");

    var color = d3.scaleOrdinal()
        .domain(jobSalariesAvg)
        .range(d3.schemeSet2);
    
    var pie = d3.pie()
        .value(function(d) {return d.avg;});
    var data_ready = pie(d3.entries(jobSalariesAvg))

    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius1);
    
});