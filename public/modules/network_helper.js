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
        if (response.status == 200) {
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
        if (response.status == 200) {
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
            throw new Error("Fetching domain status failed");
        }
    } catch (e) {
        console.error('Error:', e);
        throw new Error("Fetching domain status failed");
    }
}

exports.getPublisher = async function (userToken) {
    try {
        const requestHeader = {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        }
        const response = await axios.get(xandrBaseUrl + '/publisher', requestHeader);

        if (response.status == 200) {
            const publisherData = response.data.response.publishers; // all the data associated to publisher

            const publisherId = []; // stores identification { id, name }

            publisherData.forEach(publisher => { // sift through the data and fetch id and name keys
                const firstLetter = publisher.name.charAt(0).toUpperCase();
                const capitalName = firstLetter + publisher.name.slice(1)
                const id = { id: publisher.id, name: capitalName };
                publisherId.push(id);
            })

            publisherId.sort(letterSort); // alphabetically sort the list by publishers name
            return publisherId;
        }
        else {
            throw new Error("Publisher response status is not 200");
        }       

    } catch (error) {
        throw new Error("Fetching publishers failed");
    }
}

exports.getSites = async function (userToken, publisherId) {
    try {
        const requestHeader = {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        }
        const response = await axios.get(xandrBaseUrl + '/site?publisher_id=' + publisherId, requestHeader);

        if (response.status == 200) {
            const sitesData = response.data.response.sites; // all the data associated to publisher

            const sitesId = []; // stores identification { id, name }

            sitesData.forEach(site => { // sift through the data and fetch id and name keys
                const id = { id: site.id, name: site.name };
                sitesId.push(id);
            })
            sitesId.sort(letterSort);
            return sitesId;
        }
        else {
            throw new Error("Sites response status is not 200");
        }       

    } catch (error) {
        throw new Error("Fetching sites failed");
    }
}

function letterSort(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}