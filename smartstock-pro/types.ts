
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export type TransactionType = 'SALE' | 'ADJUST' | 'LOSS';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  totalPrice: number;
  note?: string;
  date: string; // ISO string
}

export interface AppState {
  products: Product[];
  transactions: Transaction[];
}
