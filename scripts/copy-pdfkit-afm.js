// Copia todos los .afm de pdfkit al folder de la route (para que existan en el bundle)
const fs = require('fs');
const path = require('path');

const src = path.join(process.cwd(), 'node_modules/pdfkit/js/data');
const dst = path.join(process.cwd(), 'app/api/order/pdf/data');

try {
  fs.mkdirSync(dst, { recursive: true });
  
  if (!fs.existsSync(src)) {
    console.warn('⚠️ No se encontró node_modules/pdfkit/js/data - ejecuta npm install primero');
    process.exit(0);
  }
  
  const files = fs.readdirSync(src);
  let copied = 0;
  
  for (const f of files) {
    if (f.endsWith('.afm')) {
      fs.copyFileSync(path.join(src, f), path.join(dst, f));
      copied++;
    }
  }
  
  console.log(`✅ ${copied} archivos AFM copiados a app/api/order/pdf/data`);
} catch (error) {
  console.error('❌ Error copiando archivos AFM:', error.message);
  process.exit(1);
}
