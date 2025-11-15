import {Command} from "../model/command";

export interface INotification{
  //id: number;
  description: string;
  status: string;
  commandId: number;
  command: Command;
  createdAt: Date;
  updatedAt: Date;
}
