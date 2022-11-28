async function check() {
  let input_string = document.getElementById("input_string").value;
  var text;
  var headline;

  document.getElementById("similar").innerHTML = '';

  var notice = document.getElementById("notice");
  if (notice != null) {
    document.getElementById("notice").remove();
  }

  document.getElementById("article-descriptor").classList.add("d-none")
  document.getElementById("article-descriptor").classList.remove("d-flex")
  document.getElementById("article-display").classList.add("d-none")
  document.getElementById("second-hr").style.display = "none"
  document.getElementById("similar").style.display = "none"

  document.getElementById("spinner").style.display = "inline-block";
  document.getElementById("first-hr").style.display = 'block'
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
              text = response.article.text;
              headline = response.article.title;
              author = response.article.author
              loadArticle(headline, author, text)

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
          }).then((response) => response.json())
          .then((res) => {
            let allClaims = res.results;
            for (let i = 0; i < allClaims.length; i++) {
                $("#collapseArticle").html(function() {
                    return $(this).html().replace(allClaims[i].text, `<span class = "bg-success text-light colorblock">${allClaims[i].text}</span>`);
                });
                checkSingleClaim(allClaims[i].text, false, "text");
            }
          }).catch((err) => {
            displayError()
            console.log(err)
          });
  } else {
      // Regular text.
      checkSingleClaim(input_string, true, "custom");
  }

  document.getElementById("article-descriptor").classList.remove("d-none")
  document.getElementById("article-descriptor").classList.add("d-flex")
  document.getElementById("article-display").classList.remove("d-none")
  document.getElementById("second-hr").style.display = "block"
  document.getElementById("similar").insertAdjacentHTML('afterend', `<p class="text-muted mt-4" id = "notice"><i>NOTE: If an identified claim does not appear above, it means that our knowledges bases did not return any debunked claims from verified sources.</i></p>`)
  document.getElementById("similar").style.display = "block"

  document.getElementById("first-hr").scrollIntoView();
  // Clear input value.
  document.getElementById("input_string").value = "";
  document.getElementById("spinner").style.display = "none";
}

function displayError() {
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `
<div class='error'>Failed to extract verifiable claims</div>`;
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
  const claimDiv = document.createElement("div");
  claimDiv.innerHTML = `
<h4>Checking ${claimType} claim:</h4>
<h5 class = "text-muted">${claim}</h5>`;
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
  <div class="card mb-4">
    <div class="card-header text-secondary">
      Debunked related claim
    </div>
    <div class="card-body text-secondary">
      <p class="card-text">${data.claims[i].text}</p>
      <p class="card-text" style = "margin: 0">Claimed by <span class = "text-body" style = "font-weight: 500;">${data.claims[i].claimant}</span></p>
    </div>
    <div class="card-footer text-secondary d-flex justify-content-between">
      <p class="card-text" style = "margin: 0">Truthfulness Rating: <span class = "text-body" style = "font-weight: 500;">${data.claims[i].claimReview[0].textualRating}</span></p>
      <a href="${data.claims[i].claimReview[0].url}" class="card-link">Source: ${data.claims[i].claimReview[0].publisher.name}</a>
    </div>
  </div>`;

      document.getElementById("similar").append(similarClaimsDiv);
  }
}

function loadArticle(headline, author, body) {
  document.getElementById("article-headline").textContent = headline
  document.getElementById("article-author").textContent = author
  document.getElementById("collapseArticle").textContent = body
}