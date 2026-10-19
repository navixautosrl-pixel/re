@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title AI Clipper - instalare
set "HF_HUB_DISABLE_SYMLINKS_WARNING=1"
set "HF_HUB_DISABLE_TELEMETRY=1"

echo ============================================================
echo   AI Clipper local - instalare
echo   Totul este gratuit si ruleaza pe procesor - fara CUDA.
echo ============================================================
echo.

rem ---------- 1. Python 3.10+ ----------
set "PY="
call :trypy py -3
if not defined PY call :trypy python
if defined PY goto :python_ok

echo [LIPSA] Python 3.10 sau mai nou nu a fost gasit.
where winget >nul 2>&1
if errorlevel 1 goto :python_manual
choice /C DN /M "Instalez Python 3.13 acum cu winget - gratuit, doar pentru utilizatorul curent? D=Da N=Nu"
if errorlevel 2 goto :python_manual
winget install -e --id Python.Python.3.13 --scope user --accept-package-agreements --accept-source-agreements
echo.
echo Python a fost instalat. INCHIDE aceasta fereastra si ruleaza din nou install.bat
echo pentru ca Windows sa recunoasca noua instalare.
pause
exit /b 0

:python_manual
echo Instaleaza Python 3.13 de pe https://www.python.org/downloads/windows/
echo si bifeaza "Add python.exe to PATH" la instalare. Apoi ruleaza din nou install.bat.
pause
exit /b 1

:python_ok
echo [OK] Python gasit: %PY%
%PY% --version

rem ---------- 2. Mediu virtual + pachete ----------
if exist ".venv\Scripts\python.exe" goto :venv_ok
echo.
echo Creez mediul virtual .venv ...
%PY% -m venv .venv
if errorlevel 1 goto :fail_venv
:venv_ok
set "VPY=%~dp0.venv\Scripts\python.exe"

echo.
echo Instalez pachetele Python - poate dura cateva minute la prima rulare ...
"%VPY%" -m pip install --upgrade pip
"%VPY%" -m pip install --upgrade -r requirements.txt
if errorlevel 1 goto :fail_pip
echo [OK] Pachete instalate.

rem ---------- 2b. Runtime Visual C++ - necesar motorului de transcriere ----------
"%VPY%" -c "import ctranslate2" >nul 2>&1
if not errorlevel 1 goto :vc_ok
echo [LIPSA] Motorul de transcriere nu porneste - de obicei lipseste Microsoft Visual C++ Redistributable.
where winget >nul 2>&1
if errorlevel 1 goto :vc_manual
choice /C DN /M "Instalez Microsoft Visual C++ Redistributable cu winget - gratuit? D=Da N=Nu"
if errorlevel 2 goto :vc_manual
winget install -e --id Microsoft.VCRedist.2015+.x64 --accept-package-agreements --accept-source-agreements
goto :vc_ok
:vc_manual
echo Descarca si instaleaza: https://aka.ms/vs/17/release/vc_redist.x64.exe
:vc_ok

rem ---------- 3. FFmpeg ----------
echo.
if exist "ffmpeg\bin\ffmpeg.exe" goto :ffmpeg_ok
where ffmpeg >nul 2>&1
if not errorlevel 1 goto :ffmpeg_ok
if exist "%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe" goto :ffmpeg_ok

echo [LIPSA] FFmpeg nu a fost gasit.
where winget >nul 2>&1
if errorlevel 1 goto :ffmpeg_manual
choice /C DN /M "Instalez FFmpeg acum cu winget - gratuit? D=Da N=Nu"
if errorlevel 2 goto :ffmpeg_manual
winget install -e --id Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
goto :ffmpeg_done

:ffmpeg_manual
echo Descarca FFmpeg - varianta "release essentials" - de pe https://www.gyan.dev/ffmpeg/builds/
echo si copiaza ffmpeg.exe si ffprobe.exe in folderul:  %~dp0ffmpeg\bin\
goto :ffmpeg_done

:ffmpeg_ok
echo [OK] FFmpeg gasit.
:ffmpeg_done

rem ---------- 4. Deno - optional, ajuta yt-dlp la YouTube ----------
echo.
where deno >nul 2>&1
if not errorlevel 1 goto :deno_ok
where node >nul 2>&1
if not errorlevel 1 goto :deno_ok
where winget >nul 2>&1
if errorlevel 1 goto :deno_skip
echo yt-dlp foloseste un runtime JavaScript - Deno - pentru unele videoclipuri YouTube.
choice /C DN /M "Instalez Deno cu winget - gratuit, recomandat? D=Da N=Nu"
if errorlevel 2 goto :deno_skip
winget install -e --id DenoLand.Deno --accept-package-agreements --accept-source-agreements
goto :deno_skip
:deno_ok
echo [OK] Runtime JavaScript gasit.
:deno_skip

rem ---------- 5. Model Whisper base - optional acum, altfel la prima transcriere ----------
echo.
choice /C DN /M "Descarc acum modelul Whisper 'base' - aprox. 145 MB? D=Da N=Nu"
if errorlevel 2 goto :model_skip
"%VPY%" -c "from faster_whisper import WhisperModel; WhisperModel('base', device='cpu', compute_type='int8', download_root='models'); print('[OK] Model base descarcat.')"
if errorlevel 1 echo [AVERT] Modelul nu a putut fi descarcat acum. Se va reincerca la prima transcriere.
:model_skip

rem ---------- 6. Verificare finala ----------
echo.
echo ============ Verificare finala ============
"%VPY%" -m clipper.selfcheck
if errorlevel 1 goto :fail_check
echo.
echo Instalare terminata. Porneste aplicatia cu run.bat
echo Daca FFmpeg sau Deno tocmai au fost instalate si apar ca lipsa, inchide fereastra si ruleaza din nou run.bat.
pause
exit /b 0

:fail_venv
echo [EROARE] Mediul virtual nu a putut fi creat.
pause
exit /b 1

:fail_pip
echo [EROARE] Instalarea pachetelor a esuat. Verifica conexiunea la internet si ruleaza din nou install.bat.
pause
exit /b 1

:fail_check
echo.
echo [ATENTIE] Lipsesc componente obligatorii - vezi lista de mai sus.
echo Daca FFmpeg tocmai a fost instalat cu winget, inchide fereastra si ruleaza din nou install.bat.
pause
exit /b 1

rem ---------- subrutina: verifica o comanda Python ----------
:trypy
%* -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>&1
if not errorlevel 1 set "PY=%*"
exit /b 0
