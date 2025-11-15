import { PharmacyState } from './pharmacy.model';

export interface DashboardTotals {
  totalPharmacies: number;
  activePharmacies: number;
  pendingPharmacies: number;
  blockedPharmacies: number;
}

export interface DashboardOrderItem {
  id: number;
  code: string;
  pharmacy: string;
  distributor?: string;
  status: string;
  date: string; // ISO or display string
}

export interface DashboardPharmacyItem {
  id: string;
  name: string;
  zone: string;
  state: PharmacyState;
  createdAt: string; // ISO or display string
}

export interface DashboardSummary {
  totals: DashboardTotals;
  recentOrders: DashboardOrderItem[];
  recentPharmacies: DashboardPharmacyItem[];
}
