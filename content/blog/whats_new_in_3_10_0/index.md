---
title: "What's new in 3.10?"
description: "Improved connection dialog with support for Entra authentication"
summary: "Improved connection dialog with support for Entra authentication"
date: 2024-09-15T16:52:00+01:00
lastmod: 2024-09-15T16:52:00+01:00
draft: false
weight: 50
images: []
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Improved Connection Dialog

The connection dialog includes a number of improvements including support for Entra authentication!

### Old dialog:

[![Old Connection Dialog](old-connect-dialog.png)](old-connect-dialog.png)

### New dialog:

[![Connection Dialog](connect-dialog.png)](connect-dialog.png)

* Added support for Entra authentication.
    * Microsoft Entra MFA
    * Microsoft Entra Password
    * Microsoft Entra Service Principal
    * Microsoft Entra Managed Identity
    * Microsoft Entra Default

* Added Additional "Strict" encryption option.
* Trust server certificate unchecked by default.  This is inline with similar changes Microsoft have made to SSMS to improve security.
* Added Host name in certificate option.
* Added option to supply additional connection string options


## Support added for monitoring read replicas in Azure

This is now possible by adding `ApplicationIntent=ReadOnly` to the connection string in the config tool to target the read replica.  This would previously be blocked by the config tool as it would detect the read replica as a duplicate connection.

## Other

See [3.10.0](https://github.com/trimble-oss/dba-dash/releases/tag/3.10.0) release notes for a full list of fixes.
