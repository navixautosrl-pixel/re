; Installer Windows pentru AI Clipper (Inno Setup 6).
; Compilare: iscc /DSourceDir=<dist\AI-Clipper> /DOutputDir=<folder> /DAppVersion=0.2.0 installer.iss

#ifndef AppVersion
  #define AppVersion "0.2.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\dist\AI-Clipper"
#endif
#ifndef OutputDir
  #define OutputDir "..\dist"
#endif

[Setup]
AppId={{6B0E7C3A-41D2-4F7B-9C55-2B8E7A1D9F30}
AppName=AI Clipper
AppVersion={#AppVersion}
AppPublisher=AI Clipper local
; instalare doar pentru utilizatorul curent: nu cere drepturi de administrator
PrivilegesRequired=lowest
DefaultDirName={localappdata}\Programs\AI Clipper
DisableProgramGroupPage=yes
OutputDir={#OutputDir}
OutputBaseFilename=AI-Clipper-Setup
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\AI-Clipper.exe
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
WizardStyle=modern
InfoBeforeFile=inainte_de_instalare.txt

[Languages]
#ifexist "Romanian.isl"
Name: "ro"; MessagesFile: "Romanian.isl"
#else
Name: "en"; MessagesFile: "compiler:Default.isl"
#endif

[Tasks]
Name: "desktopicon"; Description: "Creează o scurtătură pe desktop"; GroupDescription: "Scurtături:"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{autoprograms}\AI Clipper"; Filename: "{app}\AI-Clipper.exe"
Name: "{autodesktop}\AI Clipper"; Filename: "{app}\AI-Clipper.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\AI-Clipper.exe"; Description: "Pornește AI Clipper acum"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
