export interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage?: number;
  discountendTotal: number;
  thumbnail: string;
  [k: string]: unknown;
}

export interface Cart {
  id: number;
  products: CartProduct[];
  total: number;
  userId: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  [k: string]: unknown;
}
