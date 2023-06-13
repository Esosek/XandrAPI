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
const selectElement = document.getElementById('publisher-select');

// Add an event listener for the 'change' event
selectElement.addEventListener('change', function () {
    const selectedValue = selectElement.value;

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
                updateSitesDropdown(data.sites);
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
function updateSitesDropdown(sitesData) {
    const sitesDropdown = document.getElementById('site-group');

    // Clear existing options
    sitesDropdown.innerHTML = '';
    const option = document.createElement('option');
    option.textContent = "Select Site Group";
    sitesDropdown.appendChild(option);

    // Add new options based on the sites data
    sitesData.forEach(site => {
        const option = document.createElement('option');
        option.value = site.id;
        option.textContent = site.name;
        sitesDropdown.appendChild(option);
    });
}
