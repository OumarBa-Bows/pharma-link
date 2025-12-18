import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}
  private api = environment.apiUrl;
  getData<T>(endpoint: string, options: object = {}): Observable<T> {
    return this.http.get<T>(`${this.api}/${endpoint}`, { ...options });
  }

  postData<T>(endpoint: string, data: any, options: object = {}): Observable<T> {
    return this.http.post<T>(`${this.api}/${endpoint}`, data, { ...options });
  }

  postDataWithProgress<T>(endpoint: string, data: any): Observable<HttpEvent<T>> {
    return this.http.post<T>(`${this.api}/${endpoint}`, data, {
      reportProgress: true,
      observe: 'events'
    });
  }

  putData<T>(endpoint: string, data: any, options: object = {}): Observable<T> {
    return this.http.put<T>(`${this.api}/${endpoint}`, data, { ...options });
  }

  deleteData<T>(endpoint: string, options: object = {}): Observable<T> {
    return this.http.delete<T>(`${this.api}/${endpoint}`, { ...options });
  }
}
