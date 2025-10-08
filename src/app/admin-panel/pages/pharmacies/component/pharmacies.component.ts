import { Component, effect, signal } from '@angular/core';
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
import { PharmaciesFakeService } from 'src/app/services/fakes/pharmacies.fake.service';

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
  
  columns: TableColumn[] = [
    { header: 'name', field: 'name', sortable: true },
    { header: 'code', field: 'code', sortable: true },
    { header: 'type', field: 'type', sortable: true },
    { header: 'phoneNumber', field: 'phoneNumber', sortable: false },
    { header: 'managerName', field: 'managerName', sortable: true },
    { header: 'doctorName', field: 'doctorName', sortable: true }
  ];
  selectedItems: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public store: PharmaciesStore,
    private modal: NgbModal,
    private pharmacyService: PharmaciesFakeService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      type: ['', [Validators.required, Validators.maxLength(40)]],
      address: ['', [Validators.required, Validators.maxLength(160)]],
      managerName: ['', [Validators.maxLength(80)]],
      doctorName: ['', [Validators.maxLength(80)]]
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

  onEdit(pharmacy: any) {
    if (!pharmacy || !pharmacy.id) {
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
