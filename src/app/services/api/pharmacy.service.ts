import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Page, Pharmacy } from 'src/app/models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private apiUrl = `${environment.apiUrl}/pharmacies`;
  selectedItem = signal<Pharmacy | null>(null);
  constructor(private http: HttpClient) {}

  list(search: string = '', page: number = 1, pageSize: number = 10): Observable<Page<Pharmacy>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    return this.http.get<Page<Pharmacy>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Pharmacy> {
    return this.http.get<Pharmacy>(`${this.apiUrl}/${id}`);
  }

  create(pharmacy: Omit<Pharmacy, 'id'>): Observable<Pharmacy> {
    return this.http.post<Pharmacy>(this.apiUrl, pharmacy);
  }

  update(id: string, pharmacy: Partial<Pharmacy>): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/${id}`, pharmacy);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
