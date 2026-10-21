# UNVERIFIED: requires Windows, .NET 8 SDK and Inno Setup 6 (ISCC.exe on PATH). Stops on the first error.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
dotnet test tests/RobixHost.Tests            # do not package a build whose tests fail
if ($LASTEXITCODE -ne 0) { throw 'Tests failed; installer not built.' }
dotnet publish desktop/RobixHost.ControlCenter -c Release -r win-x64 --self-contained true -o artifacts/publish/ControlCenter
if ($LASTEXITCODE -ne 0) { throw 'Publish failed.' }
ISCC.exe installer/RobixHostControlCenter.iss
if ($LASTEXITCODE -ne 0) { throw 'Inno Setup failed.' }
Get-FileHash artifacts/installer/*.exe -Algorithm SHA256 | Format-Table -AutoSize
