import { Injectable, effect, signal } from '@angular/core';
import { PharmaciesFakeService } from '../fakes/pharmacies.fake.service';
import { Pharmacy, Page } from 'src/app/models/pharmacy.model';

@Injectable({ providedIn: 'root' })
export class PharmaciesStore {
  constructor(private api: PharmaciesFakeService) {
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
    this.api.list$(search, page, pageSize).subscribe({
      next: (res: Page<Pharmacy>) => {
        this.items.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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

  create(payload: Omit<Pharmacy, 'id'>) {
    this.loading.set(true);
    this.api.create$(payload).subscribe({
      next: (created) => {
        // reload first page to include new record
        this.page.set(1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  update(id: string, payload: Partial<Omit<Pharmacy, 'id'>>) {
    this.loading.set(true);
    this.api.update$(id, payload).subscribe({
      next: () => {
        // refresh current page
        this.fetch(this.search(), this.page(), this.pageSize());
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  delete(id: string) {
    this.loading.set(true);
    this.api.delete$(id).subscribe({
      next: () => {
        // refresh current page (if empty, go back a page)
        const remaining = this.total() - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / this.pageSize()));
        if (this.page() > maxPage) this.page.set(maxPage);
        else this.fetch(this.search(), this.page(), this.pageSize());
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
