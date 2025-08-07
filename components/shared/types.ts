import { CartItem } from '@prisma/client';

export interface ShoeComment {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  shoeId: number;
  user: { fullName: string; avatar: string | null; username: string | null };
}

export interface ShoeCardType {
  id: number;
  name?: string;
  price: number;
  imageURL: string;
  color: string;
  gender: string;
  description: string | null | undefined;
  model: {
    name: string;
    brand: {
      name: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
  favorites?: { id: number; userId: number; shoeId: number }[];
  comments?: ShoeComment[];
}

export interface ShoeCardWithFavorites extends ShoeCardType {
  favorites: { id: number; userId: number; shoeId: number }[];
}

export interface ExtendedCartItem extends CartItem {
  shoe?: ShoeCardType;
}

export interface FavoriteItem {
  id: number;
  userId: number;
  shoeId: number;
  shoe?: ShoeCardType;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  shoeId: number;
  size: string;
  quantity: number;
  price: number;
  shoe?: {
    model: { name: string };
    imageURL: string;
  };
}

export interface Order {
  id: number;
  totalPrice: number | string | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
}
