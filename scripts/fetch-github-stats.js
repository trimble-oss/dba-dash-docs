const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'trimble-oss';
const REPO_NAME = 'dba-dash';
const OUTPUT_DIR = path.join(__dirname, '..', 'static', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'github-stats.json');

// Cache duration in milliseconds (10 minutes for local development)
// Set FORCE_REFRESH=1 environment variable to skip cache check
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if we should skip fetching due to recent data
function shouldSkipFetch() {
    if (process.env.FORCE_REFRESH === '1') {
        console.log('🔄 FORCE_REFRESH set, fetching fresh data...');
        return false;
    }

    if (!fs.existsSync(OUTPUT_FILE)) {
        console.log('📄 No existing data file found, fetching...');
        return false;
    }

    try {
        const fileStats = fs.statSync(OUTPUT_FILE);
        const fileAge = Date.now() - fileStats.mtimeMs;
        const minutesOld = Math.floor(fileAge / 60000);

        if (fileAge < CACHE_DURATION) {
            console.log(`✅ Using cached data (${minutesOld} minute${minutesOld !== 1 ? 's' : ''} old, cache valid for 10 minutes)`);
            console.log('   To force refresh: set FORCE_REFRESH=1 or delete static/data/github-stats.json');
            return true;
        }

        console.log(`🔄 Cache expired (${minutesOld} minutes old), fetching fresh data...`);
        return false;
    } catch (error) {
        console.log('⚠️  Error checking cache, will fetch fresh data:', error.message);
        return false;
    }
}

function fetchGitHub(path, headers = {}, returnHeaders = false) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'DBA-Dash-Docs',
                ...headers
            }
        };

        https.get(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const parsed = JSON.parse(data);
                    if (returnHeaders) {
                        resolve({ data: parsed, headers: res.headers });
                    } else {
                        resolve(parsed);
                    }
                } else if (res.statusCode === 202) {
                    // GitHub is computing stats, return null to skip
                    console.log('   ℹ️  GitHub is computing statistics (202), skipping for now...');
                    resolve(null);
                } else if (res.statusCode === 403) {
                    // Rate limit error
                    const resetTime = res.headers['x-ratelimit-reset'];
                    const resetDate = resetTime ? new Date(resetTime * 1000) : null;
                    const resetMsg = resetDate ? ` (resets at ${resetDate.toLocaleTimeString()})` : '';
                    reject(new Error(`GitHub API rate limit exceeded${resetMsg}`));
                } else {
                    reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

// Get total count of any paginated resource efficiently using Link header
async function getResourceCount(path, resourceName = 'items') {
    try {
        // Fetch first page with headers to get pagination info
        const response = await fetchGitHub(`${path}?per_page=1&page=1`, {}, true);
        if (!response || !response.headers || !response.headers.link) {
            console.log(`   ⚠️  No Link header found for ${resourceName}, trying alternative method...`);
            // Fallback: fetch a reasonable number of items
            const items = await fetchGitHub(`${path}?per_page=100`);
            return items ? items.length : 0;
        }

        // Parse Link header to get last page number
        // Link header format: <url>; rel="next", <url>; rel="last"
        const linkHeader = response.headers.link;
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);

        if (lastPageMatch) {
            const lastPage = parseInt(lastPageMatch[1], 10);
            console.log(`   Found ${lastPage} pages of ${resourceName} (total: ${lastPage})`);
            return lastPage; // With per_page=1, page number = total count
        }

        // If no last page, there's only one page
        return response.data ? response.data.length : 0;
    } catch (error) {
        console.log(`   ⚠️  Error counting ${resourceName}:`, error.message);
        return 0;
    }
}

async function fetchAllPages(basePath, headers = {}, perPage = 100) {
    const allData = [];
    let page = 1;

    while (true) {
        console.log(`Fetching ${basePath} page ${page}...`);
        const data = await fetchGitHub(`${basePath}?per_page=${perPage}&page=${page}`, headers);

        if (!data || data.length === 0) break;

        allData.push(...data);

        if (data.length < perPage) break;

        page++;
    }

    return allData;
}

