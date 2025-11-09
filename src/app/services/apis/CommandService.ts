

import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()
export class CommandService{

   private ressource = 'http://localhost:8080/api/';

   constructor(private httpClient : HttpClient) {
   }

   getCommandByDistributor(distributorId: number): Observable<any>{
    const data = {distributorId : 1}
    return  this.httpClient.post<any>(`${this.ressource}`+"commands/get/by-distributor", data);
   }

   getById(id: number): Observable<any>{
     return this.httpClient.post<any>(`${this.ressource}`+"commands/get/by-id", id)
   }

   delete(id: number):Observable<any>{
     return this.httpClient.post<any>(`${this.ressource}`+"commands/get/delete", id)
   }
}
