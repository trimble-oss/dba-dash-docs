---
title: "Move DBA Dash Service"
description: "Move an existing DBA Dash service to another computer"
lead: ""
date: 2024-03-02T16:23:39Z
lastmod: 2026-10-27T00:00:00+00:00
draft: false
images: []
menu:
  docs:
    parent: ""
    identifier: "move-service-5933a1cd261bb215881a2f5e351c150b"
weight: 1000
toc: true
slug: "move-service"
---

## Move the Repository Database

* Use backup/restore to move the database to the new server.
* Ensure the DBA Dash service account has access to the repository database on the new server.
* Change the destination connection in the service config tool to point to the new instance.

## Move the Service:

* Copy/Paste the app folder from one server to the other.  Or download a fresh copy of DBA Dash and transfer the **ServiceConfig.json** file.  All configuration made using the config tool is in this file.  You might also have a **commandTimeouts.json** file and a **PerformanceCountersCustom.xml** file if you customized timeouts or performance counters.

* Prefer **Export Config** in the service config tool (or `DBADashConfig -a Export`) on the original machine. An unencrypted config protects SQL passwords and the AWS secret key with a machine key, so those values cannot be decrypted after the file is copied. The export writes a separate file: either with the secrets protected by an export password, or with the secrets left out to be entered on the new machine. See [Moving the config](/docs/help/config-file/#moving-the-config).

* If the config is encrypted, you will need to supply the password when you load the config tool on the new server. Secrets in an encrypted config move with that password. Once you load the service configuration tool, click the **Configure Encryption** button again and update. This creates a temporary password that the service account can use to decrypt the config (still protected by the machine key).

* If you copied an unencrypted config and the config tool lists passwords it cannot decrypt, enter them in that grid before you install the service. The service will not start when the destination password cannot be decrypted, and it will skip any source whose password cannot be decrypted.

* Ensure the service account has permissions to write to the app folder on the new server.  Limit access to other accounts to this folder.

* The service is configured already so click the **Install as a service** link in the service configuration tool.  If you use the same service account as the old server it will make things easier with permissions.  Or you will need to ensure the new service account has permissions to your monitored instances.  Using a group managed service account is a good option.

* Stop the service on the old server and start it on the new server.  If everything works as expected, click the link to uninstall the service on the old server.
