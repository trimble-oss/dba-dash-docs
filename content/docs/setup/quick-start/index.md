---
title: "Quick Start"
description: "One page summary of how to setup DBA Dash"
lead: ""
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
weight: 110
toc: true
---
## Requirements

### Repository DB:

* SQL 2016 SP1 **or later**, including Azure DB⁽¹⁾, Managed Instance and RDS (SQL Server)

  *⁽¹⁾The [Messaging](/docs/help/messaging) feature requires service broker which isn't supported on Azure DB.*

### Monitored Instances:

* SQL 2005-2025, including Azure DB, Managed Instance and RDS (SQL Server)

### DBA Dash Service:

* {{< details ".NET 8/10 Desktop Runtime.  Version 10.0.0 or later" >}}
[Download .NET 10 Desktop Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/10.0/runtime)

*Note:*
* Versions 4.x use [.NET 10.](https://dotnet.microsoft.com/en-us/download/dotnet/10.0/runtime)
* Versions 3.x use [.NET 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0/runtime).
* Versions 2.x of DBA Dash use [.NET 6](https://dotnet.microsoft.com/en-us/download/dotnet/6.0/runtime).

`dotnet --list-runtimes`

{{< /details >}}
{{< callout context="caution" >}}
DBA Dash is in a [transition period](/blog/whats-new-in-4.0/) between .NET 8 and .NET 10.  [.NET 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0/runtime) is the current runtime for the latest 3.x release.  [.NET 10.](https://dotnet.microsoft.com/en-us/download/dotnet/10.0/runtime) is the runtime for the 4.x prerelease.
{{< /callout >}}

* A user account to run the service with [appropriate permissions](/docs/help/security/) to connect to the monitored instances and repository database instance.  This account requires **Log on as a service**.

{{< details "Grant Log on as a service" >}}

To run as a Windows service, accounts need the **Logon as a service** right.  This should be granted by default if you are LocalSystem, LocalService, NetworkService or a managed service account.  A managed service account is recommended.

* Start, run.  gpedit.msc
* Navigate to [*Computer Configuration\Windows Settings\Security Settings\Local Policies\User Rights Assignment*](logon-as-a-service.png)
* Double click *Log on as a service*
* Click *Add User or Group...*
* Add the user account & click OK.

{{< /details >}}

{{< callout context="note" icon="outline/info-circle" >}}
A [managed service account](https://github.com/trimble-oss/dba-dash/blob/main/DBADashServiceConfig/CreateMSA.ps1) is the best option as it allows you to use Windows authentication and the password of the account is automatically rotated for you. It should also have the logon as a service right automatically.  A regular domain account can be used, but you will need to grant **Log on as a service**.  You will also need to manage the rotation of the password (set it to never expire to avoid issues with password expiry and rotate manually).  A local account can also be used, but you will need to use SQL authentication to connect to your monitored instances.
{{< /callout >}}

{{< callout context="note" icon="outline/info-circle" >}}
DBA Dash now includes a [Permissions Helper](/docs/help/permissions-helper) as part of the config tool to help you assign the appropriate permissions.  Configure the destination & source connections and install the service.  Use the Permissions Helper to assign permissions to the service account.
{{< /callout >}}

{{< callout context="note" icon="outline/info-circle" >}}
You can run the DBADashService.exe console app as your own user account without installing as a service for testing purposes
{{< /callout >}}

## Setup

1. Download the latest release from GitHub:

<a id='full-download' class="btn btn-primary btn-lg px-4 mb-2" target="_blank" href="https://github.com/trimble-oss/dba-dash/releases" title="Download latest version of DBA Dash" role="button">Download</a>

*(Select the one labelled DBADash_{version}.zip)*

2. Extract the files to a folder of your choosing

{{< callout context="caution" icon="outline/alert-triangle" >}}
Please secure access to this folder.  See [security document](/docs/help/security) for more information.
{{< /callout >}}

3. Run DBADashServiceConfigTool.exe

{{< callout context="caution" icon="outline/alert-triangle" >}}
If the application fails to start, please ensure you have .NET Framework 8 Runtime (desktop apps) installed.  See Requirements
{{< /callout >}}

4. Set a destination connection

{{< callout context="note" icon="outline/info-circle" >}}
The destination connection is the SQL instance where your DBA Dash repository database is to be located. By default this is set to DBADashDB and the database will be created automatically when the service starts. If you select an existing database it will need to be completely blank with no existing objects created.
{{< /callout >}}
{{< callout context="note" icon="outline/info-circle" >}}
Use Windows authentication where possible.
{{< /callout >}}

5. Click the "Source" tab
6. Click the connect button to add a source connection (monitored instance)

{{< callout context="note" icon="outline/info-circle" >}}
Add multiple instances at the same time by entering a connection string or instance name on each line in the source textbox
{{< /callout >}}

7. Review the options available on the "Extended Events" and "Other" tab.
8. Click "Add/Update" to add the source connection(s)
9. Repeat the process of adding source connections as necessary
10.  Click "Save".

{{< callout context="note" icon="outline/info-circle" >}}
Your settings are stored in a file called [ServiceConfig.json](/docs/help/security/#config-file-security).  You can protect this by clicking *Configure Encryption* on the *Options* tab.
{{< /callout >}}

11.  Click the "Destination" tab
12.  Click the "Install as service link"
13.  Click Install and enter credentials for the service.

{{< callout context="note" icon="info" >}}
You can use the script in the "Script to create service account" link to help create a managed service account.
{{< /callout >}}

14. If you haven't already done so, use the Permissions Helper button to assign permissions to the service account and/or review the [security document](/docs/help/security) and configure the permissions manually.

15.  Click Start

{{< callout context="note" icon="outline/info-circle" >}}
Click View Service Log button to see what the service is doing.  It will take a few moments to create the repository database and start collecting data.
{{< /callout >}}

16.  All done! Run DBADash.exe to see the data collected 🎉

