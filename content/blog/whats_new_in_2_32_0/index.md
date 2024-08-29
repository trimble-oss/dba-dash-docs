---
title: "What's new in 2.32.0?"
description: "Agent job improvements..."
excerpt: ""
summary: "Agent job improvements..."
date: 2023-01-20T08:40:23Z
lastmod: 2023-01-20T08:40:23Z
draft: false
weight: 50
images: [agent_jobs_status.png]
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## New Status Filter

[![Agent Jobs](agent_jobs.png)](agent_jobs.png)

[![Agent Jobs status filter](agent_jobs_status.png)](agent_jobs_status.png)

The new status filter makes it easy to see that a filter has been applied.

## Acknowledge Agent job failures

[![Acknowledge Agent Jobs](agent_jobs_acknowledge.png)](agent_jobs_acknowledge.png)

DBA Dash 2.32.0 introduces the ability to acknowledge agent job failures.  This allows you to keep your dashboard clear after you have investigated the root cause of a job failure.  The job will have a new "Acknowledged" status until there is a subsequent failure or the thresholds are no longer met for warning/error status.

Simply click the "Acknowledge" link to clear an issue.  Clicking the "Gears" icon and selecting "Acknowledge Errors" allows you to Acknowledge all the jobs displayed in the grid.
