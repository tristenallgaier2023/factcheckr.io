async function check() {
  let input_string = document.getElementById("input_string").value;
  var text;
  var headline;

  document.getElementById("similar").innerHTML = '';
  document.getElementById("spinner").style.display = "inline-block";
  if (isValidHttpUrl(input_string)) {
      const rapidApiKey = await getKey("rapidApiKey");
      const rapidApiHost = await getKey("rapidApiHost");
      const claimbusterKey = await getKey("claimbuster");
      const options = {
          method: "GET",
          headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": rapidApiHost,
          },
      };

      // Perform article content web scraping.
      let webText = await fetch(
              `https://lexper.p.rapidapi.com/v1.1/extract?url=${input_string}&js_timeout=30&media=true`,
              options
          )
          .then((response) => response.json())
          .then((response) => {
              // console.log("Article Title:\n" + response.article.title);
              // console.log("Article Author:\n" + response.article.author);
              // console.log("Article Text:\n" + response.article.text);
              text = response.article.text;
              headline = response.article.title;
          })
          .catch((err) => console.error(err));

      // Check headline
      await checkSingleClaim(headline, true, "headline");

      // Extract verifiable claims;
      let url = `https://idir.uta.edu/claimbuster/api/v2/score/text/sentences/${text}`;
      let response = await fetch(url, {
          method: "GET",
          headers: {
              "x-api-key": claimbusterKey,
          },
      })
      .catch((err) => displayError());
      let res = await response.json();
      let allClaims = res.results;
      for (let i = 0; i < allClaims.length; i++) {
          checkSingleClaim(allClaims[i].text, false, "text");
      }
  } else {
      // Regular text.
      checkSingleClaim(input_string, true, "custom");
  }
  // Clear input value.
  document.getElementById("input_string").value = "";
  document.getElementById("spinner").style.display = "none";
}

function displayError() {
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `
  <div class='error'>Failed to load article text</div>`;
  document.getElementById("similar").append(errorDiv);
  document.getElementById("spinner").style.display = "none";
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

async function getKey(keyName) {
  // The keys should be hosted in a local nodejs server
  let api_key;
  let contents = await fetch("http://127.0.0.1:3000/")
      .then((response) => response.text())
      .then((data) => {
          api_key = JSON.parse(data)[keyName];
      });
  return api_key;
}

async function checkSingleClaim(claim, showIfNoResults, claimType) {
  let api_key = await getKey("google");

  let response = await fetch(
          `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${claim}&key=${api_key}`, {
              method: "GET",
          }
      )
      .then((response) => response.json())
      .then((data) => {
          if (Object.keys(data).length !== 0 || showIfNoResults) {
            displaySimilarClaims(claim, data, claimType);
          }
      });
}

function displaySimilarClaims(claim, data, claimType) {
  // console.log(claim);
  // console.log(data);

  const claimDiv = document.createElement("div");
  claimDiv.innerHTML = `
  <h3>Checking ${claimType} claim:</h3>
  <h4>${claim}</h4>`;
  document.getElementById("similar").append(claimDiv);


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
    </div>`;
  
    document.getElementById("similar").append(similarClaimsDiv);
  }
}