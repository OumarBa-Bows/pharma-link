import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../model/user";
import { environment } from "src/environments/environment";

@Injectable()
export class UserService{

  env = environment;
  private resource = `${this.env.apiUrl}/`;

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

  getConnectedUser(): Observable<any>{
    return  this.httpClient.get<any>(`${this.resource}`+"users/connected/user")
  }

  changePassword(newPassword: string, currentPassword: string, confirmPassword: string): Observable<any>{
    return this.httpClient.post(`${this.resource}`+"users/reset/password", {currentPassword: currentPassword, newPassword: newPassword,confirmPassword: confirmPassword})
  }
}
