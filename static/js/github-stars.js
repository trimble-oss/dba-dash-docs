(function () {
  var count = document.getElementById("github-star-count");
  if (!count || !window.fetch) {
    return;
  }

  function showCount(stars) {
    if (typeof stars !== "number") {
      return;
    }
    count.textContent = stars.toLocaleString("en-US");
    count.setAttribute("aria-label", stars + " stars. Star this repository on GitHub");
    count.removeAttribute("hidden");
  }

  // Built by scripts/fetch-github-stats.js. Used when the unauthenticated API is rate limited.
  function showCachedCount() {
    return fetch(new URL("/data/github-stats.json", window.location.href).href)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Cached GitHub stats request failed");
        }
        return response.json();
      })
      .then(function (stats) {
        showCount(stats && stats.repository && stats.repository.stars);
      });
  }

  fetch("https://api.github.com/repos/trimble-oss/dba-dash")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub star count request failed");
      }
      return response.json();
    })
    .then(function (repo) {
      if (typeof repo.stargazers_count !== "number") {
        return showCachedCount();
      }
      showCount(repo.stargazers_count);
    })
    .catch(function () {
      return showCachedCount();
    });
})();
