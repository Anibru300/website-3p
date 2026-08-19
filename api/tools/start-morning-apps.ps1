# Abre las aplicaciones de trabajo de la mañana para 3P.
# Se ejecuta automáticamente al inicio de sesión mediante la tarea programada "3P-Morning-Apps".

$ErrorActionPreference = "Continue"
$LogFile = "G:\Mi unidad\pagina web\3p-website\api\logs\morning-apps.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
    Add-Content -Path $LogFile -Value $line -ErrorAction SilentlyContinue
    if ($Level -eq "ERROR") { Write-Host $line -ForegroundColor Red }
    elseif ($Level -eq "WARN") { Write-Host $line -ForegroundColor Yellow }
    else { Write-Host $line }
}

$apps = @(
    @{
        Name = "Outlook"
        Path = "C:\Program Files (x86)\Microsoft Office\root\Office16\OUTLOOK.EXE"
        Arguments = $null
        WaitSeconds = 3
    },
    @{
        Name = "WhatsApp"
        Path = "shell:AppsFolder\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App"
        Arguments = $null
        WaitSeconds = 3
        UseShellAppsFolder = $true
    },
    @{
        Name = "Microsoft Edge - Gmail"
        Path = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        Arguments = "https://mail.google.com/mail/u/0/?hl=es-419#inbox"
        WaitSeconds = 2
    },
    @{
        Name = "Aspel-SAE 9.0"
        Path = "C:\Program Files (x86)\Aspel\Aspel-SAE 9.0\SAEWIN90.exe"
        Arguments = $null
        WaitSeconds = 0
    },
    @{
        Name = "iVMS-4200 3.12.1.5 Client"
        Path = "C:\Program Files (x86)\iVMS-4200 Site\iVMS-4200 Client\Client\iVMS-4200.Framework.C.exe"
        Arguments = $null
        WaitSeconds = 0
        OnlyOnDayOfWeek = "Monday"
    }
)

New-Item -ItemType Directory -Path (Split-Path $LogFile) -Force | Out-Null
Write-Log "=== Inicio de aplicaciones matutinas ==="

$today = (Get-Date).DayOfWeek

foreach ($app in $apps) {
    try {
        if ($app.OnlyOnDayOfWeek -and ($today -ne $app.OnlyOnDayOfWeek)) {
            $daySpanish = switch ($app.OnlyOnDayOfWeek) {
                'Monday'    { 'lunes' }
                'Tuesday'   { 'martes' }
                'Wednesday' { 'miércoles' }
                'Thursday'  { 'jueves' }
                'Friday'    { 'viernes' }
                'Saturday'  { 'sábado' }
                'Sunday'    { 'domingo' }
                default     { $app.OnlyOnDayOfWeek }
            }
            Write-Log "Omitiendo $($app.Name) (solo se abre los $daySpanish)" "INFO"
            continue
        }

        Write-Log "Abriendo $($app.Name)..."
        if ($app.UseShellAppsFolder) {
            Start-Process -FilePath "explorer.exe" -ArgumentList $app.Path
        }
        else {
            if (-not (Test-Path $app.Path)) {
                Write-Log "No se encontró $($app.Name): $($app.Path)" "WARN"
                continue
            }
            $startArgs = @{
                FilePath = $app.Path
                WindowStyle = "Normal"
            }
            if ($app.Arguments) { $startArgs['ArgumentList'] = $app.Arguments }
            Start-Process @startArgs
        }

        if ($app.WaitSeconds -gt 0) {
            Start-Sleep -Seconds $app.WaitSeconds
        }
    }
    catch {
        Write-Log "Error al abrir $($app.Name): $_" "ERROR"
    }
}

Write-Log "=== Aplicaciones matutinas completadas ==="
