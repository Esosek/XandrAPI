// When the page is ready
$(document).ready(function () {
    // When the link is clicked
    $('#showDivLink').click(function (e) {
        e.preventDefault();

        // Toggle the visibility of the div
        $('#hiddenDiv').toggle();
    });
});

// Hide the site section initially
const siteSection = document.getElementById('site-section');
siteSection.style.display = 'none';

// Get the select element for publishers
const publisherSelectElement = document.getElementById('publisher-select');

const createSiteBtn = document.getElementById('create-site');
const sitesDropdown = document.getElementById('site-group');

// Add an event listener for the 'change' event
publisherSelectElement.addEventListener('change', function () {
    const selectedValue = publisherSelectElement.value;

    const postData = {
        publisher: selectedValue
    };

    // Send the POST request to fetch sites data
    if (selectedValue) {
        sendPostRequest('/sites', postData)
            .then(data => {
                // Update the HTML elements with the new data
                updateSitesDropdown(data.sites, true);
                siteSection.style.display = 'block';
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        // No publisher was chosen, hide the site section again
        siteSection.style.display = 'none';
    }
});

// Function to send a POST request
function sendPostRequest(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json());
}

// Function to update the sites dropdown with new data
function updateSitesDropdown(sitesData, defaultEnabled) {
    sitesDropdown.innerHTML = '';

    if (defaultEnabled) {
        // Add a default option when enabled
        const option = createOptionElement("Select Site Group");
        sitesDropdown.appendChild(option);
    }

    sitesData.forEach(site => {
        // Add options based on the sites data
        const option = createOptionElement(site.name, site.id);
        sitesDropdown.appendChild(option);
    });
}

// Function to create an option element
function createOptionElement(text, value = "") {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
}

createSiteBtn.addEventListener('click', function (event) {
    event.preventDefault();
    const siteNameElement = document.getElementById('new-site-name');
    const siteName = siteNameElement.value;
    const publisherId = publisherSelectElement.value;

    const postData = {
        publisherId: publisherId,
        newSiteName: siteName
    };

    // Send the POST request to create a site
    if (siteName) {
        sendPostRequest('/create-site', postData)
            .then(data => {
                // Update the HTML elements with the new data
                updateSitesDropdown([data.site], false);
                siteNameElement.value = ""; // Reset the input text
                $('#hiddenDiv').toggle(); // Hide the site creation section
            })
            .catch(error => {
                console.error(error);
            });
    }
    // else do nothing
});
