async function check() {
    let input_string = document.getElementById("input_string").value;

    // Perform article content web scraping.
    if (isValidHttpUrl(input_string)) {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'dce9755f64mshe61076df41050e4p1e1571jsn25bf332ab4e6',
                'X-RapidAPI-Host': 'lexper.p.rapidapi.com'
            }
        };
        
        fetch(`https://lexper.p.rapidapi.com/v1.1/extract?url=${input_string}&js_timeout=30&media=true`, options)
            .then(response => response.json())
            .then(response => {
                console.log("Article Title:\n" + response.article.title)
                console.log("Article Author:\n" + response.article.author)
                console.log("Article Text:\n" + response.article.text)
            })
            .catch(err => console.error(err));
    } else { // Regular text.
        console.log(`Checking \"${input_string}\"`);

        // The key should be placed somewhere else later
        let api_key = 'AIzaSyCz7xKnP_rVlK8mhVMaA3wvYnd4L9ziHVM';
    
        // Setup the Fetch GET Request with the appropriate headers and URL
        let response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${input_string}&key=${api_key}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
    }
    // Clear input value.
    document.getElementById("input_string").value = ''
}

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}