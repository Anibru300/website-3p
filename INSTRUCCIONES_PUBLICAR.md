# 🚀 Instrucciones para Publicar 3P Website en GitHub

## 📋 RESUMEN RÁPIDO

Tu proyecto está listo en:
```
C:\Users\Importaciones-3P\Desktop\pagina web\3p-website\
```

Tu sitio se publicará en:
```
https://Anibru300.github.io/website-3p/
```

---

## OPCIÓN 1: Usar el Script Automático (Recomendado)

1. **Abre PowerShell** como Administrador

2. **Navega a la carpeta del proyecto:**
```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"
```

3. **Ejecuta el script:**
```powershell
.\deploy-to-github.ps1
```

4. **Si el repositorio no existe**, el script te dará instrucciones para crearlo en GitHub.

---

## OPCIÓN 2: Comandos Manuales

### Paso 1: Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. **Repository name:** `website-3p`
3. **Description:** Sitio web oficial de 3P S.A. DE C.V.
4. Selecciona **Public**
5. **NO** marques "Initialize this repository with a README"
6. Haz clic en **Create repository**

### Paso 2: Subir el Código

En PowerShell, ejecuta:

```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"

# Configurar remote
git remote add origin https://github.com/Anibru300/website-3p.git

# Subir código
git branch -M main
git push -u origin main
```

### Paso 3: Publicar el Sitio

```powershell
npm run deploy
```

### Paso 4: Configurar GitHub Pages

1. Ve a: https://github.com/Anibru300/website-3p/settings/pages
2. En **Source** selecciona: `Deploy from a branch`
3. En **Branch** selecciona: `gh-pages` → `/ (root)`
4. Haz clic en **Save**

### Paso 5: Ver tu Sitio

Después de 2-5 minutos, visita:
```
https://Anibru300.github.io/website-3p/
```

---

## 📝 Para Actualizar el Sitio en el Futuro

Cada vez que hagas cambios:

```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"

# Guardar cambios
git add .
git commit -m "Descripción de cambios"
git push

# Publicar
npm run deploy
```

---

## ❓ Solución de Problemas

### Error: "No se puede cargar el archivo deploy-to-github.ps1"

Ejecuta esto primero:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/Anibru300/website-3p.git
```

### El sitio no se ve bien (sin estilos o imágenes)

Verifica que en `vite.config.js` tengas:
```javascript
base: '/website-3p/',
```

Y en `package.json`:
```json
"homepage": "https://Anibru300.github.io/website-3p"
```

---

## 📞 Contacto y Soporte

- **GitHub:** https://github.com/Anibru300
- **Proyecto:** https://github.com/Anibru300/website-3p (después de crearlo)

---

## 🎉 ¡Listo!

Tu sitio web profesional de 3P S.A. DE C.V. estará en línea pronto.
