# HR-CMGT Minor Game Design & Development Setup Script
$ErrorActionPreference = "Continue"
$logFile = "$HOME\setup_log.txt"

function Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $msg"
    Write-Host $line -ForegroundColor Cyan
    Add-Content -Path $logFile -Value $line
}

Log "=== Starting Environment Setup for HR-CMGT Minor Game Design & Development ==="

# Step 1: Install core software packages via winget
$packages = @(
    'Git.Git',
    'Unity.UnityHub',
    'JetBrains.Rider',
    'GitHub.GitHubDesktop',
    'OpenJS.NodeJS.LTS',
    'Python.Python.3.11'
)

foreach ($pkg in $packages) {
    Log "Installing $pkg via winget..."
    $proc = Start-Process winget -ArgumentList "install --id $pkg --accept-package-agreements --accept-source-agreements --disable-interactivity" -Wait -PassThru -NoNewWindow
    if ($proc.ExitCode -eq 0) {
        Log "$pkg installed successfully."
    } else {
        Log "$pkg exited with code $($proc.ExitCode). Checking if already present or needs retry..."
    }
}

# Update environment PATH for the current session
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$machinePath;$userPath"

# Step 2: Install Unity 6 (6000.3.17f1) with Android support
Log "Locating Unity Hub..."
$unityHubExe = "C:\Program Files\Unity Hub\Unity Hub.exe"

if (Test-Path $unityHubExe) {
    Log "Found Unity Hub at $unityHubExe."
    Log "Installing Unity 6 (6000.3.17f1, changeset cf0352b38e81) with Android support module..."
    Log "This is a large download (~10GB) and may take some time depending on internet speed."
    
    $uHubProc = Start-Process -FilePath $unityHubExe -ArgumentList "-- --headless install --version 6000.3.17f1 --changeset cf0352b38e81 --module android" -Wait -PassThru -NoNewWindow
    Log "Unity Hub installation command exited with code $($uHubProc.ExitCode)."
} else {
    Log "ERROR: Unity Hub executable was not found at $unityHubExe!"
}

# Step 3: Clone curriculum repository
$targetDir = "$HOME\Documents\HR"
$repoUrl = "https://github.com/HR-CMGT/Minor-GDD-Unity.git"

Log "Cloning curriculum repository into $targetDir..."
if (Test-Path $targetDir) {
    Log "Directory $targetDir already exists. Pulling latest changes..."
    Set-Location $targetDir
    git pull
} else {
    New-Item -ItemType Directory -Path "$HOME\Documents" -Force | Out-Null
    git clone $repoUrl $targetDir
}

# Step 4: Verification
Log "=== VERIFICATION & HEALTH CHECK ==="

Log "Git version:"
git --version 2>&1 | Tee-Object -FilePath $logFile -Append

Log "Node version:"
node --version 2>&1 | Tee-Object -FilePath $logFile -Append

Log "NPM version:"
npm --version 2>&1 | Tee-Object -FilePath $logFile -Append

Log "Python version:"
python --version 2>&1 | Tee-Object -FilePath $logFile -Append

if (Test-Path $unityHubExe) {
    Log "Installed Unity Editors:"
    & $unityHubExe -- --headless editors --installed 2>&1 | Tee-Object -FilePath $logFile -Append
}

Log "HR Repository contents:"
Get-ChildItem -Path $targetDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize 2>&1 | Tee-Object -FilePath $logFile -Append

Log "=== Setup script execution finished! Press Enter to exit. ==="
Read-Host "Press Enter to exit"
