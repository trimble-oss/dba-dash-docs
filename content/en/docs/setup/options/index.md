---
title: "Setup Options"
description: "Additional setup options not covered in the quick start"
lead: "This pages covers some setup options not covered in the quick start guide."
date: 2022-10-01T21:03:53+01:00
lastmod: 2022-10-01T21:03:53+01:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
    identifier: "options-0200e506447a099d54cf3eaa71da9d8e"
weight: 999
toc: true
---
## Destination Connection

The destination connection is usually the connection to the DBA Dash repository database but you can also set this as a S3 bucket or folder.  You might do this if you don't have any connectivity between your monitored instances and your DBA Dash repository database.  

Click the icons highlighted below to set the destination connection to a S3 bucket or folder.

![Set destination connection](destination.png)

You can also set it manually.  e.g. 
`https://mybucket.s3.amazonaws.com/DBADash`

There are various methods you can use to configure access to S3 buckets.  You could add the permissions to an IAM role associated with the instance if it's a EC2 instance in AWS.  If you want to provide a AWS profile or Access/Secret key combination, that can be done in the Options tab.  

{{< alert icon="⚠️" text="Please avoid storing the credentials in the config if possible." />}}

## Source Connection

Similar to the destination connection, your source connection can also be a folder or S3 bucket.  This allows the DBA Dash service that has connectivity to your repository database to import the data collected via the remote DBA Dash agent.  Set the source connection the same as the destination connection used by the remote agent and click Add/Update.

![Set source connection](source.png)

## Azure DB

DBA Dash supports monitoring Azure DB.  Each database is treated like an individual SQL instance, but you only need to add a connection to the master database to the config.  By default the application will add collection schedules for each database when the service starts and also look for new databases created every hour.  You can disable these features if required.  The "Scan Now" button can be used to add the databases as connections in the config.  You might want to do this to have different collection configurations for each database.  You might also want to monitor specific databases.

![Azure DB configuration](azuredb.png)

## Schedules

Schedules can be customized if required.  You can configure schedules at the agent level or have customized schedules for each monitored instance.  See [here](/docs/help/schedule/) for more information. 

## Slow Query capture - Extended Events 

Slow query capture can be enabled to capture RPC/Batch completed events that take longer than a specified duration.  See [here](/docs/help/slow-queries/) for more information.

## Query plan capture

Query plans can be captured for running queries.  See [here](/docs/help/running-queries/) for more information.

## Schema snapshots

See [here](/docs/help/schema-snapshots/) for information on schema snapshots.

## ConnectionID

The ConnectionID can be edited in the existing connections grid on the Source tab of the service configuration tool.  By default the output from @@SERVERNAME is used to uniquely identify an instance in the DBA Dash repository database.  You might want to change the ConnectionID if @@SERVERNAME isn't unique for your environment.  You might also want to set the ConnectionID if you want to migrate to a new server and maintain history from the old instance as if it was the same server.

![ConnectionID](connectionid.png)

## Identity Collection Threshold

DBA Dash collects identity column information for any identity columns that have used 5% of their identities.  You can adjust this threshold in the Options tab of the service configuration tool.

## Log Internal Performance Counters

If you enable internal performance counters, you will be able to track how long each collection took to run as well as some other internal metrics.  This information will be available on the Metrics tab along with the os performance counter metrics that get collected.  

[![Internal performance counters](internalcounters.png)](internalcounters.png)

{{< alert icon="⚠️" text="Enabling internal performance counters will increase the size of the PerformanceCounters tables." />}}

Internal performance counters track the time taken from the client side.  If you are interested in evaluating the monitoring impact of DBA Dash, you could create an extended event session to capture RPC and Batch Completed events for application name starting with "DBADash".

## Multiple agents running on the same host

It's possible to have multiple DBA Dash agents running on the same host.  To do this you need to give each a unique service name.  The default service name is **DBADashService**.  To change this, edit the "ServiceName" in the ServiceConfig.json file or click the "Json" tab in the service configuration tool.  On the "Destination" tab you will need to click the "Refresh" button to pick up the new service name.

## Service Threads

The default value is -1 which is determined by the application.  The number of threads used is shown in the service log when the service starts up. If you have a large number of instances to monitor, you might need to increase the service threads to allow the collections to fire for each instance. It's also possible to distribute the monitored instances between multiple agents.  Multiple agents can point to the same DBA Dash repository database or you could also use multiple repository databases.