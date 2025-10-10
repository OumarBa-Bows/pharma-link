import { Component, effect, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PharmaciesStore } from 'src/app/services/stores/pharmacies.store';
import { PaginationComponent } from 'src/app/theme/shared/components/pagination/pagination.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn } from 'src/app/models/table-column.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from 'src/app/theme/shared/components/table/table.component';
import { PageHeaderComponent } from 'src/app/theme/shared/components/page-header/page-header.component';
import { Pharmacy } from 'src/app/models/pharmacy.model';
import { PharmacyService } from 'src/app/services/api/pharmacy.service';

@Component({
  selector: 'app-pharmacies',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    SharedModule, 
    PaginationComponent,
    TableComponent,
    TranslateModule,
    PageHeaderComponent
  ],
  templateUrl: './pharmacies.component.html',
  styleUrls: ['./pharmacies.component.scss']
})
export class PharmaciesComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: FormGroup;
  isLoading = false;
  
  columns: TableColumn<Pharmacy>[] = [
    { 
      header: 'Name', 
      field: 'name', 
      sortable: true 
    },
    { 
      header: 'City', 
      field: 'city', 
      sortable: true 
    },
    { 
      header: 'State', 
      field: 'state', 
      sortable: true 
    },
    { 
      header: 'Phone', 
      field: 'phone', 
      sortable: false 
    },
    { 
      header: 'Email', 
      field: 'email', 
      sortable: true 
    },
    { 
      header: 'Status', 
      field: 'isActive',
      cellRenderer: (value: boolean) => 
        `<span class="status-badge ${value ? 'active' : 'inactive'}">
          <i class="fas ${value ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        </span>`,
      align: 'center',
      headerAlign: 'center'
    }
  ];
  selectedItems: any[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modal = inject(NgbModal);
  
  constructor(public store: PharmaciesStore, public pharmacyService: PharmacyService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      address: ['', [Validators.required, Validators.maxLength(160)]],
      city: ['', [Validators.required, Validators.maxLength(80)]],
      state: ['', [Validators.required, Validators.maxLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,}$/)]],
      email: ['', [Validators.email]],
      isActive: [true]
    });

    // Handle query parameters for search and pagination
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      const p = +params['page'] || 1;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: q || null, page: p !== 1 ? p : null },
        queryParamsHandling: 'merge'
      });
    });
  }

  get isEditing() { return this.editingId() !== null; }

  onAddNew() {
    this.router.navigate(['/pharmacies/create']);
  }

  onEdit(pharmacy: Pharmacy) {
    if (!pharmacy?.id) {
      console.error('Invalid pharmacy object:', pharmacy);
      return;
    }
    this.pharmacyService.selectedItem.set(pharmacy);
    this.router.navigate(['/pharmacies/edit', pharmacy.id]);
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

  onSelectionChange(selectedItems: any[]) {
    this.selectedItems = selectedItems;
  }

  onSearch(term: string) {
    this.store.setQuery(term, 1);
  }

  onPageChange(p: number) {
    this.store.setPage(p);
  }
}
