async function check() {
    let input_claim = document.getElementById("input_link").value;

    // The key should be placed somewhere else later
    let api_key = '156503534eed411ca6d4182549051a4a';

    console.log(`Checking \"${input_claim}\"`);

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