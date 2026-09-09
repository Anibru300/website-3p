# Actualiza las acciones de las tareas programadas 3P tras el movimiento de carpetas.
# Ejecutar UNA VEZ como administrador:
#   powershell -ExecutionPolicy Bypass -File "C:\Projects\PAGINA WEB 3P\pagina web 3p\api\tools\update-task-paths.ps1"
$ErrorActionPreference = "Stop"

$p = "C:\Projects\PAGINA WEB 3P\pagina web 3p"

$tasks = @(
    @{
        Name   = "3P-Website-Backend"
        Action = New-ScheduledTaskAction -Execute "powershell.exe" `
            -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$p\api\tools\start-backend-hidden.ps1`""
    },
    @{
        Name   = "3P-Website-Tunnel"
        Action = New-ScheduledTaskAction -Execute "powershell.exe" `
            -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$p\api\tools\start-tunnel-hidden.ps1`""
    },
    @{
        Name   = "3P-Inventario-Snapshot-Diario"
        Action = New-ScheduledTaskAction -Execute "powershell.exe" `
            -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$p\scripts\inventario-snapshot-daily.ps1`""
    },
    @{
        Name   = "3P-Sync-Excel"
        Action = New-ScheduledTaskAction -Execute "cmd" `
            -Argument "/c cd /d `"$p\api`" && .venv\Scripts\python.exe -m app.sync.job >> logs\sync.log 2>&1"
    }
)

foreach ($t in $tasks) {
    $existing = Get-ScheduledTask -TaskName $t.Name -ErrorAction SilentlyContinue
    if (-not $existing) {
        Write-Host "NO EXISTE: $($t.Name) - crearla con su script de registro original." -ForegroundColor Yellow
        continue
    }
    Set-ScheduledTask -TaskName $t.Name -Action $t.Action | Out-Null
    Write-Host "OK: $($t.Name)" -ForegroundColor Green
}

Write-Host "`nListo. Revisa arriba que las 4 digan OK." -ForegroundColor Cyan
