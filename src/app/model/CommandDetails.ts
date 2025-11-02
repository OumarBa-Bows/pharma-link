import {Command} from "./command";
import {Article} from "./Article";

export interface CommandDetails{
  id: number;
  batchnumber: string;
  quantity: number;
  article_id: string;
  command_id: number; // ⚠️ correspond exactement au nom de la colonne dans la DB
  command: Command;
  article: Article;
}
