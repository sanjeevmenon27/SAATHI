@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set "LIVE_RELOAD_MODE=0"
if "%~1"=="--live-reload" (
  set "LIVE_RELOAD_MODE=1"
  echo [SaathiCare APK Builder] Running in LIVE RELOAD mode.
)

echo [SaathiCare APK Builder] Step 1: Installing Capacitor dependencies in client...
call npm install --workspace client @capacitor/core@latest @capacitor/android@latest
call npm install --workspace client -D @capacitor/cli@latest

echo [SaathiCare APK Builder] Step 1.5: Detecting computer's local IP address...
set "COMPUTER_IP="
for /f "usebackq tokens=*" %%i in (`powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex (Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select-Object -ExpandProperty InterfaceIndex) | Select-Object -ExpandProperty IPAddress)"`) do (
  set "COMPUTER_IP=%%i"
)
if "%COMPUTER_IP%"=="" (
  set "COMPUTER_IP=localhost"
)
echo [SaathiCare APK Builder] Detected IP: %COMPUTER_IP%

if "%LIVE_RELOAD_MODE%"=="1" (
  echo [SaathiCare APK Builder] Backing up capacitor.config.json...
  copy /y "client\capacitor.config.json" "client\capacitor.config.json.bak" >nul

  echo [SaathiCare APK Builder] Injecting live-reload URL: http://%COMPUTER_IP%:5173 into capacitor.config.json...
  powershell -Command "$config = Get-Content 'client/capacitor.config.json' | ConvertFrom-Json; if (-not $config.server) { $config | Add-Member -MemberType NoteProperty -Name 'server' -Value @{} }; $config.server.url = 'http://%COMPUTER_IP%:5173'; $config.server.cleartext = $true; $config.server.allowNavigation = @('*'); $config | ConvertTo-Json -Depth 10 | Set-Content 'client/capacitor.config.json'"
)

echo [SaathiCare APK Builder] Step 2: Building React frontend...
call npm run build
if errorlevel 1 (
  echo [SaathiCare] Web build failed!
  call :cleanup
  exit /b 1
)

cd client

echo [SaathiCare APK Builder] Step 3: Checking Android project structure...
if not exist "android" (
  echo [SaathiCare] Adding Android native project...
  call npx cap add android
) else (
  echo [SaathiCare] Syncing assets...
  call npx cap sync android
)

echo [SaathiCare APK Builder] Step 4: Configuring Android SDK location...
set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
set "SDK_PATH_ESC=!SDK_PATH:\=\\!"

echo sdk.dir=!SDK_PATH_ESC!> android\local.properties
echo [SaathiCare] local.properties updated with: sdk.dir=!SDK_PATH_ESC!

echo [SaathiCare APK Builder] Step 5: Compiling APK using Gradle...
set "JAVA_HOME=C:\Program Files\Java\jdk-25"
echo [SaathiCare] Using Java 25: %JAVA_HOME%
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  echo [SaathiCare] Gradle compilation failed!
  cd /d "%~dp0"
  call :cleanup
  exit /b 1
)

cd /d "%~dp0"
echo [SaathiCare APK Builder] Step 6: Copying APK to workspace root...
if exist "client\android\app\build\outputs\apk\debug\app-debug.apk" (
  copy /y "client\android\app\build\outputs\apk\debug\app-debug.apk" "saathicare.apk" >nul
  echo ==========================================================
  echo [SaathiCare] SUCCESS!
  echo The compiled APK is available at:
  echo   %~dp0saathicare.apk
  echo ==========================================================
  call :cleanup
) else (
  echo [SaathiCare] Could not locate the compiled APK file!
  call :cleanup
  exit /b 1
)

endlocal
exit /b 0

:cleanup
if exist "client\capacitor.config.json.bak" (
  echo [SaathiCare APK Builder] Restoring original capacitor.config.json...
  copy /y "client\capacitor.config.json.bak" "client\capacitor.config.json" >nul
  del "client\capacitor.config.json.bak"
)
goto :eof
