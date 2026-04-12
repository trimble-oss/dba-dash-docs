# GitHub Stats Implementation - Build-time Data Generation

## Overview

The GitHub stats page has been successfully converted from client-side API calls to build-time static data generation. This eliminates per-user API rate limit issues and improves performance.

## Changes Made

### 1. Build-time Data Generation Script

**File:** `scripts/fetch-github-stats.js`

- Fetches all GitHub data at build time using Node.js native `https` module
- Retrieves repository stats, all releases (with pagination), and complete star history
- Processes star history by grouping stars by month
- Outputs static JSON file to `static/data/github-stats.json`
- No external dependencies required

**Output Structure:**
```json
{
  "generatedAt": "2025-04-12T17:48:23.305Z",
  "repository": {
    "stars": 401,
    "forks": 100,
    "watchers": 27,
    "openIssues": 98
  },
  "totalDownloads": 36577,
  "releases": [...],
  "downloadChart": {
    "labels": ["Release 1", "Release 2", ...],
    "data": [100, 250, 500, ...]
  },
  "starHistory": {
    "labels": ["Jan 2022", "Feb 2022", ...],
    "data": [17, 27, 76, ...]
  }
}
```

### 2. Updated Frontend Code

**File:** `layouts/stats/list.html`

**Removed:**
- All jQuery dependencies
- Client-side GitHub API calls
- localStorage caching logic
- Rate limit handling code

**Added:**
- Simple `fetch('/data/github-stats.json')` to load pre-generated data
- Vanilla JavaScript for all DOM manipulation
- Cleaner, more maintainable code

**Charts:**
- Star history chart with monthly grouping
- Cumulative downloads chart
- Both charts automatically recreate when theme switches (light/dark)

### 3. Build Pipeline Integration

**File:** `package.json`

Added prebuild script that runs before Hugo build:
```json
"prebuild": "node scripts/fetch-github-stats.js"
```

**Build command:** `npm run build`
- First runs prebuild script to fetch fresh GitHub data
- Then runs Hugo build to generate static site

### 4. Scheduled Rebuilds

**File:** `.github/workflows/scheduled-rebuild.yml`

- Triggers Netlify rebuild hourly via webhook
- Keeps stats up-to-date without manual intervention
- Runs on cron schedule: `0 * * * *` (every hour)

**Documentation:** `.github/SCHEDULED_REBUILD.md`

### 5. Git Configuration

**File:** `.gitignore`

Added `static/data/` to ignore generated JSON files:
```
# Generated data files (created at build time)
static/data/
```

## Setup Instructions

### Local Development

1. **Test data generation:**
   ```bash
   npm run prebuild
   ```
   This fetches GitHub data and creates `static/data/github-stats.json`

   **Caching behavior:**
   - Data is cached for 10 minutes to avoid rate limits during development
   - If the data file is less than 10 minutes old, the script will skip fetching
   - To force a refresh: `$env:FORCE_REFRESH=1; npm run prebuild` (PowerShell) or `FORCE_REFRESH=1 npm run prebuild` (bash)
   - Or delete the file: `Remove-Item static/data/github-stats.json`

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Stats will be loaded from the generated JSON file

3. **Build for production:**
   ```bash
   npm run build
   ```
   Automatically runs prebuild first

### Netlify Deployment Setup

The build configuration is already set in `netlify.toml`. The build command should be:
```
npm run build
```

### GitHub Actions Scheduled Rebuild Setup

1. **Create Netlify Build Hook:**
   - Go to Netlify dashboard → Site settings → Build & deploy → Build hooks
   - Click "Add build hook"
   - Name: "Scheduled Stats Update" (or similar)
   - Branch: `main` (or your default branch)
   - Copy the webhook URL

2. **Add Secret to GitHub Repository:**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NETLIFY_BUILD_HOOK`
   - Value: Paste the webhook URL from Netlify
   - Click "Add secret"

3. **Verify Workflow:**
   - Go to Actions tab in GitHub repository
   - You should see "Scheduled Netlify Rebuild" workflow
   - It will run automatically every hour
   - You can also trigger it manually for testing

## Benefits

✅ **No more API rate limits** - Data fetched once per build, not per user
✅ **Better performance** - Static JSON file instead of multiple API calls
✅ **Automatic updates** - Hourly rebuilds keep stats fresh
✅ **Cleaner code** - No jQuery, no caching logic, simpler architecture
✅ **More reliable** - No client-side network failures
✅ **Complete data** - All releases and star history loaded via pagination
✅ **Development-friendly** - 10-minute cache prevents rate limits during local development
✅ **Error resilient** - Preserves previous data if API fails, build continues successfully

## Maintenance

- **Data updates:** Automatically every hour via GitHub Actions
- **Manual update:** Run `npm run prebuild` and commit if needed
- **Monitoring:** Check GitHub Actions runs for any API failures

## Troubleshooting

### GitHub API Rate Limits

The script uses GitHub API without authentication, which allows 60 requests per hour per IP. The fetch script makes approximately:
- 1 request for repository info
- ~2 requests for releases (pagination)
- ~4 requests for star history (pagination)

**Total: ~7 requests per build** - well within the limit for hourly rebuilds.

**Development rate limit protection:**
- Data is automatically cached for 10 minutes
- If you run `npm run prebuild` multiple times, it will use cached data
- Force refresh when needed: `FORCE_REFRESH=1 npm run prebuild`

**Error handling:**
- If API rate limit is hit, the script preserves the previous data file
- Build continues with existing stats rather than failing
- Fresh data will be fetched on the next successful run

If you encounter rate limits during development, you can:
1. Wait 10 minutes - the cache will be used automatically
2. Use the existing cached data file
3. Add a GitHub token to the script (increases limit to 5,000 requests/hour)
4. Wait for the rate limit to reset (shown in error message)

### Data Not Updating

1. Check GitHub Actions workflow runs for errors
2. Verify Netlify build hook secret is set correctly
3. Check Netlify build logs for prebuild script errors
4. Manually trigger a rebuild to test

## File Reference

- `scripts/fetch-github-stats.js` - Data fetcher
- `layouts/stats/list.html` - Stats page template
- `content/stats/_index.md` - Stats page content
- `static/data/github-stats.json` - Generated data (gitignored)
- `.github/workflows/scheduled-rebuild.yml` - Hourly rebuild trigger
- `package.json` - Build scripts
- `.gitignore` - Excludes generated data

## Next Steps

1. ✅ Local testing completed
2. ⏳ Commit changes to repository
3. ⏳ Set up Netlify build hook
4. ⏳ Add GitHub secret for build hook URL
5. ⏳ Test manual workflow trigger
6. ⏳ Verify stats page loads correctly on live site
7. ⏳ Monitor automated hourly rebuilds
