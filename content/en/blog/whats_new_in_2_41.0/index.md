---
title: "What's new in 2.41.0?"
description: ""
excerpt: ""
date: 2023-06-12T11:01:43+01:00
lastmod: 2023-06-12T11:01:43+01:00
draft: false
weight: 50
images: [config-file-encryption.png]
categories: []
tags: []
contributors: []
pinned: false
homepage: false
---
## Config file encryption

You can now encrypt the config file providing better protection for any sensitive information stored such as passwords and access keys.  Ideally you should avoid storing any passwords in the config file but there are some situations where this is not possible.  Using config file encryption will help keep this data secure.  

[See here](/docs/help/config-file) for more information.

{{< alert icon="💡" text="Passwords and access keys are <b>obfuscated</b> even if encryption isn't used.  The encryption option provides much stronger protection and applies to the whole config." />}}


## Config file backup retention

DBA Dash automatically creates backups of your configuration. This provides the option to rollback to a previous config if you make a mistake.  These backups are now automatically cleared out after 7 days and no longer need to be removed manually. In the **Options** tab of the service configuration tool you can configure the retention.  If retention is set to 0, config backups won't be created.

If you enable config file encryption you might have backups of the config before you enabled encryption - potentially containing sensitive data that is not protected. The new retention policy ensures that those files do not remain indefinitely.  There is a "Delete Config Backups" in the **Options** tab that you can use to clear out ALL config backups immediately.  

## Other

See [2.41.0](https://github.com/trimble-oss/dba-dash/releases/tag/2.41.0) release notes for a full list of fixes.

