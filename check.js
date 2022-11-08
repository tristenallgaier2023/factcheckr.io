async function check() {
  let input_string = document.getElementById("input_string").value;
  var text;
  var thresh_hold = 0.5;

  // Perform article content web scraping.
  if (isValidHttpUrl(input_string)) {
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "dce9755f64mshe61076df41050e4p1e1571jsn25bf332ab4e6",
        "X-RapidAPI-Host": "lexper.p.rapidapi.com",
      },
    };

    let webText = await fetch(
      `https://lexper.p.rapidapi.com/v1.1/extract?url=${input_string}&js_timeout=30&media=true`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("Article Title:\n" + response.article.title);
        console.log("Article Author:\n" + response.article.author);
        // console.log("Article Text:\n" + response.article.text);
        text = response.article.text;
      })
      .catch((err) => console.error(err));

    // get api key
    let api_key;
    let contents = await fetch("http://127.0.0.1:3000/")
      .then((response) => response.text())
      .then((data) => {
        api_key = JSON.parse(data).claimbuster;
      });

    // Extract verifiable claims;
    var verifiableClaims = [];
    let url = `https://idir.uta.edu/claimbuster/api/v2/score/text/sentences/${text}`;
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": api_key,
      },
    });
    let res = await response.json();
    let allClaims = res.results;
    for (let i = 0; i < allClaims.length; i++) {
      if (allClaims[i].score >= thresh_hold) {
        verifiableClaims.push(allClaims[i]);
      }
    }

    console.log(verifiableClaims);
  } else {
    // Regular text.
    console.log(`Checking \"${input_string}\"`);

    // The keys should be hosted in a local nodejs server
    let api_key;
    let contents = await fetch("http://127.0.0.1:3000/")
      .then((response) => response.text())
      .then((data) => {
        api_key = JSON.parse(data).google;
      });

    // Setup the Fetch GET Request with the appropriate headers and URL
    let response = await fetch(
      `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${input_string}&key=${api_key}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  }
  // Clear input value.
  document.getElementById("input_string").value = "";
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
