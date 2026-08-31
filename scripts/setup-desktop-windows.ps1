# Somali AI Learning Tutor — copy complete project to Desktop
# PowerShell: Right-click → Run with PowerShell

$ProjectPath = "C:\Users\HODAN\Desktop\somali-ai-learning-tutor"
$RepoUrl = "https://github.com/Hodan-dev/somali-ai-learning-tutor.git"

Write-Host "=== Somali AI Tutor — Desktop Setup ===" -ForegroundColor Cyan
Write-Host "Folder: $ProjectPath`n"

if ((Test-Path $ProjectPath) -and -not (Test-Path "$ProjectPath\.git")) {
    Write-Host "Desktop folder exists but is not the project. Rename/delete it first." -ForegroundColor Red
    exit 1
}

if (Test-Path "$ProjectPath\.git") {
    Set-Location $ProjectPath
    Write-Host "Updating project..."
    git pull
} else {
    Write-Host "Downloading full project from GitHub..."
    git clone $RepoUrl $ProjectPath
    Set-Location $ProjectPath
}

Write-Host "`nInstalling packages..."
npm install
npm install --prefix server
npm install --prefix client

if (-not (Test-Path "server\.env")) {
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "`nCreated server\.env — add your MongoDB Atlas URI and Gemini key." -ForegroundColor Yellow
}

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "Complete folder on Desktop:"
Write-Host "  $ProjectPath"
Write-Host "`nTo run:"
Write-Host "  cd `"$ProjectPath`""
Write-Host "  npm run dev"
Write-Host "  → http://127.0.0.1:3850"
Write-Host "`nLogin: ahmed@student.so / password123"

# Open folder in Explorer
explorer.exe $ProjectPath
