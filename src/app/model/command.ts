import { Pharmacy } from '../models/pharmacy.model';
import { Distributor } from './Distributor';
import { CommandDetails } from './CommandDetails';

export interface CompositionItem {
  command_detail_id: number;
  quantity: number;
  batchnumber: string;
  article_id: number;
  article_reference: string;
  article_name: string;
  article_price: number;
  article_availableQuantity: number;
  article_imageLink: string;
  article_expiryDate: string;
  category_id: number;
  category_name: string;
  category_nameAr: string;
  category_imageUrl: string;
  category_url: string;
}

export interface Command {
  id: number;
  code: string;
  status: string;
  commandreference: string;
  invoicereference: string;
  totalprice: number;
  date: Date;
  pharmacyId: string;
  distributorid: number;
  distributor: Distributor;
  mainDistributor: Distributor;
  pharmacy: Pharmacy;
  details: CommandDetails[];
  viewed: boolean;
  composition?: CompositionItem[];
}
