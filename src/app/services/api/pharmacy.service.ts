import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Page, Pharmacy, PharmacyState } from 'src/app/models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private apiUrl = `${environment.apiUrl}/pharmacies`;
  selectedItem = signal<Pharmacy | null>(null);
  constructor(private http: HttpClient) {}

  list(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      tap((res) => {
        console.warn('pharmacies0', res.data.pharmacies);
        return {
          items: res.data.pharmacies
        };
      })
    );
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

  updateStatus(id: string, state: PharmacyState, reason?: string): Observable<Pharmacy> {
    return this.http.patch<Pharmacy>(`${this.apiUrl}/${id}/status`, { state, reason });
  }

  search(query: string, page: number = 1, limit: number = 10): Observable<Page<Pharmacy>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    return this.http.get<Page<Pharmacy>>(`${this.apiUrl}/search`, { params });
  }
}
