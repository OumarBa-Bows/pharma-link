import {Pharmacy} from "../models/pharmacy.model";
import {Distributor} from "./Distributor";
import {CommandDetails} from "./CommandDetails";

export interface Command{
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
}
