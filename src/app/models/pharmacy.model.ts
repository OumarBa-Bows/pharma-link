export enum PharmacyState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED'
}

export enum CustomerType {
  PHARMACY = 'PHARMACY',
  DEPOT = 'DEPOT'
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  wilayaId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  // Add other user fields as needed
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  code: string;
  state: PharmacyState;
  customerType: CustomerType;
  doctorName?: string;
  managerName?: string;
  email?: string;
  location?: string;
  zone?: Zone;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PharmacyFormData extends Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt' | 'zone' | 'user'> {
  zoneId?: string;
  userId?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number; // 1-based
  pageSize: number;
  totalPages: number;
}
