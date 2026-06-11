@echo off
setlocal

cd /d "%~dp0"

echo [SaathiCare] Checking dependencies...
call npm.cmd install
if errorlevel 1 (
  echo [SaathiCare] npm install failed.
  exit /b 1
)

if not exist "server\.env" (
  copy /y "server\.env.example" "server\.env" >nul
)

echo [SaathiCare] Trying to seed the database...
call npm.cmd run seed
if errorlevel 1 (
  echo [SaathiCare] Seed skipped or failed. Make sure MongoDB is running on 127.0.0.1:27017 if you want demo data.
)

echo [SaathiCare] Starting dev servers...
start "SaathiCare Dev" cmd /k "cd /d %~dp0 && npm.cmd run dev"

echo [SaathiCare] Opening app in browser...
timeout /t 10 >nul
start "" http://localhost:5173

endlocal
