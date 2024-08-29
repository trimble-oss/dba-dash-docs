---
title: "What's new in 2.39.0?"
description: "Identity column threshold configuration & more"
excerpt: ""
summary: "Identity column threshold configuration & more"
date: 2023-04-10T21:02:36+01:00
lastmod: 2023-04-10T21:02:36+01:00
draft: false
weight: 50
images: [identity-columns-threshold-configuration.png]
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Identity column thresholds configuration

You can now configure identity column thresholds in the GUI.  For example, you might want to adjust the thresholds for a table that has hit the warning/critical thresholds but is no longer growing.

## Running Queries - maintain scroll position

The scroll position is [now maintained](running-queries-scroll2.gif) when extending the date range or navigating back from viewing a specific snapshot.  The snapshot you have just viewed will also be [highlighted](running-queries-scroll.gif)  when navigating back.

## RCSI Count added to DB Options tab

This makes it easy to see at a high level if RCSI (Read Committed Snapshot Isolation) is been used. Blocking is significantly reduced with this isolation level as readers and writers are able to run concurrently without blocking.  RCSI is generally the best option for most use cases, though there are some tradeoffs to consider and testing needs to be done for existing applications.

## Query timeouts

Query timeouts have been extended and query timeout errors have been excluded from the retry policy.  A query will often succeed on retry if it experiences a timeout for various reasons, but often it will be better to extend the query timeout instead of executing the query again from scratch.  For more frequently executed queries, we can just wait for the next collection to run.

## sys.dm_os_schedulers metrics

Some extra performance counters are available:

* Worker threads used % - check if we are close to running out of worker threads. Useful for diagnosis of THREADPOOL waits.
* Avg runnable tasks - sustained values over 1 are a sign of CPU pressure
* Avg current tasks - sustained values over 10 might indicate a problem. e.g. Blocking
* Avg pending disk IO - sustained values over 1 are a sign of IO pressure.

These are not **currently** enabled by default though.  Create a new file called "PerformanceCountersCustom.xml" based on "PerformanceCounters.xml" and add this line:

```xml
<Counter object_name="sys.dm_os_schedulers" counter_name="*" />
```
*Note: It's already there ready to comment out.*

 [See here](/docs/help/os-performance-counters) for more info on customizing performance counters.

## Other

See [here](https://github.com/trimble-oss/dba-dash/releases/tag/2.39.0) for a full list of fixes.
