# 🚀 Guía de Publicación en GitHub Pages

Esta guía te ayudará a publicar tu sitio web de 3P S.A. DE C.V. en GitHub Pages.

---

## Paso 1: Crear el Repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. En **Repository name** escribe: `website-3p`
3. En **Description** puedes poner: "Sitio web oficial de 3P S.A. DE C.V. - Equipos para la industria avícola"
4. Selecciona **Public** (para que GitHub Pages funcione gratis)
5. **NO** marques "Initialize this repository with a README" (ya tenemos uno)
6. Haz clic en **Create repository**

---

## Paso 2: Conectar tu Repositorio Local con GitHub

Abre PowerShell en la carpeta del proyecto y ejecuta estos comandos:

```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"

# Agregar el repositorio remoto (reemplaza TU_USERNAME con tu usuario de GitHub)
git remote add origin https://github.com/TU_USERNAME/website-3p.git

# Subir el código
git branch -M main
git push -u origin main
```

---

## Paso 3: Actualizar la Configuración con tu Username

Antes de hacer deploy, necesitas actualizar el archivo `package.json` con tu nombre de usuario de GitHub:

1. Abre el archivo `package.json`
2. Busca la línea: `"homepage": "https://carlosurbina.github.io/website-3p"`
3. Reemplaza `carlosurbina` con tu nombre de usuario de GitHub
4. Guarda el archivo

Haz lo mismo en `vite.config.js` si es necesario.

---

## Paso 4: Publicar el Sitio

Ejecuta este comando en PowerShell:

```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"
npm run deploy
```

Esto:
1. Compilará el proyecto (`npm run build`)
2. Publicará automáticamente en GitHub Pages

---

## Paso 5: Configurar GitHub Pages (Primera vez)

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USERNAME/website-3p`
2. Haz clic en **Settings** (pestaña superior)
3. En el menú lateral izquierdo, haz clic en **Pages**
4. En "Source" selecciona: **Deploy from a branch**
5. En "Branch" selecciona: **gh-pages** y haz clic en **Save**

---

## Paso 6: Ver tu Sitio Publicado

Después de unos minutos (2-5 minutos), tu sitio estará disponible en:

```
https://TU_USERNAME.github.io/website-3p/
```

---

## 📝 Actualizar el Sitio

Cada vez que quieras hacer cambios:

```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"

# Guardar cambios
git add .
git commit -m "Descripción de los cambios"
git push

# Publicar	npm run deploy
```

---

## ❓ Solución de Problemas

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/TU_USERNAME/website-3p.git
```

### Error: "fatal: not a git repository"
```powershell
cd "C:\Users\Importaciones-3P\Desktop\pagina web\3p-website"
git init
git add .
git commit -m "Initial commit"
```

### El sitio no se ve correctamente
Verifica que:
1. La propiedad `homepage` en `package.json` tenga tu username correcto
2. La propiedad `base` en `vite.config.js` sea `/website-3p/`

---

## 📞 Soporte

Si tienes problemas, verifica:
- Que tu repositorio sea **Público**
- Que GitHub Pages esté habilitado en Settings > Pages
- Que la rama `gh-pages` exista (se crea automáticamente al hacer deploy)
