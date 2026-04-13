let downloadsChart = null;
let starHistoryChart = null;
let statsData = null;
let releasesData = [];
let currentPage = 1;
let itemsPerPage = 20;
let viewMode = 'simple'; // 'simple' or 'detailed'

// Wait for DOM to be ready before loading stats
document.addEventListener('DOMContentLoaded', function() {
    // Get stats data URL from data attribute
    const statsOverview = document.getElementById('stats-overview');
    const statsDataUrl = statsOverview ? statsOverview.dataset.statsUrl : null;

    if (!statsDataUrl) {
        console.error('Stats data URL not found');
        if (statsOverview) {
            statsOverview.innerHTML = '<p class="text-danger">Configuration error: Stats data URL not found.</p>';
        }
        return;
    }

    // Load stats from build-time generated JSON
    fetch(statsDataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            statsData = data;
            displayStats(data);

            // Listen for color scheme changes to recreate charts
            if (window.matchMedia) {
                const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                colorSchemeQuery.addEventListener('change', () => recreateCharts());
            }

            // Listen for manual theme toggle
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-bs-theme' || mutation.attributeName === 'data-dark-mode') {
                        recreateCharts();
                    }
                });
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-bs-theme', 'data-dark-mode']
            });
        })
        .catch(error => {
            console.error('Error loading GitHub stats:', error);
            const statsOverview = document.getElementById('stats-overview');
            if (statsOverview) {
                statsOverview.innerHTML = '<p class="text-danger">Failed to load statistics. Check console for details.</p>';
            }
        });
});

