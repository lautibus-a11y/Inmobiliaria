export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'villa';
  operation: 'venta' | 'alquiler';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  featured: boolean;
  status: 'disponible' | 'reservada' | 'vendida';
  main_image: string;
  created_at: string;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: number;
  property_id: number;
  url: string;
}

export interface Inquiry {
  id: number;
  property_id: number;
  client_name: string;
  client_phone: string;
  message: string;
  status: 'pendiente' | 'contactado' | 'cerrado';
  created_at: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  sold: number;
  inquiries: number;
}
