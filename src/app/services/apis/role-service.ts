import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../model/user";
import { environment } from "src/environments/environment";

@Injectable()
export class RoleService{

  env = environment;
  private resource = `${this.env.apiUrl}/`;

  constructor(private httpClient : HttpClient) {
  }

  getAll(): Observable<any>{
    return  this.httpClient.get<any>(`${this.resource}`+"role");
  }

}
