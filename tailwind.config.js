/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    // Colores (usar con moderación; cubrimos paleta típica)
    { pattern: /(bg|text|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900)/, variants: ['hover','focus','active','disabled'] },

    // Grid & layout utilitarios frecuentes
    { pattern: /(grid-cols|col-span|row-span)-[1-9]/ },
    { pattern: /(grid-cols|col-span|row-span)-(10|11|12)/ },
    { pattern: /(order|z)-\d+/ },
    { pattern: /(gap|space-x|space-y)-[0-9]/ },

    // Bordes y radios
    { pattern: /rounded(-(sm|md|lg|xl|2xl|3xl|full))?/ },
    { pattern: /border(-(0|2|4|8))?/ },

    // Flex & alignment
    { pattern: /(flex|items|justify|content|self|place)-(start|end|center|between|around|evenly)/ },

    // Tamaños comunes (evita arbitarios dinámicos tipo w-[${x}px])
    { pattern: /(w|h|max-w|max-h|min-w|min-h)-(\\d|\\d{2}|full|screen)/ },

    // Tipografía
    { pattern: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/ },

    // Aspect ratios
    { pattern: /aspect-(auto|square|video)/ },
  ],
};