import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../model/user";

@Injectable()
export class RoleService{

  private resource = 'http://localhost:8080/api/';

  constructor(private httpClient : HttpClient) {
  }

  getAll(): Observable<any>{
    return  this.httpClient.get<any>(`${this.resource}`+"role");
  }

}
