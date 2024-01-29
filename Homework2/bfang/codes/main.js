// Overall dimension of the canvas
const width = window.innerWidth;
const height = window.innerHeight;

// Dimensions for each individual plot
// Dimensions for the parallel coordinates plot
let parallelLeft = 0, parallelTop = 0;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = 400 - parallelMargin.left - parallelMargin.right,
    parallelHeight = 350 - parallelMargin.top - parallelMargin.bottom;

d3.csv("../data/pokemon_alopez247.csv").then(rawData => {

    // Data Processing
    // Print out the data to see what it looks like
    console.log("rawData", rawData);
    // Transform data to number, string, and boolean values
    rawData.forEach(function(d) {
        d.Number = Number(d.Number);
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
        d.Speed = Number(d.Speed);
        d.isLegendary = d.isLegendary == "TRUE" ? true : false;
        d.hasGender = d.hasGender == "TRUE" ? true : false;
        d.Pr_Male = Number(d.Pr_Male);
        d.hasMegaEvolution = d.hasMegaEvolution == "TRUE" ? true : false;
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
        d.Catch_Rate = Number(d.Catch_Rate);
    });

    // Drop two types that have incomplete and trivial attributes
    rawData.forEach(d => {
        delete d.Type_2;
        delete d.Egg_Group_2;
    });

    // Check is the rawDate is properly processed
    console.log(rawData);





}).catch(function(error){
    console.log(error);
});