import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}
  private api = 'http://localhost:8080/api/'; // Replace with your API base URL

  // Example method to get data from an endpoint
  getData(endpoint: string): Observable<any> {
    return this.http.get(`${this.api}${endpoint}`, { withCredentials: true });
  }

  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.api}${endpoint}`, data, { withCredentials: true });
  }
}
