async function check() {
    let input_claim = document.getElementById("input_link").value;
    console.log(`Checking \"${input_claim}\"`);

    // fact check with claim buster
    check_claim_buster(input_claim);

    // fact check with google
    check_google(input_claim);
}

async function check_claim_buster(input_claim) {
    // The key should be placed somewhere else later
    let api_key = '156503534eed411ca6d4182549051a4a';

    // Setup the Fetch GET Request with the appropriate headers and URL
    let response = await fetch(`https://idir.uta.edu/claimbuster/api/v2/query/knowledge_bases/${input_claim}`, {
        method: 'GET',
        headers: {
            'x-api-key': api_key,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.justification);
    });
}

async function check_google(input_claim) {
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