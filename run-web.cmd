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

echo [SaathiCare] Detecting local network IP address...
set "COMPUTER_IP="
for /f "usebackq tokens=*" %%i in (`powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex (Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select-Object -ExpandProperty InterfaceIndex) | Select-Object -ExpandProperty IPAddress)"`) do (
  set "COMPUTER_IP=%%i"
)
if "%COMPUTER_IP%"=="" (
  set "COMPUTER_IP=localhost"
)
echo [SaathiCare] Detected IP: %COMPUTER_IP%
echo VITE_API_URL=http://%COMPUTER_IP%:5000/api> client\.env
echo [SaathiCare] Updated client\.env with VITE_API_URL=http://%COMPUTER_IP%:5000/api


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
