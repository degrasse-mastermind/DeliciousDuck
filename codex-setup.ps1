# DeliciousDuck.com — native Windows PowerShell setup
# Run from the repository root. Safe to run more than once.

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-SetupLog {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host "`n[DeliciousDuck setup] $Message" -ForegroundColor Cyan
}

function Assert-Command {
    param([Parameter(Mandatory = $true)][string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name is required but was not found on PATH."
    }
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed with exit code $LASTEXITCODE."
    }
}

function Install-WithWingetIfMissing {
    param(
        [Parameter(Mandatory = $true)][string]$CommandName,
        [Parameter(Mandatory = $true)][string]$WingetId,
        [Parameter(Mandatory = $true)][string]$FriendlyName
    )

    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        return
    }

    if (-not (Get-Command "winget" -ErrorAction SilentlyContinue)) {
        throw "$FriendlyName is required but is not on PATH, and winget is unavailable. Install $FriendlyName manually, reopen PowerShell, and rerun this script."
    }

    Write-SetupLog "$FriendlyName not found; installing with winget package $WingetId"
    & winget install --id $WingetId --exact --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "winget failed to install $FriendlyName (exit code $LASTEXITCODE)."
    }

    # Refresh PATH for common per-user package locations without assuming install success.
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")
}

Assert-Command "git"
Assert-Command "node"

if (-not (Test-Path -LiteralPath "package.json" -PathType Leaf)) {
    throw "package.json was not found. Run this script from the DeliciousDuck repository root."
}
if (-not (Test-Path -LiteralPath "bun.lock" -PathType Leaf)) {
    throw "bun.lock was not found. This repository is Bun-managed; do not substitute npm install."
}

Install-WithWingetIfMissing -CommandName "bun" -WingetId "Oven-sh.Bun" -FriendlyName "Bun"
Install-WithWingetIfMissing -CommandName "ffmpeg" -WingetId "Gyan.FFmpeg" -FriendlyName "FFmpeg"

Assert-Command "bun"
Assert-Command "ffmpeg"
Assert-Command "ffprobe"

$repositoryName = Split-Path -Leaf (Get-Location)
$nodeVersion = (& node --version)
$bunVersion = (& bun --version)
Write-SetupLog "Repository: $repositoryName"
Write-SetupLog "Node: $nodeVersion; Bun: $bunVersion"
Write-SetupLog ((& ffmpeg -version | Select-Object -First 1) -join "")
Write-SetupLog "ffprobe: available"

Write-SetupLog "Installing exact dependencies from committed bun.lock"
Invoke-Checked -Command "bun" -Arguments @("install", "--frozen-lockfile")

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json
$dependencyNames = @()
if ($package.PSObject.Properties.Name -contains "dependencies" -and $null -ne $package.dependencies) {
    $dependencyNames += $package.dependencies.PSObject.Properties.Name
}
if ($package.PSObject.Properties.Name -contains "devDependencies" -and $null -ne $package.devDependencies) {
    $dependencyNames += $package.devDependencies.PSObject.Properties.Name
}
$hasPlaywright = ($dependencyNames -contains "@playwright/test") -or
                 ($dependencyNames -contains "playwright")

if ($hasPlaywright) {
    Write-SetupLog "Playwright detected; ensuring Chromium is available"
    & bunx playwright install chromium
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Chromium installation did not complete. Codex may use an existing browser installation."
    }
}
else {
    Write-SetupLog "Root application does not declare Playwright; Creative Studio should add it only inside its isolated package if browser QA is required."
}

if (Test-Path -LiteralPath ".env.example" -PathType Leaf) {
    Write-SetupLog "Environment-variable names declared by .env.example"
    Get-Content -LiteralPath ".env.example" |
        Where-Object { $_ -match '^\s*[^#\s][^=]*=' } |
        ForEach-Object { ($_ -split '=', 2)[0].Trim() } |
        Sort-Object -Unique
}
else {
    Write-SetupLog "No .env.example found; no environment values were created or changed"
}

Write-SetupLog "Running the production build as the setup health check"
Invoke-Checked -Command "bun" -Arguments @("run", "build")

Write-SetupLog "Setup complete. Start locally with: bun run dev -- --host 0.0.0.0"
Write-SetupLog "Creative Studio dependencies must remain isolated under creative-studio/."
