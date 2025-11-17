

import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable()
export class CommandService{
  env = environment;
   private ressource = `${this.env.apiUrl}/`;

   constructor(private httpClient : HttpClient) {
   }

   getCommandByDistributor(distributorId: number): Observable<any>{
    const data = {distributorId : 1}
    return  this.httpClient.post<any>(`${this.ressource}`+"commands/get/by-distributor", data);
   }

   getById(id: number): Observable<any>{
     return this.httpClient.post<any>(`${this.ressource}`+"commands/get/by-id", {id: id})
   }

   delete(id: number):Observable<any>{
     return this.httpClient.post<any>(`${this.ressource}`+"commands/get/delete", id)
   }

   updateStatus(id: number, status: string):Observable<any>{
     const data = {id: id, status: status}
     return this.httpClient.post<any>(`${this.ressource}`+"commands/status-update", data)
   }

   updateCommand(command: any):Observable<any>{
     const data = {command: command}
     return this.httpClient.post<any>(`${this.ressource}`+"commands/update/command", data)
   }
}