function processStarHistory(stargazers) {
    console.log(`Processing ${stargazers.length} stargazers...`);

    const starsByMonth = new Map();

    stargazers.forEach((star) => {
        const date = new Date(star.starred_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!starsByMonth.has(monthKey)) {
            starsByMonth.set(monthKey, {
                date: date,
                count: 0
            });
        }
        starsByMonth.get(monthKey).count++;
    });

    const sortedMonths = Array.from(starsByMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));

    const labels = [];
    const data = [];
    let cumulative = 0;

    sortedMonths.forEach(([monthKey, monthData]) => {
        cumulative += monthData.count;
        // Format the date as "Mon YYYY" (e.g., "Jan 2022")
        const formattedDate = monthData.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
        labels.push(formattedDate);
        data.push(cumulative);
    });

    return { labels, data };
}


async function main() {
    // Check if we should skip fetching due to recent data
    if (shouldSkipFetch()) {
        process.exit(0);
    }

    console.log('Fetching GitHub statistics for', `${REPO_OWNER}/${REPO_NAME}...`);

    // Create backup of existing file in case of errors
    let backupPath = null;
    if (fs.existsSync(OUTPUT_FILE)) {
        backupPath = OUTPUT_FILE + '.backup';
        fs.copyFileSync(OUTPUT_FILE, backupPath);
    }

    try {
        // Fetch repository info
        console.log('Fetching repository info...');
        const repo = await fetchGitHub(`/repos/${REPO_OWNER}/${REPO_NAME}`);

        const repoStats = {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.subscribers_count,
            openIssues: repo.open_issues_count
        };

        console.log('Repository stats:', repoStats);

        // Fetch all releases
        console.log('Fetching releases...');
        const releases = await fetchAllPages(`/repos/${REPO_OWNER}/${REPO_NAME}/releases`);

        let totalDownloads = 0;
        const releaseStats = [];

        releases.forEach((release) => {
            let releaseDownloads = 0;
            const assets = [];

            release.assets.forEach((asset) => {
                releaseDownloads += asset.download_count;
                assets.push({
                    name: asset.name,
                    downloads: asset.download_count,
                    size: asset.size,
                    url: asset.browser_download_url
                });
            });
            totalDownloads += releaseDownloads;

            // Include all releases, even those without assets
            releaseStats.push({
                name: release.name || release.tag_name,
                downloads: releaseDownloads,
                publishedAt: release.published_at,
                url: release.html_url,
                assets: assets
            });
        });

        // Sort by date (oldest first)
        releaseStats.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

        // Prepare download chart data
        const downloadLabels = [];
        const downloadData = [];
        let cumulative = 0;

        releaseStats.forEach((release) => {
            cumulative += release.downloads;
            downloadLabels.push(release.name);
            downloadData.push(cumulative);
        });

        console.log(`Processed ${releaseStats.length} releases with ${totalDownloads.toLocaleString()} total downloads`);

        // Fetch star history
        console.log('Fetching star history...');
        const stargazers = await fetchAllPages(
            `/repos/${REPO_OWNER}/${REPO_NAME}/stargazers`,
            { 'Accept': 'application/vnd.github.v3.star+json' }
        );

        const starHistory = processStarHistory(stargazers);

        // Fetch contributors
        console.log('Fetching contributors...');
        const contributors = await fetchAllPages(`/repos/${REPO_OWNER}/${REPO_NAME}/contributors`);

        const contributorStats = contributors.map(contributor => ({
            username: contributor.login,
            contributions: contributor.contributions,
            avatar: contributor.avatar_url,
            profile: contributor.html_url
        }));

        console.log(`Found ${contributorStats.length} contributors`);

        // Fetch pull request and issue stats from search API for better accuracy
        console.log('Fetching pull request and issue stats...');
        const [openPRsSearch, allPRsSearch, mergedPRsSearch, closedIssuesSearch] = await Promise.all([
            fetchGitHub(`/search/issues?q=repo:${REPO_OWNER}/${REPO_NAME}+type:pr+state:open`),
            fetchGitHub(`/search/issues?q=repo:${REPO_OWNER}/${REPO_NAME}+type:pr`),
            fetchGitHub(`/search/issues?q=repo:${REPO_OWNER}/${REPO_NAME}+type:pr+is:merged`),
            fetchGitHub(`/search/issues?q=repo:${REPO_OWNER}/${REPO_NAME}+type:issue+state:closed`)
        ]);

        // Fetch commit count efficiently using Link header
        console.log('Fetching commit count...');
        const totalCommits = await getResourceCount(`/repos/${REPO_OWNER}/${REPO_NAME}/commits`, 'commits');
        if (totalCommits > 0) {
            console.log(`Found ${totalCommits.toLocaleString()} total commits`);
        }

        // Fetch discussions count efficiently using Link header
        console.log('Fetching discussions count...');
        const totalDiscussions = await getResourceCount(`/repos/${REPO_OWNER}/${REPO_NAME}/discussions`, 'discussions');
        if (totalDiscussions > 0) {
            console.log(`Found ${totalDiscussions.toLocaleString()} total discussions`);
        }

        const pullRequestStats = {
            open: openPRsSearch.total_count,
            merged: mergedPRsSearch.total_count,
            total: allPRsSearch.total_count
        };

        const issueStats = {
            open: repoStats.openIssues,
            closed: closedIssuesSearch.total_count,
            total: repoStats.openIssues + closedIssuesSearch.total_count
        };

        console.log(`Pull requests: ${pullRequestStats.total} total (${pullRequestStats.open} open, ${pullRequestStats.merged} merged)`);
        console.log(`Issues: ${issueStats.total} total (${issueStats.open} open, ${issueStats.closed} closed)`);
        console.log(`Commits: ${totalCommits.toLocaleString()} total`);
        console.log(`Discussions: ${totalDiscussions.toLocaleString()} total`);

        // Compile final stats object
        const stats = {
            generatedAt: new Date().toISOString(),
            repository: repoStats,
            totalDownloads: totalDownloads,
            totalCommits: totalCommits,
            totalDiscussions: totalDiscussions,
            releases: releaseStats.reverse(), // Newest first for table
            downloadChart: {
                labels: downloadLabels,
                data: downloadData
            },
            starHistory: starHistory,
            contributors: contributorStats,
            pullRequests: pullRequestStats,
            issues: issueStats
        };

        // Write to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stats, null, 2));
        console.log(`✅ Stats written to ${OUTPUT_FILE}`);
        console.log(`   - ${stats.repository.stars} stars`);
        console.log(`   - ${stats.totalDownloads.toLocaleString()} downloads`);
        console.log(`   - ${stats.releases.length} releases`);
        console.log(`   - ${stats.starHistory.labels.length} months of star history`);
        console.log(`   - ${stats.contributors.length} contributors`);

        // Clean up backup on success
        if (backupPath && fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
        }

    } catch (error) {
        console.error('❌ Error fetching GitHub stats:', error.message);

        // Restore from backup if available
        if (backupPath && fs.existsSync(backupPath)) {
            console.log('🔄 Restoring previous data file...');
            fs.copyFileSync(backupPath, OUTPUT_FILE);
            fs.unlinkSync(backupPath);
            console.log('✅ Previous data preserved. Build will continue with existing stats.');
            console.log('💡 Tip: This is likely a rate limit issue. The data will refresh on next build.');
            process.exit(0); // Exit successfully to allow build to continue
        } else {
            console.error('⚠️  No previous data available. Build may fail.');
            process.exit(1);
        }
    }
}

main();
