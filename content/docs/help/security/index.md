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

* Enable config file encryption (Starting 2.41.0).
* Use a strong password to encrypt the config.
* Avoid storing sensitive information in the config file if possible.

*e.g. Use Windows authentication where possible.  Use IAM roles to provide access to S3 buckets instead of access keys*

* Limit access to the config file.
* Use the principal of least privilege.

## Service Account

The recommended approach is to grant a [minimal set of permissions](#running-with-minimal-permissions) to the service account.  The optional [WMI collections](/docs/wmi) require membership of the **local administrators group** on the monitored instances. The only way this works without local admin access is to run a copy of the DBA Dash service locally on each monitored instance.  Please review what's provided through the [WMI collections](/docs/wmi) and decide if you want to use it in your environment.  If you don't want to use WMI, click the option to disable WMI collections when adding the instance to avoid WMI related errors in the log.

Alternatively, you can grant membership of the **sysadmin** role which will allow some additional information to be collected over the SQL connection. See the [why sysadmin](#why-sysadmin) section for more info.

An Active Directory user account is recommended as it will allow you to use Windows authentication, avoiding the need to store passwords in the [config](#config-file-security).  Ideally a managed service account should be used which will automatically set and rotate passwords for the service account.

{{< details "How to create a Group Managed service account" >}}

[See here](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/service-accounts-group-managed) for more info on Group Managed Service accounts.

The commands listed here use dbatools and RSAT-AD-PowerShell
```powershell
Install-Module dbatools
Install-WindowsFeature RSAT-AD-PowerShell
```

* The first step is to ensure you have a [key distribution service](https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/create-the-key-distribution-services-kds-root-key) root key deployed:

```powershell
Get-KdsRootKey
<# Run if needed:
# This command will take time to replicate.  See MS docs for more info.
Add-KdsRootKey -EffectiveImmediately
#>
```

* Create an Active Directory group.  Computers that are a member of this group will be able to use the service account.

```powershell
## Replace the path as required.  e.g. Domain is mydomain.com - Path =  CN=Users,DC=mydomain,DC=com or OU=MyOU,DC=mydomain,DC=com
New-ADGroup -Name "DBADashGrp" -SamAccountName DBADashGrp -GroupCategory Security -GroupScope Global -DisplayName "DBADashGrp" -Path "CN=Users,DC=UPDATE_PATH_AS_REQUIRED,DC=local" -Description "Managed Service Account Group for DBA Dash"
```

* Add the computer where DBA Dash is to be installed as a member of the group

```powershell
Add-ADGroupMember -Identity "DBADashGrp" -Members "MACHINE_NAME_WHERE_DBADASH_RUNS$"
```

* A reboot of the machine specified in the previous step is required to pick up the change in group membership
* Create the service account

```powershell
## Replace the DNSHostName as required.  e.g. Domain is mydomain.com - use DBADash.mydomain.com
New-ADServiceAccount -name DBADash -DNSHostName DBADash.UPDATE_PATH_AS_REQUIRED.local -PrincipalsAllowedToRetrieveManagedPassword DBADashGrp
```

* Grant the appropriate permissions to the new account.

```powershell
## Option to add new service account to local admins to get WMI calls to work
Invoke-Command -ComputerName SQL1,SQL2 -ScriptBlock {Add-LocalGroupMember -Group "Administrators" -Member "DBADash$" }

## Create login for service account on monitored instances
New-DbaLogin -SqlInstance SQL1,SQL2 -Login "YOURDOMAINNAME\DBADash$"

## Add user to sysadmin group - or provision the minimum permissions as described in the security doc
Add-DbaServerRoleMember -SqlInstance SQL1,SQL2 -ServerRole sysadmin -Login "YOURDOMAINNAME\DBADash$"

```

* Now install the service account machine specified earlier where you will run the DBA Dash service.

```powershell
Install-ADServiceAccount DBADash
```

* You can now use the service account in the service config tool. Specify DomainName\DBADash$ without a password.

{{< /details >}}

{{< details "Why local admin?" >}}

### Why local admin?
This provides the access required to run [WMI queries](/docs/help/wmi) (optional).  These are used to collect drive space, driver info and o/s info.

If you don't want the tool to use WMI, select the "**Don't use WMI**" checkbox when adding an instance in the DBA Dash Service Config Tool. If you don't check this box, WMI collection will be attempted - resulting in a logged error if the user doesn't have access.  If drive space isn't collected via WMI it will be collected through SQL instead - but only for drives that contain SQL files. You could provision the required WMI access to your service account.

{{< /details >}}

{{< details "Why SysAdmin?" >}}
### Why SysAdmin?

Sysadmin permissions enabled the following data to be collected.

* [This collection](https://github.com/trimble-oss/dba-dash/blob/main/DBADash/SQL/SQLServerExtraProperties.sql) needs sysadmin permissions to read data from the registry like processor name, manufacturer and model.  These might be collected anyway if you have WMI enabled.
* SQL Server instances **older** than 2014 require sysadmin permissions to collect [last good check db time](https://github.com/trimble-oss/dba-dash/blob/main/DBADash/SQL/SQLLastGoodCheckDB.sql).
* The active power plan collection either requires sysadmin permissions or the user needs to be granted EXECUTE permissions on xp_cmdshell and a proxy account configured.  Regardless of sysadmin permissions, the query only collects this data via SQL if xp_cmdshell is already enabled. This data is also collected via WMI if enabled - so sysadmin access isn't required in this instance.


````SQL
ALTER SERVER ROLE [sysadmin] ADD MEMBER [{LoginName}]
````

If you are on a modern version of SQL Server and you have granted local admin access to allow WMI collections to run there is little benefit in running with sysadmin over the more minimal permissions.

{{< /details >}}

### Firewall

DBA Dash collects most of it's data via a SQL connection (Typically port 1433).  If you check the "No WMI" box when adding a connection then ALL data will be collected via the SQL connection and no additional firewall configuration would be required.

Starting with version 2.24.2, DBA Dash uses WSMan/WinRM protocol for WMI data collections which uses port 5985.  On servers WinRM should be enabled by default.  If you need to [enable it manually](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enable-psremoting?view=powershell-7.2), run this on the monitored instance:

```powershell
Enable-PSRemoting -SkipNetworkProfileCheck -Force
```

This does a number of tasks including creating the firewall exception (port 5985).  [See here](/docs/help/wmi) for more information on WMI collections.


## Running with Minimal Permissions

If you **don't** want to grant sysadmin access, you can assign the permissions listed below instead

**Server Level Permissions:**
* View Server State
* View Any Database
* Connect Any Database
* Alter Event Session (For Slow Query trace if used)
* View Any Definition

**MSDB Database:**
* Add user to the *db_datareader* role.
* Add user to the *SQLAgentReaderRole* role

This script can be used to provision the required permissions:
````SQL
/*
	Use this script to configure permissions for the DBA Dash service account if you don't want to use the sysadmin server role.
	DBA Dash can collect more data when running as sysadmin but most features and functionallity will work with a more limited account
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
ALTER ROLE [SQLAgentReaderRole] ADD MEMBER ' + QUOTENAME(@LoginName) + '
'
PRINT @SQL
EXEC sp_executesql @SQL
````

### Azure DB

For Azure DB, add the service account to the **##MS_ServerStateReader##** role in the master database.

e.g.
```sql
ALTER SERVER ROLE ##MS_ServerStateReader##
ADD MEMBER DBADashService
```

If you want to allow slow query capture, grant the following permissions in the user databases.

```sql
GRANT CREATE ANY DATABASE EVENT SESSION TO DBADashService;
GRANT ALTER ANY DATABASE EVENT SESSION TO DBADashService;
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

## DBA Dash GUI

To use the DBA Dash GUI, users only need access to the DBA Dash repository database.  No access is required to the monitored instances.  To grant the minimum permissions to run the DBA Dash GUI, add the user the the **App** role in the DBA Dash database. This grants the user SELECT and EXECUTE permissions to the database.  An **AppReadOnly** role can also be used to allow access to the GUI without the ability to acknowledge alerts.

The **ManageGlobalViews** role can be used to allow the user to save their customized metrics dashboards for all users. They will also have access to delete shared dashboards.  Users with db_owner will also have the same access.  Otherwise the user can still create their own dashboards.

## Messaging Security Considerations

Without messaging enabled, the GUI communicates exclusively with the repository database. Enabling messaging establishes a communication channel between the GUI and the service, allowing users to initiate queries on monitored instances, even without direct access. These queries are executed within the context of the service account.

Key points to note:

* Messaging functionality is deactivated by default, posing no additional security risk if left disabled.
* To send messages, users require EXECUTE permissions on the Messaging schema. This permission can be granted via the **Messaging** role, distinct from the App role. Granting access to the GUI does not automatically confer messaging privileges, ensuring controlled access.
* Presently, messaging functionality is limited to triggering pre-existing collections.
* Security risks can be mitigated by adhering to the principle of least privilege.  See the [security doc](/docs/help/security) for recommendations for the service account.
