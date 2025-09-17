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
    price: 85000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/products/nike-camiseta-dri-fit.jpg'],
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
    price: 120000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/products/adidas-pantalon-tiro.jpg'],
    active: true,
    categoryId: '1',
    sortIndex: 2
  },
  {
    id: '3',
    brand: 'Puma',
    title: 'Zapatillas Puma Suede Classic',
    description: 'Zapatillas clásicas de cuero con suela de goma, perfectas para uso diario y casual.',
    sku: 'PU-ZAP-003',
    price: 180000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/puma-suede-classic.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 3
  },
  {
    id: '4',
    brand: 'Under Armour',
    title: 'Chaqueta Under Armour HeatGear',
    description: 'Chaqueta deportiva con tecnología HeatGear para mantener la temperatura corporal óptima.',
    sku: 'UA-CHA-004',
    price: 220000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/products/under-armour-heatgear.jpg'],
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
    price: 95000,
    sizes: ['Única'],
    imageUrls: ['/images/products/reebok-mochila-classic.jpg'],
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
    price: 250000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/new-balance-574.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 6
  },
  {
    id: '7',
    brand: 'Converse',
    title: 'Zapatillas Converse Chuck Taylor All Star',
    description: 'Las clásicas Chuck Taylor All Star, un ícono del calzado casual y urbano.',
    sku: 'CV-ZAP-007',
    price: 160000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/converse-chuck-taylor.jpg'],
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
    price: 190000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/vans-old-skool.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 8
  },
  {
    id: '9',
    brand: 'Jordan',
    title: 'Zapatillas Air Jordan 1 Retro',
    description: 'Las legendarias Air Jordan 1, el modelo que cambió la historia del calzado deportivo.',
    sku: 'JR-ZAP-009',
    price: 450000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/jordan-1-retro.jpg'],
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
    price: 140000,
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrls: ['/images/products/champion-reverse-weave.jpg'],
    active: true,
    categoryId: '1',
    sortIndex: 10
  },
  {
    id: '11',
    brand: 'Nike',
    title: 'Zapatillas Nike Air Max 270',
    description: 'Zapatillas deportivas con tecnología Air Max para máximo confort y estilo.',
    sku: 'NK-ZAP-011',
    price: 320000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/nike-air-max-270.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 11
  },
  {
    id: '12',
    brand: 'Adidas',
    title: 'Zapatillas Adidas Ultraboost 22',
    description: 'Zapatillas de running con tecnología Boost para máxima energía de retorno.',
    sku: 'AD-ZAP-012',
    price: 380000,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    imageUrls: ['/images/products/adidas-ultraboost-22.jpg'],
    active: true,
    categoryId: '2',
    sortIndex: 12
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