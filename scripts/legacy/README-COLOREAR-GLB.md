# 🎨 Guía para Colorear Modelos 3D (GLB)

Esta guía te explica cómo darle color a los modelos 3D generados por IA.

---

## ⚡ MÉTODO RÁPIDO: Three.js Editor (Recomendado)

**Tiempo:** 5 minutos | **Dificultad:** Fácil | **Costo:** Gratis

### Paso a paso:

1. **Abre el editor:**
   - Ve a: https://threejs.org/editor/

2. **Importa tu modelo:**
   - Haz clic en **"File"** → **"Import"**
   - Selecciona tu archivo `.glb` (ej: `48299.glb`)
   - El modelo aparecerá en la escena (normalmente en gris)

3. **Selecciona el objeto:**
   - En el panel de la **izquierda**, haz clic en el nombre del objeto
   - Puede llamarse "Mesh", "Object" o el nombre del archivo

4. **Aplica el color:**
   - En el panel de la **derecha**, busca la sección **"MATERIAL"**
   - Haz clic en el cuadrado de color (normalmente blanco o gris)
   - Selecciona el color deseado:
     - **Sensores:** Blanco hueso `#F5F5DC`
     - **Tarjetas:** Azul claro `#E3F2FD`
     - **Motores:** Gris plata `#C0C0C0`
     - **Cables:** Cobre `#B87333`
   
5. **Ajusta el brillo:**
   - **Roughness:** 0.3 (más bajo = más brillante)
   - **Metalness:** 0.1 (0 = plástico, 1 = metal)

6. **Exporta el modelo:**
   - **File** → **"Export GLB"**
   - Guarda como `48299-colored.glb`

7. **Reemplaza el archivo:**
   - Ve a la carpeta `public/models/`
   - Renombra: `48299.glb` → `48299-original.glb`
   - Renombra: `48299-colored.glb` → `48299.glb`

8. **Prueba en tu web:**
   - Recarga la página y verás el modelo con color!

---

## 🛠️ MÉTODO AVANZADO: Node.js Script

**Tiempo:** 10 minutos | **Dificultad:** Media | **Costo:** Gratis

### Requisitos:
- Tener [Node.js](https://nodejs.org) instalado
- Acceso a terminal/consola

### Instrucciones:

1. **Abre terminal** en la carpeta `scripts/`

2. **Instala dependencias:**
   ```bash
   npm install
   ```

3. **Edita la configuración:**
   - Abre `add-color-to-glb.js` en un editor de texto
   - Cambia el color en la sección `CONFIG`:
   ```javascript
   color: '#F5F5DC', // Cambia al color que quieras
   ```

4. **Ejecuta el script:**
   ```bash
   node add-color-to-glb.js
   ```

5. **El archivo coloreado se generará automáticamente**

---

## 🎨 PALETA DE COLORES RECOMENDADA

### Por tipo de producto:

| Producto | Código | Color HEX | Vista previa |
|----------|--------|-----------|--------------|
| **Sensores** | 48xxx | `#F5F5DC` | 🟨 Blanco hueso |
| **Tarjetas** | 41xxx | `#E3F2FD` | 🟦 Azul claro |
| **Controles** | 49xxx | `#E3F2FD` | 🟦 Azul claro |
| **Motores** | 32xxx | `#C0C0C0` | ⬜ Gris plata |
| **Mecánicos** | 42xxx | `#B87333` | 🟫 Cobre |
| **Tubos** | 68xxx | `#FFFFFF` | ⬜ Blanco puro |
| **Cables** | 51xxx | `#D2691E` | 🟫 Cobre oscuro |

### Colores genéricos:

| Nombre | HEX | Uso |
|--------|-----|-----|
| Blanco puro | `#FFFFFF` | Plástico blanco |
| Gris claro | `#D3D3D3` | Aluminio |
| Gris oscuro | `#4A4A4A` | Acero |
| Negro | `#1A1A1A` | Plástico técnico |
| Dorado | `#D4AF37` | Contactos/eléctrico |
| Verde PCB | `#2E7D32` | Circuitos |
| Rojo | `#C62828` | Alertas/botones |

---

## 🔧 HERRAMIENTAS ALTERNATIVAS

### Opción 1: Gestaltor (Más profesional)
- Web: https://gestaltor.io/
- Descarga el software (gratis)
- Abre el GLB
- Edita materiales visualmente
- Exporta

### Opción 2: Blender (Más potente)
- Descarga: https://www.blender.org/
- Importa el GLB
- Selecciona el objeto
- En "Material Properties" cambia el color
- Exporta como GLB

### Opción 3: glTF Report (Online)
- Web: https://gltf.report/
- Arrastra tu archivo
- Edita el JSON de materiales
- Descarga

---

## ❌ SOLUCIÓN DE PROBLEMAS

### "El modelo sigue gris en la web"
- Asegúrate de reemplazar el archivo original
- Limpia la caché del navegador (Ctrl+Shift+R)
- Verifica que el archivo tenga extensión `.glb`

### "El color no se ve igual"
- Prueba diferentes valores de `roughness` (0-1)
- Usa iluminación en el visor 3D (exposure)
- El entorno HDR afecta cómo se ve el color

### "El archivo es muy grande"
- Usa https://gltf.report/ para comprimir
- Reduce la complejidad del modelo en la IA

---

## 📝 EJEMPLO RÁPIDO

**Antes:** Sensor 48299 (gris)  
**Después:** Sensor 48299 (blanco hueso #F5F5DC)

**Pasos:**
1. Abre https://threejs.org/editor/
2. Importa `48299.glb`
3. Selecciona el objeto
4. Material → Color: `#F5F5DC`
5. Roughness: `0.3`
6. Metalness: `0.1`
7. Export GLB
8. ¡Listo!

---

## 💡 CONSEJOS

1. **Siempre guarda el original** antes de modificar
2. **Prueba diferentes colores** hasta encontrar el ideal
3. **Usa colores reales** que correspondan al producto real
4. **Mantén consistencia** entre productos similares
5. **Documenta** qué color usaste para cada tipo de producto

---

## 🆘 AYUDA

Si tienes problemas:
1. Revisa que el archivo GLB no esté corrupto
2. Intenta con otra herramienta de la lista
3. Verifica que el modelo tenga geometría (no esté vacío)
4. Consulta el canal de ayuda de Three.js: https://discourse.threejs.org/
