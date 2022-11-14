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

      for (const [key, value] of Object.entries(verifiableClaims)) {
          console.log(value.text)

          // The keys should be hosted in a local nodejs server
          let api_key;
          let contents = await fetch("http://127.0.0.1:3000/")
              .then((response) => response.text())
              .then((data) => {
                  api_key = JSON.parse(data).google;
              });

          // Setup the Fetch GET Request with the appropriate headers and URL
          let response = await fetch(
                  `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${value.text}&key=${api_key}`, {
                      method: "GET",
                  }
              )
              .then((response) => response.json())
              .then((data) => {
                  console.log(data)
                  let claimRating = -1
                  // Empty object check. No results.
                  if (!(data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype)) {
                      claimRating = processClaim(data)
                  }
                  displayClaim(value.text, claimRating)
              });



      }
      document.getElementById("article-hr").style.display = "block";
      document.getElementById("article").style.display = "flex";
      document.getElementById("article").scrollIntoView();

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
              `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${input_string}&key=${api_key}`, {
                  method: "GET",
              }
          )
          .then((response) => response.json())
          .then((data) => {
              displaySimilarClaims(data);
              // let rating = "NaN"
              // if (data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype) {
              //     rating = processClaim(data)
              // }
              // console.log("This claim is", Math.floor(rating * 100), "% truthful.")
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

function displaySimilarClaims(data) {
  console.log(data);
  document.getElementById("similar").innerHTML = '';

  if (Object.keys(data).length === 0) {
    const noSimilarClaimsDiv = document.createElement("div");
    noSimilarClaimsDiv.innerHTML = `No results`;
    document.getElementById("similar").append(noSimilarClaimsDiv);
    return;
  }

  let similarClaimsDiv;
  for (let i = 0; i < data.claims.length; i++) {
    similarClaimsDiv = document.createElement("div");

    similarClaimsDiv.innerHTML = `
    <div class="card">
      <div class="card-header">
        ${data.claims[i].text}
      </div>
      <div class="card-body text-secondary bg-secondary bg-opacity-10">
        <p class="card-text">${data.claims[0].claimReview[0].textualRating}</p>
      </div>
    </div>`
  
    document.getElementById("similar").append(similarClaimsDiv)
  }
}

function displayClaim(claimText, claimRating) {
  const claimDiv = document.createElement("div");
  claimDiv.classList.add("col-md-12", "mt-3")

  if (claimRating == -1) {
      claimDiv.innerHTML = `
    <div class="card">
      <div class="card-header text-secondary bg-secondary bg-opacity-10">
        Our program was unable to quantitate the truthfulness of this claim. No sources were provided.
      </div>
      <div class="card-body">
        <p class="card-text">${claimText}</p>
      </div>
    </div>`
  } else if (claimRating >= 0.75) {
      claimDiv.innerHTML = `
    <div class="card">
      <div class="card-header text-success bg-success bg-opacity-10">
        Our program has identified this claim as ${Math.floor(claimRating * 100)}% truthful.
      </div>
      <div class="card-body">
        <p class="card-text">${claimText}</p>
      </div>
    </div>`
  } else if (claimRating <= 0.25) {
      claimDiv.innerHTML = `
    <div class="card">
      <div class="card-header text-warning bg-warning bg-opacity-10">
        Our program has identified this claim as ${Math.floor(claimRating * 100)}% truthful.
      </div>
      <div class="card-body">
        <p class="card-text">${claimText}</p>
      </div>
    </div>`
  } else {
      claimDiv.innerHTML = `
    <div class="card">
      <div class="card-header text-danger bg-danger bg-opacity-10">
        Our program has identified this claim as ${Math.floor(claimRating * 100)}% truthful.
      </div>
      <div class="card-body">
        <p class="card-text">${claimText}</p>
      </div>
    </div>`
  }

  document.getElementById("article").append(claimDiv)
}

function processClaim(claimJSON) {
  // Truth-o-meter ratings according to Politico and
  // their relative weights in determining overall truthfulness.
  const truthRatings = {
      "True": 1,
      "Mostly True": 0.75,
      "Half True": 0.5,
      "Mostly False": 0.25,
      "False": 0,
      "Pants on Fire": 0
  }
  var avgClaimValidity = 0

  for (const [key, value] of Object.entries(claimJSON.claims)) {
      let rating = value.claimReview[0].textualRating
      if (typeof(rating) == "number") {
          avgClaimValidity = avgClaimValidity + truthRatings[rating]
      }
  }
  // Calculate weighted average truth rating for a single claim, calculated from
  // the aggregated results JSON received by ClaimBuster as a decimal value
  // between 0 and 1, where 1 is the 100% truthful and 0 is completely false.
  avgClaimValidity = avgClaimValidity / claimJSON.claims.length

  return avgClaimValidity
}