---
title: "What's new in 2.37.0?"
description: ""
excerpt: ""
date: 2023-03-20T19:41:33Z
lastmod: 2023-03-20T19:41:33Z
draft: false
weight: 50
images: [alert_acknowledge.png]
categories: []
tags: []
contributors: []
pinned: false
homepage: false
---
## Alert Acknowledgement & Configuration

Alerts previously had no configuration options.  When triggered an alert would either highlight as warning for 3 days or critical for 7 days with no way to clear the alert. Critical status would apply to alerts for message_id 823-825 and severity>20 and all other alerts would have warning status.  

Alerts can now be acknowledged by clicking the Acknowledge link or selecting Acknowledge ALL from the Options menu.  The configure link can now be used to override the default notification period and the default alert level.  

## Instance uptime menu option

Menu option added on Summary tab for acknowledging instance uptime and configuring root level thresholds. (Added in 2.36.1)

## Summary tab column sizing

More compact column widths are used to minimize horizontal scrolling.  (Added in 2.36.1)

## Processor info collection via WMI

Processor name is now collected via WMI.  This is also collected via SQL but only if service account has sysadmin role membership.  (Added in 2.36.1)

## Other

See [here](https://github.com/trimble-oss/dba-dash/releases/tag/2.37.0) for a full list of fixes.