import {Command} from "./command";

export interface Distributor{
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  commands?: Command[];
}
