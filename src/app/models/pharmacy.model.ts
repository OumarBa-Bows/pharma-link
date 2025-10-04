export interface Pharmacy {
  id: string;
  name: string;
  phoneNumber: string;
  code: string;
  type: string;
  address: string;
  managerName: string;
  doctorName: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number; // 1-based
  pageSize: number;
}
