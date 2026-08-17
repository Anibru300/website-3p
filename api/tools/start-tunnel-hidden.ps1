# Inicia el túnel de Cloudflare en segundo plano y guarda logs.
# Uso: Task Scheduler al inicio de sesión.

$ScriptDir = "G:\Mi unidad\pagina web\3p-website\api\tools"
$Cloudflared = "$ScriptDir\cloudflared.exe"
$ConfigPath = "$ScriptDir\.cloudflared\config.yml"
$TokenPath = "$ScriptDir\.cloudflared\token.txt"
$LogDir = "$ScriptDir\..\logs"
$StartupLog = "$LogDir\startup-tunnel.log"
$LogFile = "$LogDir\tunnel.log"
$ErrFile = "$LogDir\tunnel.err"

function Write-StartupLog($message) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -Path $StartupLog -Value "$timestamp $message"
    Write-Host "$timestamp $message"
}

# Crear directorio de logs
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Descargar cloudflared.exe si no existe
if (!(Test-Path $Cloudflared)) {
    Write-StartupLog "Descargando cloudflared.exe..."
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    try {
        Invoke-WebRequest -Uri $url -OutFile $Cloudflared -UseBasicParsing
        Write-StartupLog "cloudflared.exe descargado correctamente."
    } catch {
        Write-StartupLog "ERROR: No se pudo descargar cloudflared.exe: $_"
        exit 1
    }
}

# Verificar archivo de configuración
if (!(Test-Path $ConfigPath)) {
    Write-StartupLog "ERROR: No se encontró $ConfigPath. Ejecuta primero: api\tools\setup-cloudflare-tunnel.ps1"
    exit 1
}

# Evitar múltiples instancias
$existing = Get-Process | Where-Object { $_.Name -like "*cloudflared*" }
if ($existing) {
    Write-StartupLog "cloudflared ya está corriendo (PID $($existing.Id)). Se omite inicio."
    exit 0
}

# Iniciar túnel en segundo plano
$arguments = @("tunnel", "run")
if (Test-Path $TokenPath) {
    $token = Get-Content $TokenPath -Raw
    $arguments += "--token"
    $arguments += $token.Trim()
    Write-StartupLog "Iniciando túnel con token..."
} elseif (Test-Path $ConfigPath) {
    $arguments += "--config"
    $arguments += $ConfigPath
    Write-StartupLog "Iniciando túnel con config: $ConfigPath"
} else {
    Write-StartupLog "ERROR: No se encontró token ni config del túnel."
    exit 1
}

try {
    Start-Process -FilePath $Cloudflared `
        -ArgumentList $arguments `
        -WorkingDirectory $ScriptDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $LogFile `
        -RedirectStandardError $ErrFile
    Write-StartupLog "Túnel iniciado. Logs en $LogFile"
} catch {
    Write-StartupLog "ERROR al iniciar túnel: $_"
    exit 1
}
