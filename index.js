const serverBaseUrl = "http://localhost:3000";

document.getElementById('audit-form').addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    const domainUrls = document.getElementById('domain-url').value.split(",");
    console.log(domainUrls);
    console.log(JSON.stringify(domainUrls));

    fetch(serverBaseUrl + "/audit", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(domainUrls)
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response data
          console.log(data);
        })
        .catch(error => {
          // Handle the error
          console.error(error);
        });
  });