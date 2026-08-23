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

Assert-Command "git"
Assert-Command "node"
Assert-Command "npm"

if (-not (Test-Path -LiteralPath "package.json" -PathType Leaf)) {
    throw "package.json was not found. Run this script from the DeliciousDuck repository root."
}

$repositoryName = Split-Path -Leaf (Get-Location)
$nodeVersion = (& node --version)
$npmVersion = (& npm --version)
Write-SetupLog "Repository: $repositoryName"
Write-SetupLog "Node: $nodeVersion; npm: $npmVersion"

if ((Test-Path -LiteralPath "package-lock.json" -PathType Leaf) -or
    (Test-Path -LiteralPath "npm-shrinkwrap.json" -PathType Leaf)) {
    Write-SetupLog "Installing exact dependencies from the committed npm lockfile"
    Invoke-Checked -Command "npm" -Arguments @("ci", "--no-audit", "--no-fund")
}
else {
    Write-Warning "No npm lockfile is committed. Installing from package.json without creating package-lock.json."
    Invoke-Checked -Command "npm" -Arguments @("install", "--no-package-lock", "--no-audit", "--no-fund")
}

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
    & npx playwright install chromium
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Chromium installation did not complete. Codex may use an existing browser installation."
    }
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
Invoke-Checked -Command "npm" -Arguments @("run", "build")

Write-SetupLog "Setup complete. Start locally with: npm run dev -- --host 0.0.0.0"
