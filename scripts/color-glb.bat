@echo off
chcp 65001 >nul
title Colorear modelo GLB
cls

echo ==========================================
echo   🎨 EDITOR DE COLOR PARA MODELOS 3D
echo ==========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado.
    echo.
    echo 💡 Por favor instala Node.js desde:
    echo    https://nodejs.org
    echo.
    echo 🌐 O usa las herramientas online:
    echo    https://threejs.org/editor/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detectado:
node --version
echo.

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    echo    (Esto puede tardar unos minutos)
    echo.
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
echo.
)

REM Ejecutar script
echo 🚀 Ejecutando script de coloreado...
echo.
node add-color-to-glb.js

echo.
echo ==========================================
pause
