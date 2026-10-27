---
title: "Query Stats"
description: "Statement-level query statistics from the plan cache, including ad-hoc queries."
lead: "Which statement did the work, including ad-hoc queries that never appear in Object Execution Stats."
date: 2026-10-27T00:00:00+00:00
lastmod: 2026-10-27T00:00:00+00:00
draft: false
images: []
menu:
  docs:
    parent: "help"
    identifier: "query-stats-7c4e1a9b2d8f46e0a1b3c5d7e9f01234"
weight: 999
toc: true
slug: "query-stats"
---

Object Execution Stats tells you which procedure did the work. Query Stats tells you which statement inside it, and it also captures ad-hoc queries.

The collection reads `sys.dm_exec_query_stats` and stores the change since the last read. The plan cache itself is not copied into the repository. Each instance and database has a **Query Stats** tab: charts and a grid of CPU, duration, reads, writes, executions and the rest.

It is off by default. Reading the plan cache costs whatever the cache costs, and that cost scales with the size of the cache.

## Enabling

In the service configuration tool, on the **Query Stats** tab when you add a connection:

* **Collect query stats** turns the collection on. The default **Top N** is 50.
* **Plans per collection** is how many plans one collection fetches for the shapes it stored. The default is 50. Set it to 0 to store no plans. Plans can still be fetched from the cache from the grid when messaging is enabled.
* **Apply query stats configuration to all existing connections** copies those settings onto connections that are already in the config.

The same values are columns on the existing connections grid: **Query Stats Top N** and **Query Stats Plans**. Updating a connection keeps its Query Stats settings.

The collection is scheduled every five minutes. Nothing is collected until Top N is set above 0. It is skipped on the Azure SQL master database, which has no user workload to account for, and on SQL Server 2005. `DATETIME2` and `query_hash` were added in SQL Server 2008.

From the GUI, **Connection Options...** on an instance can change the same settings when the service allows [connection changes](/docs/help/messaging/#source-connections).

## What is stored

Top N is the number of query families kept for each ranking measure. Seven measures are ranked and the results are combined:

* CPU (worker time)
* Duration (elapsed time)
* Logical reads
* Logical writes
* Physical reads
* Executions
* Memory grant per execution

The same heavy queries usually top several of those lists, so the number stored is often close to Top N. It can reach seven times Top N, plus any family kept because one execution was slow. A family is kept in full when a single execution in the interval took at least one second. The plan cache only exposes totals, a lifetime maximum and the last execution, so a slow run among faster ones that set no new maximum is not visible here. [Slow Queries](/docs/help/slow-queries/) records each of those.

Everything below the cut is rolled up, so the totals for an interval still add up to the work the instance did. Raising Top N buys detail. The interval totals stay the same.

Ad-hoc statements are grouped by database and query hash. Literal values and comments are masked, and one variant is kept as a labelled example. Statements inside a module are identified by object and offsets, so a redeploy does not start a new history.

A second result on the grid says how much of the window was covered, how much CPU was rolled up or could not be attributed, and how long the read took. A database whose work was rolled into the instance's {Other databases} row says so in the status bar, and so does a database that had nothing collected.

## The Query Stats tab

The tab charts a measure over time and by statement, object and database, with a CPU coverage pie. The grid can be grouped by query shape, statement or plan.

At database level the By Database pie is hidden, and the coverage chart leaves out work that cannot be attributed to a database.

From the grid you can open [Running Queries](/docs/help/running-queries/) for the same query hash and time window, or jump to Query Store.

Object links, query hashes and plan hashes open one detail window. An object has tabs for Object Execution, Query Stats (its statements), Running Queries, Slow Queries, Query Store and Schema History. A query hash or plan hash opens Query Stats, Running Queries and Query Store. It opens on Query Stats where that collection is on, and on Query Store where it is not.

Plans for the shapes that were stored are fetched afterwards, heaviest first, up to the plans-per-collection limit, and once a day per shape. A plan that was not captured can be fetched from the cache through [messaging](/docs/help/messaging/), or with a generated script when messaging is not available.

## Retention

Raw rows are kept for 30 days and hourly rollups for 365. Both can be changed in [Data Retention](/docs/help/data-retention/). The coverage rows the charts divide by follow those tables and have no retention setting of their own.

Reports read whole hours from the hourly rollup and the partial hours at either end from the raw rows. A time filter with a UTC offset that is not a whole number of hours reads the raw rows, because an hourly row then straddles two local hours.

Collection date alerts use a warning threshold of 15 minutes and a critical threshold of 30 minutes. Adjust them on the Collection Dates tab if you change the schedule. See [Collection thresholds](/docs/help/schedule/#collection-thresholds).
