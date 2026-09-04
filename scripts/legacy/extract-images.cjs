const { fromPath } = require('pdf2pic');
const fs = require('fs');
const path = require('path');

async function convertPDFToImages(pdfPath, outputDir, prefix) {
  try {
    console.log(`Procesando: ${pdfPath}`);
    
    // Crear directorio de salida si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const options = {
      density: 150,        // Calidad de imagen (DPI)
      saveFilename: prefix,
      savePath: outputDir,
      format: 'png',
      width: 1200,         // Ancho de imagen
      height: 1600         // Alto de imagen
    };
    
    const convert = fromPath(pdfPath, options);
    
    // Convertir todas las páginas
    const result = await convert.bulk(-1); // -1 = todas las páginas
    
    console.log(`  ✓ ${result.length} páginas convertidas a imágenes`);
    
    // Renombrar archivos para que tengan numeración secuencial
    result.forEach((res, index) => {
      const oldPath = res.path;
      const newName = `${prefix}_page${String(index + 1).padStart(2, '0')}.png`;
      const newPath = path.join(outputDir, newName);
      
      if (fs.existsSync(oldPath) && oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
      }
    });
    
    console.log(`  ✓ Imágenes guardadas en: ${outputDir}\n`);
    return result.length;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}\n`);
    return 0;
  }
}

// Lista de catálogos a procesar
const catalogos = [
  { pdf: '../CATALOGO/ALKE/CATALOGO  ALKE.pdf', dir: 'alke', prefix: 'alke' },
  { pdf: '../CATALOGO/FANCOM/CATALOGO FANCOM.pdf', dir: 'fancom', prefix: 'fancom' },
  { pdf: '../CATALOGO/LUBING/CATALOGO LUBING-1.pdf', dir: 'lubing', prefix: 'lubing' },
  { pdf: '../CATALOGO/TIGSA/PRESENTACION SOLO FOTOS.pdf', dir: 'tigsa', prefix: 'tigsa' },
  { pdf: '../CATALOGO/SCHIPPERS/CATALOGO  MS.pdf', dir: 'schippers', prefix: 'schippers' },
  { pdf: '../CATALOGO/SCHIPPERS/ITEMS NUEVOS SCHIPPERS.pdf', dir: 'schippers', prefix: 'schippers-nuevos' },
  { pdf: '../CATALOGO/LB WHITE/CATALOGO LBWHITE.pdf', dir: 'lbwhite', prefix: 'lbwhite' },
];

async function main() {
  const baseOutputDir = './public/images/catalogo';
  
  console.log('=== EXTRAYENDO IMÁGENES DE CATÁLOGOS ===\n');
  console.log('Convirtiendo páginas PDF a imágenes PNG...\n');
  
  let totalImages = 0;
  
  for (const catalogo of catalogos) {
    const outputDir = path.join(baseOutputDir, catalogo.dir);
    const count = await convertPDFToImages(catalogo.pdf, outputDir, catalogo.prefix);
    totalImages += count;
  }
  
  console.log('=== PROCESO COMPLETADO ===');
  console.log(`Total de páginas convertidas: ${totalImages}`);
  console.log(`Las imágenes se guardaron en: ${path.resolve(baseOutputDir)}`);
}

main().catch(console.error);
