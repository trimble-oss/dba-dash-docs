---
title: "What's new in 2.36.0?"
description: ""
excerpt: ""
date: 2023-02-26T13:43:10Z
lastmod: 2023-02-26T13:43:10Z
draft: false
weight: 50
images: [corruption_info.png]
categories: []
tags: []
contributors: []
pinned: false
homepage: false
---
## Corruption Drilldown

DBA Dash will highlight detected corruption on the Summary tab (Checking msdb.dbo.suspect_pages, sys.dm_hadr_auto_page_repair & sys.dm_db_mirroring_auto_page_repair). Previously this was just a red square with no additional information when corruption was detected. It now displays how long ago corruption was detected with a link you can use to get more information on which databases are impacted.  The "More Info" column provides a script you can run on the SQL instance to get more detailed information.

When corruption is detected you should investigate and fix the root cause of the corruption.  Validate that your databases are free of corruption by running DBCC CHECKDB and take manual action to repair the corruption if needed.  There are various options to recover from corruption such as [page level restores](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-pages-sql-server?view=sql-server-ver16) and the DBCC CHECKDB REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS options.  If corruption is on a non-clustered index dropping and re-creating the index is an option.  Recovering from corruption is outside the scope of this blog post.  

{{< alert icon="💡" text="REPAIR_ALLOW_DATA_LOSS should only be used as a last resort.  As it's name implies, this command is likely to result in data loss." />}} 

The "Corruption Info" dialog gives you an option to "Acknowledge" the corruption once it's been investigated and fixed.  The alert will remain cleared until there is a new incident of corruption been detected - allowing you to keep focused on the things that require your attention.

The corruption alert will also check the row counts in msdb.dbo.suspect_pages.  This table is limited to 1000 rows and needs to be cleared out manually by the DBA or new incidents of corruption won't be detected. DBA Dash will highlight red at 1000 rows and orange at 800.  The hadr and mirroring auto page repair tables are limited to 100 rows but old entries are automatically replaced so no action is required on these tables. 

## Summary - Database State check

A check for database state has been added at summary level to highlight if a database is in recovery pending, suspect or emergency state.