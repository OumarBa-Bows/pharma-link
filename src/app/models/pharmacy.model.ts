export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Legacy fields (keep for backward compatibility)
  phoneNumber?: string;
  code?: string;
  type?: string;
  managerName?: string;
  doctorName?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number; // 1-based
  pageSize: number;
  totalPages: number;
}
