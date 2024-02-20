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

    //Data process for Plot 1
    //Create a dictionary for our data where the key is each job_title and the value is an array of salaries
    let jobSalaries1 = {};
    rawData.forEach(function(d){
        if (!jobSalaries1[d.job_title]){
            jobSalaries1[d.job_title] = [];
        }
        jobSalaries1[d.job_title].push(d.salary_in_usd);
    });
    //console.log(jobSalaries1);
    //Since the job titles can differ slightly, we will simply look at jobs with more than 50 people.
    let jobSalariesFiltered = {};
    for (const [key, value] of Object.entries(jobSalaries1)){
        if (value.length > 50){
            jobSalariesFiltered[key] = value;
        }
    }
    //console.log(jobSalariesFiltered);
    //Now we will take jobSalariesFiltered and calculate the average salary for each job rounding to the nearest integer.
    //The new array will be an array of objects with the job title and the average salary as well as the number of people in that job
    let jobSalariesAvg1 = [];
    for (const [key, value] of Object.entries(jobSalariesFiltered)){
        let sum = value.reduce((a, b) => a + b, 0);
        let avg = Math.round(sum / value.length);
        jobSalariesAvg1.push({"job_title": key, "avg_salary": avg, "num_people": value.length});
    }
    console.log("Data for Plot 1");
    console.log(jobSalariesAvg1);

    //Second plot will be a sankey diagram describing the flow of people from job titles -> experience_level -> employment_type
    console.log("Data for Plot 2");
    //Data process for Plot 2
    //Create an array where each object includes the job_title, unique experience_level, unique_employment types, and the number of people with those attributes
    let jobExpEmp = [];
    rawData.forEach(function(d){
        let jobTitle = d.job_title;
        let experienceLevel = d.experience_level;
        let employmentType = d.employment_type;
        let found = false;
        for (let i = 0; i < jobExpEmp.length; i++){
            if (jobExpEmp[i].job_title === jobTitle && jobExpEmp[i].experience_level === experienceLevel && jobExpEmp[i].employment_type === employmentType){
                jobExpEmp[i].num_people += 1;
                found = true;
                break;
            }
        }
        if (!found){
            jobExpEmp.push({"job_title": jobTitle, "experience_level": experienceLevel, "employment_type": employmentType, "num_people": 1});
        }
    });
    console.log(jobExpEmp);
    //Sort jobExpEmp by job_title, experience_level, and employment_type for readability
    jobExpEmp.sort(function(a, b){
        if (a.job_title < b.job_title){
            return -1;
        }
        else if (a.job_title > b.job_title){
            return 1;
        }
        else if (a.experience_level < b.experience_level){
            return -1;
        }
        else if (a.experience_level > b.experience_level){
            return 1;
        }
        else if (a.employment_type < b.employment_type){
            return -1;
        }
        else if (a.employment_type > b.employment_type){
            return 1;
        }
        return 0;
    });
    console.log(jobExpEmp);
    //Format data for dendogram
    let jobExpEmpDen = {"name": "Data Science Jobs", "children": []};
    let jobTitles = [];
    for (let i = 0; i < jobExpEmp.length; i++){
        if (!jobTitles.includes(jobExpEmp[i].job_title)){
            jobTitles.push(jobExpEmp[i].job_title);
            jobExpEmpDen.children.push({"name": jobExpEmp[i].job_title, "children": []});
        }
    }
    for (let i = 0; i < jobExpEmp.length; i++){
        let jobTitle = jobExpEmp[i].job_title;
        let experienceLevel = jobExpEmp[i].experience_level;
        let employmentType = jobExpEmp[i].employment_type;
        let numPeople = jobExpEmp[i].num_people;
        for (let j = 0; j < jobExpEmpDen.children.length; j++){
            if (jobExpEmpDen.children[j].name === jobTitle){
                let found = false;
                for (let k = 0; k < jobExpEmpDen.children[j].children.length; k++){
                    if (jobExpEmpDen.children[j].children[k].name === experienceLevel){
                        jobExpEmpDen.children[j].children[k].children.push({"name": employmentType, "value": numPeople});
                        found = true;
                        break;
                    }
                }
                if (!found){
                    jobExpEmpDen.children[j].children.push({"name": experienceLevel, "children": [{"name": employmentType, "value": numPeople}]});
                }
            }
        }
    }
    console.log(jobExpEmpDen);
    //Remove job_titles with less than 50 people
    for (let i = 0; i < jobExpEmpDen.children.length; i++){
        let totalPeople = 0;
        for (let j = 0; j < jobExpEmpDen.children[i].children.length; j++){
            for (let k = 0; k < jobExpEmpDen.children[i].children[j].children.length; k++){
                totalPeople += jobExpEmpDen.children[i].children[j].children[k].value;
            }
        }
        if (totalPeople < 50){
            jobExpEmpDen.children.splice(i, 1);
            i--;
        }
    }
    console.log(jobExpEmpDen);

    //Data process for Plot 3
    //Barplot of average salary for each company_size
    //Create an array where each object includes the company_size and the average salary for that company_size
    let companySizeSalaries = [];
    let companySizes = [];
    for (let i = 0; i < rawData.length; i++){
        let companySize = rawData[i].company_size;
        if (!companySizes.includes(companySize)){
            companySizes.push(companySize);
            companySizeSalaries.push({"company_size": companySize, "salaries": []});
        }
    }
    for (let i = 0; i < rawData.length; i++){
        let companySize = rawData[i].company_size;
        let salary = rawData[i].salary_in_usd;
        for (let j = 0; j < companySizeSalaries.length; j++){
            if (companySizeSalaries[j].company_size === companySize){
                companySizeSalaries[j].salaries.push(salary);
                break;
            }
        }
    }
    for (let i = 0; i < companySizeSalaries.length; i++){
        let sum = companySizeSalaries[i].salaries.reduce((a, b) => a + b, 0);
        let avg = Math.round(sum / companySizeSalaries[i].salaries.length);
        companySizeSalaries[i].avg_salary = avg;
    }
    console.log("Data for Plot 3");
    console.log(companySizeSalaries);
    //------------------------------------------------------------------------------------------------------------------------------------------------------------//
    //Plot 1 - Pie Chart - //https://www.visualcinnamon.com/2015/09/placing-text-on-arcs/
    var margin1 = {left: 20, top: 20, right: 20, bottom: 20},
    width1 = Math.min(screenwidth, 500) - margin1.left - margin1.right,
    height1 = Math.min(screenwidth, 500) - margin1.top - margin1.bottom;
    var svg = d3.select("svg").append("svg")
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
            .data(pie(jobSalariesAvg1))
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
                    .text(d.data.job_title + " Avg Salary: $" + d.data.avg_salary)
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
        
        //add chart title in the middle of the donut
        svg.append("text")
            .attr("class", "donutTitle2")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text("Top 9 Average Salaries for Data Science Jobs")
            .attr("transform", "translate(0, -60)");

        svg.selectAll(".donutText")
            .data(jobSalariesAvg1)
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
    //Plot 2 - Dendogram - https://d3-graph-gallery.com/graph/dendrogram_basic.html

    var margin2 = {top: 300, right: 400, bottom: -300, left: -300},
        width2 = screenwidth - 100,
        height2 = screenheight - margin2.top - margin2.bottom;
    var svg2 = d3.select("svg").append("svg")
        .attr("width", width2*4)
        .attr("height", height2*1.5)
        .append("g")
        .attr("transform", `translate(${width2-1250}, ${height2-900})`);
    
    const cluster = d3.cluster()
    .size([height2+350, width2/4]);

    const root = d3.hierarchy(jobExpEmpDen, function(d){
        return d.children;
    });
    cluster(root)

    svg2.selectAll('path')
        .data( root.descendants().slice(1) )
        .join('path')
        .attr("d", function(d) {
            return "M" + d.x + "," + d.y
                + "C" + (d.parent.x + (d.x-d.parent.x)) + "," + d.y
                + " " + (d.parent.x + (d.x-d.parent.x)) + "," + d.parent.y
                + " " + d.parent.x + "," + d.parent.y;
            })
        .style("fill", 'none')
        .attr("stroke", '#ccc')
    svg2.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", function(d) {
            return `translate(${d.x},${d.y})`
        })
        .append("circle")
            .attr("r", 7)
            .style("fill", "#69b3a2")
            .attr("stroke", "black")
            .style("stroke-width", 2)
    svg2.selectAll("g")
        .data(root.descendants())
        .join("g")
        .append("text")
        .text(function(d){
            return d.data.value ? d.data.name + " (" + d.data.value + ")" : d.data.name;
        })
        .attr("x", -10)
        .attr("y", -10)
        .style("font-size", "10px")
        .style("fill", "black")
    //add chart title
    svg2.append("text")
        .attr("x", 600)
        .attr("y", 500)
        .style("text-anchor", "middle")
        .text("Data Science Jobs by Experience Level and Employment Type");

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------//
    //Plot 3 - Barplot - https://d3-graph-gallery.com/graph/barplot_basic.html
    var margin3 = {top: 520, right: 0, bottom: 0, left: 100},
        width3 = 400,
        height3 = 350;
    var svg3 = d3.select("svg").append("svg")
        .attr("width", width3*2)
        .attr("height", height3*3)
        .append("g")
        .attr("transform", `translate(${margin3.left}, ${margin3.top})`);
    
    var x = d3.scaleBand()
        .range([0, width3])
        .padding(0.1)
        .domain(companySizeSalaries.map(function(d) { return d.company_size; }));
    svg3.append("g")
        .attr("transform", `translate(0, ${height3})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-5,-5)rotate(-45)")
        .style("text-anchor", "end");
    var y = d3.scaleLinear()
        .range([height3, 0])
        .domain([0, d3.max(companySizeSalaries, function(d) { return d.avg_salary; })]);
    svg3.append("g")
        .call(d3.axisLeft(y));
    
    var rects = svg3.selectAll("bar")
        .data(companySizeSalaries)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.company_size); })
        .attr("y", function(d) { return y(d.avg_salary); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height3 - y(d.avg_salary); })
        .attr("fill", "#69b3a2");

    
    //add x axis title
    svg3.append("text")
        .attr("x", width3-150)
        .attr("y", height3+30)
        .style("text-anchor", "end")
        .text("Company Size");
    //Add y axis title
    svg3.append("text")
        .attr("x", -(height3 / 2))
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Average Salary");
    //add chart title at top of barplot
    svg3.append("text")
        .attr("x", 190)
        .attr("y", 410)
        .style("text-anchor", "middle")
        .text("Average Salary by Company Size");
    rects.on("click", function(d){
        if (d3.select(this).attr("fill") === "#69b3a2"){
            d3.select(this).attr("fill", "#80B1D3");
            svg3.append("text")
                .attr("class", "barText")
                .attr("x", x(d.company_size) + 30)
                .attr("y", y(d.avg_salary) - 10)
                .text("$" + d.avg_salary);
        }
        else{
            d3.select(this).attr("fill", "#69b3a2");
            svg3.select(".barText").remove();
        }
    });
    var sorted = false;
    d3.select("#sort").on("click", function(){
        if (!sorted){
            companySizeSalaries.sort(function(a, b){
                sorted = true;
                return d3.descending(a.avg_salary, b.avg_salary);
            });
        }
        else{
            companySizeSalaries.sort(function(a, b){
                sorted = false;
                return d3.ascending(a.avg_salary, b.avg_salary);
            });
        }
        svg3.selectAll("rect").attr("fill", "#69b3a2");
        svg3.select(".barText").remove();
        x.domain(companySizeSalaries.map(function(d) { return d.company_size; }));
        rects.transition().duration(1000).attr("x", function(d) { return x(d.company_size); });
        svg3.select("g")
            .transition().duration(1000)
            .attr("transform", `translate(0, ${height3})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-5,-5)rotate(-45)")
            .style("text-anchor", "end");
    });
    //when the button with id="Reset" is clicked, the barplot will reset to its original state
    d3.select("#reset").on("click", function(){
        companySizeSalaries.sort(function(a, b){
            return d3.ascending(a.company_size, b.company_size);
        });
        svg3.selectAll("rect").attr("fill", "#69b3a2");
        svg3.select(".barText").remove();
        x.domain(companySizeSalaries.map(function(d) { return d.company_size; }));
        rects.transition().duration(1000).attr("x", function(d) { return x(d.company_size); });
        svg3.select("g")
            .transition().duration(1000)
            .attr("transform", `translate(0, ${height3})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-5,-5)rotate(-45)")
            .style("text-anchor", "end");
    });
});