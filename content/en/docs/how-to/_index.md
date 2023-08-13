---
title: "How-to"
description: "How To"
lead: ""
date: 2023-08-02T10:14:39+01:00
lastmod: 2023-08-02T10:14:39+01:00
draft: false
images: []
weight: 600
---
When client applications query SQL Server they can specify a timeout value.  If data isn't returned within the configured amount of time, the query is cancelled by the client application.  The default timeout in .NET is 30 seconds unless a developer specifically overrides this timeout.  It's important to specify a timeout value that is appropriate for your query - too long or too short query timeouts can both cause issues.



DBA Dash makes it easy to troubleshoot query timeouts.