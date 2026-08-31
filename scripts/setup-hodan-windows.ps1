# Somali AI Learning Tutor — Windows setup for Hodan
# Run in PowerShell: Right-click → Run with PowerShell
# Or: powershell -ExecutionPolicy Bypass -File scripts\setup-hodan-windows.ps1

$ProjectPath = "C:\Users\HODAN\Projects\somali-ai-learning-tutor"
$RepoUrl = "https://github.com/Hodan-dev/somali-ai-learning-tutor.git"

Write-Host "=== Somali AI Learning Tutor — Setup ===" -ForegroundColor Cyan
Write-Host "Target folder: $ProjectPath`n"

# Create Projects folder
$parent = Split-Path $ProjectPath -Parent
if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    Write-Host "Created $parent"
}

# Clone or update
if (Test-Path "$ProjectPath\.git") {
    Write-Host "Project exists — pulling latest..."
    Set-Location $ProjectPath
    git pull
} elseif (Test-Path $ProjectPath) {
    Write-Host "Folder exists but is not a git repo. Remove it or pick another path." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Cloning from GitHub..."
    git clone $RepoUrl $ProjectPath
    Set-Location $ProjectPath
}

# Install dependencies
Write-Host "`nInstalling dependencies (may take a few minutes)..."
npm install
npm install --prefix server
npm install --prefix client

# .env file
$envFile = "server\.env"
$envExample = "server\.env.example"
if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "`nCreated server\.env — EDIT THIS FILE:" -ForegroundColor Yellow
    Write-Host "  1. MONGODB_URI = your Atlas connection string"
    Write-Host "  2. GEMINI_API_KEY = your Google AI key (optional)"
} else {
    Write-Host "`nserver\.env already exists (not overwritten)."
}

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Project location: $ProjectPath"
Write-Host "`nNext steps:"
Write-Host "  1. Edit server\.env (MongoDB Atlas + Gemini key)"
Write-Host "  2. cd $ProjectPath"
Write-Host "  3. npm run dev"
Write-Host "  4. Open http://127.0.0.1:3850"
Write-Host "`nDemo login: ahmed@student.so / password123"
