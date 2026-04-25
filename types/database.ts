export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ProfileInsert = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role?: 'customer' | 'admin';
  created_at?: string;
};
type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  display_order?: number;
  created_at?: string;
};
type ProductInsert = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock_quantity?: number;
  category_id?: string | null;
  brand?: string | null;
  sku?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  rating_avg?: number;
  rating_count?: number;
  created_at?: string;
  updated_at?: string;
};
type ProductImageInsert = {
  id?: string;
  product_id: string;
  url: string;
  alt_text?: string | null;
  position?: number;
  created_at?: string;
};
type AddressInsert = {
  id?: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  emirate?: string | null;
  country?: string;
  is_default?: boolean;
  created_at?: string;
};
type CartItemInsert = {
  id?: string;
  user_id: string;
  product_id: string;
  quantity?: number;
  created_at?: string;
};
type OrderInsert = {
  id?: string;
  user_id: string;
  order_number: string;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_fee?: number;
  total: number;
  shipping_address: Json;
  payment_method?: string;
  notes?: string | null;
  created_at?: string;
};
type OrderItemInsert = {
  id?: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  price: number;
  quantity: number;
};
type WishlistInsert = {
  id?: string;
  user_id: string;
  product_id: string;
  created_at?: string;
};
type ReviewInsert = {
  id?: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  created_at?: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: 'customer' | 'admin';
          created_at: string;
        };
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          image_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: CategoryInsert;
        Update: Partial<CategoryInsert>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          compare_at_price: number | null;
          stock_quantity: number;
          category_id: string | null;
          brand: string | null;
          sku: string | null;
          is_active: boolean;
          is_featured: boolean;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          position: number;
          created_at: string;
        };
        Insert: ProductImageInsert;
        Update: Partial<ProductImageInsert>;
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          emirate: string | null;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: AddressInsert;
        Update: Partial<AddressInsert>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: CartItemInsert;
        Update: Partial<CartItemInsert>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          subtotal: number;
          shipping_fee: number;
          total: number;
          shipping_address: Json;
          payment_method: string;
          notes: string | null;
          created_at: string;
        };
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          price: number;
          quantity: number;
        };
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: WishlistInsert;
        Update: Partial<WishlistInsert>;
        Relationships: [
          {
            foreignKeyName: 'wishlist_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string | null;
          created_at: string;
        };
        Insert: ReviewInsert;
        Update: Partial<ReviewInsert>;
        Relationships: [
          {
            foreignKeyName: 'reviews_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
}

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type ProductImage = Database['public']['Tables']['product_images']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
