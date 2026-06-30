---
title: "What's new in 4.13?"
description: "Highlights from the DBA Dash 4.13.0 release: trigger collections across multiple instances, system report conversions, inline drill-down panels, and custom report layout improvements."
summary: "Trigger collections across multiple instances, system report conversions for Backups, Log Shipping, Drives, SQL Patching, Job Status, Files, and DBSpace, inline child report panels, and custom report layout improvements."
date: 2026-06-29T00:00:00+00:00
lastmod: 2026-06-29T00:00:00+00:00
draft: false
weight: 50
categories: [Releases]
tags: [4.13, releases, custom-reports, system-reports]
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Trigger collections across multiple instances

You can now trigger collections across multiple instances at once. Previously, collections could only be triggered one instance at a time. This is available on all tabs that have been converted to system reports, including the newly converted tabs in this release.

[![Trigger collections](trigger-collections.png)](trigger-collections.png)

## System report conversions

In [4.12](../whats_new_in_4_12_0/), the DB Options tab was converted to a system report. This release continues that effort, converting the following tabs to system reports:

* **Backups**
* **Log Shipping**
* **Drives**
* **SQL Patching**
* **Job Status**
* **DB Files**
* **DB Space**

Converting to system reports simplifies the codebase and allows these tabs to benefit from custom report features such as triggering collections and opening in a new window.

## Custom report layout improvements

Custom reports now have better sizing of panels and more effective use of available space.

## Availability Group tab update

The Availability Group summary report now includes a trigger collection option. A bug where the snapshot date wasn't being reported has been fixed.

## Pre-release upgrade support

You can now automatically upgrade to a pre-release version of DBA Dash.

[![Pre-release upgrade option](pre-release.png)](pre-release.png)

{{< callout context="caution" icon="outline/alert-triangle" >}}
Pre-release versions are intended for testing and are not recommended for production.
{{< /callout >}}

## Other improvements

See the [4.13.0 release notes](https://github.com/trimble-oss/dba-dash/releases/tag/4.13.0) for a full list of fixes and improvements.
