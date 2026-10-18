---
title: "Availability Groups"
description: ""
lead: ""
date: 2022-12-02T15:24:38Z
lastmod: 2026-10-18T00:00:00Z
draft: false
images: []
menu:
  docs:
    parent: ""
    identifier: "availability_groups-0d7835f066419270dca0bde617955baa"
weight: 999
toc: true
---
DBA Dash includes support for availability groups.

## How to add connections

Add connections to the SQL nodes that host your availability groups. The listener connection can also be monitored if you are using SQL 2022 contained availability groups ([See here](#contained-availability-groups-sql-2022)).

## Backup Status

Backup status takes into account the backups performed on each of the replicas.

## Availability Group health

DBA Dash reports the status of your availability groups on the Summary tab.  You can also see more detail about the health of your availability groups in the "Availability Groups" tab in the HA\DR folder in the tree.

[![Availability Groups](availability_groups.png)](availability_groups.png)

## Failover history

The Availability Group tab records role changes. Each collection of availability replicas compares the local replica's role with the previous snapshot.

Where the built-in `AlwaysOn_health` extended events session is running, DBA Dash also reads it every five minutes. The first run reads the files the instance already has, so the history is back-filled. Instances with no availability groups, or where that session is not running, are skipped and checked again hourly. A collection you trigger from the GUI always checks.

Those events give an exact time, a failover type (manual, forced or automatic) and a reason drawn from any monitored replica of the group: a failover statement, a health check error, the replica stopping, the HADR manager going offline, a lease expiry or a HADR error. A snapshot estimate that an extended events row already covers is hidden. An instance restart is not counted as a role change.

The tab has its own date range, defaulting to 30 days. The instance view lists the AlwaysOn health events. Events are kept for 365 days by default.

## Contained Availability Groups (SQL 2022)

For contained availability groups it's only possible to monitor the associated jobs if you also add a connection to the listener in the service configuration tool. The connection will be identified by the name of the availability group - or you can override the ConnectionID in the service configuration tool. 

Note: Slow query capture [doesn't work](https://github.com/trimble-oss/dba-dash/issues/458) for the contained availability group if it's also enabled on the node it's running on in this version of DBA Dash.
