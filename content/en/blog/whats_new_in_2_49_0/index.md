---
title: "What's new in 2.49.0?"
description: ""
excerpt: ""
date: 2023-10-24T15:38:10+01:00
lastmod: 2023-10-24T15:38:10+01:00
draft: false
weight: 50
images: [custom-reports.png]
categories: []
tags: []
contributors: []
pinned: false
homepage: false
---
## Custom Reports

DBA Dash now allows the creation of custom reports.  This allows you to extend the functionality of DBA Dash by creating reports tailored to your specific requirements.  It's really easy to get started with custom reports if you are familiar with writing T-SQL.  Creating a report is as simple as creating a stored procedure in the **UserReport** schema with some parameters that the application can use to pass context.

ℹ️[See here for more information](/docs/how-to/create-custom-reports) *(including a sample Sys Admin Users report to get you started)*

*Note: If you want to get your own custom data into DBA Dash, that would still be a manual process for now.  The application no longer uses the DropObjectsNotInSource starting with version 2.49.0 so customizations will be persisted during upgrades.  I'd recommend using a unique schema to avoid potential conflicts with future updates. Having a backup of the repository prior to upgrading is also recommended*  

🔮In future releases, DBA Dash might support custom collections which would tie in well with custom reports.  Custom reporting is also likely to be expanded on and improved in future versions.

⚙️Note: DBA Dash already supports [custom performance counters](/docs/help/os-performance-counters/) and [custom checks](/docs/help/custom-checks/).  The **Metrics** tab in the GUI can be used to create custom dashboards.  The new custom report feature is designed for tabular reports.

🤝It's easy to share your report creations with the community.  Just post the DDL for the stored procedure.  You can also script out the data in the dbo.UserReport table if you want to include any customizations made in the UI.  Post it on your blog and/or add a 🙌[Show and tell](https://github.com/trimble-oss/dba-dash/discussions) post.  

## Monitor for available worker threads by default

DBA Dash will now monitor the % of worker threads used by default.  SQL Server automatically configures the maximum number of worker threads.  If you run out of worker threads you will start to see significant [THREADPOOL](https://www.sqlskills.com/help/waits/threadpool/) waits.  A lack of available worker threads can start to cause serious performance issues and even prevent you from accessing your SQL instance if you don't have a [dedicated admin connection](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/diagnostic-connection-for-database-administrators) configured.

Monitoring the % of worker threads used is useful as an early warning sign and for troubleshooting purposes.  In most cases performance issues are not caused by insufficient worker threads and most users won't need to worry about this.  

If your SQL instance does run out of worker threads you should identify and fix the root cause of the issue.  A common root cause would be blocking for example. You might also run into issues using Availability Groups with a large number of databases.

⚠️It's not recommended to adjust the maximum number of worker threads.

## Other

See [2.49.0](https://github.com/trimble-oss/dba-dash/releases/tag/2.49.0) release notes for a full list of fixes.