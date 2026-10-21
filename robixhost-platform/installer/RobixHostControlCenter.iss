; UNVERIFIED: never compiled (needs Inno Setup 6 on Windows). Installs ONLY the Control Center client.
; The hypervisor host is installed separately on Linux (docs/HOST-INSTALL.md). No service, no firewall change, no network change.
#define AppName "RobixHost Control Center"
#define AppVersion "0.1.0"
[Setup]
AppId={{B3C1F2A0-5E6D-4C77-9A11-52B0D7A9E001}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=RobixHost
DefaultDirName={autopf}\RobixHost\ControlCenter
DefaultGroupName=RobixHost
OutputDir=..\artifacts\installer
OutputBaseFilename=RobixHostControlCenter-Setup-{#AppVersion}
SetupIconFile=..\brand\ico\RobixHost.ico
WizardImageFile=..\brand\installer\wizard-side.bmp
WizardSmallImageFile=..\brand\installer\wizard-small.bmp
UninstallDisplayIcon={app}\RobixHostControlCenter.exe
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
Compression=lzma2
SolidCompression=yes
[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
[Files]
; Self-contained publish output (see installer/build.ps1), so no .NET runtime is required on the admin PC.
Source: "..\artifacts\publish\ControlCenter\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\RobixHostControlCenter.exe"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\RobixHostControlCenter.exe"; Tasks: desktopicon
[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; Flags: unchecked
[Run]
Filename: "{app}\RobixHostControlCenter.exe"; Description: "Launch {#AppName}"; Flags: nowait postinstall skipifsilent
