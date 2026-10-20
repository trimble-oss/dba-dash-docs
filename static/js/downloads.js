(function () {
  if (!window.fetch) {
    return;
  }

  var assets = document.querySelectorAll("[data-asset]");
  var versionSlots = document.querySelectorAll("[data-version-text]");
  var homeVersion = document.getElementById("github-version");
  if (!assets.length && !versionSlots.length && !homeVersion) {
    return;
  }

  function applyVersion(version, assetUrls) {
    if (!version) {
      return;
    }

    if (homeVersion) {
      homeVersion.textContent = "Latest Version " + version;
    }

    versionSlots.forEach(function (el) {
      el.textContent = version;
    });

    assets.forEach(function (link) {
      var file = link.getAttribute("data-asset").replaceAll("{version}", version);
      link.href =
        (assetUrls && assetUrls[file]) ||
        "https://github.com/trimble-oss/dba-dash/releases/download/" +
          version +
          "/" +
          file;
    });
  }

  // Built by scripts/fetch-github-stats.js. Used when the unauthenticated API is rate limited.
  function applyCachedRelease() {
    return fetch(new URL("/data/github-stats.json", window.location.href).href)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Cached GitHub stats request failed");
        }
        return response.json();
      })
      .then(function (stats) {
        var release = stats && stats.releases && stats.releases[0];
        if (!release) {
          return;
        }

        var tag = release.url && release.url.match(/\/releases\/tag\/([^/]+)$/);
        var version = (tag && tag[1]) || release.name;
        var assetUrls = {};
        (release.assets || []).forEach(function (asset) {
          if (asset.name && asset.url) {
            assetUrls[asset.name] = asset.url;
          }
        });
        applyVersion(version, assetUrls);
      });
  }

  fetch("https://api.github.com/repos/trimble-oss/dba-dash/tags")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub release request failed");
      }
      return response.json();
    })
    .then(function (tags) {
      var version = tags[0] && tags[0].name;
      if (!version) {
        return applyCachedRelease();
      }
      applyVersion(version);
    })
    .catch(function () {
      return applyCachedRelease();
    });
})();
