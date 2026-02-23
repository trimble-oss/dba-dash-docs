---
title: "What's new in 4.5?"
description: "More granular tracking for Resource Governor"
summary: "Version 4.5 allows you to associate individual queries with resource governor workload groups and resource pools. Group and filter queries by workload group or resource pool in the Slow Queries or Running Queries tab. This expands on the monitoring for resource governor added in 4.4, allowing you to dive deeper with this more granular query level view. "
date: 2026-02-23T08:00:00+00:00
lastmod: 2026-02-23T08:00:00+00:00
draft: false
weight: 50
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---

## Slow Queries - Workload Groups and Resource Pools

You can now group and filter slow query capture by **workload group** or **resource pool**.

[![Slow Queries tab - workload group & resource pool capture](slow-queries.png)](slow-queries.png)

#### Configuration Notes:

* **Automatic Capture:** Data is captured automatically if Resource Governor is active and workload groups are configured.
* **Required Collections:** Ensure *ResourceGovernorWorkloadGroups* and *ResourceGovernorResourcePools* are enabled (default enabled, collection running every 1min, provided that Resource Governor is active and workload groups are configured).
* **Extended Events:**
  * **Standard Setup:** Existing XE sessions are dropped and re-created automatically with the new settings.
  * **Persist XE Sessions:** If you use the 'persist XE sessions' setting in service config tool, you must manually edit the extended event to add capture `sqlserver.session_resource_group_id` & `sqlserver.session_resource_pool_id`.  The existing session will still work but it won't capture the data required to map the captured queries to workload groups and resource pools.

## Running Queries - Workload Groups and Resource Pools

You can also group and filter the **Running Query** snapshots by **workload group** and **resource pool**.

[![Running Queries tab - workload group & resource pool capture. Group By](running-queries.png)](running-queries.png)

[![Running Queries tab - workload group & resource pool capture.  Detail](running-queries-detail.png)](running-queries-detail.png)

#### Configuration Notes:

* **Required Collections:** Ensure *ResourceGovernorWorkloadGroups* and *ResourceGovernorResourcePools* are enabled (default enabled, collection running every 1min, provided that Resource Governor is active and workload groups are configured).
* **Automatic Capture:** The *group_id* column from *sys.dm_exec_sessions* is captured automatically.

## Other Improvements

See the [4.5.0 release notes](https://github.com/trimble-oss/dba-dash/releases/tag/4.5.0) for a complete list of fixes and improvements.
