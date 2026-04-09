@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   PUBLICADOR AUTOMATICO - 3P WEBSITE
echo ==========================================
echo.
echo Este script publicara automaticamente tu
echo sitio web en GitHub Pages.
echo.
echo Requisitos:
echo - Tener cuenta en GitHub (Anibru300)
echo - Estar conectado a internet
echo.
pause

cd /d "C:\Users\Importaciones-3P\Desktop\pagina web"

powershell -ExecutionPolicy Bypass -File "PUBLICAR_AUTOMATICO.ps1"

echo.
echo.
echo Presiona cualquier tecla para salir...
pause >nul
