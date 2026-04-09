const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

async function renderPDFPageToImage(pdfPath, pageNum, outputPath) {
  try {
    // Cargar el documento PDF
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    
    // Obtener la página
    const page = await pdf.getPage(pageNum);
    
    // Configurar el canvas
    const scale = 1.5; // Calidad de renderizado
    const viewport = page.getViewport({ scale });
    
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Renderizar la página
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Guardar como PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return true;
  } catch (error) {
    console.error(`Error renderizando página ${pageNum}: ${error.message}`);
    return false;
  }
}

async function extractImagesFromPDF(pdfPath, outputDir, prefix) {
  try {
    console.log(`Procesando: ${pdfPath}`);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      console.error(`  ✗ Archivo no encontrado: ${pdfPath}\n`);
      return 0;
    }
    
    // Crear directorio de salida si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Cargar el PDF para obtener el número de páginas
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    console.log(`  Total de páginas: ${numPages}`);
    
    let successCount = 0;
    
    // Renderizar cada página
    for (let i = 1; i <= numPages; i++) {
      const outputPath = path.join(outputDir, `${prefix}_page${String(i).padStart(2, '0')}.png`);
      const success = await renderPDFPageToImage(pdfPath, i, outputPath);
      if (success) {
        successCount++;
        console.log(`  ✓ Página ${i}/${numPages}`);
      } else {
        console.log(`  ✗ Página ${i}/${numPages}`);
      }
    }
    
    console.log(`  Completado: ${successCount}/${numPages} páginas convertidas\n`);
    return successCount;
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
  console.log('Renderizando páginas PDF a imágenes PNG...\n');
  console.log('Este proceso puede tomar varios minutos...\n');
  
  let totalImages = 0;
  
  for (const catalogo of catalogos) {
    const outputDir = path.join(baseOutputDir, catalogo.dir);
    const count = await extractImagesFromPDF(catalogo.pdf, outputDir, catalogo.prefix);
    totalImages += count;
  }
  
  console.log('=== PROCESO COMPLETADO ===');
  console.log(`Total de páginas convertidas: ${totalImages}`);
  console.log(`Las imágenes se guardaron en: ${path.resolve(baseOutputDir)}`);
}

main().catch(console.error);
