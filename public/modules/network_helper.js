const axios = require('axios');

const xandrBaseUrl = "https://api.appnexus.com";

// Function to send a request to Xandr API
async function sendRequest(url, method, userToken, requestBody) {
    const requestHeader = {
        headers: {
            'Authorization': 'Bearer ' + userToken
        }
    };

    try {
        const response = await axios({ method, url, data: requestBody, ...requestHeader });
        if (response.status == 200) {
            return response.data.response;
        } else {
            throw new Error("Request to Xandr failed with response status: " + response.status);
        }
    } catch (e) {
        console.error('Error:', e);
        throw new Error("Request to Xandr threw an exception, see console for more information");
    }
}

// Function to authenticate the user
exports.authenticate = async function (loginCredentials) {
    const requestBody = {
        auth: {
            username: loginCredentials.username,
            password: loginCredentials.password
        }
    };

    const response = await sendRequest(xandrBaseUrl + '/auth', 'post', null, requestBody);
    console.log("Authentication request to Xandr successful");
    const userToken = response.token;
    console.log("Generate user token: " + userToken);
    return userToken;
}

// Function to perform a URL audit
exports.audit = async function (domains, userToken) {
    const requestBody = { urls: domains };
    const response = await sendRequest(xandrBaseUrl + '/url-audit-search', 'post', userToken, requestBody);
    console.log("Audit search request to Xandr successful");

    const results = [];
    const urlsResult = response.urls;

    urlsResult.forEach((urlObject) => {
        const url = urlObject.url;
        const auditStatus = urlObject.found ? urlObject.audit_status : "unknown";
        const reason = urlObject.found ? urlObject.reason : "URL was not submitted to Xandr";

        results.push({ domain: url, status: auditStatus, reason: reason });
    });

    return results;
}

// Function to get publisher information
exports.getPublisher = async function (userToken) {
    const response = await sendRequest(xandrBaseUrl + '/publisher', 'get', userToken);
    const publisherData = response.publishers;

    const publisherId = [];

    publisherData.forEach(publisher => {
        const firstLetter = publisher.name.charAt(0).toUpperCase();
        const capitalName = firstLetter + publisher.name.slice(1);
        const id = { id: publisher.id, name: capitalName };
        publisherId.push(id);
    });

    publisherId.sort(letterSort);
    return publisherId;
}

// Function to get site information for a specific publisher
exports.getSites = async function (userToken, publisherId) {
    const url = xandrBaseUrl + '/site?publisher_id=' + publisherId;
    const response = await sendRequest(url, 'get', userToken);
    const sitesData = response.sites;

    const sitesId = [];

    sitesData.forEach(site => {
        const id = { id: site.id, name: site.name };
        sitesId.push(id);
    });

    sitesId.sort(letterSort);
    return sitesId;
}

// Function to create a new site for a specific publisher
exports.createSite = async function (userToken, publisherId, siteName) {
    const createSiteUrl = xandrBaseUrl + '/site?publisher_id=' + publisherId;
    const requestBody = { site: { name: siteName, rtb: true } };
    const createSiteResponse = await sendRequest(createSiteUrl, 'post', userToken, requestBody);
    const sitesData = createSiteResponse.site;

    const updateSiteUrl = xandrBaseUrl + '/site?id=' + sitesData.id;
    const updateSiteRequestBody = { site: { code: sitesData.id } };

    try {
        await sendRequest(updateSiteUrl, 'put', userToken, updateSiteRequestBody);
    } catch (error) {
        throw new Error("Updating new site failed");
    }

    return sitesData;
}

exports.createPlacements = async function (userToken, requestBody) {
    const placementNames = requestBody.placementNames.split('\r\n');
    console.log(placementNames);

    const createPlacementUrl = xandrBaseUrl + '/placement?site_id=' + requestBody.siteGroup;

    const placementDataArray = []; // Array to store updated placement data

    for (const placementName of placementNames) { // Use a for...of loop instead
        const placementRequestBody = { placement: { name: placementName } };

        const updatedPlacementData = await createSinglePlacement(userToken, createPlacementUrl, placementRequestBody);
        // push placement object with ID and Name into array
        const newPlacement = { id: updatedPlacementData.id, name: updatedPlacementData.name };
        placementDataArray.push(newPlacement);
    }
    return placementDataArray;
}

async function createSinglePlacement(userToken, createPlacementUrl, requestBody) {
    try {
        const createPlacementResponse = await sendRequest(createPlacementUrl, 'post', userToken, requestBody);
        const placementData = createPlacementResponse.placement;

        const putRequestBody = { placement: { code: placementData.id } };
        const updatePlacementResponse = await sendRequest(xandrBaseUrl + '/placement?id=' + placementData.id, 'put', userToken, putRequestBody);
        const updatedPlacementData = updatePlacementResponse.placement;

        return updatedPlacementData;
    } catch (error) {
        throw new Error("Placement creation or update failed");
    }
}

// Function to sort objects based on name property
function letterSort(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}
