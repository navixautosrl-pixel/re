@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title AI Clipper local
set "HF_HUB_DISABLE_SYMLINKS_WARNING=1"
set "HF_HUB_DISABLE_TELEMETRY=1"

if exist ".venv\Scripts\python.exe" goto :start
echo Aplicatia nu este instalata. Ruleaza mai intai install.bat
pause
exit /b 1

:start
".venv\Scripts\python.exe" -m clipper.selfcheck
echo.
".venv\Scripts\python.exe" launcher.py
if errorlevel 1 pause
