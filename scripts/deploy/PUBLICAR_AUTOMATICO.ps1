# Script de Publicacion Automatica Completa - 3P Website
# Este script hace TODO automaticamente: crea repo, sube codigo, configura GitHub Pages y publica

param(
    [string]$GitHubUsername = "Anibru300",
    [string]$RepoName = "website-3p"
)

# Configurar codificacion UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "INFO: $Message" -ForegroundColor Yellow
}

Write-Header "PUBLICADOR AUTOMATICO - 3P WEBSITE"

# ============================================
# PASO 0: Verificar que estamos en el directorio correcto
# ============================================
Write-Header "PASO 0: Verificando Proyecto"

$projectPath = "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"
Set-Location $projectPath

$requiredFiles = @("package.json", "vite.config.js", "index.html")
$missingFiles = $requiredFiles | Where-Object { -not (Test-Path $_) }

if ($missingFiles) {
    Write-ErrorMsg "No se encuentran archivos del proyecto. Archivos faltantes: $($missingFiles -join ', ')"
    exit 1
}

Write-Success "Proyecto verificado en: $projectPath"

# ============================================
# PASO 1: Verificar GitHub CLI
# ============================================
Write-Header "PASO 1: Verificando GitHub CLI"

try {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Success "GitHub CLI encontrado: $ghVersion"
} catch {
    Write-Info "GitHub CLI no esta instalado. Instalando..."
    winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
    
    # Recargar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# ============================================
# PASO 2: Verificar Autenticacion en GitHub
# ============================================
Write-Header "PASO 2: Verificando Autenticacion"

$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "No estas autenticado en GitHub. Iniciando proceso de login..."
    Write-Host ""
    Write-Host "Se abrira una ventana del navegador para que autorices el acceso." -ForegroundColor Yellow
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "  1. Inicia sesion en GitHub si es necesario" -ForegroundColor White
    Write-Host "  2. Haz clic en Authorize github" -ForegroundColor White
    Write-Host "  3. Copia el codigo que se muestra" -ForegroundColor White
    Write-Host "  4. Pegalo aqui cuando te lo pida" -ForegroundColor White
    Write-Host ""
    Write-Host "Presiona ENTER cuando estes listo para continuar..." -ForegroundColor Cyan
    Read-Host
    
    gh auth login --web
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "No se pudo completar la autenticacion"
        exit 1
    }
}

$currentUser = gh api user --jq '.login' 2>$null
if ($currentUser) {
    Write-Success "Autenticado como: $currentUser"
    if ($currentUser -ne $GitHubUsername) {
        Write-Info "Usuario autenticado ($currentUser) diferente al configurado ($GitHubUsername)"
        Write-Info "Usando usuario autenticado: $currentUser"
        $GitHubUsername = $currentUser
        
        # Actualizar package.json con el usuario correcto
        $packageContent = Get-Content package.json -Raw
        $packageContent = $packageContent -replace 'https://[^/]+\.github\.io', "https://$GitHubUsername.github.io"
        Set-Content package.json $packageContent
    }
} else {
    Write-ErrorMsg "No se pudo verificar el usuario autenticado"
    exit 1
}

# ============================================
# PASO 3: Verificar/Crear Repositorio
# ============================================
Write-Header "PASO 3: Verificando Repositorio"

$repoExists = gh repo view "$GitHubUsername/$RepoName" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "El repositorio ya existe: $GitHubUsername/$RepoName"
} else {
    Write-Info "Creando repositorio en GitHub..."
    
    gh repo create $RepoName --public --description "Sitio web oficial de 3P S.A. DE C.V." --source=. --remote=origin --push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Repositorio creado exitosamente"
    } else {
        Write-ErrorMsg "No se pudo crear el repositorio"
        exit 1
    }
}

# ============================================
# PASO 4: Configurar Git y Subir Codigo
# ============================================
Write-Header "PASO 4: Configurando Git y Subiendo Codigo"

# Verificar si es un repositorio git
if (-not (Test-Path ".git")) {
    Write-Info "Inicializando repositorio Git..."
    git init
    git branch -M main
}

# Configurar remote
$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
git remote remove origin 2>$null
git remote add origin $remoteUrl
Write-Success "Remote configurado: $remoteUrl"

# Verificar si hay cambios para commitear
$status = git status --porcelain
if ($status) {
    Write-Info "Guardando cambios..."
    git add .
    git commit -m "Update: Preparando para publicacion automatica"
}

# Push
Write-Info "Subiendo codigo a GitHub..."
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Success "Codigo subido exitosamente"
} else {
    Write-ErrorMsg "Error al subir el codigo"
    exit 1
}

# ============================================
# PASO 5: Compilar el Proyecto
# ============================================
Write-Header "PASO 5: Compilando Proyecto"

Write-Info "Instalando dependencias..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Error al instalar dependencias"
    exit 1
}

Write-Info "Compilando para produccion..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Error al compilar el proyecto"
    exit 1
}

Write-Success "Proyecto compilado exitosamente"

# ============================================
# PASO 6: Publicar en GitHub Pages
# ============================================
Write-Header "PASO 6: Publicando en GitHub Pages"

# Instalar gh-pages si no esta instalado
npm list gh-pages 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Info "Instalando gh-pages..."
    npm install -D gh-pages
}

Write-Info "Desplegando a GitHub Pages..."
npm run deploy

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Error al desplegar"
    exit 1
}

Write-Success "Sitio desplegado exitosamente"

# ============================================
# RESUMEN FINAL
# ============================================
Write-Header "PUBLICACION COMPLETADA"

$websiteUrl = "https://$GitHubUsername.github.io/$RepoName/"
$repoUrl = "https://github.com/$GitHubUsername/$RepoName"

Write-Host "TU SITIO ESTA EN LINEA:" -ForegroundColor Green
Write-Host "   $websiteUrl" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "Repositorio:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Notas importantes:" -ForegroundColor Yellow
Write-Host "   - El sitio puede tardar 2-5 minutos en estar completamente disponible" -ForegroundColor White
Write-Host "   - Si ves una pagina 404, espera unos minutos y refresca" -ForegroundColor White
Write-Host "   - Los cambios futuros se publican con: npm run deploy" -ForegroundColor White
Write-Host ""
Write-Host "Para actualizar en el futuro:" -ForegroundColor Cyan
Write-Host "   npm run deploy" -ForegroundColor White
Write-Host ""
