# Scheduled Rebuild Setup

This workflow automatically rebuilds the site every hour to keep GitHub statistics fresh.

## Setup Instructions

### 1. Create a Netlify Build Hook

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings** → **Build & deploy** → **Build hooks**
3. Click **Add build hook**
4. Name it: `Scheduled Rebuild`
5. Select branch: `main` (or your default branch)
6. Click **Save**
7. Copy the generated webhook URL (looks like: `https://api.netlify.com/build_hooks/xxxxx`)

### 2. Add the Build Hook to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NETLIFY_BUILD_HOOK`
5. Value: Paste the webhook URL from step 1
6. Click **Add secret**

### 3. Verify the Workflow

The workflow will:
- ✅ Run automatically every hour at :00
- ✅ Can be triggered manually from the **Actions** tab
- ✅ Trigger a Netlify rebuild to fetch fresh GitHub stats

### Schedule Options

To change the rebuild frequency, edit `.github/workflows/scheduled-rebuild.yml`:

```yaml
# Every hour (current setting)
- cron: '0 * * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Daily at midnight UTC
- cron: '0 0 * * *'

# Daily at 6 AM UTC
- cron: '0 6 * * *'
```

### Testing

1. Go to **Actions** tab in GitHub
2. Select **Scheduled Rebuild** workflow
3. Click **Run workflow** → **Run workflow** button
4. Check Netlify dashboard to confirm build started

## Benefits

- 📊 **Fresh stats** - Up-to-date GitHub statistics
- 🚀 **No browser API calls** - All data fetched at build time
- ⚡ **Fast loads** - Stats are served as static data
- 🔒 **No rate limits** - One build uses minimal API quota
