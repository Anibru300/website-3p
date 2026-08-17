# Inicia el backend de 3P en segundo plano y guarda logs.
# Uso: Task Scheduler al inicio de sesión.

$BaseDir = "G:\Mi unidad\pagina web\3p-website\api"
$LogDir = "$BaseDir\logs"
$LogFile = "$LogDir\backend.log"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Evitar múltiples instancias
$existing = Get-Process | Where-Object { $_.Name -like "*uvicorn*" -or ($_.CommandLine -and $_.CommandLine -like "*app.main:app*") }
if ($existing) {
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') uvicorn ya está corriendo (PID $($existing.Id)). Se omite inicio."
    exit 0
}

Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Iniciando backend..."

try {
    Set-Location $BaseDir
    & ".venv\Scripts\activate.ps1"
    Start-Process -FilePath "uvicorn" -ArgumentList "app.main:app", "--host", "0.0.0.0", "--port", "8000" -WindowStyle Hidden -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Backend iniciado."
} catch {
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ERROR: $_"
}
