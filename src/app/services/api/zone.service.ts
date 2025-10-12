import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone } from 'src/app/models/pharmacy.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private apiUrl = `${environment.apiUrl}/zones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.apiUrl);
  }

  getById(id: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/${id}`);
  }

  create(zone: Partial<Zone>): Observable<Zone> {
    return this.http.post<Zone>(this.apiUrl, zone);
  }

  update(id: string, zone: Partial<Zone>): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/${id}`, zone);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