function displayStats(data) {
    // Display repository stats
    document.getElementById('stars-count').textContent = data.repository.stars.toLocaleString();
    document.getElementById('forks-count').textContent = data.repository.forks.toLocaleString();
    document.getElementById('watchers-count').textContent = data.repository.watchers.toLocaleString();
    document.getElementById('open-issues').textContent = data.repository.openIssues.toLocaleString();
    document.getElementById('total-downloads').textContent = data.totalDownloads.toLocaleString();

    // Display issue stats
    if (data.issues) {
        document.getElementById('closed-issues').textContent = data.issues.closed.toLocaleString();
    }

    // Display pull request stats
    if (data.pullRequests) {
        document.getElementById('open-prs').textContent = data.pullRequests.open.toLocaleString();
        // Closed PRs = Total - Open (includes both merged and closed-without-merge)
        const closedPRs = data.pullRequests.total - data.pullRequests.open;
        document.getElementById('closed-prs').textContent = closedPRs.toLocaleString();
    }

    // Display commit and discussion counts
    if (data.totalCommits !== undefined) {
        document.getElementById('total-commits').textContent = data.totalCommits.toLocaleString();
    }
    if (data.totalDiscussions !== undefined) {
        document.getElementById('total-discussions').textContent = data.totalDiscussions.toLocaleString();
    }

    // Display last updated time
    const generatedDate = new Date(data.generatedAt);
    const timeAgo = getTimeAgo(generatedDate);
    document.querySelector('.footer-note p').innerHTML =
        `Updated ${timeAgo} from the <a href="https://github.com/trimble-oss/dba-dash" target="_blank">GitHub repository</a>.`;

    // Create charts
    createStarHistoryChart(data.starHistory.labels, data.starHistory.data);
    createDownloadsChart(data.downloadChart.labels, data.downloadChart.data);

    // Display releases table
    displayReleasesTable(data.releases);

    // Display contributors
    if (data.contributors) {
        displayContributors(data.contributors);
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

function displayReleasesTable(releases) {
    releasesData = releases;
    currentPage = 1;
    renderReleasesPage();
}

function renderReleasesPage() {
    const totalPages = Math.ceil(releasesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageReleases = releasesData.slice(startIndex, endIndex);

    let tableHtml = '';

    // View toggle buttons (use data attributes + event delegation)
    tableHtml += '<div class="view-toggle">';
    tableHtml += `<button class="btn-view ${viewMode === 'simple' ? 'active' : ''}" data-view="simple">☰ Simple View</button>`;
    tableHtml += `<button class="btn-view ${viewMode === 'detailed' ? 'active' : ''}" data-view="detailed">📦 Asset Details</button>`;
    tableHtml += '</div>';

    if (viewMode === 'simple') {
        tableHtml += renderSimpleView(pageReleases);
    } else {
        tableHtml += renderDetailedView(pageReleases);
    }

    // Add pagination controls
    tableHtml += '<div class="pagination-controls">';

    // Page size selector
    tableHtml += '<div class="page-size-selector">';
    tableHtml += '<label for="pageSize">Show:</label>';
    tableHtml += '<select id="pageSize" class="page-size-select">';
    const pageSizes = [10, 20, 50, 100];
    pageSizes.forEach(size => {
        tableHtml += `<option value="${size}" ${size === itemsPerPage ? 'selected' : ''}>${size}</option>`;
    });
    tableHtml += '</select>';
    tableHtml += '<span>per page</span>';
    tableHtml += '</div>';

    if (totalPages > 1) {
        tableHtml += `<button class="btn-pagination" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>← Previous</button>`;
        tableHtml += '<span class="pagination-info">';

        // Page numbers
        const maxPageButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
            tableHtml += `<button class="btn-page" data-page="1">1</button>`;
            if (startPage > 2) tableHtml += '<span class="pagination-ellipsis">...</span>';
        }

        for (let i = startPage; i <= endPage; i++) {
            tableHtml += `<button class="btn-page ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) tableHtml += '<span class="pagination-ellipsis">...</span>';
            tableHtml += `<button class="btn-page" data-page="${totalPages}">${totalPages}</button>`;
        }

        tableHtml += '</span>';
            tableHtml += `<button class="btn-pagination" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
    }

    tableHtml += `<div class="pagination-summary">Showing ${startIndex + 1}-${Math.min(endIndex, releasesData.length)} of ${releasesData.length} releases</div>`;
    tableHtml += '</div>';

    document.getElementById('release-stats').innerHTML = tableHtml;

    // Attach event listeners (delegation) after injecting HTML to avoid inline handlers
    attachReleaseStatsHandlers();
}

function attachReleaseStatsHandlers() {
    const container = document.getElementById('release-stats');
    if (!container) return;

    // Remove any existing delegated listener to avoid duplicates
    container.removeEventListener('click', container._releaseStatsClickHandler);

    const clickHandler = function(e) {
        const btn = e.target.closest('button');
        if (!btn || !container.contains(btn)) return;

        // View toggle
        if (btn.classList.contains('btn-view') && btn.dataset.view) {
            changeView(btn.dataset.view);
            return;
        }

        // Page buttons
        if (btn.classList.contains('btn-page') && btn.dataset.page) {
            const p = parseInt(btn.dataset.page, 10);
            if (!isNaN(p)) changePage(p);
            return;
        }

        // Pagination prev/next
        if (btn.classList.contains('btn-pagination') && btn.dataset.page) {
            const p = parseInt(btn.dataset.page, 10);
            if (!isNaN(p)) changePage(p);
            return;
        }
    };

    container.addEventListener('click', clickHandler);
    container._releaseStatsClickHandler = clickHandler;

    // Page size select
    const pageSizeSelect = container.querySelector('#pageSize');
    if (pageSizeSelect) {
        pageSizeSelect.removeEventListener('change', container._releaseStatsChangeHandler);
        const changeHandler = function(e) {
            changePageSize(e.target.value);
        };
        pageSizeSelect.addEventListener('change', changeHandler);
        container._releaseStatsChangeHandler = changeHandler;
    }
}

function changePage(page) {
    const totalPages = Math.ceil(releasesData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderReleasesPage();
    // Scroll to top of table
    document.getElementById('release-stats').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePageSize(newSize) {
    itemsPerPage = parseInt(newSize);
    currentPage = 1; // Reset to first page when changing page size
    renderReleasesPage();
}

function changeView(mode) {
    viewMode = mode;
    renderReleasesPage();
}

function renderSimpleView(pageReleases) {
    let html = '<table class="table table-hover"><thead><tr><th>Release</th><th>Date</th><th>Downloads</th></tr></thead><tbody>';

    pageReleases.forEach(release => {
        const publishedDate = new Date(release.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        html += `<tr>
            <td><a href="${release.url}" target="_blank">${release.name}</a></td>
            <td>${publishedDate}</td>
            <td><strong>${release.downloads.toLocaleString()}</strong></td>
        </tr>`;
    });

    html += '</tbody></table>';
    return html;
}

function renderDetailedView(pageReleases) {
    let html = '<div class="releases-detailed">';

    pageReleases.forEach(release => {
        const publishedDate = new Date(release.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        html += '<div class="release-card">';
        html += '<div class="release-header">';
        html += `<h3 class="release-title"><a href="${release.url}" target="_blank">${release.name}</a></h3>`;
        html += `<span class="release-date">${publishedDate}</span>`;
        html += '</div>';

        if (release.assets && release.assets.length > 0) {
            html += '<table class="assets-table">';
            html += '<thead><tr><th>Asset</th><th>Downloads</th></tr></thead>';
            html += '<tbody>';

            release.assets.forEach(asset => {
                html += '<tr>';
                html += `<td><a href="${asset.url}" target="_blank" class="asset-link">${asset.name}</a></td>`;
                html += `<td class="asset-downloads">${asset.downloads.toLocaleString()}</td>`;
                html += '</tr>';
            });

            html += '</tbody>';
            html += '<tfoot>';
            html += '<tr class="total-row">';
            html += '<td><strong>Total</strong></td>';
            html += `<td class="asset-downloads"><strong>= ${release.downloads.toLocaleString()}</strong></td>`;
            html += '</tr>';
            html += '</tfoot>';
            html += '</table>';
        }

        html += '</div>';
    });

    html += '</div>';
    return html;
}

function displayContributors(contributors) {
    let html = '<div class="contributors-grid">';

    contributors.forEach(contributor => {
        html += '<div class="contributor-card">';
        html += `<a href="${contributor.profile}" target="_blank" class="contributor-link">`;
        html += `<img src="${contributor.avatar}" alt="${contributor.username}" class="contributor-avatar">`;
        html += `<div class="contributor-info">`;
        html += `<div class="contributor-name">${contributor.username}</div>`;
        html += `<div class="contributor-contributions">${contributor.contributions.toLocaleString()} contribution${contributor.contributions !== 1 ? 's' : ''}</div>`;
        html += '</div>';
        html += '</a>';
        html += '</div>';
    });

    html += '</div>';
    document.getElementById('contributors-list').innerHTML = html;
}

function createStarHistoryChart(labels, data) {
    const ctx = document.getElementById('starHistoryChart');
    if (!ctx) return;

    if (starHistoryChart) {
        starHistoryChart.destroy();
    }

    // Get colors from CSS custom properties
    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue('--accent-color').trim();
    const accentBg = styles.getPropertyValue('--chart-bg').trim();
    const textColor = styles.getPropertyValue('--chart-text').trim();
    const gridColor = styles.getPropertyValue('--chart-grid').trim();

    starHistoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stars Over Time',
                data: data,
                borderColor: accentColor,
                backgroundColor: accentBg,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: accentColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: styles.getPropertyValue('--card-bg').trim(),
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Stars: ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createDownloadsChart(labels, data) {
    const ctx = document.getElementById('downloadsChart');
    if (!ctx) return;

    if (downloadsChart) {
        downloadsChart.destroy();
    }

    // Get colors from CSS custom properties
    const styles = getComputedStyle(document.documentElement);
    const trimbleBlue = styles.getPropertyValue('--chart-color').trim();
    const trimbleBluePale = styles.getPropertyValue('--chart-bg').trim();
    const textColor = styles.getPropertyValue('--chart-text').trim();
    const gridColor = styles.getPropertyValue('--chart-grid').trim();

    downloadsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Downloads',
                data: data,
                borderColor: trimbleBlue,
                backgroundColor: trimbleBluePale,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: trimbleBlue
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: styles.getPropertyValue('--card-bg').trim(),
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Total: ' + context.parsed.y.toLocaleString() + ' downloads';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Recreate charts when theme changes
function recreateCharts() {
    if (statsData) {
        if (statsData.starHistory) {
            createStarHistoryChart(statsData.starHistory.labels, statsData.starHistory.data);
        }
        if (statsData.downloadChart) {
            createDownloadsChart(statsData.downloadChart.labels, statsData.downloadChart.data);
        }
    }
}
