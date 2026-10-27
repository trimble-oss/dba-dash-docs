---
title: "Service Broker"
description: "Monitor SQL Server Service Broker queues, the transmission queue, conversations and the broker endpoint."
lead: "Queue depth, messages that are not being received, conversations that are not being ended, and a broker endpoint that is not started."
date: 2026-10-27T00:00:00+00:00
lastmod: 2026-10-28T00:00:00+00:00
draft: false
images: []
menu:
  docs:
    parent: "help"
    identifier: "service-broker-4e8c2b1a9d7f46e0b3c5a81720f4d6e1"
weight: 999
toc: true
slug: "service-broker"
---

Service Broker monitoring is off by default. Enable the **ServiceBroker** collection in the service configuration tool. The suggested schedule is every five minutes. See [Collection schedule](/docs/help/schedule/#disabled-by-default).

The collection visits online, accessible databases that have Service Broker enabled. Availability group secondaries are skipped. Databases are matched by name, so a contained availability group whose `database_id` differs between replicas still lines up.

The **Summary** tab has a Service Broker column. The tooltip says what is wrong. The **Service Broker** tab is on the Checks node and on a database. It is shown when the ServiceBroker schedule is enabled for the instance, or when a Service Broker collection has already run. Turning the schedule off leaves the tab while that collection date is still stored. On Checks above a single instance, the tab is shown when this is true for any instance.

## What is collected

Each collection returns:

* User queues: configuration, depth, the age of the oldest message waiting to be received, and whether activation is running.
* The transmission queue, grouped by target service and status.
* Conversation endpoint counts by state.
* The Service Broker endpoint and its connections. The endpoint is only needed for messaging between instances.
* Cumulative Broker Statistics and Broker Activation counters. The repository stores the change since the previous snapshot. A counter that goes backwards, such as after a restart, is stored as unknown rather than as a negative change.

Queue depth is read from `sys.partitions` for the queue's internal table. Queues that have messages are then read, up to 100,000 messages, for the age of the oldest message waiting to be received. That age shows a queue that is not being processed, which depth alone does not.

A queue with `RETENTION = ON` also holds messages that have already been received, so its depth is the count of messages still waiting. If that queue is not read, the depth is left empty.

`SqlDependency` creates a `SqlQueryNotificationService-{GUID}` queue for each listener. Those are rolled into one row per database and schema.

Conversations are counted by state up to 1,000,000 endpoints. Above that the total comes from `sys.partitions` and the state is reported as `??`, so a leak of conversations does not turn every collection into a full scan of the endpoints.

By default the collection stops if it would visit more than 500 databases. Set `ServiceBrokerMaxDatabases` in the service config. `0` means no limit.

## The Service Broker tab

The tab has grids for instances, databases, queues and the transmission queue. Database rows include conversation counts by state.

Charts show:

* Queue depth for the top queues, and the transmission queue.
* Activity per second: messages sent and received. On a database the chart is activations, because the message counters are for the whole instance.
* Open conversations over time, for the top databases.

## Status

Queues:

* **Critical** when receive is disabled, which is usually a poison message, or when the queue status is OFF.
* **Critical** when the activation procedure is missing and messages are waiting.
* **Warning** when activation is disabled and messages are waiting, or when activation has been notified for 10 minutes or more and messages are still waiting. The activation procedure is not receiving from the queue.
* Queue depth and the age of the oldest message are compared with the thresholds below.

Databases:

* Age of the oldest message in the transmission queue. Messages stay there when they cannot be delivered.
* Open conversations, other than ones already closed. A rising count is usually conversations that are never ended.
* Conversations in the error state. They stay until the application ends them.
* Activation tasks aborted in the last hour.

Instances:

* Endpoint not started, or connections failing to log in.
* Corrupted messages in the last hour.

Activation errors are reported against the database. Dropped messages are shown as well. Dropped messages include ordinary retries to a remote service. A message that cannot be delivered shows in the sender's transmission queue. Neither of those counts changes the status on its own.

## Thresholds

**Configure** on the Service Broker tab sets thresholds at root, instance, database or queue level. A lower level inherits from the one above until you set it. The root defaults are:

| Threshold | Warning | Critical |
|---|---|---|
| Queue depth | 10,000 messages | not set |
| Oldest message in a queue | 15 minutes | 60 minutes |
| Oldest message in the transmission queue | 15 minutes | 60 minutes |
| Open conversations | 100,000 | not set |

Clear a threshold to leave that check unset at that level.

## Alerts

A **Service Broker** alert rule raises one alert per instance for each check, listing the queues or databases that fail it. Each check can be Off, Critical, or Warning or Critical. The defaults follow the status above: a disabled queue alerts at critical, activation and open conversations alert on a warning as well, and conversations in the error state are off until you turn that check on.

**Recently Disabled (Hours)** defaults to 24. A queue disabled longer ago than that, or disabled before it was first collected, is left out of the queue checks. A queue that was disabled while the alert is still open stays in the alert until the queue is enabled. Set it to 0 to include every disabled queue.

A rule with a **Database Name** (LIKE syntax) does not check the endpoint or corrupted messages. Those are instance-level. Leave the name blank to include every database and the instance checks.

## Retention

Queue depth history and the per-database stats are kept for 90 days. Instance activity is kept for 180 days. Change them in [Data Retention](/docs/help/data-retention/). Dropped queues are marked inactive and removed once their history is purged.
