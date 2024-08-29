---
title: "What's new in 2.42.0?"
description: "Summary load performance improvement, partition management improvement..."
excerpt: ""
summary: "Summary load performance improvement, partition management improvement..."
date: 2023-07-04T09:18:11+01:00
lastmod: 2023-07-04T09:18:11+01:00
draft: false
weight: 50
images: [summary_refresh_cron.png]
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Summary load performance

If you have a large number of SQL Server instances or databases you might notice a delay in loading the summary page.  In version 2.42.0, the summary data is cached in the dbo.Summary table to improve performance.  In the service config tool you can configure the service to keep the summary up-to-date on a schedule which will eliminate any delay in generating the summary in the client.  Just click the checkbox next to *Summary refresh cron* in the options tab of the service configuration tool.  Set a time in seconds or a cron expression.

It shouldn't be necessary to set the summary refresh on most deployments of DBA Dash, but it can be useful for larger repositories.  The summary data is cached for 5min by default.  The *SummaryCacheDurationSec* can be adjusted in the dbo.Settings table if you need to change it.  Summary data was previously cached for up to 5min on the client side which has been reduced to 1min as the cost of re-querying the database has been reduced.  This can be adjusted using *GUISummaryCacheDuration* in dbo.Settings table.

If you don't have the summary refresh enabled, the refresh will be triggered automatically when the cached data is over 5min old and you will still benefit from caching. If you click the refresh button it will serve a newer snapshot if available from dbo.Summary, otherwise it will force a refresh.

The *Refresh Time* in the top right reflects when the summary was generated.  The font will be *italic* when the summary was returned from cache.

## Partition management improvement

Version 2.42.0 uses TRUNCATE TABLE **WITH PARTITIONS** rather than switching data out to a staging table to truncate.  This is a simpler design and avoids any issues with the table schema not matching.  Previously you might have had problems with the partition maintenance if you changed data compression on the indexes without also changing the setting on the associated table in the *Switch* schema.

It used to be required to switch data out to a staging table in order to TRUNCATE, but the **WITH PARTITIONS** option was added in SQL 2016.  The repository database already requires SQL 2016 or later so there is no issue taking advantage of this new syntax.

*Note: DBA Dash still supports older versions of SQL Server (SQL 2005 and later) as monitored instances.*

## Optional write to secondary destinations

In most deployments of DBA Dash you will write to a single DBA Dash repository.  It's possible to write to multiple destinations such as a local DBA Dash repository and a remote repository via a S3 bucket.  Previously, all source connections were written to secondary destinations (Including S3 bucket sources).  You now have the option to disable the write to secondary destinations in the *Source* tab of the configuration tool.  For more complex deployments (S3 buckets and multiple repositories) this can help to simplify things. Previously you would have needed to run multiple instances of the DBA Dash service if you didn't want some source connections to be written to secondary destinations.

## Other

See [2.42.0](https://github.com/trimble-oss/dba-dash/releases/tag/2.42.0) release notes for a full list of fixes.
