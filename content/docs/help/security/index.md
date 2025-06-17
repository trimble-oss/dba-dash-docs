---
title: "Security"
description: ""
lead: ""
date: 2022-09-25T20:30:12+01:00
lastmod: 2022-09-25T20:30:12+01:00
draft: false
images: []
menu:
  docs:
    parent: "help"
    identifier: "security-a9e852d79358e8e1c846db81d9b1bef6"
weight: 999
toc: true
---
## DBA Dash service folder & Config file

Please ensure that you secure access to the folder where the DBA Dash service runs.  Limit who can access the computer where the service account runs and also secure access to the folder using NTFS permissions.

Why?  If someone has permissions to the service folder it's possible they could elevate their permissions by replacing the service executable.  It also provides a layer of protection for the  **ServiceConfig.json** file.

Note: The [service account](#service-account) should have read/write access to the folder.

### ServiceConfig.json

The application configuration is stored in a **ServiceConfig.json** file.  This file *can* contain sensitive data such as passwords and you also don't want unauthorized users to be able to manipulate this file.

* Enable config file encryption.
* Use a strong password to encrypt the config.
* Avoid storing sensitive information in the config file if possible.

*e.g. Use Windows authentication where possible.  Use IAM roles to provide access to S3 buckets instead of access keys*

* Limit access to the config file.
* Use the principal of least privilege.

## Service Account

Using a domain user account as the service account is recommended as it allows you to use Windows authentication to connect to your monitored instances.  A [managed service account](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/service-accounts-group-managed) is the best type of domain user account as it avoids the need to configure and rotate passwords.  [This script](https://github.com/trimble-oss/dba-dash/blob/main/DBADashServiceConfig/CreateMSA.ps1) can be used to create a managed service account for DBA Dash.  If you prefer to use a regular domain user account, that will also work.  A local account will also work, but you will need to use SQL authentication to connect to your monitored instances.

To assign permissions to the service account, the [Permissions Helper](/docs/help/permissions-helper) can be used.

#### Local Admin for WMI

If you want to use [WMI](/docs/wmi) collections (optional), the service account will need to be a local admin on the monitored instances.  The main benefit of WMI is it allows you to collect drive space for ALL drives on your monitored instance - otherwise only the drives that contain SQL files are collected.  See the [WMI](/docs/wmi) doc for more info.  The [Permissions Helper](/docs/help/permissions-helper) has a button that will grant local admin access.  Or you can use PowerShell.

```pwsh
## Option to add new service account to local admins to get WMI calls to work
Invoke-Command -ComputerName SQL1,SQL2 -ScriptBlock {Add-LocalGroupMember -Group "Administrators" -Member "DBADash$" }
```

#### SysAdmin

The service account *doesn't* require sysadmin access, but the sysadmin role allows a small amount of additional information to be collected.  The [Permissions Helper](/docs/help/permissions-helper) doesn't assign *sysadmin* by default, but it's available for selection if required.

{{< details "What does sysadmin provide?" >}}

Sysadmin permissions enable the following data to be collected.

* [This collection](https://github.com/trimble-oss/dba-dash/blob/main/DBADash/SQL/SQLServerExtraProperties.sql) needs sysadmin permissions to read data from the registry like processor name, manufacturer and model.  These might be collected anyway if you have WMI enabled.
* SQL Server instances **older** than 2014 require sysadmin permissions to collect [last good check db time](https://github.com/trimble-oss/dba-dash/blob/main/DBADash/SQL/SQLLastGoodCheckDB.sql).
* The active power plan collection either requires sysadmin permissions or the user needs to be granted EXECUTE permissions on xp_cmdshell and a proxy account configured.  Regardless of sysadmin permissions, the query only collects this data via SQL if xp_cmdshell is already enabled. This data is also collected via WMI if enabled - so sysadmin access isn't required in this instance.

````SQL
ALTER SERVER ROLE [sysadmin] ADD MEMBER [{LoginName}]
````

If you are on a modern version of SQL Server and you have granted local admin access to allow WMI collections to run there is little benefit in running with sysadmin over the more minimal permissions.

{{< /details >}}

### Recommended permissions for monitored instances

The [Permissions Helper](/docs/help/permissions-helper) can be used to assign permissions.

**Server Level Permissions:**
* View Server State
* View Any Database
* Connect Any Database
* Alter Event Session (For Slow Query trace if used)
* View Any Definition

**MSDB Database:**
* Add user to the *db_datareader* role.
* Add user to the *SQLAgentReaderRole* role or *SQLAgentOperatorRole* (If you want to allow job execution via the messaging feature)

This script can be used to provision the required permissions:
````SQL
/*
	Use this script to configure permissions for the DBA Dash service account if you don't want to use the sysadmin server role.
	DBA Dash can collect more data when running as sysadmin but most features and functionality will work with a more limited account
	See here for details: https://github.com/trimble-oss/dba-dash/edit/main/Docs/Security.md

	On the destination connection the service will need to be a member of db_owner role on the repository database
	To allow the service to create the repository database you can use:
	GRANT CREATE ANY DATABASE TO {LoginName}
*/
DECLARE @LoginName SYSNAME = 'DBADashService' /* !!!! Replace with your own service login !!!! */
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = N'
GRANT VIEW SERVER STATE TO ' + QUOTENAME(@LoginName) + '
GRANT VIEW ANY DATABASE TO ' + QUOTENAME(@LoginName) + '
GRANT CONNECT ANY DATABASE TO ' + QUOTENAME(@LoginName) + '
GRANT VIEW ANY DEFINITION TO ' + QUOTENAME(@LoginName) + '
GRANT ALTER ANY EVENT SESSION TO ' + QUOTENAME(@LoginName) + ' /* Required if you want to use slow query capture */
USE [msdb]
IF NOT EXISTS(SELECT *
			FROM msdb.sys.database_principals
			WHERE name = ' + QUOTENAME(@LoginName,'''') + ')
BEGIN
	CREATE USER ' + QUOTENAME(@LoginName) + ' FOR LOGIN ' + QUOTENAME(@LoginName) + '
END
ALTER ROLE [db_datareader] ADD MEMBER ' + QUOTENAME(@LoginName) + '
--ALTER ROLE [SQLAgentReaderRole] ADD MEMBER ' + QUOTENAME(@LoginName) + '
ALTER ROLE [SQLAgentOperatorRole] ADD MEMBER ' + QUOTENAME(@LoginName) + '
'
PRINT @SQL
EXEC sp_executesql @SQL
````

If you want to allow slow query capture, grant the following permissions in the user databases.

```sql
GRANT CREATE ANY DATABASE EVENT SESSION TO DBADashService;
GRANT ALTER ANY DATABASE EVENT SESSION TO DBADashService;
```

Additional permissions might be required for custom collections, custom checks, custom performance counters & community script execution.

#### Azure DB

For Azure DB, add the service account to the **##MS_ServerStateReader##** role in the master database.

e.g.
```sql
ALTER SERVER ROLE ##MS_ServerStateReader##
ADD MEMBER DBADashService
```

### Repository Database Permissions
The service will also need db_owner permissions to the repository database.  The repository database is created by clicking the "Deploy/Update Database" button in the service configuration tool, otherwise it's created when the service starts.  To allow the service account to create the repository database you can use:

````SQL
DECLARE @LoginName SYSNAME = 'DBADashService' /* !!!! Replace with your own service login !!!! */
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = N'
GRANT CREATE ANY DATABASE TO ' + QUOTENAME(@LoginName)
PRINT @SQL
EXEC sp_executesql @SQL
````

Or to grant the permissions after creating the repository database:

````SQL
DECLARE @LoginName SYSNAME = 'DBADashService' /* !!!! Replace with your own service login !!!! */
DECLARE @RepositoryName SYSNAME = 'DBADashDB' /* !!!! Replace with your own Repository Database Name (default:DBADashDB) !!!! */
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = N'
USE ' + QUOTENAME(@RepositoryName) + '
GO
CREATE USER ' + QUOTENAME(@LoginName) + ' FOR LOGIN ' + QUOTENAME(@LoginName) + '
GO
ALTER ROLE [db_owner] ADD MEMBER ' + QUOTENAME(@LoginName)
PRINT @SQL
EXEC sp_executesql @SQL
````

### Firewall

DBA Dash collects most of it's data via a SQL connection (Typically port 1433).  If you check the "No WMI" box when adding a connection then ALL data will be collected via the SQL connection and no additional firewall configuration would be required.

Starting with version 2.24.2, DBA Dash uses WSMan/WinRM protocol for WMI data collections which uses port 5985.  On servers WinRM should be enabled by default.  If you need to [enable it manually](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enable-psremoting?view=powershell-7.2), run this on the monitored instance:

```powershell
Enable-PSRemoting -SkipNetworkProfileCheck -Force
```

This does a number of tasks including creating the firewall exception (port 5985).  [See here](/docs/help/wmi) for more information on WMI collections.


## DBA Dash GUI

To use the DBA Dash GUI, users only need access to the DBA Dash repository database.  No access is required to the monitored instances.  To grant the minimum permissions to run the DBA Dash GUI, add the user the the **App** role in the DBA Dash database. This grants the user SELECT and EXECUTE permissions to the database.  An **AppReadOnly** role can also be used to allow access to the GUI without the ability to acknowledge alerts.

The **ManageGlobalViews** role can be used to allow the user to save their customized metrics dashboards for all users. They will also have access to delete shared dashboards.  Users with db_owner will also have the same access.  Otherwise the user can still create their own dashboards.

## Messaging Security Considerations

Without messaging enabled, the GUI communicates exclusively with the repository database. Enabling messaging establishes a communication channel between the GUI and the service, allowing users to trigger actions against monitored instances, even without direct access. These queries are executed within the context of the service account.

Key points to note:

* Messaging functionality is deactivated by default, posing no additional security risk if left disabled.
* To send messages, users require EXECUTE permissions on the Messaging schema. This permission can be granted via the **Messaging** role, distinct from the App role. Granting access to the GUI does not automatically confer messaging privileges, ensuring controlled access.
* Additional role membership might be required for certain messaging actions.  These are application level restrictions which could potentially be bypassed *if* a user already has access to send messages.  See [Messaging doc](/docs/help/messaging) for more info.
* [Messaging](/docs/help/messaging) is now used for a variety of things, but you can limit what actions are available.
* Security risks can be mitigated by adhering to the principle of least privilege.  See the [security doc](/docs/help/security) for recommendations for the service account.
