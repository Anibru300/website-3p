# Script de Publicacion Rapida - Sin interaccion manual
param(
    [string]$GitHubUsername = "Anibru300",
    [string]$RepoName = "website-3p"
)

$projectPath = "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"
Set-Location $projectPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUBLICANDO 3P WEBSITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar gh
$ghPath = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $ghPath) {
    Write-Host "GitHub CLI no encontrado. Instalando..." -ForegroundColor Yellow
    winget install GitHub.cli --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Verificar si esta autenticado
try {
    $user = gh api user --jq '.login' 2>$null
    if ($user) {
        Write-Host "Autenticado como: $user" -ForegroundColor Green
    } else {
        Write-Host "Por favor ejecuta primero: gh auth login" -ForegroundColor Red
        Write-Host "O abre el archivo PUBLICAR_3P_WEBSITE.bat y sigue las instrucciones" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error de autenticacion. Ejecuta: gh auth login" -ForegroundColor Red
    exit 1
}

# Crear repo si no existe
Write-Host "Verificando repositorio..." -ForegroundColor Yellow
$repoCheck = gh repo view "$user/$RepoName" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creando repositorio..." -ForegroundColor Yellow
    gh repo create $RepoName --public --description "Sitio web 3P S.A. DE C.V." -y
}

# Configurar git
Write-Host "Configurando Git..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin "https://github.com/$user/$RepoName.git"

# Commit y push
Write-Host "Subiendo codigo..." -ForegroundColor Yellow
git add . 2>$null
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" --allow-empty 2>$null
git push -u origin main --force

# Build
Write-Host "Compilando proyecto..." -ForegroundColor Yellow
npm install
npm run build

# Deploy
Write-Host "Publicando en GitHub Pages..." -ForegroundColor Yellow
npm run deploy

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SITIO PUBLICADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "URL: https://$user.github.io/$RepoName/" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
