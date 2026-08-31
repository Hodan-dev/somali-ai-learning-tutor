@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

set "DESKTOP=%USERPROFILE%\Desktop"
set "PROJECT=%DESKTOP%\somali-ai-learning-tutor"
set "REPO=https://github.com/Hodan-dev/somali-ai-learning-tutor.git"
set "ZIP_URL=https://github.com/Hodan-dev/somali-ai-learning-tutor/archive/refs/heads/main.zip"

echo.
echo ============================================
echo   Somali AI Tutor - Desktop Install
echo   Folder: %PROJECT%
echo ============================================
echo.

where git >nul 2>&1
if %ERRORLEVEL%==0 goto :use_git
goto :use_zip

:use_git
if exist "%PROJECT%\.git" (
    echo Updating existing project...
    cd /d "%PROJECT%"
    git pull
    goto :install

)
if exist "%PROJECT%" (
    echo ERROR: "%PROJECT%" exists but is not the project folder.
    echo Rename or delete it, then run this again.
    pause
    exit /b 1
)

echo Downloading full project with Git...
git clone "%REPO%" "%PROJECT%"
if %ERRORLEVEL% neq 0 goto :use_zip
cd /d "%PROJECT%"
goto :install

:use_zip
echo Git not found or clone failed. Downloading ZIP from GitHub...
set "TEMP_ZIP=%TEMP%\somali-ai-tutor-main.zip"
set "TEMP_DIR=%TEMP%\somali-ai-tutor-extract"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%TEMP_ZIP%' -UseBasicParsing } catch { exit 1 }"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Could not download project. Check internet connection.
    pause
    exit /b 1
)

if exist "%PROJECT%" (
    echo ERROR: "%PROJECT%" already exists. Delete it first.
    pause
    exit /b 1
)

if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%TEMP_DIR%' -Force"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Could not extract ZIP.
    pause
    exit /b 1
)

move "%TEMP_DIR%\somali-ai-learning-tutor-main" "%PROJECT%"
rmdir /s /q "%TEMP_DIR%" 2>nul
del "%TEMP_ZIP%" 2>nul
cd /d "%PROJECT%"

:install
echo.
echo Installing packages (may take a few minutes)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed. Install Node.js from https://nodejs.org
    pause
    exit /b 1
)
call npm install --prefix server
call npm install --prefix client

if not exist "server\.env" (
    copy "server\.env.example" "server\.env" >nul
    echo.
    echo Created server\.env - add MongoDB Atlas URI and Gemini API key.
)

echo.
echo ============================================
echo   DONE - Project on your Desktop:
echo   %PROJECT%
echo.
echo   To run the app:
echo     cd "%PROJECT%"
echo     npm run dev
echo     Open http://127.0.0.1:3850
echo.
echo   Login: ahmed@student.so / password123
echo ============================================
echo.

start "" explorer "%PROJECT%"
pause
