import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../model/user";

@Injectable()
export class UserService{

  private resource = 'http://localhost:8080/api/';

  constructor(private httpClient : HttpClient) {
  }

  getAll(): Observable<any>{
   return  this.httpClient.get<any>(`${this.resource}`+"users  ");
  }

  update(id: number, data: User){
    return this.httpClient.post(`${this.resource}`+"users/update/"+id, data)
  }

  createUser(data: User){
    return this.httpClient.post(`${this.resource}`+"users/", data)
  }

  findById(id: number){
    return this.httpClient.get(`${this.resource}`+"users/"+id)
  }

  getAllRoles(): Observable<any>{
    return this.httpClient.get<any>(`${this.resource}`+"users/roles/all")
  }

  delete(id: number){
    return  this.httpClient.get<any>(`${this.resource}`+"users/delete/"+ id)
  }
}
