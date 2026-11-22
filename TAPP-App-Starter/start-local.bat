@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  echo Starting TAPP at http://localhost:8000
  start "TAPP" http://localhost:8000
  py -m http.server 8000
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting TAPP at http://localhost:8000
  start "TAPP" http://localhost:8000
  python -m http.server 8000
  goto :eof
)
echo Python was not found. Install Python or run TAPP from an HTTPS web host.
pause
