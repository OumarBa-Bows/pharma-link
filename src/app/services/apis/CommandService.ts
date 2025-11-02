

import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()
export class CommandService{

   private resource = 'http://localhost:8080/api/';

   constructor(private httpClient : HttpClient) {
   }

   getCommandByDistributor(distributorId: number): Observable<any>{
    const data = {distributorId : 1}
    return  this.httpClient.post<any>(`${this.resource}`+"commands/get/by-distributor", data);
   }

}
