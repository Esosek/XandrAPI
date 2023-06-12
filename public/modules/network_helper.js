//jshint esversion:6

const axios = require('axios');

const xandrBaseUrl = "https://api.appnexus.com/";

// success => returns userToken
// else throw an exception
exports.authenticate = async function (loginCredentials) {
    const requestBody = {
        auth: {
            username: loginCredentials.username,
            password: loginCredentials.password
          }
    }

    try {
        const response = await axios.post(xandrBaseUrl + '/auth', requestBody);
        if(response.status == 200)
        {
            console.log("Authentication request to Xandr successful");
            userToken = response.data.response.token;
            console.log("Generate user token: " + userToken);
            return userToken;
        }

        else throw new Error("Request to Xandr failed with response status :" + response.status);
    } catch (e) {
        console.error('Error:', e);
        throw new Error("Request to Xandr threw an exception, see console for more information");
    }
}

// returns an array of object with url, auditStatus and reason
// throws an error if it fails
exports.audit = async function (domains, userToken) {

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
            console.log("Audit search request to Xandr successful");

            const results = [];
            const urlsResult = response.data.response.urls;

            // Iterate over the urlsResult and prepare domain data object
            urlsResult.forEach((urlObject) => {
                const url = urlObject.url;
                const auditStatus = urlObject.found == true ? urlObject.audit_status : "unknown";
                const reason = urlObject.found == true ? urlObject.reason : "URL was not submitted to Xandr";

                results.push({ domain: url, status: auditStatus, reason: reason });
            });

            return results; // returns an array of object with url, auditStatus and reason
        }
        else { // request failed, response.status is not 200 
            throw new Error("Error: Fetching domain status failed");
        }
    } catch (e) {
        console.error('Error:', e);
        throw new Error("Error: Fetching domain status failed");
    }
}