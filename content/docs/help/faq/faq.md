---
title: "FAQ"
description: "Answers to frequently asked questions."
lead: "Answers to frequently asked questions."
date: 2020-10-06T08:49:31+00:00
lastmod: 2024-10-13T21:44:31+00:00
draft: false
weight: 1000
toc: true
---

- [Does DBA Dash collect any telemetry or usage information?](#does-dba-dash-collect-any-telemetry-or-usage-information)
- [I Found a bug](#i-found-a-bug)
- [I have a feature suggestion](#i-have-a-feature-suggestion)
- [How Do I Contribute?](#how-do-i-contribute)
- [I need help or want to ask a question](#i-need-help-or-want-to-ask-a-question)
- [How do I create alert notifications with DBA Dash?](#how-do-i-create-alert-notifications-with-dba-dash)
- [How many instances can I monitor with DBA Dash?](#how-many-instances-can-i-monitor-with-dba-dash)
- [I get a 'Operation will cause database event session memory to exceed allowed limit.' error on AzureDB](#i-get-a-operation-will-cause-database-event-session-memory-to-exceed-allowed-limit-error-on-azuredb)
- [The stored procedure names are not showing](#the-stored-procedure-names-are-not-showing)
- [How do I get notifications of new releases?](#how-do-i-get-notifications-of-new-releases)
- [How do I remove an Instance?](#how-do-i-remove-an-instance)
- [How do I customize the tooltip length in the grid?](#how-do-i-customize-the-tooltip-length-in-the-grid)
- [How do I monitor read replicas in Azure?](#how-do-i-monitor-read-replicas-in-azure)

## Does DBA Dash collect any telemetry or usage information?

**No**.  All the data that DBA Dash collects is stored in the repository database which is fully under your control.

## I Found a bug

Please create an [Issue](https://github.com/trimble-oss/dba-dash/issues).  Before submitting an issue, please check if there is an existing issue for the bug.  Include as much information as possible about your environment and how to reproduce the bug, including full error messages.  Be careful not to include any security sensitive data in your issue.

Are you able to fix the bug yourself?  Please mention this in the issue.  We accept pull requests!

## I have a feature suggestion

Please create an [Issue](https://github.com/trimble-oss/dba-dash/issues).  Before submitting an issue, please check if there is an existing issue for the feature request. Provide a clear description for the feature.  If you are willing to help develop the new feature, please mention this in the issue.  DBA Dash is an open source project and will improve through community contributions.

## How Do I Contribute?

There are some [guidelines here](https://trimble-oss.github.io/contribute/) for Trimble employees.  We also accept external contributions.  We will [create some documentation](https://github.com/trimble-oss/dba-dash/issues/69) for external contributions shortly.

## I need help or want to ask a question

You can ask questions via the [discussions](https://github.com/trimble-oss/dba-dash/discussions) on GitHub.  There is also a **#dbadash** channel on the [SQL Server Community slack](https://dbatools.io/slack).  Before submitting a query, please check if there is an answer to your question in the documentation.  Also search the discussions to see if a similar question has already been asked. DBA Dash is an open source project that relies on community support to help answer queries.

## How do I create alert notifications with DBA Dash?

DBA Dash doesn't have any built in alerting capabilities, but you can create your own custom alerts based on the data collected.  Some [examples here](/docs/help/alerts#examples)

## How many instances can I monitor with DBA Dash?

There are no licensing restrictions or hard coded limits on the number of instances you can monitor with DBA Dash.  There are some practical limitations to consider which will impact how you deploy DBA Dash.  The DBA Dash GUI isn't designed for thousands of instances.  Collecting data from a large number of instances could also be a challenge. This will put additional pressure on the DBA Dash agent and the central repository database.  The size of the central repository database will also increase with the number of instances monitored. There are options if you have a large number of instances:

* Increase the ServiceThreads value in the ServiceConfig.json file to allow the DBA Dash agent to work with a larger number of instances.

*Note: The default value of -1 (or any number less than 1) allows the system to decide the thread count. This is currently set to 10.  Set this value to a positive integer to override the thread count.  When the service starts, the thread count should be output in the log file:*

`2024-07-21 12:48:48.738 +01:00 [INF] Threads 10 (default) <10>`

* Use multiple DBA Dash agents.
*Tip: Multiple agents can also be deployed to the same server.  Change the ServiceName in the ServiceConfig.json file to configure a unique name for each service.*
* Split the instances between multiple DBA Dash repositories.
*Starting with version 2.40.0, the DBA Dash GUI can fast switch between multiple repositories.*
* Cleanup old instances in the service config file.  These can consume threads as they try to connect.
* Adjust the collection schedules as required.  You could reduce the frequency of collection if appropriate or have offset schedules configured (easier to do with multiple DBA Dash services).  Remove any collections you are not interested in monitoring.
* The repository database might grow large.  The data retention can be adjusted and/or collection schedule to keep the repository database size under control.  For many collections there is a *_60MIN* aggregate that can be used for longer term trends and requires less storage space.

Automation also becomes important as the number of instances increase.  DBADashConfig.exe can be used for automation.  To get started run:

`DBADashConfig --help`

You can also add multiple connections at a time in the service config tool.

## I get a 'Operation will cause database event session memory to exceed allowed limit.' error on AzureDB

You will typically run into this issue when using elastic pools.  You might need to be selective about which databases you enable slow query capture for.  [See here](https://github.com/trimble-oss/dba-dash/discussions/138) for more info.

## The stored procedure names are not showing

Object names might display as {object_id:1234567}.  This can occur if the DBA Dash service account doesn't have permissions to collect the object name.  [Review the permissions](/docs/help/security) assigned to the service account.

## How do I get notifications of new releases?

Click the GitHub "Watch" button at the top of this page.  A drop down will appear.  Select "Custom".  Check "Releases" and click apply - this will only notify you when releases are published.

## How do I remove an Instance?

* First remove the instance from the service config tool to prevent data from been collected for the instance.  From version 3.12 you will be prompted to mark the instance deleted in the repository database, making this a one step process.

If you need to delete the instance in the GUI, right-click the instance.  Select delete from the Instance Actions context menu Available from 3.12. Or Options\Manage Instances for older versions.

The mark deleted is a soft delete operation that will hide the instance from display.  The recycle bin folder Available from 3.12 allows you to restore an instance or remove it completely. In *Options\Repository* Settings, you can configure the application to automatically hard delete an instance after a specified period of time after the last collection.

The **dbo.Instance_Del** stored procedure is used to perform both hard and soft delete operations.

> **Note**
>  You must wait at least 24hrs after stopping the collection for an instance before you can perform a hard delete.

```SQL
/*  Find InstanceID:
    SELECT InstanceID FROM dbo.Instances WHERE InstanceName =''
*/
EXEC dbo.Instance_Del @InstanceID = ???, @HardDelete = 1

/*
    This script will provide the command to hard delete each instance marked deleted
    This takes into account the 24hr waiting period since the last collection date.
*/
SELECT	I.InstanceDisplayName,
		I.Instance,
		CONCAT('EXEC dbo.Instance_Del @InstanceID = ',InstanceID,', @HardDelete = 1') AS DeleteCommand
FROM dbo.Instances I
WHERE IsActive=0
AND NOT EXISTS(SELECT 1
				FROM dbo.CollectionDates CD
				WHERE CD.InstanceID = I.InstanceID
				AND CD.SnapshotDate> DATEADD(d,-1,GETUTCDATE())
				)
```

## How do I customize the tooltip length in the grid?

The tooltip length can be adjusted using the script below.  A value of 0 will disable tooltips.

```sql
DELETE dbo.Settings WHERE SettingName='GUICellToolTipMaxLength'
INSERT INTO dbo.Settings(SettingName,SettingValue)
VALUES('GUICellToolTipMaxLength',1000)
```

## How do I monitor read replicas in Azure?

In the service config tool add the `ApplicationIntent=ReadOnly` option to the connection string when adding the connection in the Source tab.

This can be done from the connection builder by clicking the *{Other Options}* link or you can append this to the connection string in the Source text box.  When you click Add/Update, the Connection ID will be appended with "|ReadOnly" to ensure it's identified as a separate SQL instance from the primary replica.


{{< callout context="caution" icon="outline/alert-triangle" >}}Ensure you are using version 3.10 or later.{{< /callout >}}
