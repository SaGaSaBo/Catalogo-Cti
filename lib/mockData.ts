import { Product, Category } from './types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Ropa Deportiva' },
  { id: '2', name: 'Calzado' },
  { id: '3', name: 'Accesorios' },
  { id: '4', name: 'Equipamiento' },
  { id: '5', name: 'Promociones' }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    brand: 'Nike',
    title: 'Camiseta Nike Dri-FIT',
    description: 'Camiseta deportiva de alta calidad con tecnología Dri-FIT para mantenerte seco durante el ejercicio.',
    sku: 'NK-CAM-001',
    price: 25000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/nike-camiseta-1.jpg', '/images/nike-camiseta-2.jpg'],
    active: true,
    categoryId: '1',
    sortIndex: 1
  },
  {
    id: '2',
    brand: 'Adidas',
    title: 'Pantalón Adidas Tiro',
    description: 'Pantalón deportivo cómodo y resistente, ideal para entrenamientos y actividades al aire libre.',
    sku: 'AD-PAN-002',
    price: 35000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/adidas-pantalon-1.jpg'],
    active: true,
    categoryId: '1',
    sortIndex: 2
  },
  {
    id: '3',
    brand: 'Puma',
    title: 'Zapatillas Puma Suede',
    description: 'Zapatillas clásicas de cuero con suela de goma, perfectas para uso diario y casual.',
    sku: 'PU-ZAP-003',
    price: 45000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/puma-zapatillas-1.jpg', '/images/puma-zapatillas-2.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 3
  },
  {
    id: '4',
    brand: 'Under Armour',
    title: 'Chaqueta Under Armour',
    description: 'Chaqueta deportiva con tecnología HeatGear para mantener la temperatura corporal óptima.',
    sku: 'UA-CHA-004',
    price: 55000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/under-armour-chaqueta-1.jpg'],
    active: true,
    categoryId: '1',
    sortIndex: 4
  },
  {
    id: '5',
    brand: 'Reebok',
    title: 'Mochila Reebok Classic',
    description: 'Mochila deportiva resistente con múltiples compartimentos para organizar tus pertenencias.',
    sku: 'RB-MOC-005',
    price: 28000,
    sizes: ['Única'],
    imageUrls: ['/images/reebok-mochila-1.jpg'],
    active: true,
    categoryId: '3',
    sortIndex: 5
  },
  {
    id: '6',
    brand: 'New Balance',
    title: 'Zapatillas New Balance 574',
    description: 'Zapatillas icónicas con diseño retro y tecnología moderna para máximo confort.',
    sku: 'NB-ZAP-006',
    price: 48000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/new-balance-574-1.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 6
  },
  {
    id: '7',
    brand: 'Converse',
    title: 'Zapatillas Converse Chuck Taylor',
    description: 'Las clásicas Chuck Taylor All Star, un ícono del calzado casual y urbano.',
    sku: 'CV-ZAP-007',
    price: 42000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/converse-chuck-1.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 7
  },
  {
    id: '8',
    brand: 'Vans',
    title: 'Zapatillas Vans Old Skool',
    description: 'Zapatillas skate con diseño clásico y suela waffle para máximo agarre.',
    sku: 'VS-ZAP-008',
    price: 38000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/vans-old-skool-1.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 8
  },
  {
    id: '9',
    brand: 'Jordan',
    title: 'Zapatillas Air Jordan 1',
    description: 'Las legendarias Air Jordan 1, el modelo que cambió la historia del calzado deportivo.',
    sku: 'JR-ZAP-009',
    price: 85000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/jordan-1-1.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 9
  },
  {
    id: '10',
    brand: 'Champion',
    title: 'Sudadera Champion Reverse Weave',
    description: 'Sudadera premium con tecnología Reverse Weave para evitar el encogimiento.',
    sku: 'CH-SUD-010',
    price: 32000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/champion-sudadera-1.jpg'],
    active: true,
    categoryId: '1',
    sortIndex: 10
  }
];

// Función para obtener productos con formato simplificado para la API
export function getMockProductsForAPI() {
  return mockProducts.map(product => ({
    id: product.id,
    name: product.title,
    title: product.title,
    brand: product.brand,
    description: product.description,
    sku: product.sku,
    price: product.price,
    sizes: product.sizes,
    imageUrls: product.imageUrls,
    imagePath: product.imageUrls[0] || '/placeholder-image.jpg',
    imagen: product.imageUrls[0] || '/placeholder-image.jpg',
    image: product.imageUrls[0] || '/placeholder-image.jpg',
    mainImage: product.imageUrls[0] || '/placeholder-image.jpg',
    active: product.active,
    categoryId: product.categoryId,
    sortIndex: product.sortIndex
  }));
}

// Función para obtener categorías con formato simplificado para la API
export function getMockCategoriesForAPI() {
  return mockCategories.map(category => ({
    id: category.id,
    name: category.name
  }));
}