const PDFParser = require('pdf2json');
const fs = require('fs');
const path = require('path');

async function readPDF(filePath, limit = 8000) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      let text = '';
      if (pdfData.formImage && pdfData.formImage.Pages) {
        pdfData.formImage.Pages.forEach((page, pageIndex) => {
          if (page.Texts) {
            page.Texts.forEach((textItem) => {
              if (textItem.R && textItem.R[0] && textItem.R[0].T) {
                text += decodeURIComponent(textItem.R[0].T) + ' ';
              }
            });
            text += '\n---PAGE ' + (pageIndex + 1) + '---\n';
          }
        });
      }
      resolve(text.substring(0, limit));
    });
    
    pdfParser.on('pdfParser_dataError', (err) => {
      reject('Error: ' + err.parserError);
    });
    
    pdfParser.loadPDF(filePath);
  });
}

(async () => {
  try {
    console.log('=== CATALOGO MS SCHIPPERS ===');
    console.log(await readPDF('../CATALOGO/SCHIPPERS/CATALOGO  MS.pdf', 20000));
    
    console.log('\n\n=== ITEMS NUEVOS SCHIPPERS ===');
    console.log(await readPDF('../CATALOGO/SCHIPPERS/ITEMS NUEVOS SCHIPPERS.pdf', 20000));
  } catch (e) {
    console.error(e);
  }
})();
