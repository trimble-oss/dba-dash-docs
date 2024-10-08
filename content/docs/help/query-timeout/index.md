---
title: "Query Timeout"
description: "Customize query timeouts"
lead: ""
date: 2023-03-26T08:36:22+01:00
lastmod: 2023-03-26T08:36:22+01:00
draft: false
images: []
menu:
  docs:
    parent: ""
    identifier: "query-timeout-b406c3b445a3c38bf2c0694696608a53"
weight: 999
toc: true
---
The default query timeouts should work for most deployments of DBA Dash. If you regularly experience query timeouts for a particular collection in your environment you should consider either increasing the timeout or disabling the collection.

For example, you might experience query timeouts with the IdentityColumns collection if you have a large number of databases on your SQL instance.  You might also experience issues if you have databases with very large numbers of tables.  The collection only runs once a day so you might decide to increase the query timeout rather than disable the collection.

{{< callout tip >}}Note: The service loops through the databases rather than processing them in parallel to minimize the impact on the monitored instance.{{< /callout >}}

To specify custom query timeouts, create or edit the **commandTimeouts.json" file**.  If the file doesn't exist, you should find a file called "commandTimeouts.json.example" in the application folder that can be used as a starting point.  The example looks like this:

```json
{
  "CollectionCommandTimeouts": {
    "DatabasePermissions": 900,
    "DatabasePrincipals": 900,
    "DatabaseRoleMembers": 900,
    "IdentityColumns": 900,
    "SlowQueries": 90
  },
  "DefaultCommandTimeout": 60
}
```

You only need to specify the collection timeouts that you want to set/override.  If you just want to override the IdentityColumns collection:

```json
{
  "CollectionCommandTimeouts": {
    "IdentityColumns": 1800
  }
}
```
For any collections not specified, the application defaults for that specific collection will be used if available otherwise the DefaultCommandTimeout will apply.  If you change the "MinimumLevel" to "Debug" in  the **serilog.json** file, you will see the timeout values that will be used in the Log file when the service is started.

## Monitoring collection times

In the Options tab on the DBA Dash service config tool you can click the option to "Log Internal Performance Counters".  If this option is enabled, the collection duration will be available in the "Metrics" tab in the DBA Dash GUI.

## Additional timeouts

These additional timeouts can be configured in the **ServiceConfig.json** file.

* ImportCommandTimeout - timeout for inserting data into the repository database.  60 seconds default.
* PurgeDataCommandTimeout - timeout for managing data retention.  600 seconds default.
* AddPartitionsCommandTimeout - timeout for creating new partitions. 300 seconds default.

```json
{
  "ImportCommandTimeout": 60,
  "PurgeDataCommandTimeout": 600,
  "AddPartitionsCommandTimeout": 300,

}
```

## GUI Timeouts

The default timeout for the GUI can also be adjusted if needed.  Run this script in the repository database to change the default timeout to 120 seconds.

```
DELETE dbo.Settings WHERE SettingName='GUIDefaultCommandTimeout'
INSERT INTO dbo.Settings
(
    SettingName,
    SettingValue
)
VALUES
(
    'GUIDefaultCommandTimeout',
    120
)
```
