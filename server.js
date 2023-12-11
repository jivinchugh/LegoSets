/******************************************************************************** 
*  BTI325 – Assignment 05 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
  LINK ISSSSSSSSSS!! 
  https://weak-suit-duck.cyclic.app/
*  
*  Name: Jivin Chugh     Student ID: 156056210       Date: 21 November,2023 
* 
********************************************************************************/
const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const express = require("express");
const clientSessions = require("client-sessions");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require("path");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
    clientSessions({
        cookieName: 'session', // this is the object name that will be added to 'req'
        secret: 'okay', // this should be a long un-guessable string.
        duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
        activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
);
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

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

app.get("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        let themeData = await legoData.getAllThemes();
        res.render("addSet", { theme: themeData });
    } catch (err) { res.render('404', { message: err }); }
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.render("500", {
            message: "I'm sorry, but we have encountered the following error: ${err}"
        });
    }
});

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
    try {
        const setData = await legoData.getSetByNum(req.params.num);
        const themeData = await legoData.getAllThemes();
        res.render('editSet', { themes: themeData, set: setData });
    } catch (err) { res.status(404).render("404", { message: err }) }
});

app.post("/lego/editSet", ensureLogin, async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.render("500", {
            message: "I'm sorry, but we have encountered the following error: ${err}"
        })
    }
});


app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
    } catch (error) {
        res.render("500", {
            message: "I'm sorry, but we have encountered the following error: ${error}"
        });
    }
});


app.use((req, res) => { res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" }) });

//get login
app.get('/login', (req, res) => {
    const errorMessage = ''
    res.render('login', { userName: '', errorMessage });
});

//get register
app.get('/register', (req, res) => {
    console.log("GET register route: Rendering register page");
    res.render('register', { errorMessage: '', successMessage: '' });
});

// post register
app.post('/register', (req, res) => {
    const userData = req.body;
    authData.registerUser(userData)
        .then(() => {
            console.log("POST register route: User created successfully");
            res.render('register', { successMessage: "User created", errorMessage: "" });
        })
        .catch((err) => {
            console.error("POST register route error:", err);
            res.render('register', { errorMessage: err, userName: req.body.userName, successMessage: '' });
        });
});

//post login
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent')
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = { userName: user.userName, email: user.email, loginHistory: user.loginHistory };
            res.redirect("/lego/sets");
        })
        .catch((err) => { res.render("login", { errorMessage: err, userName: req.body.userName }); });
});

//get logout
app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
    //res.redirect("/login");
});

//get userHistory
app.get('/userHistory', ensureLogin, (req, res) => { res.render('userHistory'); })

legoData.initialize()
    .then(authData.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: ${ HTTP_PORT }");
        });
    }).catch(function (err) {
        console.log("unable to start server: ${ err }");
    });