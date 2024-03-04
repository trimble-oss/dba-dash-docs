---
title: "CLI Installation"
description: "Automate DBA DAsh installation from the command line"
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
weight: 130
toc: true
---
Use [quick start](../quick-start) to get up and running quickly, or continue on this page to learn how to automate DBA Dash deployments.

## Download

To download the latest version of DBA Dash and extract it to the "C:\DBADash" folder:

```powershell
$InstallPath = "C:\DBADash"

$Repo = "trimble-oss/dba-dash"

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Tag = (Invoke-WebRequest "https://api.github.com/repos/$Repo/releases/latest" | ConvertFrom-Json).tag_name

if (!(Test-Path -Path $InstallPath)){
    New-Item -Path $InstallPath -ItemType Directory
}

if ((Get-ChildItem -Path $InstallPath | Measure-Object).Count -gt 0){
    throw "Destination folder is not empty" 
}

cd $InstallPath
$zip = "DBADash_$Tag.zip"

$download = "https://github.com/$Repo/releases/download/$Tag/$zip"
Invoke-WebRequest $download -Out $zip

Expand-Archive -Path $zip -DestinationPath $InstallPath -Force -ErrorAction Stop

Start-Process DBADashServiceConfigTool.exe
```

## Set Destination connection

```cmd
DBADashConfig -c "Data Source=localhost;Integrated Security=SSPI;Initial Catalog=DBADashDB;Encrypt=True;TrustServerCertificate=True;" -a SetDestination
```

## Add Destination connection

Use the **SetDestination** instead to add/update the primary destination connection.  AddDestination can be used to add secondary destinations (less commonly used).  e.g. Write to a local DBA Dash repository database AND a S3 bucket.  If the primary destination doesn't exist, AddDestination will set the primary destination.  

```cmd
DBADashConfig -c "https://mybucket.s3.amazonaws.com/DBADash" -a AddDestination
```

## Remove Destination connection

Use the RemoveDestination action to remove a secondary destination added with AddDestination.

```cmd
DBADashConfig -c "https://mybucket.s3.amazonaws.com/DBADash" -a RemoveDestination
```

## Add Source connection

```cmd
DBADashConfig -c "Data Source=localhost;Integrated Security=SSPI;Encrypt=True;TrustServerCertificate=True;" -a Add --PlanCollectionEnabled --SlowQueryThresholdMs 1000 --SchemaSnapshotDBs "*"
```

## Remove connection

```
DBADashConfig -a "Remove" -c "Data Source=localhost;Integrated Security=SSPI;Encrypt=True;TrustServerCertificate=True;"
```

## Install Service

Domain user
```cmd
DBADashService install --username "Domain\DBADash" --password "YourPassword"
```

Managed service user:
```cmd
DBADashService install --username "Domain\DBADash$"
```

Local system:
```cmd
DBADashService install --localsystem
```

See `DBADashService install --help`

## Uninstall Service

```cmd
DBADashService uninstall
```

## Start Service

```cmd
DBADashService start
```

`net start DBADashService` can also be used.


## Stop Service

```cmd
DBADashService stop
```

`net stop DBADashService` can also be used.

## Set Service Name

Change the service name if you want to have more than 1 instance of the DBA Dash service installed.

```cmd
DBADashConfig -a SetServiceName --ServiceName "MyDBADashService"
```

## Get Help

```cmd
DBADashConfig --help
```

## Upgrade DBA Dash

```cmd
DBADashConfig -a Update
```

Or (Supported on old versions of DBA Dash):

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri https://raw.githubusercontent.com/trimble-oss/dba-dash/main/Scripts/UpgradeDBADash.ps1 -OutFile UpgradeDBADash.ps1
./UpgradeDBADash.ps1
```

For a specific version:
```powershell
./UpgradeDBADash.ps1 -Tag 2.22.0
```
