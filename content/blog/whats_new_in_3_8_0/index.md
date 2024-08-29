---
title: "What's new in 3.8?"
description: "Query store plan charts, plan forcing and more..."
summary: "Query store plan charts, plan forcing and more..."
date: 2024-08-13T08:57:16+01:00
lastmod: 2024-08-13T08:57:16+01:00
draft: false
weight: 50
images: [query-store-plan-chart.png]
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Query Store Plan Chart

Chart to visualize performance of query plans for a query over time.

From the *Top Queries (Query Store)* tab, click the query ID for a query to drill down.  Click the chart tab at the bottom left to see a chart instead of the plan summary.

[![Query Store Plan Chart](query-store-plan-chart.png)](query-store-plan-chart.png)

## Forced Plans

A new option is available to force query plans directly from DBA Dash.

[![Query Store Plan Forcing](query-store-plan-forcing.png)](query-store-plan-forcing.png)

You can also view forced plans in the *Forced Plans (Query Store)* tab.  A history of plan forcing operations is kept for plans forced using the DBA Dash GUI, providing a quick undo option.

[![Query Store Forced Plans](query-store-forced-plans.png)](query-store-forced-plans.png)

### Security for plan forcing

🔒Plan forcing is disabled by default and needs to be enabled in the service configuration tool.

* In the Options tab, check *Enable Communication* and *Allow Plan Forcing*.
* Add users to the *AllowPlanForcing* and *Messaging* database roles to enable users to force plans in the GUI.  *db_owner* will also have access.

[![Allow Plan Forcing](allow-plan-forcing.png)](allow-plan-forcing.png)

## Check Connections

Old source connections should be removed from the service configuration tool.  They use up resources (threads) trying to connect to an instance that no longer exists.  The new *Check Connections* button allows you to check which instances are currently accessible.  It will also show the the time of the last collection for the instance - making it easier to see how long an instance has been inaccessible.

[![Check Connections](check-connections.png)](check-connections.png)

## Wildcard support for Table Size

[Chad Baldwin](https://github.com/chadbaldwin) adds a [contribution](https://github.com/trimble-oss/dba-dash/pull/954) that improves the flexibility of the table size collection configuration.  This makes it easier to track the table size for the databases that you are interested in.

## Other

See [3.8.0](https://github.com/trimble-oss/dba-dash/releases/tag/3.8.0) release notes for a full list of fixes.
