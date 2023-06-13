//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const networkHelper = require(__dirname + '/public/modules/network_helper.js');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

let userToken = "authn:247645:2b2a81ad14673:ams3";

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
    res.render("audit", { results: [] });
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

app.get("/inventory", async function (req, res) {
    try {
        const publisherData = await networkHelper.getPublisher(userToken);
        //console.log(publisherData);
        res.render("inventory", { publishers: publisherData, sites: [] });
    } catch (error) {
        console.log(error);
        res.redirect("/auth"); 
    }        
})

app.post("/sites", async function (req, res) {
    const publisherId = req.body.publisher;
    try {
        const sitesData = await networkHelper.getSites(userToken, publisherId);
        console.log(sitesData);
        res.json({ sites: sitesData });
    } catch (error) {
        console.log(error);
        res.redirect("/auth"); 
    } 
})

app.listen(port, function(){
    console.log(`Server started on port ${port}`);
});