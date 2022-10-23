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
## Service Account

The DBA Dash service will work with a [minimal set of permissions](#running-with-minimal-permissions), but requires membership of the **sysadmin** role and **local "Administrators" group** for certain data collections (optional). 

An Active Directory user account is recommended as it will allow you to use Windows authentication, avoiding the need to store passwords in the [config](#config-file-security).  Ideally a managed service account should be used which will automatically set and rotate passwords for you.  

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
This provides the access required to run WMI queries (optional).  These are used to collect drive space, driver info and o/s info.  

If you don't want the tool to use WMI, select the "**Don't use WMI**" checkbox when adding an instance in the DBA Dash Service Config Tool. If you don't check this box, WMI collection will be attempted - resulting in a logged error if the user doesn't have access.  If drive space isn't collected via WMI it will be collected through SQL instead - but only for drives that contain SQL files. You could provision the required WMI access to your service account.  

{{< /details >}}

{{< details "Why local SysAdmin?" >}}
### Why SysAdmin?

If the tool doesn't run as sysadmin it won't be able to collect last good CHECKDB date as well as some other data from the registry like processor name, system manufacturer and model.  Sysadmin can be granted using:

````SQL
ALTER SERVER ROLE [sysadmin] ADD MEMBER [{LoginName}]
````

{{< /details >}}

### Firewall

DBA Dash collects most of it's data via a SQL connection (Typically port 1433).  If you check the "No WMI" box when adding a connection then ALL data will be collected via the SQL connection and no additional firewall configuration would be required.  

It can be useful to have WMI collection enabled though as this allows you to collect some extra data like drive capacity and free space for all drives.

These firewall rules can be used to allow WMI:

* Windows Management Instrumentation (ASync-In)
* Windows Management Instrumentation (DCOM-In)
* Windows Management Instrumentation (WMI-In)

If you want to check if WMI is working, you can run this powershell script to test:
```Powershell
Get-WmiObject -Class Win32_computerSystem -ComputerName "YOUR_COMPUTER_NAME"
```

As part of the DriversWMI collection DBA Dash will also attempt to get the AWS PV driver version by reading this registry key: SOFTWARE\Amazon\PVDriver. This requires a different firewall rule: 
* File and Printer Sharing (SMB-In)

This powerhell query provides a quick way to test if it's working (it should run without errors):
```Powershell
[Microsoft.Win32.RegistryKey]::OpenRemoteBaseKey("LocalMachine", "YOUR_COMPUTER_NAME")
```
It's also possible to disable the "DriversWMI" collection in the service configuration tool if you are not interested in collecting driver versions for your SQL instances.

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

## Config file Security

The application configuration is stored in a "ServiceConfig.json" file.  You can edit this manually but it's recommended to use the "DBADashServiceConfigTool.exe" app to ensure a valid configuration.  Sensitive information like connection string passwords and AWS Secret key are encrypted automatically.  This is done to avoid storing the data in plain text but it should be considered as **obfuscation** rather than encryption (due to the storage of encryption keys).  Ideally you should use Windows authentication to connect to your SQL instances which avoids the need to store passwords in the config file.  

If you are collecting data from remote SQL instances via a S3 bucket you could consider using IAM roles instead of specifying the credentials in the config file.  I would also recommend creating a new S3 bucket and configure minimal permissions that allow only read/write access to the new bucket.

## DBA Dash GUI

To use the DBA Dash GUI, users only need access to the DBA Dash repository database.  No access is required to the monitored instances.  To grant the minimum permissions to run the DBA Dash GUI, add the user the the **App** role in the DBA Dash database. This grants the user SELECT and EXECUTE permissions to the database.

The **ManageGlobalViews** role can be used to allow the user to save their customized metrics dashboards for all users. They will also have access to delete shared dashboards.  Users with db_owner will also have the same access.  Otherwise the user can still create their own dashboards.  
