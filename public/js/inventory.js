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

// Add an event listener for the 'change' event
publisherSelectElement.addEventListener('change', function () {
    const selectedValue = publisherSelectElement.value;

    const postData = {
        publisher: selectedValue
    };

    // Send the POST request
    if (selectedValue) {
        fetch('/sites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
            .then(response => response.json())
            .then(data => {
                // Update the HTML elements with the new data
                updateSitesDropdown(data.sites, true);
                siteSection.style.display = 'block';
            })
            .catch(error => {
                console.error(error);
            });
    }
    else {
        // No publisher was chosen, hide the site section again
        siteSection.style.display = 'none';
    }
});

// Function to update the sites dropdown with new data
function updateSitesDropdown(sitesData, defaultEnabled) {
    const sitesDropdown = document.getElementById('site-group');

    // Clear existing options
    sitesDropdown.innerHTML = '';
    if (defaultEnabled) { // if no choice is possible, add it
        const option = document.createElement('option');
        option.textContent = "Select Site Group";
        sitesDropdown.appendChild(option);
    }

    // Add new options based on the sites data
    sitesData.forEach(site => {
        const option = document.createElement('option');
        option.value = site.id;
        option.textContent = site.name;
        sitesDropdown.appendChild(option);
    });
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

    // Send the POST request
    if (siteName) {
        fetch('/create-site', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
            .then(response => response.json())
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
