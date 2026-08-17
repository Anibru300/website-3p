# Inicia el backend de 3P en segundo plano y guarda logs.
# Uso: Task Scheduler al inicio de sesión.

$BaseDir = "G:\Mi unidad\pagina web\3p-website\api"
$LogDir = "$BaseDir\logs"
$StartupLog = "$LogDir\startup-backend.log"
$LogFile = "$LogDir\backend.log"
$ErrFile = "$LogDir\backend.err"

function Write-StartupLog($message) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -Path $StartupLog -Value "$timestamp $message"
    Write-Host "$timestamp $message"
}

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Evitar múltiples instancias
$existing = Get-Process | Where-Object { $_.Name -like "*uvicorn*" }
if ($existing) {
    Write-StartupLog "uvicorn ya está corriendo (PID $($existing.Id)). Se omite inicio."
    exit 0
}

Write-StartupLog "Iniciando backend..."

try {
    Set-Location $BaseDir
    & ".venv\Scripts\activate.ps1"
    Start-Process -FilePath "uvicorn" `
        -ArgumentList "app.main:app", "--host", "0.0.0.0", "--port", "8000" `
        -WorkingDirectory $BaseDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $LogFile `
        -RedirectStandardError $ErrFile
    Write-StartupLog "Backend iniciado. Logs en $LogFile"
} catch {
    Write-StartupLog "ERROR al iniciar backend: $_"
}
