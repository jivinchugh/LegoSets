/******************************************************************************** 
*  BTI325 – Assignment 04 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
  LINK ISSSSSSSSSS!! 
  https://weak-suit-duck.cyclic.app/
*  
*  Name: Jivin Chugh     Student ID: 156056210       Date: 3 November,2023 
* 
********************************************************************************/
const legoData = require("./modules/legoSets");
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/lego/sets", async (req, res) => {
    try {
        if (req.query.theme) {
            let sets = await legoData.getSetsByTheme(req.query.theme);
            if (sets.length > 0) { res.render("sets", { sets: sets }); }
            else { res.render('404', { message: "I'm Sorry, theme not found" }) }
        }
        else {
            let sets = await legoData.getAllSets();
            res.render("sets", { sets: sets });
        }
    }
    catch (err) { res.render('404', { message: err }); }
});

app.get("/lego/sets/:id", (req, res) => {
    legoData
        .getSetByNum(req.params.id)
        .then((data) => res.render("set", { set: data }))
        .catch((err) => res.status(404).render("404", { message: "I'm sorry, sets not found" }));
});

app.get("/lego/addSet", async (req, res) => {
    try {
        let themeData = await legoData.getAllThemes();
        res.render("addSet", { theme: themeData });
    } catch (err) { res.render('404', { message: err }); }
});

app.post("/lego/addSet", async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) { res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` }); }
});

app.get("/lego/editSet/:num", async (req, res) => {
    try {
        const setData = await legoData.getSetByNum(req.params.num);
        const themeData = await legoData.getAllThemes();
        res.render('editSet', { themes: themeData, set: setData });
    } catch (err) { res.status(404).render("404", { message: err }) }
});

app.post("/lego/editSet", async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (err) { res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` }) }
});


app.get("/lego/deleteSet/:num", async (req, res) => {
    try {
      await legoData.deleteSet(req.params.num);
      res.redirect("/lego/sets");
    } catch (error) {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
  });
  

app.use((req, res) => { res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" }) });




legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on : ${HTTP_PORT}`)
    })
});
