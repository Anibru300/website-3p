/**
 * Script para agregar color a modelos GLB
 * 
 * INSTRUCCIONES DE USO:
 * ====================
 * 
 * Opción 1 - Usando Node.js (Recomendado):
 * ----------------------------------------
 * 1. Instalar Node.js desde: https://nodejs.org (descargar LTS)
 * 2. Abrir PowerShell en esta carpeta (scripts)
 * 3. Ejecutar: npm install @gltf-transform/core @gltf-transform/extensions
 * 4. Ejecutar: node add-color-to-glb.js
 * 
 * Opción 2 - Herramientas Online (Más fácil):
 * -------------------------------------------
 * Ver lista de herramientas online al final de este archivo
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  // Archivo de entrada (modelo sin color)
  inputFile: '../public/models/48299.glb',
  
  // Archivo de salida (modelo con color)
  outputFile: '../public/models/48299-colored.glb',
  
  // Color a aplicar (en formato HEX)
  // Opciones comunes para refacciones:
  // - '#FFFFFF' = Blanco puro
  // - '#F5F5DC' = Blanco hueso (sensores)
  // - '#E3F2FD' = Azul claro (electrónicos)
  // - '#D3D3D3' = Gris plata (metales)
  // - '#B87333' = Cobre
  // - '#C0C0C0' = Plateado
  color: '#F5F5DC',
  
  // Propiedades del material
  metalness: 0.1,    // 0 = plástico, 1 = metal
  roughness: 0.3,    // 0 = brillante/espejo, 1 = mate
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Convertir HEX a RGB array [r, g, b, a] con valores 0-1
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1.0];
}

// Verificar si el archivo existe
function checkFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: No se encontró el archivo: ${fullPath}`);
    console.log('\n💡 Asegúrate de que:');
    console.log(`   1. El archivo existe en: ${filePath}`);
    console.log('   2. Estás ejecutando este script desde la carpeta /scripts');
    return null;
  }
  return fullPath;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function addColorToGLB() {
  console.log('🎨 Agregando color a modelo GLB...\n');
  
  // Verificar archivo de entrada
  const inputPath = checkFile(CONFIG.inputFile);
  if (!inputPath) return;
  
  try {
    // Importar bibliotecas (se instalan con npm)
    const { NodeIO } = await import('@gltf-transform/core');
    
    // Crear interfaz de IO
    const io = new NodeIO();
    
    // Leer archivo GLB
    console.log(`📂 Leyendo: ${CONFIG.inputFile}`);
    const document = await io.read(inputPath);
    
    // Obtener todos los materiales
    const materials = document.getRoot().listMaterials();
    console.log(`✓ Encontrados ${materials.length} materiales`);
    
    // Convertir color
    const [r, g, b, a] = hexToRGB(CONFIG.color);
    console.log(`\n🎯 Aplicando color: ${CONFIG.color}`);
    console.log(`   RGB: [${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}]`);
    console.log(`   Metalness: ${CONFIG.metalness}`);
    console.log(`   Roughness: ${CONFIG.roughness}\n`);
    
    // Si hay materiales existentes, modificarlos
    if (materials.length > 0) {
      materials.forEach((material, index) => {
        const name = material.getName() || `Material_${index}`;
        console.log(`✏️  Modificando: ${name}`);
        
        // Aplicar color
        material.setBaseColorFactor([r, g, b, a]);
        material.setMetallicFactor(CONFIG.metalness);
        material.setRoughnessFactor(CONFIG.roughness);
      });
    } else {
      // Si no hay materiales, crear uno nuevo
      console.log('⚠️  No hay materiales, creando uno nuevo...');
      const material = document.createMaterial('ColoredMaterial')
        .setBaseColorFactor([r, g, b, a])
        .setMetallicFactor(CONFIG.metalness)
        .setRoughnessFactor(CONFIG.roughness);
      
      // Aplicar a todas las mallas
      const meshes = document.getRoot().listMeshes();
      meshes.forEach((mesh, meshIndex) => {
        mesh.listPrimitives().forEach(primitive => {
          primitive.setMaterial(material);
        });
      });
      console.log(`✓ Material aplicado a ${meshes.length} mallas`);
    }
    
    // Guardar archivo de salida
    const outputPath = path.resolve(__dirname, CONFIG.outputFile);
    console.log(`\n💾 Guardando: ${CONFIG.outputFile}`);
    await io.write(outputPath, document);
    
    // Verificar tamaño
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('\n✅ ¡Archivo coloreado exitosamente!');
    console.log(`📄 Salida: ${CONFIG.outputFile}`);
    console.log(`📦 Tamaño: ${sizeMB} MB`);
    console.log('\n📝 Pasos siguientes:');
    console.log('   1. Renombra el archivo original: 48299.glb → 48299-original.glb');
    console.log('   2. Renombra el coloreado: 48299-colored.glb → 48299.glb');
    console.log('   3. Prueba el modelo en la web');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Instalar dependencias: npm install @gltf-transform/core');
    console.log('   2. Verificar que Node.js esté instalado: node --version');
    console.log('   3. Usar herramientas online (ver abajo)\n');
  }
}

// ============================================
// HERRAMIENTAS ONLINE ALTERNATIVAS
// ============================================
const ONLINE_TOOLS = `
🌐 HERRAMIENTAS ONLINE PARA EDITAR GLB:
=====================================

1. **glTF Report** (https://gltf.report/)
   - Editor visual de archivos GLB
   - Permite ver y editar materiales
   - Gratis y muy fácil de usar

2. **PlayCanvas Editor** (https://playcanvas.com/)
   - Motor de juegos online
   - Importar GLB, aplicar materiales, exportar
   - Requiere cuenta gratuita

3. **Three.js Editor** (https://threejs.org/editor/)
   - Editor oficial de Three.js
   - Importar GLB, modificar materiales, exportar
   - Gratis, funciona en el navegador

4. **Babylon.js Sandbox** (https://sandbox.babylonjs.com/)
   - Visualizador y editor de GLB
   - Puede inspeccionar y exportar

5. **Gestaltor** (https://gestaltor.io/)
   - Editor profesional de glTF/GLB
   - Versión gratuita con funcionalidades básicas

📖 INSTRUCCIONES RÁPIDAS (Three.js Editor):
-------------------------------------------
1. Abre https://threejs.org/editor/
2. File → Import → Selecciona tu .glb
3. Selecciona el objeto en la escena
4. En el panel derecho (Material), cambia:
   - color: al color deseado
   - roughness: 0.3 (brillante)
   - metalness: 0.1 (no metálico)
5. File → Export GLB
6. Guarda el archivo y súbelo a tu web
`;

// Imprimir información de ayuda si se ejecuta con --help
if (process.argv.includes('--help')) {
  console.log(ONLINE_TOOLS);
} else {
  // Ejecutar función principal
  addColorToGLB();
}
