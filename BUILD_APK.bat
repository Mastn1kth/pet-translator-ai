@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Build Pet Translator Android APK

cd /d "%~dp0"

set "APP_NAME=PetTranslatorAI"
set "ROOT_DIR=%CD%"
set "AAB_SOURCE=%ROOT_DIR%\android\app\build\outputs\bundle\release\app-release.aab"
set "APK_TARGET=%ROOT_DIR%\%APP_NAME%-release.apk"
set "BUNDLETOOL_VERSION=1.18.1"
set "ANDROID_ARCHS=arm64-v8a"

if exist "D:\" (
  set "TOOL_DIR=D:\codex_tmp\pettranslator"
) else (
  set "TOOL_DIR=%ROOT_DIR%\.codex-agent\tools"
)
set "BUNDLETOOL_JAR=%TOOL_DIR%\bundletool-all-%BUNDLETOOL_VERSION%.jar"
set "APKS_FILE=%TOOL_DIR%\%APP_NAME%-release.apks"
set "APKS_ZIP=%TOOL_DIR%\%APP_NAME%-release.zip"
set "EXTRACT_DIR=%TOOL_DIR%\extract"
set "UNIVERSAL_APK=%EXTRACT_DIR%\universal.apk"

echo ==============================
echo   BUILD ANDROID APK
echo ==============================
echo Project: %ROOT_DIR%
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm not found. Install Node.js first.
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: node not found. Install Node.js first.
  exit /b 1
)

if not exist "%ROOT_DIR%\node_modules" (
  echo [1/6] Installing npm dependencies...
  call npm install
  if errorlevel 1 exit /b 1
) else (
  echo [1/6] npm dependencies already installed.
)

echo.
echo [2/6] Running local verification...
call npm run verify
if errorlevel 1 (
  echo ERROR: Local verification failed.
  exit /b 1
)

if not exist "%ROOT_DIR%\android\gradlew.bat" (
  echo.
  echo [3/6] Android project not found, generating it with Expo...
  call npx expo prebuild --platform android
  if errorlevel 1 exit /b 1
) else (
  echo.
  echo [3/6] Android project already exists.
)

if "%ANDROID_HOME%"=="" (
  set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

if not exist "%ANDROID_HOME%" (
  echo ERROR: Android SDK not found: %ANDROID_HOME%
  echo Install Android Studio or set ANDROID_HOME to your SDK path.
  exit /b 1
)

set "SDK_DIR=%ANDROID_HOME:\=/%"
echo sdk.dir=%SDK_DIR%> "%ROOT_DIR%\android\local.properties"

echo.
echo [4/6] Building release Android App Bundle with embedded JS...
echo Android native architectures: %ANDROID_ARCHS%
set "NODE_ENV=production"
set "SKIP_GRADLE_BUNDLE="
powershell -NoProfile -ExecutionPolicy Bypass -Command "$drive=(Get-Item '%ROOT_DIR%').PSDrive.Name; if ((Get-PSDrive $drive).Free -lt 8GB) { exit 1 }"
if errorlevel 1 (
  set "SKIP_GRADLE_BUNDLE=1"
  echo WARNING: Less than 8 GB free on the project drive. Skipping Gradle bundle build to avoid corrupt cache / broken builds.
  if exist "%AAB_SOURCE%" (
    echo Existing release AAB found, using it to create APK:
    echo %AAB_SOURCE%
  ) else (
    echo ERROR: Release AAB was not created at:
    echo %AAB_SOURCE%
    exit /b 1
  )
)

if not defined SKIP_GRADLE_BUNDLE (
  cd /d "%ROOT_DIR%\android"
  call gradlew.bat bundleRelease -PreactNativeArchitectures=%ANDROID_ARCHS%
  if errorlevel 1 (
    echo WARNING: Gradle release bundle build failed.
    if exist "%AAB_SOURCE%" (
      echo Existing release AAB found, using it to create APK:
      echo %AAB_SOURCE%
    ) else (
      echo ERROR: Release AAB was not created at:
      echo %AAB_SOURCE%
      exit /b 1
    )
  )
)

if not exist "%AAB_SOURCE%" (
  echo ERROR: AAB was not found at:
  echo %AAB_SOURCE%
  exit /b 1
)

echo.
echo [5/6] Preparing bundletool...
if not exist "%TOOL_DIR%" mkdir "%TOOL_DIR%"

if not exist "%BUNDLETOOL_JAR%" (
  echo Downloading bundletool %BUNDLETOOL_VERSION%...
  where curl.exe >nul 2>nul
  if errorlevel 1 (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/google/bundletool/releases/download/%BUNDLETOOL_VERSION%/bundletool-all-%BUNDLETOOL_VERSION%.jar' -OutFile '%BUNDLETOOL_JAR%'"
  ) else (
    curl.exe -L --fail --retry 3 --retry-delay 2 -o "%BUNDLETOOL_JAR%" "https://github.com/google/bundletool/releases/download/%BUNDLETOOL_VERSION%/bundletool-all-%BUNDLETOOL_VERSION%.jar"
  )
  if errorlevel 1 (
    echo ERROR: Failed to download bundletool.
    exit /b 1
  )
)

echo.
echo [6/6] Creating installable release APK...
if exist "%APKS_FILE%" del /f /q "%APKS_FILE%"
if exist "%APKS_ZIP%" del /f /q "%APKS_ZIP%"
if exist "%EXTRACT_DIR%" rmdir /s /q "%EXTRACT_DIR%"
mkdir "%EXTRACT_DIR%"

java -Djava.io.tmpdir="%TOOL_DIR%" -jar "%BUNDLETOOL_JAR%" build-apks --bundle="%AAB_SOURCE%" --output="%APKS_FILE%" --mode=universal --ks="%ROOT_DIR%\android\app\debug.keystore" --ks-pass=pass:android --ks-key-alias=androiddebugkey --key-pass=pass:android
if errorlevel 1 (
  echo ERROR: bundletool failed to create universal APK.
  exit /b 1
)

copy /Y "%APKS_FILE%" "%APKS_ZIP%" >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%APKS_ZIP%' -DestinationPath '%EXTRACT_DIR%' -Force"
if errorlevel 1 exit /b 1

if not exist "%UNIVERSAL_APK%" (
  echo ERROR: universal.apk was not found inside bundletool output.
  exit /b 1
)

copy /Y "%UNIVERSAL_APK%" "%APK_TARGET%" >nul
if errorlevel 1 exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Item '%APK_TARGET%').LastWriteTime = Get-Date"

echo.
echo ==============================
echo APK READY
echo ==============================
echo AAB:  %AAB_SOURCE%
echo APK:  %APK_TARGET%
echo.
echo NOTE: This APK is signed with the local debug keystore for manual install/testing.
echo For Google Play upload, use the AAB and real upload signing config.
echo.

endlocal
