# Registra tareas programadas para iniciar backend y túnel al inicio de sesión.
# Ejecutar como Administrador.

$TaskBackend = "3P-Website-Backend"
$TaskTunnel = "3P-Website-Tunnel"

$User = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

$ActionBackend = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"G:\Mi unidad\pagina web\3p-website\api\tools\start-backend-hidden.ps1`""
$ActionTunnel = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"G:\Mi unidad\pagina web\3p-website\api\tools\start-tunnel-hidden.ps1`""

$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $User

$Principal = New-ScheduledTaskPrincipal -UserId $User -RunLevel Highest

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName $TaskBackend -Action $ActionBackend -Trigger $Trigger -Principal $Principal -Settings $Settings -Force
Register-ScheduledTask -TaskName $TaskTunnel -Action $ActionTunnel -Trigger $Trigger -Principal $Principal -Settings $Settings -Force

Write-Host "Tareas registradas correctamente."
Write-Host "- $TaskBackend"
Write-Host "- $TaskTunnel"
Write-Host ""
Write-Host "Puedes verificarlas en: Task Scheduler > Task Scheduler Library"
