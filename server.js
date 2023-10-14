/******************************************************************************** 
*  BTI325 – Assignment 02 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Jivin Chugh     Student ID: 156056210       Date: 13 October,2023 
* 
********************************************************************************/
const legoData = require("./modules/legoSets");
const express = require("express");
const path = require("path");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"))
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
});

app.get("/lego/sets", (req, res) => {
    if (req.query.theme) {
        legoData.getSetsByTheme(req.query.theme)
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(404).sendFile(path.join(__dirname, "/views/404.html"))
            );

    }

    legoData.getAllSets().then((data) => res.json(data))
        .catch((err) =>
            res.status(404).sendFile(path.join(__dirname, "/views/404.html"))
        );
});

app.get("/lego/sets/:id", (req, res) => {
    legoData
        .getSetByNum(req.params.id)
        .then((data) => res.json(data))
        .catch((err) =>
            res.status(404).sendFile(path.join(__dirname, "/views/404.html"))
        );
});

/*app.get("/lego/sets/theme-demo", (req, res) => {
    const theme = "tech"; 
    legoData
      .getSetsByTheme(theme)
      .then(sets => res.json(sets))
      .catch(error => {res.json(error)});
  });*/
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});
/*
// //legoData.initialize();
app.get("/lego/sets", (req, res) => {
    legoData.getAllSets().then((sets) => {
        res.json(sets);
    })
});



//method 1
app.get("/lego/sets/num-demo", async (req, res) => {

    try {
        const temp = "1000648795-1";
        let foundtemp = await legoData.getSetByNum(temp);
        res.send(foundtemp);
    }
    catch (err) {
        res.json(err);//res.send("not found");
    }
});


//method 2
app.get("/lego/sets/theme-demo", (req, res) => {
    const theme = "Pirates";
    legoData.getSetsByTheme(theme).then(sets =>
        res.json(sets)).catch(err => {
            res.json(err);
        });
});*/


legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on : ${HTTP_PORT}`)
    })
});

// app.listen(HTTP_PORT,()=>{
//     console.log(`server listening on : ${HTTP_PORT}`)
// })