---
title: "What's new in 4.0?"
description: "DBA Dash 4.0 upgrades to .NET 10 LTS, ensuring long-term support and improved performance. Major version upgrade with runtime requirement changes."
summary: "DBA Dash 4.0 upgrades to .NET 10 LTS, ensuring long-term support and improved performance. Major version upgrade with runtime requirement changes."
date: 2025-11-24T08:00:00+00:00
lastmod: 2025-12-01T08:00:00+00:00
draft: false
weight: 50
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Upgrading to .NET 10 LTS

Version 4.0.0 moves DBA Dash from .NET 8 to .NET 10, the latest Long Term Support (LTS) version of Microsoft's .NET platform. This upgrade provides several key benefits:

### Why .NET 10?

- **Extended Support Timeline**: .NET 10 LTS provides support until November 2028, while .NET 8 support ends in November 2026
- **Performance Improvements**: .NET 10 includes performance optimizations and memory usage improvements
- **Future-Proofing**: Positions DBA Dash to take advantage of future .NET enhancements and security updates
- **Security Enhancements**: Latest security improvements and patches from Microsoft

By upgrading to .NET 10 now we get immediate benefits and enjoy a longer period of Microsoft support for the .NET Runtime. Installing the .NET 10 Desktop runtime is quick & easy.

### What's Changed

This is a **maintenance release** focused solely on the .NET runtime upgrade. No new features or bug fixes are introduced in version 4.0.0 compared to 3.31.1. The major version change from 3 to 4 reflects the breaking nature of the .NET runtime requirement change.

## Runtime Requirements & Migration

{{< callout context="note" >}}
**Important**: The [.NET 10 Desktop Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) is required for this upgrade.

If the .NET 10 Desktop Runtime is not installed, DBA Dash will fail to start and prompt you to install the required runtime. The application will not run on older .NET versions.
{{< /callout >}}

### Upgrade Steps

Before upgrading to DBA Dash 4.0:

1. **Download and install** the [.NET 10 Desktop Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
2. **Verify installation** by running `dotnet --list-runtimes` in PowerShell/Command Prompt
3. **Upgrade DBA Dash** by following the upgrade instructions [here](/docs/setup/upgrades/).


## Additional Changes

See the [4.0.0 release notes](https://github.com/trimble-oss/dba-dash/releases/tag/4.0.0) for a complete list of fixes and improvements.

Version [4.0.1](https://github.com/trimble-oss/dba-dash/releases/tag/4.0.1) is now marked as the latest release.  It fixes a query store bug and ensures the service user has logon as a service rights for a smoother installation experience.
