#Requires -Version 5.1
<#
.SYNOPSIS
    Toma un snapshot del valor del inventario y lo guarda en el historial.
.DESCRIPTION
    Se ejecuta desde el Task Scheduler de Windows al iniciar la computadora.
    Espera a que la API esté lista, luego llama al endpoint de snapshot.
#>

$ErrorActionPreference = "Stop"

# Rutas
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path (Join-Path $projectRoot "api") ".env"
$logFile = Join-Path (Join-Path (Join-Path $projectRoot "api") "logs") "inventario-snapshot.log"

# Asegurar carpeta de logs
$logDir = Split-Path -Parent $logFile
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $logFile -Append -Encoding UTF8
}

# Leer SERVICE_TOKEN del .env
$serviceToken = $null
if (Test-Path $envFile) {
    $lines = Get-Content $envFile -Encoding UTF8
    foreach ($line in $lines) {
        if ($line -match '^SERVICE_TOKEN\s*=\s*(.+)$') {
            $serviceToken = $matches[1].Trim().Trim("'", '"')
            break
        }
    }
}

if (!$serviceToken -or $serviceToken -eq "cambiar_por_token_de_servicio_seguro") {
    Write-Log "ERROR: SERVICE_TOKEN no configurado en $envFile"
    exit 1
}

# Determinar URL de la API
# Por defecto usa localhost porque este script corre en la misma computadora del backend.
$apiUrl = "http://localhost:8000"
if (Test-Path $envFile) {
    $lines = Get-Content $envFile -Encoding UTF8
    foreach ($line in $lines) {
        if ($line -match '^API_URL\s*=\s*(.+)$') {
            $apiUrl = $matches[1].Trim().Trim("'", '"').TrimEnd('/')
            break
        }
    }
}

$healthEndpoint = "$apiUrl/health"
$snapshotEndpoint = "$apiUrl/api/inventario/valor-historico/snapshot"
$headers = @{
    "X-Service-Token" = $serviceToken
    "Accept" = "application/json"
}

# Esperar a que la API responda (máximo 5 minutos)
$maxWait = 300
$waited = 0
$ready = $false
while ($waited -lt $maxWait) {
    try {
        $null = Invoke-RestMethod -Uri $healthEndpoint -Method GET -TimeoutSec 5
        $ready = $true
        break
    }
    catch {
        Write-Log "Esperando API... ($waited s)"
        Start-Sleep -Seconds 10
        $waited += 10
    }
}

if (!$ready) {
    Write-Log "ERROR: API no respondió después de $maxWait segundos"
    exit 1
}

# Intentar snapshot hasta 3 veces
$intentos = 0
$maxIntentos = 3
while ($intentos -lt $maxIntentos) {
    $intentos++
    try {
        $response = Invoke-RestMethod -Uri $snapshotEndpoint -Method POST -Headers $headers -TimeoutSec 120
        Write-Log "OK: Snapshot guardado. Fecha=$($response.fecha), Registros=$($response.registros_guardados), ValorTotal=$($response.valor_total)"
        exit 0
    }
    catch {
        $errorMessage = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $errorMessage = "HTTP $statusCode - $errorMessage"
        }
        Write-Log "ERROR intento $intentos`: $errorMessage"
        if ($intentos -lt $maxIntentos) {
            Start-Sleep -Seconds 30
        }
    }
}

Write-Log "ERROR: No se pudo guardar el snapshot después de $maxIntentos intentos"
exit 1
