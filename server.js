//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: true}));

const xandrBaseUrl = "https://api.appnexus.com/";

const username = "ales.zima";
const password = "48se9#t8J4_JZ$4"

let userToken = "authn:247645:60ac3b3e66393:ams3";

// landing home sends authentication request to Xandr and store it's userToken
// then redirects to /audit route
app.get("/", async function (req, res) {
    const requestBody = {
        auth: {
            username: username,
            password: password
          }
    }
    try {
        const response = await axios.post(xandrBaseUrl + '/auth', requestBody);
        if(response.status == 200)
        {
            console.log("Request to Xandr successful");
            //console.log(response.data);
            userToken = response.data.response.token;
            console.log(userToken);
        }
    } catch (e) {
        console.error('Error:', e);
    }
    res.redirect("/audit");
});

app.get("/audit", function (req, res) {
    res.sendFile(__dirname + "/audit.html");
});

// handles post request on /audit endpoint
app.post("/audit", async function (req, res) {
    const domains = req.body.domainUrl.split(",");
    console.log(domains);

    const requestBody = {
        urls: domains
    }

    const requestHeader = {
        headers: {
            'Authorization': 'Bearer ' + userToken
        }
    }
    try {
        const response = await axios.post(xandrBaseUrl + '/url-audit-search', requestBody, requestHeader);
        if(response.status == 200)
        {
            console.log("Request to Xandr successful");
            //console.log(response.data.response.urls);

            const urlsResult = response.data.response.urls;
            //res.send(urlsResult);

            let htmlResponse = ''; // Initialize the HTML string

            // Iterate over the urlsResult array and concatenate the properties into HTML string
            urlsResult.forEach((urlObject) => {
                const url = urlObject.url;
                const auditStatus = urlObject.audit_status;

                htmlResponse += `<p>URL: ${url}</p>`;
                htmlResponse += `<p>Audit Status: ${auditStatus}</p>`;
            });

            res.send(htmlResponse); // Send the HTML response
        }
    } catch (e) {
        console.error('Error:', e);
        res.send("Not Authorized!");
    }    
});

app.listen(port, function(){
    console.log(`Sever started on port ${port}`);
});