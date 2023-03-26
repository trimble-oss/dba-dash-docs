---
title: "What's new in 2.38.0"
description: ""
excerpt: ""
date: 2023-03-26T09:30:58+01:00
lastmod: 2023-03-26T09:30:58+01:00
draft: false
weight: 50
images: [2_38_0.png]
categories: []
tags: []
contributors: []
pinned: false
homepage: false
---
## Customize Query Timeouts

[Collection query timeouts can now be customized](/docs/help/query-timeout/).  Although the default settings should work well for most users, the ability to set custom timeouts provides additional flexibility.

## Performance improvements

The performance of Tree has been significantly enhanced for users with a large number of databases. Databases have been moved to a dedicated "Databases" folder, which eliminates the need to enumerate the entire list of databases when expanding an instance. This results in much faster expanding times, with an extreme case of ~8K databases taking only a few milliseconds to expand without the databases. Expanding the databases folder now takes ~1 second for this example. In addition, the Summary tab performance has also been improved.

## Other

The DB Space tab is now located in the new "Databases" folder.

See [here](https://github.com/trimble-oss/dba-dash/releases/tag/2.38.0) for a full list of fixes.