# Inicia el túnel de Cloudflare en segundo plano y guarda logs.
# Uso: Task Scheduler al inicio de sesión.

$BaseDir = "G:\Mi unidad\pagina web\3p-website\api\tools"
$LogDir = "$BaseDir\..\logs"
$LogFile = "$LogDir\tunnel.log"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Evitar múltiples instancias
$existing = Get-Process | Where-Object { $_.Name -like "*cloudflared*" }
if ($existing) {
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') cloudflared ya está corriendo (PID $($existing.Id)). Se omite inicio."
    exit 0
}

Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Iniciando túnel..."

try {
    Set-Location $BaseDir
    if (Test-Path ".\start-cloudflared.ps1") {
        # Si existe el script del túnel, lo ejecuta en segundo plano
        Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy", "Bypass", "-File", "start-cloudflared.ps1" -WindowStyle Hidden -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
    } else {
        # Fallback: ejecuta cloudflared directamente con el túnel configurado
        Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "3p-website-api" -WindowStyle Hidden -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
    }
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Túnel iniciado."
} catch {
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ERROR: $_"
}
