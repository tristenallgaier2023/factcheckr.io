async function check() {
  let input_string = document.getElementById("input_string").value;
  var text;
  var thresh_hold = 0.5;

  document.getElementById("similar").innerHTML = '';

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
              console.log("Article Title:\n" + response.article.title);
              console.log("Article Author:\n" + response.article.author);
              // console.log("Article Text:\n" + response.article.text);
              text = response.article.text;
          })
          .catch((err) => console.error(err));

      // Extract verifiable claims;
      let url = `https://idir.uta.edu/claimbuster/api/v2/score/text/sentences/${text}`;
      let response = await fetch(url, {
          method: "GET",
          headers: {
              "x-api-key": claimbusterKey,
          },
      });
      let res = await response.json();
      let allClaims = res.results;
      for (let i = 0; i < allClaims.length; i++) {
          if (allClaims[i].score >= thresh_hold) {
              checkSingleClaim(allClaims[i].text);
          }
      }
  } else {
      // Regular text.
      checkSingleClaim(input_string);
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

async function checkSingleClaim(claim) {
  let api_key = await getKey("google");

  let response = await fetch(
          `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${claim}&key=${api_key}`, {
              method: "GET",
          }
      )
      .then((response) => response.json())
      .then((data) => {
          displaySimilarClaims(claim, data);
      });
}

function displaySimilarClaims(claim, data) {
  console.log(claim);
  console.log(data);

  const claimDiv = document.createElement("div");
  claimDiv.innerHTML = `
  <h3>Checking claim:</h3>
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