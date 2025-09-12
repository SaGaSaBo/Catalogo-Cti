import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

// Ajusta tu carpeta origen y salida
const INPUT_DIR = 'assets/originales';
const OUTPUT_DIR = 'assets/optimizado';

const SIZES = [400, 800, 1200]; // anchos útiles para listas/detalle
const QUALITY = 72;

async function findImageFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await findImageFiles(fullPath);
      files.push(...subFiles);
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

(async () => {
  try {
    const files = await findImageFiles(INPUT_DIR);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const file of files) {
      const relativePath = path.relative(INPUT_DIR, file);
      const base = relativePath.replace(/\.(jpg|jpeg|png)$/i, '');
      
      for (const w of SIZES) {
        const outDir = path.join(OUTPUT_DIR, path.dirname(relativePath));
        await fs.mkdir(outDir, { recursive: true });

        // WebP
        const webpOut = path.join(outDir, `${base}-${w}.webp`);
        await sharp(file).resize({ width: w }).webp({ quality: QUALITY }).toFile(webpOut);

        // AVIF (opcional)
        const avifOut = path.join(outDir, `${base}-${w}.avif`);
        await sharp(file).resize({ width: w }).avif({ quality: QUALITY }).toFile(avifOut);
      }
    }

    console.log('✅ Optimización lista. Sube OUTPUT_DIR a tu bucket (privado).');
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
  }
})();
