import { Injectable, effect, signal } from '@angular/core';
import { PharmacyService } from '../api/pharmacy.service';
import { Pharmacy, Page } from 'src/app/models/pharmacy.model';

@Injectable({ providedIn: 'root' })
export class PharmaciesStore {
  constructor(private api: PharmacyService) {
    // Load whenever page/search/pageSize changes
    effect(() => {
      const p = this.page();
      const s = this.search();
      const ps = this.pageSize();
      this.fetch(s, p, ps);
    });
  }

  // State signals
  items = signal<Pharmacy[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = signal(10);
  search = signal('');
  loading = signal(false);

  private fetch(search: string, page: number, pageSize: number) {
    this.loading.set(true);
    this.api.list(search, page, pageSize).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.items.set(res.data.data);
          this.total.set(res.data.total);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching pharmacies:', err);
        this.loading.set(false);
      }
    });
  }

  setQuery(search: string, page: number) {
    this.search.set(search);
    this.page.set(page);
  }

  setPage(page: number) {
    this.page.set(page);
  }

  setPageSize(size: number) {
    this.pageSize.set(size);
  }

  getById(id: string) {
    return this.api.getById(id).toPromise();
  }

  create(payload: Omit<Pharmacy, 'id'>) {
    return this.api.create(payload).subscribe({
      next: () => this.fetch(this.search(), this.page(), this.pageSize()),
      error: (err) => console.error('Error creating pharmacy:', err)
    });
  }

  update(id: string, payload: Partial<Pharmacy>) {
    return this.api.update(id, payload).subscribe({
      next: () => this.fetch(this.search(), this.page(), this.pageSize()),
      error: (err) => console.error('Error updating pharmacy:', err)
    });
  }

  delete(id: string) {
    this.loading.set(true);
    return this.api.delete(id).subscribe({
      next: () => {
        // refresh current page (if empty, go back a page)
        const remaining = this.total() - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / this.pageSize()));
        if (this.page() > maxPage) {
          this.page.set(maxPage);
        } else {
          this.fetch(this.search(), this.page(), this.pageSize());
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error deleting pharmacy:', err);
        this.loading.set(false);
      }
    });
  }
}
