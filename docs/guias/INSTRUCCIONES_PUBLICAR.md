# ðŸš€ Instrucciones para Publicar 3P Website en GitHub

## ðŸ“‹ RESUMEN RÃPIDO

Tu proyecto estÃ¡ listo en:
```
C:\Projects\PAGINA WEB 3P\
```

Tu sitio se publicarÃ¡ en:
```
https://Anibru300.github.io/website-3p/
```

---

## OPCIÃ“N 1: Usar el Script AutomÃ¡tico (Recomendado)

1. **Abre PowerShell** como Administrador

2. **Navega a la carpeta del proyecto:**
```powershell
cd "C:\Projects\PAGINA WEB 3P"
```

3. **Ejecuta el script:**
```powershell
.\scripts\deploy\deploy-to-github.ps1
```

4. **Si el repositorio no existe**, el script te darÃ¡ instrucciones para crearlo en GitHub.

---

## OPCIÃ“N 2: Comandos Manuales

### Paso 1: Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. **Repository name:** `website-3p`
3. **Description:** Sitio web oficial de 3P S.A. DE C.V.
4. Selecciona **Public**
5. **NO** marques "Initialize this repository with a README"
6. Haz clic en **Create repository**

### Paso 2: Subir el CÃ³digo

En PowerShell, ejecuta:

```powershell
cd "C:\Projects\PAGINA WEB 3P"

# Configurar remote
git remote add origin https://github.com/Anibru300/website-3p.git

# Subir cÃ³digo
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
3. En **Branch** selecciona: `gh-pages` â†’ `/ (root)`
4. Haz clic en **Save**

### Paso 5: Ver tu Sitio

DespuÃ©s de 2-5 minutos, visita:
```
https://Anibru300.github.io/website-3p/
```

---

## ðŸ“ Para Actualizar el Sitio en el Futuro

Cada vez que hagas cambios:

```powershell
cd "C:\Projects\PAGINA WEB 3P"

# Guardar cambios
git add .
git commit -m "DescripciÃ³n de cambios"
git push

# Publicar
npm run deploy
```

---

## â“ SoluciÃ³n de Problemas

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

### El sitio no se ve bien (sin estilos o imÃ¡genes)

Verifica que en `vite.config.js` tengas:
```javascript
base: '/website-3p/',
```

Y en `package.json`:
```json
"homepage": "https://Anibru300.github.io/website-3p"
```

---

## ðŸ“ž Contacto y Soporte

- **GitHub:** https://github.com/Anibru300
- **Proyecto:** https://github.com/Anibru300/website-3p (despuÃ©s de crearlo)

---

## ðŸŽ‰ Â¡Listo!

Tu sitio web profesional de 3P S.A. DE C.V. estarÃ¡ en lÃ­nea pronto.
