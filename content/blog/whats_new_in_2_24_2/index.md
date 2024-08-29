---
title: "What's new in 2.24.2"
description: "WMI collection improvements..."
excerpt: ""
summary: "WMI collection improvements..."
date: 2022-10-26T15:07:12+01:00
lastmod: 2022-10-26T15:07:12+01:00
draft: false
weight: 50
images: [2_24_2.png]
categories: [Releases]
tags: []
contributors: [David Wiseman]
pinned: false
homepage: false
---
## Changes to WMI Collections

Changes have been made to [WMI collections](/docs/help/wmi) - relating to issue [#299](https://github.com/trimble-oss/dba-dash/issues/299).  The collections are now done through Microsoft.Management.Infrastructure instead of System.Management. This is the [newer/reccomended](https://learn.microsoft.com/en-us/windows/win32/wmisdk/connecting-to-wmi-remotely-with-c-) way make WMI calls in .NET.  By default the WMI calls will now use WSMan/WinRM instead of DCOM.  This uses 1 dedicated firewall port (5985) so it's easier to provision access.  Unfortunatley local admin permissions are still needed for WMI calls to work.

If you are familiar with PowerShell, the old method was similar to:
```powershell
Get-WmiObject -Class Win32_computerSystem -ComputerName "NAME_HERE"
```

The new method is similar to :
```powershell
Get-CimInstance -Class Win32_computerSystem -ComputerName "NAME_HERE"
```

Switching to use just WSMan is potentially a breaking change so DBA Dash will first attempt to connect via WSMan then use DCOM if that fails.  This is similar to using the old `Get-WmiObject` or passing the DCOM protocol session option:

```powershell
[Microsoft.Management.Infrastructure.CimCmdlets.ProtocolType]$Protocol = 'DCOM'

$option = New-CimSessionOption -Protocol $protocol
$session = New-CimSession -ComputerName "LAB2012" -SessionOption $option
Get-CimInstance -CimSession $session -ClassName Win32_computerSystem
```

Testing which method works adds a potential performnace overhead.  This is avoided by caching the protocol option so that it will be used for any subsequent WMI collections.

As part of the drivers collection, a registry key is read to determine the PV driver version (For AWS).  Previously this used `RegistryKey.OpenRemoteBaseKey` which required a different port to be enabled and the remote registry service to be running.  This is now done using `Microsoft.Management.Infrastructure` which simplifies access.

### How do I get WMI collections to work?

On servers WinRM should be enabled by default.  If you need to [enable it manually](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enable-psremoting?view=powershell-7.2), run this on the monitored instance:

```powershell
Enable-PSRemoting -SkipNetworkProfileCheck -Force
```

This does a number of tasks including creating the firewall exception.

The DBA Dash service account should be a member of the local administrators group on the monitored instance.

```powershell
## Option to add new service account to local admins to get WMI calls to work
Invoke-Command -ComputerName SQL1,SQL2 -ScriptBlock {Add-LocalGroupMember -Group "Administrators" -Member "DBADash$" }
```

### Further reading:

[WMI Collections](/docs/help/wmi)

[https://powershell.one/wmi/remote-access](https://powershell.one/wmi/remote-access)

## Other changes

2.24.2 also includes a few other fixes and improvements:
* Fix for backup collection on re-named instances
* Progress bar fix for drive free space
* Connect dialog database list is now sorted alphabetically

[See here](https://github.com/trimble-oss/dba-dash/releases/tag/2.24.2) for a full list of changes.
