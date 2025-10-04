import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { Page, Pharmacy } from 'src/app/models/pharmacy.model';

@Injectable({ providedIn: 'root' })
export class PharmaciesFakeService {
  // Seed fake data
  private data: Pharmacy[] = [
    { id: crypto.randomUUID(), name: 'Green Leaf Pharmacy', phoneNumber: '(408) 555-0132', code: 'GLP-001', type: 'Retail', address: '123 Health St, San Jose', managerName: 'Alice Green', doctorName: 'Dr. Hart' },
    { id: crypto.randomUUID(), name: 'WellCare Drugs', phoneNumber: '(415) 555-0178', code: 'WCD-002', type: 'Retail', address: '89 Wellness Ave, San Francisco', managerName: 'Brian Wells', doctorName: 'Dr. Torres' },
    { id: crypto.randomUUID(), name: 'CarePlus Rx', phoneNumber: '(510) 555-0112', code: 'CPR-003', type: 'Hospital', address: '45 Vital Blvd, Oakland', managerName: 'Cathy Plus', doctorName: 'Dr. Singh' },
    { id: crypto.randomUUID(), name: 'HealPoint Pharmacy', phoneNumber: '(650) 555-0199', code: 'HPP-004', type: 'Clinic', address: '77 Remedy Rd, San Mateo', managerName: 'Daniel Point', doctorName: 'Dr. Patel' },
    { id: crypto.randomUUID(), name: 'CityMeds', phoneNumber: '(408) 555-0144', code: 'CMD-005', type: 'Retail', address: '9 Core St, San Jose', managerName: 'Eva City', doctorName: 'Dr. Brown' },
    { id: crypto.randomUUID(), name: 'VitalCare', phoneNumber: '(510) 555-0120', code: 'VCR-006', type: 'Retail', address: '21 Wellness Rd, Oakland', managerName: 'Frank Vital', doctorName: 'Dr. Lin' }
  ];

  list$(search = '', page = 1, pageSize = 10): Observable<Page<Pharmacy>> {
    const s = (search || '').toLowerCase();
    const filtered = this.data.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.code.toLowerCase().includes(s) ||
      p.type.toLowerCase().includes(s) ||
      p.address.toLowerCase().includes(s) ||
      p.managerName.toLowerCase().includes(s) ||
      p.doctorName.toLowerCase().includes(s) ||
      p.phoneNumber.toLowerCase().includes(s)
    );
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return of({ items, total: filtered.length, page, pageSize }).pipe(delay(250));
  }

  create$(payload: Omit<Pharmacy, 'id'>): Observable<Pharmacy> {
    const created: Pharmacy = { id: crypto.randomUUID(), ...payload } as Pharmacy;
    this.data = [created, ...this.data];
    return of(created).pipe(delay(150));
  }

  update$(id: string, payload: Partial<Omit<Pharmacy, 'id'>>): Observable<Pharmacy> {
    let updated!: Pharmacy;
    this.data = this.data.map(p => {
      if (p.id === id) {
        updated = { ...p, ...payload } as Pharmacy;
        return updated;
      }
      return p;
    });
    return of(updated).pipe(delay(150));
  }

  delete$(id: string): Observable<{ id: string }> {
    this.data = this.data.filter(p => p.id !== id);
    return of({ id }).pipe(delay(150));
  }
}
