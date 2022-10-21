---
title: "Quick Start"
description: "One page summary of how to setup DBA Dash"
lead: "One page summary of how to setup DBA Dash"
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

Repository DB:

* SQL 2016 SP1 or later, including Azure DB and RDS (SQL Server)
  
Monitored Instances:

* SQL 2005-2022, including Azure DB and RDS (SQL Server)
  
DBA Dash Service:

* {{< details ".NET Framework 6 Runtime (desktop apps).  Version 6.0.2 or later" >}}
[Download .NET 6 Desktop Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/6.0/runtime)

If the .NET 6 runtime is not installed, you will be prompted to install it when you try to run the application.  

If you have an older version of the .NET framework installed (6.0.0 or 6.0.1), the **application will fail to start** (no errors).  This is due to a [breaking change in 6.0.2](https://github.com/trimble-oss/dba-dash/issues/42).  If you want to check the version of the .NET runtime you have installed you can run:

`dotnet --list-runtimes`


{{< /details >}}
* Account to run the service with [appropriate permissions](/docs/help/security/) to connect to the monitored instances and repository database instance
  
{{< alert icon="💡" text="You can run the DBADashService.exe console app as your own user account without installing as a service for testing purposes" />}}

## Setup

![DBA Dash setup](https://raw.githubusercontent.com/DavidWiseman/testinggithubpages/372055731112a47f4552192ea88a432e99b941c5/DBADashSetup.gif)

1. Download the latest release from GitHub:
  
<a id='full-download' class="btn btn-primary btn-lg px-4 mb-2" target="_blank" href="https://github.com/trimble-oss/dba-dash/releases" title="Download latest version of DBA Dash" role="button">Download</a>

*(Select the one labelled DBADash_{version}.zip)*

2. Extract the files to a folder of your choosing
3. Run DBADashServiceConfigTool.exe

{{< alert icon="⚠️" text="If the application fails to start, please ensure you have .NET Framework 6 Runtime (desktop apps) 6.0.2 or later installed.  See Requirements" />}}

4. Set a destination connection

{{< alert icon="💡" text="The destination connection is the SQL instance where your DBA Dash repository database is to be located" />}}
{{< alert icon="⚠️" text="Use Windows authentication where possible." />}}
 [ServiceConfig.json](/docs/help/security/#config-file-security) is used to store the connection details.

1. Click the "Source" tab
2. Click the connect button to add a source connection (monitored instance)

{{< alert icon="💡" text="Add multiple instances at the same time by entering a connection string or instance name on each line in the source textbox" />}}

7. Review the options available on the "Extended Events" and "Other" tab. 
8. Click "Add/Update" to add the source connection(s)
9. Repeat the process of adding source connections as necessary 
10. Click "Save".

{{< alert icon="💡" text="Your settings are stored in a file called ServiceConfig.json" />}}

11. Click the "Destination" tab
12. Click the "Install as service button"
13. Click Install and enter credentials for the service.
14. Click Start
  
{{< alert icon="💡" text="Click View Service Log button to see what the service is doing.  It will take a few moments to create the repository database and start collecting data." />}}

15. All done! Run DBADash.exe to see the data collected 🎉

