import { test, expect } from '@playwright/test';

test.describe('Modal de Producto - Accesibilidad y Scroll', () => {
  test('modal bloquea scroll del body y restaura posición', async ({ page }) => {
    await page.goto('/');
    
    // Scrollear catálogo
    await page.evaluate(() => window.scrollTo(0, 1200));
    const yBefore = await page.evaluate(() => window.scrollY);

    // Abrir modal
    await page.getByRole('button', { name: /agregar/i }).first().click();

    // Intentar scrollear body (debe quedarse igual)
    await page.mouse.wheel(0, 2000);
    const yDuring = await page.evaluate(() => window.scrollY);
    expect(yDuring).toBe(yBefore);

    // Cerrar modal con Escape
    await page.keyboard.press('Escape');

    const yAfter = await page.evaluate(() => window.scrollY);
    expect(yAfter).toBe(yBefore); // restaurado
  });

  test('modal cierra con click fuera del contenido', async ({ page }) => {
    await page.goto('/');
    
    // Abrir modal
    await page.getByRole('button', { name: /agregar/i }).first().click();
    
    // Verificar que el modal está abierto
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click fuera del modal (en el overlay)
    await page.click('div[aria-modal="true"]');
    
    // Verificar que el modal se cerró
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('focus trap funciona correctamente', async ({ page }) => {
    await page.goto('/');
    
    // Abrir modal
    await page.getByRole('button', { name: /agregar/i }).first().click();
    
    // Verificar que el foco está en el modal
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Intentar hacer tab fuera del modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // El foco debe seguir dentro del modal
    const stillFocused = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(document.activeElement);
    });
    expect(stillFocused).toBe(true);
  });

  test('atributos ARIA están presentes', async ({ page }) => {
    await page.goto('/');
    
    // Abrir modal
    await page.getByRole('button', { name: /agregar/i }).first().click();
    
    // Verificar atributos ARIA
    const modal = page.getByRole('dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'qa-title');
    await expect(modal).toHaveAttribute('aria-describedby', 'qa-desc');
    
    // Verificar que el título tiene el ID correcto
    await expect(page.locator('#qa-title')).toBeVisible();
    
    // Verificar que la descripción está presente (aunque oculta)
    await expect(page.locator('#qa-desc')).toBeAttached();
  });

  test('stepper funciona con teclado', async ({ page }) => {
    await page.goto('/');
    
    // Abrir modal
    await page.getByRole('button', { name: /agregar/i }).first().click();
    
    // Encontrar el primer stepper
    const stepper = page.locator('input[inputmode="numeric"]').first();
    
    // Hacer foco en el stepper
    await stepper.focus();
    
    // Usar flechas para cambiar valor
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    
    // Verificar que el valor cambió
    const value = await stepper.inputValue();
    expect(parseInt(value)).toBeGreaterThan(0);
  });
});
