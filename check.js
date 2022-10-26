async function check() {
    let input_claim = document.getElementById("input_link").value;
    console.log(`Checking \"${input_claim}\"`);

    // The key should be placed somewhere else later
    let api_key = 'AIzaSyCz7xKnP_rVlK8mhVMaA3wvYnd4L9ziHVM';

    // Setup the Fetch GET Request with the appropriate headers and URL
    let response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${input_claim}&key=${api_key}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
}