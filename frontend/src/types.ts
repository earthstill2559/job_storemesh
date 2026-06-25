export type Role = "seller" | "buyer";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
}

export interface Product {
  id: number;
  seller: number;
  seller_email: string;
  title: string;
  description: string;
  unit_price: string;
  quantity: number;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  seller_id: number;
  title: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface Order {
  id: number;
  buyer: number;
  buyer_email: string;
  status: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}

export interface Session {
  access: string;
  refresh: string;
  user: User;
}

export type Cart = Record<number, number>;
