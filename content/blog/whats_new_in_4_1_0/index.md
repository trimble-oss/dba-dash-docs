---
title: "What's new in 4.1?"
description: "Improvements to memory, waits, forced plans & slow queries tabs"
summary: "Improvements to memory, waits, forced plans & slow queries tabs"
date: 2025-12-08T08:00:00+00:00
lastmod: 2025-12-08T08:00:00+00:00
draft: false
weight: 50
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Memory Analysis Enhancement

The Memory tab now displays **maximum**, **average**, and **minimum** values alongside current readings. This historical view makes it easy to identify memory clerk issues that occurred during your selected time range, even if they're not currently active.

[![Memory tab improvements](memory.png)](memory.png)

## Waits Visualization

The Waits tab now includes the waits bar chart, previously only available on the Performance tab. This consolidates all wait analysis tools in one location for a streamlined troubleshooting workflow.

[![Waits tab improvements](waits.png)](waits.png)

## Flexible Form Management

Forms can now be configured to either close existing instances when opening new ones (default) or allow multiple instances to remain open simultaneously. Quickly load new form instances without the extra step of closing the existing form.  Or keep existing forms open to refer to later or for side-by-side comparisons.

[![Single Instance Forms](single-instance.png)](single-instance.png)

## Community Contributions

Thank you [Mark Cilia Vincenti](https://github.com/MarkCiliaVincenti) for [this PR](https://github.com/trimble-oss/dba-dash/pull/1665) to reduce code complexity.

## Other Improvements

* **Slow Queries tab**: Added clickable links on *Object Name* column
* **Forced Plans tab**: Added navigation links for *Query ID*, *Plan ID*, *Object Name*, *Query Hash*, and *Plan Hash* columns
* **Running Queries tab**: Additional grouping options added.
* Performance optimizations
* Service config tool now automatically grants "logon as a service" rights for smoother installations *(added in 4.0.1)*

See the [4.1.0 release notes](https://github.com/trimble-oss/dba-dash/releases/tag/4.1.0) for a complete list of fixes and improvements.


