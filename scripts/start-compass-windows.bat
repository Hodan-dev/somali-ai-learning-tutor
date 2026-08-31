@echo off
title Somali Tutor - MongoDB + Compass
echo Starting MongoDB service...
net start MongoDB 2>nul
if errorlevel 1 (
  echo.
  echo MongoDB service not found. Install from:
  echo https://www.mongodb.com/try/download/community
  echo Choose "Install MongoDB as a Service" during setup.
  echo.
  pause
  exit /b 1
)
echo MongoDB is running on localhost:27017
echo Opening MongoDB Compass...
start "" "%LOCALAPPDATA%\MongoDBCompass\MongoDB Compass.exe" "mongodb://localhost:27017/" 2>nul
start "" "C:\Program Files\MongoDB Compass\MongoDB Compass.exe" "mongodb://localhost:27017/" 2>nul
echo.
echo Compass connection: mongodb://localhost:27017/
pause
