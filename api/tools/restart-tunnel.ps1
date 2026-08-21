# Reinicia el tÃºnel de Cloudflare
$ErrorActionPreference = "Stop"

Write-Host "Buscando proceso cloudflared..." -ForegroundColor Cyan
$cloudflared = Get-Process | Where-Object { $_.Name -like "*cloudflared*" }
if ($cloudflared) {
    Write-Host "Deteniendo cloudflared (PID $($cloudflared.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $cloudflared.Id -Force
    Start-Sleep -Seconds 3
} else {
    Write-Host "No se encontrÃ³ proceso cloudflared corriendo." -ForegroundColor Gray
}

$ScriptDir = "C:\Projects\PAGINA WEB 3P\api\tools"
$Cloudflared = "$ScriptDir\cloudflared.exe"
$ConfigPath = "$ScriptDir\.cloudflared\config.yml"
$TokenPath = "$ScriptDir\.cloudflared\token.txt"
$LogDir = "$ScriptDir\..\logs"
$LogFile = "$LogDir\tunnel.log"
$ErrFile = "$LogDir\tunnel.err"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

if (!(Test-Path $Cloudflared)) {
    Write-Host "Descargando cloudflared.exe..." -ForegroundColor Cyan
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $url -OutFile $Cloudflared -UseBasicParsing
}

$arguments = @("tunnel", "run")
if (Test-Path $TokenPath) {
    $token = Get-Content $TokenPath -Raw
    $arguments += "--token"
    $arguments += $token.Trim()
} elseif (Test-Path $ConfigPath) {
    $arguments += "--config"
    $arguments += $ConfigPath
} else {
    Write-Host "ERROR: No se encontrÃ³ token ni config del tÃºnel." -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando tÃºnel..." -ForegroundColor Cyan
Start-Process -FilePath $Cloudflared `
    -ArgumentList $arguments `
    -WorkingDirectory $ScriptDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError $ErrFile

Write-Host "TÃºnel iniciado." -ForegroundColor Green
