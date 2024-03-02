---
title: "Move DBA Dash Service"
description: "Move an existing DBA Dash service to another computer"
lead: ""
date: 2024-03-02T16:23:39Z
lastmod: 2024-03-02T16:23:39Z
draft: false
images: []
menu:
  docs:
    parent: ""
    identifier: "move-service-5933a1cd261bb215881a2f5e351c150b"
weight: 1000
toc: true
---

## Move the Repository Database

* Use backup/restore to move the database to the new server.
* Ensure the DBA Dash service account has access to the repository database on the new server.
* Change the destination connection in the service config tool to point to the new instance.

## Move the Service:

* Copy/Paste the app folder from one server to the other.  Or download a fresh copy of DBA Dash and transfer the **ServiceConfig.json** file.  All configuration made using the config tool is in this file.  You might also have a **commandTimeouts.json** file and a **PerformanceCountersCustom.xml** file if you customized timeouts or performance counters.

* If the config is encrypted, you will need to supply the password when you load the config tool on the new server.  Once you load the service configuration tool, click the **Configure Encryption** button again and update.  This is necessary to create a temporary password that the service account can use to decrypt the config (still protected by the machine key).

* Ensure the service account has permissions to write to the app folder on the new server.  Limit access to other accounts to this folder.

* The service is configured already so click the **Install as a service** link in the service configuration tool.  If you use the same service account as the old server it will make things easier with permissions.  Or you will need to ensure the new service account has permissions to your monitored instances.  Using a group managed service account is a good option.

* Stop the service on the old server and start it on the new server.  If everything works as expected, click the link to uninstall the service on the old server.