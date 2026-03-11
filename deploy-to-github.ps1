# Script para publicar 3P Website en GitHub Pages
# Autor: Asistente de Código
# Fecha: 2025

param(
    [string]$GitHubUsername = "Anibru300",
    [string]$RepoName = "website-3p"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Publicador de 3P Website a GitHub" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$requiredFiles = @("package.json", "vite.config.js", "index.html")
$missingFiles = $requiredFiles | Where-Object { -not (Test-Path $_) }

if ($missingFiles) {
    Write-Host "❌ Error: No se encuentran archivos del proyecto en esta carpeta" -ForegroundColor Red
    Write-Host "Archivos faltantes: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto verificado correctamente" -ForegroundColor Green
Write-Host ""

# Configurar el remote
$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "📡 Configurando repositorio remoto..." -ForegroundColor Yellow
Write-Host "   URL: $remoteUrl" -ForegroundColor Gray

# Verificar si ya existe el remote
try {
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "   El remote 'origin' ya existe: $existingRemote" -ForegroundColor Yellow
        $response = Read-Host "   ¿Deseas actualizarlo? (s/n)"
        if ($response -eq 's' -or $response -eq 'S') {
            git remote remove origin
            git remote add origin $remoteUrl
            Write-Host "   ✅ Remote actualizado" -ForegroundColor Green
        }
    } else {
        git remote add origin $remoteUrl
        Write-Host "   ✅ Remote agregado" -ForegroundColor Green
    }
} catch {
    git remote add origin $remoteUrl
    Write-Host "   ✅ Remote agregado" -ForegroundColor Green
}

Write-Host ""

# Verificar commits
$hasCommits = git log --oneline -1 2>$null
if (-not $hasCommits) {
    Write-Host "📝 Creando commit inicial..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit: 3P Website ready for deployment"
    Write-Host "   ✅ Commit creado" -ForegroundColor Green
} else {
    Write-Host "📝 Actualizando cambios..." -ForegroundColor Yellow
    git add .
    git commit -m "Update: Configured for GitHub Pages deployment" --allow-empty 2>$null
    Write-Host "   ✅ Cambios actualizados" -ForegroundColor Green
}

Write-Host ""

# Push a GitHub
Write-Host "☁️ Subiendo código a GitHub..." -ForegroundColor Yellow
try {
    git branch -M main
    git push -u origin main -f
    Write-Host "   ✅ Código subido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ No se pudo hacer push automáticamente" -ForegroundColor Yellow
    Write-Host "   Posibles causas:" -ForegroundColor Gray
    Write-Host "   - El repositorio aún no existe en GitHub" -ForegroundColor Gray
    Write-Host "   - No has iniciado sesión en Git" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Para crear el repositorio:" -ForegroundColor Cyan
    Write-Host "   1. Ve a: https://github.com/new" -ForegroundColor White
    Write-Host "   2. Nombre: $RepoName" -ForegroundColor White
    Write-Host "   3. Selecciona 'Public'" -ForegroundColor White
    Write-Host "   4. NO marques 'Initialize with README'" -ForegroundColor White
    Write-Host "   5. Haz clic en 'Create repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "   Luego ejecuta manualmente:" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor White
    exit 1
}

Write-Host ""

# Deploy a GitHub Pages
Write-Host "🚀 Publicando en GitHub Pages..." -ForegroundColor Yellow
Write-Host "   Esto puede tomar unos minutos..." -ForegroundColor Gray

try {
    npm run deploy
    Write-Host "   ✅ Sitio publicado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al publicar" -ForegroundColor Red
    Write-Host "   Verifica que tengas instalado gh-pages: npm install -D gh-pages" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ¡PUBLICACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Tu sitio estará disponible en:" -ForegroundColor Cyan
Write-Host "   https://$GitHubUsername.github.io/$RepoName/" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Nota: Puede tardar 2-5 minutos en estar disponible" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Siguiente paso (solo la primera vez):" -ForegroundColor Cyan
Write-Host "   1. Ve a: https://github.com/$GitHubUsername/$RepoName/settings/pages" -ForegroundColor White
Write-Host "   2. En 'Source' selecciona: 'Deploy from a branch'" -ForegroundColor White
Write-Host "   3. En 'Branch' selecciona: 'gh-pages'" -ForegroundColor White
Write-Host "   4. Haz clic en 'Save'" -ForegroundColor White
Write-Host ""
