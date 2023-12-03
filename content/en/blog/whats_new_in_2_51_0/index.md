---
title: "What's new in 2.51.0?"
description: ""
excerpt: ""
date: 2023-12-03T17:50:18Z
lastmod: 2023-12-03T17:50:18Z
draft: false
weight: 50
images: [cell-highlighting.png]
categories: []
tags: []
contributors: []
pinned: false
homepage: false
---
## Cell Highlighting for Custom Reports

Custom reports can now have conditional cell formatting applied.  This is already used in a variety of places in DBA Dash to highlight items that require your attention.  For example, coloring cells Red, Amber & Green.  You can now apply conditional formatting to your own custom reports.  You can use the existing statuses that are used elsewhere in DBA Dash or set your own custom BackColor, ForeColor and Font.  Once you have defined your set of rules, these can be quickly applied to other columns with a copy/paste feature.

[See here for more info](/docs/how-to/create-custom-reports/#cell-highlighting-rules)

## Running Queries improvement

New blocking filters added in addition to Root Blockers:

* Blocked Queries
* Blocking Queries
* Blocked Or Blocking

The back button is enabled when accessing from the blocking bubble chart.

## Tooltips are now truncated to 1000 chars

This fixes a performance/stability issue with wide query text in the running queries tab or slow queries tab.  1000 chars seems to be the sweet spot, but you can [adjust it](/docs/help/faq/#how-do-i-customize-the-tooltip-length-in-the-grid) if you need to.  

## Other

See [2.51.0](https://github.com/trimble-oss/dba-dash/releases/tag/2.51.0) release notes for a full list of fixes.