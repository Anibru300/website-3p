# Script de preparacion del backend del portal 3P
# Lee credenciales de PostgreSQL desde C:\Projects\CJ_Assistant\.env
# y configura G:\Mi unidad\pagina web\3p-website\api\.env

$ErrorActionPreference = "Stop"

$sourceEnv = "C:\Projects\CJ_Assistant\.env"
$targetEnv = "G:\Mi unidad\pagina web\3p-website\api\.env"
$apiDir = Split-Path -Parent $targetEnv

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Preparando backend del portal 3P" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Verificar que existe el .env de CJ_Assistant
if (-not (Test-Path $sourceEnv)) {
    Write-Host "ERROR: No se encontro $sourceEnv" -ForegroundColor Red
    Write-Host "Verifica que CJ_Assistant este instalado en C:\Projects\CJ_Assistant" -ForegroundColor Yellow
    exit 1
}

# 2. Leer variables del .env de CJ_Assistant
function Get-EnvValue {
    param($file, $key)
    $line = Get-Content $file | Where-Object { $_ -match "^\s*$key\s*=\s*(.*)\s*$" }
    if ($line) {
        return $line.Split('=', 2)[1].Trim()
    }
    return $null
}

$pgHost = Get-EnvValue -file $sourceEnv -key "POSTGRES_HOST"
$pgPort = Get-EnvValue -file $sourceEnv -key "POSTGRES_PORT"
$pgDb = Get-EnvValue -file $sourceEnv -key "POSTGRES_DB"
$pgUser = Get-EnvValue -file $sourceEnv -key "POSTGRES_USER"
$pgPassword = Get-EnvValue -file $sourceEnv -key "POSTGRES_PASSWORD"

# Ajustar host: si es 'postgres' (nombre del contenedor), usar localhost desde fuera de Docker
if ($pgHost -eq "postgres") {
    $pgHost = "localhost"
}

# Validar que tenemos todos los valores
$missing = @()
if (-not $pgHost) { $missing += "POSTGRES_HOST" }
if (-not $pgPort) { $missing += "POSTGRES_PORT" }
if (-not $pgDb) { $missing += "POSTGRES_DB" }
if (-not $pgUser) { $missing += "POSTGRES_USER" }
if (-not $pgPassword) { $missing += "POSTGRES_PASSWORD" }

if ($missing.Count -gt 0) {
    Write-Host "ERROR: Faltan variables en $sourceEnv`: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "Credenciales de PostgreSQL leidas correctamente." -ForegroundColor Green
Write-Host "Host: $pgHost, Puerto: $pgPort, Base: $pgDb, Usuario: $pgUser" -ForegroundColor Gray

# 3. Generar JWT secret seguro
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

# 4. Escribir el .env del backend del portal
$envContent = @"
# App
APP_NAME=CJ_OS Core API
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000

# Security
JWT_SECRET=$jwtSecret

# CORS (solo el dominio real de produccion)
CORS_ORIGINS=https://3psadecv.com

# PostgreSQL (heredado de CJ_Assistant)
POSTGRES_HOST=$pgHost
POSTGRES_PORT=$pgPort
POSTGRES_DB=$pgDb
POSTGRES_USER=$pgUser
POSTGRES_PASSWORD=$pgPassword

# Users DB (SQLite local, no va al repo)
USERS_DB_PATH=./data/users.db

# San Antonio Excel
SAN_ANTONIO_EXCEL_PATH=C:/Users/Ventas-3P/Desktop/SAN ANTONIO/SAN_ANTONIO_SEGUIMIENTO.xlsx
"@

$envContent | Set-Content -Path $targetEnv -Encoding UTF8
Write-Host "Archivo $targetEnv creado/actualizado correctamente." -ForegroundColor Green

# 5. Verificar entorno virtual Python
$venvPython = Join-Path $apiDir ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "Entorno virtual no encontrado. Creandolo..." -ForegroundColor Yellow
    & python -m venv (Join-Path $apiDir ".venv")
    if (-not (Test-Path $venvPython)) {
        Write-Host "ERROR: No se pudo crear el entorno virtual. Verifica que Python este instalado." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Verificando Python..." -ForegroundColor Cyan
& $venvPython --version

# 6. Verificar/instalar dependencias
Write-Host "Verificando dependencias..." -ForegroundColor Cyan
$pip = Join-Path $apiDir ".venv\Scripts\pip.exe"
& $pip install -r (Join-Path $apiDir "requirements.txt") | Out-String | Write-Host

# 7. Probar conexion a PostgreSQL usando un archivo temporal
Write-Host "Probando conexion a PostgreSQL..." -ForegroundColor Cyan
$testFile = Join-Path $apiDir "tools\_tmp_test_pg.py"
$testScript = @"
import psycopg2
import sys

try:
    conn = psycopg2.connect(
        host='$pgHost',
        port='$pgPort',
        dbname='$pgDb',
        user='$pgUser',
        password='$pgPassword'
    )
    cur = conn.cursor()
    cur.execute('SELECT version();')
    version = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    table_count = cur.fetchone()[0]
    conn.close()
    print(f'OK: PostgreSQL conectado. Version: {version}')
    print(f'OK: Tablas publicas encontradas: {table_count}')
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
"@

$testScript | Set-Content -Path $testFile -Encoding UTF8
try {
    & $venvPython $testFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudo conectar a PostgreSQL. Revisa las credenciales." -ForegroundColor Red
        exit 1
    }
}
finally {
    Remove-Item $testFile -ErrorAction SilentlyContinue
}

# 8. Verificar que existan las vistas/tablas que necesita el portal
Write-Host "Verificando tablas/vistas requeridas por el portal..." -ForegroundColor Cyan
$checkFile = Join-Path $apiDir "tools\_tmp_check_tables.py"
$checkScript = @"
import psycopg2
import sys

try:
    conn = psycopg2.connect(
        host='$pgHost',
        port='$pgPort',
        dbname='$pgDb',
        user='$pgUser',
        password='$pgPassword'
    )
    cur = conn.cursor()
    required = [
        'sae_existencias',
        'sae_productos',
        'sae_almacenes',
        'sae_movimientos_inventario',
        'vales',
        'vale_lineas',
        'v_pedidos_vivos',
        'v_facturas_cobranza',
        'v_seguimiento_documental'
    ]
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' UNION SELECT table_name FROM information_schema.views WHERE table_schema = 'public'")
    existing = {row[0] for row in cur.fetchall()}
    missing = [r for r in required if r not in existing]
    conn.close()
    
    if missing:
        print('ADVERTENCIA: Faltan tablas/vistas: ' + ', '.join(missing))
        print('El portal funcionara pero esas pestanas mostraran vacio o error.')
    else:
        print('OK: Todas las tablas/vistas requeridas existen.')
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
"@

$checkScript | Set-Content -Path $checkFile -Encoding UTF8
try {
    & $venvPython $checkFile
}
finally {
    Remove-Item $checkFile -ErrorAction SilentlyContinue
}

Write-Host "" 
Write-Host "==============================================" -ForegroundColor Green
Write-Host "PASO 2 COMPLETADO" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "El backend esta configurado. Ya puedes seguir al PASO 3." -ForegroundColor Green
