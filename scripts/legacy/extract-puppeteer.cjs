const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertPDFToImages(pdfPath, outputDir, prefix) {
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
    
    // Lanzar navegador
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Cargar el PDF
    const pdfUrl = 'file://' + path.resolve(pdfPath);
    await page.goto(pdfUrl, { waitUntil: 'networkidle0' });
    
    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Obtener el número de páginas
    const numPages = await page.evaluate(() => {
      const viewer = document.querySelector('#viewer');
      if (viewer) {
        return viewer.querySelectorAll('.page').length;
      }
      return 1;
    });
    
    console.log(`  Total de páginas detectadas: ${numPages}`);
    
    // Tomar screenshot de cada página
    let successCount = 0;
    
    for (let i = 1; i <= numPages; i++) {
      const outputPath = path.join(outputDir, `${prefix}_page${String(i).padStart(2, '0')}.png`);
      
      try {
        // Navegar a la página específica si es posible
        if (i > 1) {
          await page.evaluate((pageNum) => {
            const pageElement = document.querySelector(`[data-page-number="${pageNum}"]`);
            if (pageElement) {
              pageElement.scrollIntoView();
            }
          }, i);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Tomar screenshot
        await page.screenshot({
          path: outputPath,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1200, height: 1600 }
        });
        
        successCount++;
        console.log(`  ✓ Página ${i}/${numPages}`);
      } catch (err) {
        console.log(`  ✗ Página ${i}/${numPages}: ${err.message}`);
      }
    }
    
    await browser.close();
    
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
  console.log('Usando Puppeteer para renderizar PDFs...\n');
  console.log('Este proceso puede tomar varios minutos...\n');
  
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
