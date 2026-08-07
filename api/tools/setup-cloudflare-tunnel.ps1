# Script de configuración inicial del túnel de Cloudflare
# Ejecutar UNA SOLA VEZ en la computadora que actuará como servidor.
# Requiere cuenta de Cloudflare y que el dominio 3psadecv.com esté gestionado allí.

$ErrorActionPreference = "Stop"
$cloudflared = "$PSScriptRoot\cloudflared.exe"
$tunnelName = "3p-website-api"
$hostname = "api.3psadecv.com"
$serviceUrl = "http://localhost:8000"
$configDir = "$PSScriptRoot\.cloudflared"

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

Write-Host "Paso 1: Autenticación con Cloudflare (se abrirá el navegador)..." -ForegroundColor Cyan
& $cloudflared tunnel login

Write-Host ""
Write-Host "Paso 2: Creando túnel '$tunnelName'..." -ForegroundColor Cyan
$tunnelJson = & $cloudflared tunnel create $tunnelName | Out-String
Write-Host $tunnelJson

# Extraer el ID del túnel de la salida
$tunnelId = ($tunnelJson | Select-String -Pattern "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})").Matches.Groups[1].Value

if (-not $tunnelId) {
    Write-Host "ERROR: No se pudo obtener el ID del túnel." -ForegroundColor Red
    exit 1
}

Write-Host "Túnel creado con ID: $tunnelId" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path $configDir | Out-Null

$config = @"
tunnel: $tunnelId
credentials-file: $configDir\$tunnelId.json

ingress:
  - hostname: $hostname
    service: $serviceUrl
  - service: http_status:404
"@

$configPath = "$configDir\config.yml"
$config | Set-Content -Path $configPath -Encoding UTF8

Write-Host ""
Write-Host "Paso 3: Configurando DNS para $hostname..." -ForegroundColor Cyan
& $cloudflared tunnel route dns $tunnelId $hostname

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "Configuración completa." -ForegroundColor Green
Write-Host "Archivo de configuración: $configPath" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta: api\tools\start-production.ps1" -ForegroundColor Yellow
