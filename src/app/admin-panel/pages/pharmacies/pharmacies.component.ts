import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PharmaciesStore } from 'src/app/services/stores/pharmacies.store';
import { PaginationComponent } from 'src/app/theme/shared/components/pagination/pagination.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PharmaciesFormModalComponent } from './pharmacies.form-modal';

@Component({
  selector: 'app-pharmacies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule, PaginationComponent],
  templateUrl: './pharmacies.component.html',
  styleUrls: ['./pharmacies.component.scss']
})
export class PharmaciesComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public store: PharmaciesStore,
    private modal: NgbModal
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      address: ['', [Validators.required, Validators.maxLength(120)]],
      city: ['', [Validators.required, Validators.maxLength(60)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      status: ['Active', [Validators.required]]
    });
    // Initialize state from query params
    const qp = this.route.snapshot.queryParamMap;
    const search = qp.get('q') ?? '';
    const page = +(qp.get('page') ?? '1');
    this.store.setQuery(search, isNaN(page) ? 1 : page);

    // Keep URL in sync when search/page change
    effect(() => {
      const q = this.store.search();
      const p = this.store.page();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: q || null, page: p !== 1 ? p : null },
        queryParamsHandling: 'merge'
      });
    });
  }

  get isEditing() { return this.editingId() !== null; }

  onAddNew() {
    const ref = this.modal.open(PharmaciesFormModalComponent, { centered: true, size: 'lg' });
    ref.componentInstance.title = 'Add Pharmacy';
    ref.componentInstance.value = null;
    ref.closed.subscribe((payload: any) => {
      if (payload) {
        this.store.create(payload);
      }
    });
  }

  onEdit(id: string) {
    const item = this.store.items().find(p => p.id === id);
    if (!item) return;
    const ref = this.modal.open(PharmaciesFormModalComponent, { centered: true, size: 'lg' });
    ref.componentInstance.title = 'Edit Pharmacy';
    ref.componentInstance.value = item;
    ref.closed.subscribe((payload: any) => {
      if (payload) {
        this.store.update(item.id, payload);
      }
    });
  }

  onCancel() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  onSubmit() { 
    if (this.form.invalid) return;
    const value = this.form.value as any;
    if (this.isEditing) this.store.update(this.editingId()!, value);
    else this.store.create(value);
    this.onCancel();
  }

  onDelete(id: string) {
    this.store.delete(id);
  }

  onSearch(term: string) {
    this.store.setQuery(term, 1);
  }

  onPageChange(p: number) {
    this.store.setPage(p);
  }
}
