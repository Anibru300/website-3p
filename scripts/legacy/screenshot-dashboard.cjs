const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 4000 } });
  const page = await context.newPage();

  try {
    // Ir al login
    await page.goto('https://3psadecv.com/login', { waitUntil: 'networkidle' });

    // Llenar credenciales
    await page.fill('input#username', 'trespsadecv@hotmail.com');
    await page.fill('input#password', 'Lumina38');

    // Hacer clic en ingresar
    await page.click('button[type="submit"]');

    // Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Esperar que carguen los datos
    await page.waitForTimeout(3000);

    // Tomar captura del resumen
    await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
    console.log('Captura guardada en dashboard-screenshot.png');

    // Hacer clic en la pestaña Existencias
    const existenciasTab = await page.locator('button:has-text("Existencias")').first();
    if (await existenciasTab.count() > 0) {
      await existenciasTab.click();
      await page.waitForTimeout(4000);

      // Hacer clic en la primera fila de la tabla para seleccionar un producto
      const firstRow = await page.locator('table tbody tr').first();
      if (await firstRow.count() > 0) {
        await firstRow.click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'existencias-screenshot.png', fullPage: true });
      console.log('Captura de existencias guardada en existencias-screenshot.png');
    }
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'dashboard-error.png', fullPage: true });
    console.log('Captura de error guardada en dashboard-error.png');
  } finally {
    await browser.close();
  }
})();
