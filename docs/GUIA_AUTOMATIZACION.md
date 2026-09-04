# ðŸ¤– GuÃ­a de AutomatizaciÃ³n Completa

## Â¿QuÃ© se configurÃ³?

### 1. **GitHub CLI (gh)**
- Se instalÃ³ automÃ¡ticamente usando Winget
- Permite crear repositorios y gestionar GitHub desde la terminal

### 2. **Scripts de AutomatizaciÃ³n**

| Archivo | FunciÃ³n |
|---------|---------|
| `PUBLICAR_AUTOMATICO.ps1` | Script principal de PowerShell que hace TODO |
| `PUBLICAR_3P_WEBSITE.bat` | Acceso directo fÃ¡cil (doble clic) |

### 3. **ConfiguraciÃ³n del Proyecto**

#### `package.json`
```json
{
  "homepage": "https://Anibru300.github.io/website-3p",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### `vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/website-3p/',  // Importante para GitHub Pages
})
```

---

## Â¿QuÃ© hace el script automÃ¡tico?

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PASO 0: Verificar que el proyecto existe                   â”‚
â”‚  PASO 1: Verificar GitHub CLI instalado                     â”‚
â”‚  PASO 2: Verificar/Realizar login en GitHub                 â”‚
â”‚  PASO 3: Crear repositorio en GitHub (si no existe)         â”‚
â”‚  PASO 4: Configurar Git y subir cÃ³digo                      â”‚
â”‚  PASO 5: Compilar el proyecto (npm run build)               â”‚
â”‚  PASO 6: Publicar en GitHub Pages (npm run deploy)          â”‚
â”‚  PASO 7: Configurar GitHub Pages en el repositorio          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸš€ CÃ³mo usar (MÃ©todo FÃ¡cil)

### OpciÃ³n 1: Doble clic (Recomendado)
1. Abre la carpeta: `C:\Users\Importaciones-3P\Desktop\pagina web\`
2. Haz **doble clic** en: `PUBLICAR_3P_WEBSITE.bat`
3. Sigue las instrucciones en pantalla
4. Â¡Listo!

### OpciÃ³n 2: PowerShell
1. Abre PowerShell
2. Ejecuta:
```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web"
.\PUBLICAR_AUTOMATICO.ps1
```

---

## ðŸ” AutenticaciÃ³n (Primera vez)

La primera vez que ejecutes el script:

1. Se abrirÃ¡ tu navegador
2. Inicia sesiÃ³n en GitHub (si no lo has hecho)
3. Haz clic en "Authorize github"
4. Copia el cÃ³digo que aparece
5. PÃ©galo en la terminal cuando te lo pida
6. Presiona ENTER

**Esto solo se hace una vez.** DespuÃ©s el script funcionarÃ¡ automÃ¡ticamente.

---

## ðŸ“‹ Requisitos Previos

Para que funcione la automatizaciÃ³n completa necesitas:

| Requisito | Estado | DescripciÃ³n |
|-----------|--------|-------------|
| Cuenta GitHub | âœ… | Usuario: Anibru300 |
| Git instalado | âœ… | Ya estaba configurado |
| GitHub CLI | âœ… | Se instalÃ³ automÃ¡ticamente |
| Node.js/npm | âœ… | Ya estaba instalado |
| ConexiÃ³n a internet | Requerido | Para subir a GitHub |

---

## ðŸ”„ Flujo de Trabajo Futuro

DespuÃ©s de la primera publicaciÃ³n, para actualizar el sitio:

```powershell
cd "C:\Projects\PAGINA WEB 3P"
npm run deploy
```

**O simplemente:**
```
1. Edita los archivos
2. Guarda cambios
3. Ejecuta PUBLICAR_3P_WEBSITE.bat
```

---

## ðŸ› ï¸ SoluciÃ³n de Problemas

### "No se puede ejecutar scripts de PowerShell"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "gh no se reconoce como comando"
Cierra y vuelve a abrir PowerShell (para recargar el PATH)

### "Error al crear repositorio"
- Verifica que no exista ya: https://github.com/Anibru300/website-3p
- Si existe, el script lo usarÃ¡ automÃ¡ticamente

### "El sitio no se ve bien"
Verifica en `vite.config.js` que tenga:
```javascript
base: '/website-3p/',
```

---

## ðŸŒ URLs Importantes

| DescripciÃ³n | URL |
|-------------|-----|
| **Tu Sitio Web** | https://Anibru300.github.io/website-3p/ |
| **Repositorio** | https://github.com/Anibru300/website-3p |
| **ConfiguraciÃ³n Pages** | https://github.com/Anibru300/website-3p/settings/pages |

---

## ðŸ“ž Resumen de Archivos

```
C:\Users\Importaciones-3P\Desktop\pagina web\
â”‚
â”œâ”€â”€ PUBLICAR_3P_WEBSITE.bat          â† Ejecuta esto (doble clic)
â”œâ”€â”€ PUBLICAR_AUTOMATICO.ps1          â† Script principal
â”œâ”€â”€ GUIA_AUTOMATIZACION.md           â† Esta guÃ­a
â”‚
â””â”€â”€ 3p-website\                      â† Proyecto
    â”œâ”€â”€ package.json                 â† Configurado para deploy
    â”œâ”€â”€ vite.config.js               â† Configurado para GitHub Pages
    â”œâ”€â”€ scripts\deploy\deploy-to-github.ps1  â† Script alternativo
    â””â”€â”€ ...
```

---

## âœ… Checklist antes de ejecutar

- [ ] Tienes cuenta en GitHub (Anibru300)
- [ ] EstÃ¡s conectado a internet
- [ ] Los archivos del proyecto estÃ¡n en `C:\Projects\PAGINA WEB 3P\`
- [ ] Tienes 5-10 minutos libres (tiempo de instalaciÃ³n + deploy)

---

**Â¡Todo estÃ¡ listo! Solo ejecuta `PUBLICAR_3P_WEBSITE.bat` y sigue las instrucciones.** ðŸš€
