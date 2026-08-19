# Reinicia el backend de 3P
$ErrorActionPreference = "Stop"

Write-Host "Buscando proceso uvicorn..." -ForegroundColor Cyan
$uvicorn = Get-Process | Where-Object { $_.Name -like "*uvicorn*" }
if ($uvicorn) {
    Write-Host "Deteniendo uvicorn (PID $($uvicorn.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $uvicorn.Id -Force
    Start-Sleep -Seconds 3
} else {
    Write-Host "No se encontró proceso uvicorn corriendo." -ForegroundColor Gray
}

$BaseDir = "G:\Mi unidad\pagina web\3p-website\api"
$LogDir = "$BaseDir\logs"
$LogFile = "$LogDir\backend.log"
$ErrFile = "$LogDir\backend.err"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

Write-Host "Iniciando backend..." -ForegroundColor Cyan
Set-Location $BaseDir
& ".venv\Scripts\activate.ps1"
Start-Process -FilePath "uvicorn" `
    -ArgumentList "app.main:app", "--host", "0.0.0.0", "--port", "8000" `
    -WorkingDirectory $BaseDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError $ErrFile

Write-Host "Backend iniciado." -ForegroundColor Green
