# Registra la tarea programada del snapshot de inventario.
# Ejecutar como el usuario que va a correr la tarea (no necesita Administrador).

$ErrorActionPreference = "Stop"

$TaskName = "3P-Inventario-Snapshot-Diario"
$ScriptPath = "C:\Projects\PAGINA WEB 3P\scripts\inventario-snapshot-daily.ps1"
$User = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""

# Trigger al iniciar sesion con 2 minutos de espera para que el backend este listo
$TriggerLogon = New-ScheduledTaskTrigger -AtLogOn -User $User
$TriggerLogon.Delay = "PT2M"

# Trigger diario a las 8:00 a.m.
$TriggerDaily = New-ScheduledTaskTrigger -Daily -At "08:00"

$Principal = New-ScheduledTaskPrincipal -UserId $User -RunLevel Limited

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $TriggerLogon, $TriggerDaily `
    -Principal $Principal `
    -Settings $Settings `
    -Description "Snapshot diario del valor del inventario. Tambien se ejecuta al iniciar sesion." `
    -Force

Write-Host "Tarea '$TaskName' registrada correctamente." -ForegroundColor Green
Write-Host "Triggers: al iniciar sesion (con 2 min de delay) y diario a las 8:00 a.m." -ForegroundColor Cyan
