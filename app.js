//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const networkHelper = require(__dirname + '/public/modules/network_helper.js');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let userToken = "";

app.get("/", function (req, res) {
    res.redirect("auth");
})

app.get("/auth", function (req, res) {
    res.render("auth");
})

app.post("/auth", async function (req, res) {
    // get credentials from page form
    const loginCredentials = { username: req.body.username, password: req.body.password };
    try {
        userToken = await networkHelper.authenticate(loginCredentials); // pass the credentials
        res.redirect("/audit"); // redirects to audit
    } catch (e) {
        console.error('Error:', e);
        res.redirect("/auth"); // refresh page with some message
    }    
});

app.get("/audit", function (req, res) {
    res.render('audit', { results: [] });
});

// handles post request on /audit endpoint
app.post("/audit", async function (req, res) {
    const domains = req.body.urls.split(",");
    console.log("Requested domains: " + domains);

    try {
        const results = await networkHelper.audit(domains, userToken);
        res.render('audit', { results: results });
    } catch (error) {
        // if the request failed for whatever reason -> redirects to auth for new token
        res.redirect("/auth"); 
    }        
});

app.listen(port, function(){
    console.log(`Sever started on port ${port}`);
});