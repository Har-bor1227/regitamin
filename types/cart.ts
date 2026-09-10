export interface CartItemAttribute {
  name: string;
  option: string;
}

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  quantity: number;
  image?: string;
  variationId?: number;
  attributes?: CartItemAttribute[];
}