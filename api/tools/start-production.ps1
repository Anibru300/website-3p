# Script de inicio del backend 3P + túnel de Cloudflare
# Ejecutar en la computadora que actuará como servidor.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$cloudflared = "$PSScriptRoot\cloudflared.exe"
$configDir = "$PSScriptRoot\.cloudflared"
$configPath = "$configDir\config.yml"

function Ensure-Cloudflared {
    if (Test-Path $cloudflared) { return }
    Write-Host "Descargando cloudflared.exe..." -ForegroundColor Cyan
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $url -OutFile $cloudflared -UseBasicParsing
    if (-not (Test-Path $cloudflared)) {
        Write-Host "ERROR: No se pudo descargar cloudflared.exe" -ForegroundColor Red
        exit 1
    }
    Write-Host "cloudflared.exe descargado correctamente." -ForegroundColor Green
}

Ensure-Cloudflared

if (-not (Test-Path $configPath)) {
    Write-Host "ERROR: No se encontró $configPath" -ForegroundColor Red
    Write-Host "Ejecuta primero: api\tools\setup-cloudflare-tunnel.ps1" -ForegroundColor Yellow
    exit 1
}

# Cargar variables de entorno del backend
$envFile = "$root\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.*)\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

Write-Host "Iniciando backend CJ_OS Core API en http://localhost:8000 ..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "$root\.venv\Scripts\uvicorn.exe" `
    -ArgumentList "app.main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory $root `
    -WindowStyle Normal -PassThru

Start-Sleep -Seconds 3

Write-Host "Iniciando túnel de Cloudflare..." -ForegroundColor Cyan
$tunnel = Start-Process -FilePath $cloudflared `
    -ArgumentList "tunnel --config $configPath run" `
    -WindowStyle Normal -PassThru

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "Servidor iniciado." -ForegroundColor Green
Write-Host "Backend local: http://localhost:8000" -ForegroundColor Green
Write-Host "Público (si el DNS está configurado): https://api.3psadecv.com" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener ambos procesos." -ForegroundColor Yellow

# Esperar a que el usuario cierre
Wait-Process -Id $backend.Id
Stop-Process -Id $tunnel.Id -ErrorAction SilentlyContinue
