/**
 * Script SIMPLE para colorear GLB usando solo Node.js nativo
 * No requiere npm install
 */

const fs = require('fs');
const path = require('path');

// Configuración
const INPUT_FILE = path.join(__dirname, '../public/models/48299.glb');
const OUTPUT_FILE = path.join(__dirname, '../public/models/48299-colored.glb');

// Color blanco hueso para sensores (como el sensor real 48299)
const TARGET_COLOR = [0.96, 0.96, 0.86, 1.0]; // RGBA normalizado (F5F5DC)

console.log('🎨 Procesando modelo GLB...\n');
console.log(`📂 Entrada: ${INPUT_FILE}`);
console.log(`💾 Salida: ${OUTPUT_FILE}\n`);

try {
  // Leer archivo GLB
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Error: No se encontró el archivo GLB');
    console.log(`   Buscando: ${INPUT_FILE}`);
    process.exit(1);
  }

  const glbData = fs.readFileSync(INPUT_FILE);
  console.log(`✓ Archivo leído: ${(glbData.length / 1024 / 1024).toFixed(2)} MB`);

  // Estructura GLB:
  // - Header: 12 bytes (magic + version + length)
  // - Chunk 0: JSON (tipo 0x4E4F534A)
  // - Chunk 1: BIN (tipo 0x004E4942)

  // Leer header
  const magic = glbData.readUInt32LE(0);
  const version = glbData.readUInt32LE(4);
  const totalLength = glbData.readUInt32LE(8);

  if (magic !== 0x46546C67) { // 'glTF' en ASCII
    console.error('❌ Error: El archivo no es un GLB válido');
    process.exit(1);
  }

  console.log(`✓ GLB válido (versión ${version})`);

  // Leer chunk JSON
  const jsonChunkLength = glbData.readUInt32LE(12);
  const jsonChunkType = glbData.readUInt32LE(16);
  
  if (jsonChunkType !== 0x4E4F534A) { // 'JSON'
    console.error('❌ Error: Chunk JSON no encontrado');
    process.exit(1);
  }

  // Extraer JSON
  const jsonData = glbData.slice(20, 20 + jsonChunkLength);
  let gltf = JSON.parse(jsonData.toString('utf8'));

  console.log(`✓ JSON extraído: ${jsonChunkLength} bytes`);
  console.log(`✓ Materiales encontrados: ${gltf.materials ? gltf.materials.length : 0}`);

  // Modificar materiales
  let modifiedCount = 0;
  
  if (gltf.materials && gltf.materials.length > 0) {
    gltf.materials.forEach((material, index) => {
      const name = material.name || `Material_${index}`;
      console.log(`\n✏️  Procesando: ${name}`);

      // Crear o modificar pbrMetallicRoughness
      if (!material.pbrMetallicRoughness) {
        material.pbrMetallicRoughness = {};
      }

      // Aplicar color base
      material.pbrMetallicRoughness.baseColorFactor = TARGET_COLOR;
      
      // Configurar propiedades físicas (plástico blanco)
      material.pbrMetallicRoughness.metallicFactor = 0.1;
      material.pbrMetallicRoughness.roughnessFactor = 0.3;

      // Asegurar que use el color base (no texturas)
      if (material.pbrMetallicRoughness.baseColorTexture) {
        console.log(`   ⚠️  El material tenía textura, reemplazando por color sólido`);
        delete material.pbrMetallicRoughness.baseColorTexture;
      }

      // Agregar nombre si no tiene
      if (!material.name) {
        material.name = 'ColoredMaterial';
      }

      modifiedCount++;
      console.log(`   ✓ Color aplicado: RGBA(${TARGET_COLOR.map(v => (v * 255).toFixed(0)).join(', ')})`);
    });
  } else {
    // Si no hay materiales, crear uno
    console.log('\n⚠️  No se encontraron materiales, creando uno nuevo...');
    gltf.materials = [{
      name: 'SensorMaterial',
      pbrMetallicRoughness: {
        baseColorFactor: TARGET_COLOR,
        metallicFactor: 0.1,
        roughnessFactor: 0.3
      }
    }];
    
    // Aplicar material a todas las mallas
    if (gltf.meshes) {
      gltf.meshes.forEach(mesh => {
        if (mesh.primitives) {
          mesh.primitives.forEach(primitive => {
            primitive.material = 0;
          });
        }
      });
    }
    
    modifiedCount = 1;
  }

  // Convertir JSON modificado a buffer
  const modifiedJson = JSON.stringify(gltf);
  const modifiedJsonBuffer = Buffer.from(modifiedJson, 'utf8');
  
  // Alinear a 4 bytes (padding)
  const padding = (4 - (modifiedJsonBuffer.length % 4)) % 4;
  const paddedJsonBuffer = Buffer.concat([
    modifiedJsonBuffer,
    Buffer.alloc(padding, 0x20) // Espacios como padding
  ]);

  console.log(`\n✓ JSON modificado: ${modifiedJsonBuffer.length} bytes`);

  // Calcular offsets para reconstruir GLB
  const binChunkOffset = 12 + 8 + paddedJsonBuffer.length; // Header + JSON chunk header + JSON data
  const binChunkData = glbData.slice(20 + jsonChunkLength); // Datos binarios originales

  // Crear nuevo buffer GLB
  const newGlbLength = 12 + 8 + paddedJsonBuffer.length + binChunkData.length;
  const newGlb = Buffer.alloc(newGlbLength);

  // Escribir header
  newGlb.writeUInt32LE(0x46546C67, 0); // magic
  newGlb.writeUInt32LE(2, 4); // version
  newGlb.writeUInt32LE(newGlbLength, 8); // total length

  // Escribir chunk JSON
  newGlb.writeUInt32LE(paddedJsonBuffer.length, 12); // chunk length
  newGlb.writeUInt32LE(0x4E4F534A, 16); // chunk type (JSON)
  paddedJsonBuffer.copy(newGlb, 20); // chunk data

  // Escribir chunk BIN
  binChunkData.copy(newGlb, 20 + paddedJsonBuffer.length);

  // Guardar archivo
  fs.writeFileSync(OUTPUT_FILE, newGlb);

  console.log(`\n✅ ¡Archivo coloreado exitosamente!`);
  console.log(`   Archivo: ${OUTPUT_FILE}`);
  console.log(`   Tamaño: ${(newGlb.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Materiales modificados: ${modifiedCount}`);
  console.log(`   Color: Blanco hueso (F5F5DC) - Ideal para sensores`);

  console.log(`\n📝 PASOS SIGUIENTES:`);
  console.log(`   1. El archivo coloreado está en: public/models/48299-colored.glb`);
  console.log(`   2. Renombra el original: 48299.glb → 48299-original.glb`);
  console.log(`   3. Renombra el coloreado: 48299-colored.glb → 48299.glb`);
  console.log(`   4. Recarga la web para ver el cambio`);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\n💡 Solución alternativa:');
  console.log('   Usa el Three.js Editor online:');
  console.log('   https://threejs.org/editor/');
  process.exit(1);
}
