export interface Product {
  id: number;
  barcode: string;
  name: string;
  sale_price: number;
  import_price: number;
  stock_quantity: number;
  stock_threshold: number;
  note: string;
}

// Fake DB (in-memory)
let products: Product[] = [{
    id: 1,
    barcode: "SP001",
    name: "Cà phê Arabica",
    import_price: 15000,
    sale_price: 25000,
    stock_quantity: 50,
    stock_threshold: 10,
    note: "Hạt cà phê nhập khẩu"
  },
  {
    id: 2,
    barcode: "SP002",
    name: "Trà sữa Matcha",
    import_price: 12000,
    sale_price: 20000,
    stock_quantity: 30,
    stock_threshold: 5,
    note: "Trà sữa matcha Nhật"
  }]


export const ProductService = {
  getProducts: async (): Promise<Product[]> => products,

  getProduct: async (id: number): Promise<Product | null> =>
    products.find((p) => p.id === id) || null,

  createProduct: async (product: Product): Promise<Product> => {
    if (product.sale_price < product.import_price) {
      throw new Error("Giá bán phải >= giá nhập");
    }
    products.push(product);
    return product;
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product | null> => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...data };
    return products[index];
  },

  deleteProduct: async (id: number): Promise<boolean> => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
    },
  
  patchProduct: async (id: number, data: Partial<Product>): Promise<Product | null> => {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  // Chỉ cập nhật các field có trong "data"
  products[index] = { ...products[index], ...data };
  return products[index];
},
};
