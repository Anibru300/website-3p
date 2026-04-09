# 🤖 Guía de Automatización Completa

## ¿Qué se configuró?

### 1. **GitHub CLI (gh)**
- Se instaló automáticamente usando Winget
- Permite crear repositorios y gestionar GitHub desde la terminal

### 2. **Scripts de Automatización**

| Archivo | Función |
|---------|---------|
| `PUBLICAR_AUTOMATICO.ps1` | Script principal de PowerShell que hace TODO |
| `PUBLICAR_3P_WEBSITE.bat` | Acceso directo fácil (doble clic) |

### 3. **Configuración del Proyecto**

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

## ¿Qué hace el script automático?

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 0: Verificar que el proyecto existe                   │
│  PASO 1: Verificar GitHub CLI instalado                     │
│  PASO 2: Verificar/Realizar login en GitHub                 │
│  PASO 3: Crear repositorio en GitHub (si no existe)         │
│  PASO 4: Configurar Git y subir código                      │
│  PASO 5: Compilar el proyecto (npm run build)               │
│  PASO 6: Publicar en GitHub Pages (npm run deploy)          │
│  PASO 7: Configurar GitHub Pages en el repositorio          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cómo usar (Método Fácil)

### Opción 1: Doble clic (Recomendado)
1. Abre la carpeta: `C:\Users\Importaciones-3P\Desktop\pagina web\`
2. Haz **doble clic** en: `PUBLICAR_3P_WEBSITE.bat`
3. Sigue las instrucciones en pantalla
4. ¡Listo!

### Opción 2: PowerShell
1. Abre PowerShell
2. Ejecuta:
```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web"
.\PUBLICAR_AUTOMATICO.ps1
```

---

## 🔐 Autenticación (Primera vez)

La primera vez que ejecutes el script:

1. Se abrirá tu navegador
2. Inicia sesión en GitHub (si no lo has hecho)
3. Haz clic en "Authorize github"
4. Copia el código que aparece
5. Pégalo en la terminal cuando te lo pida
6. Presiona ENTER

**Esto solo se hace una vez.** Después el script funcionará automáticamente.

---

## 📋 Requisitos Previos

Para que funcione la automatización completa necesitas:

| Requisito | Estado | Descripción |
|-----------|--------|-------------|
| Cuenta GitHub | ✅ | Usuario: Anibru300 |
| Git instalado | ✅ | Ya estaba configurado |
| GitHub CLI | ✅ | Se instaló automáticamente |
| Node.js/npm | ✅ | Ya estaba instalado |
| Conexión a internet | Requerido | Para subir a GitHub |

---

## 🔄 Flujo de Trabajo Futuro

Después de la primera publicación, para actualizar el sitio:

```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"
npm run deploy
```

**O simplemente:**
```
1. Edita los archivos
2. Guarda cambios
3. Ejecuta PUBLICAR_3P_WEBSITE.bat
```

---

## 🛠️ Solución de Problemas

### "No se puede ejecutar scripts de PowerShell"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "gh no se reconoce como comando"
Cierra y vuelve a abrir PowerShell (para recargar el PATH)

### "Error al crear repositorio"
- Verifica que no exista ya: https://github.com/Anibru300/website-3p
- Si existe, el script lo usará automáticamente

### "El sitio no se ve bien"
Verifica en `vite.config.js` que tenga:
```javascript
base: '/website-3p/',
```

---

## 🌐 URLs Importantes

| Descripción | URL |
|-------------|-----|
| **Tu Sitio Web** | https://Anibru300.github.io/website-3p/ |
| **Repositorio** | https://github.com/Anibru300/website-3p |
| **Configuración Pages** | https://github.com/Anibru300/website-3p/settings/pages |

---

## 📞 Resumen de Archivos

```
C:\Users\Importaciones-3P\Desktop\pagina web\
│
├── PUBLICAR_3P_WEBSITE.bat          ← Ejecuta esto (doble clic)
├── PUBLICAR_AUTOMATICO.ps1          ← Script principal
├── GUIA_AUTOMATIZACION.md           ← Esta guía
│
└── 3p-website\                      ← Proyecto
    ├── package.json                 ← Configurado para deploy
    ├── vite.config.js               ← Configurado para GitHub Pages
    ├── deploy-to-github.ps1         ← Script alternativo
    └── ...
```

---

## ✅ Checklist antes de ejecutar

- [ ] Tienes cuenta en GitHub (Anibru300)
- [ ] Estás conectado a internet
- [ ] Los archivos del proyecto están en `C:\Users\Importaciones-3P\Desktop\pagina web\3p-website\`
- [ ] Tienes 5-10 minutos libres (tiempo de instalación + deploy)

---

**¡Todo está listo! Solo ejecuta `PUBLICAR_3P_WEBSITE.bat` y sigue las instrucciones.** 🚀
