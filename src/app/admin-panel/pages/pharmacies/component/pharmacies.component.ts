import { Component, effect, signal, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PharmaciesStore } from 'src/app/services/stores/pharmacies.store';
import { PaginationComponent } from 'src/app/theme/shared/components/pagination/pagination.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn } from 'src/app/models/table-column.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from 'src/app/theme/shared/components/table/table.component';
import { PageHeaderComponent } from 'src/app/theme/shared/components/page-header/page-header.component';
import { Pharmacy, PharmacyState, CustomerType, Zone } from 'src/app/models/pharmacy.model';
import { PharmacyService } from 'src/app/services/api/pharmacy.service';
import { ZoneService } from '../../../../services/api/zone.service';

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
export class PharmaciesComponent implements OnInit {
  @ViewChild('pharmacyForm') pharmacyFormTemplate!: TemplateRef<any>;
  @ViewChild('statusModal') statusModalTemplate!: TemplateRef<any>;
  
  private modalRef!: NgbModalRef;
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: FormGroup;
  isLoading = false;
  
  columns = [
    { 
      header: 'Name', 
      field: 'name', 
      sortable: true 
    },
    { 
      header: 'Code', 
      field: 'code', 
      sortable: true 
    },
    { 
      header: 'Address', 
      field: 'address', 
      sortable: true 
    },
    { 
      header: 'Zone', 
      field: 'zone',
      sortable: true,
      formatter: (pharmacy: Pharmacy) => pharmacy.zone?.name || 'N/A'
    },
    { 
      header: 'Email', 
      field: 'email', 
      sortable: true 
    },
    { 
      header: 'Status', 
      field: 'state',
      sortable: true,
      formatter: (pharmacy: Pharmacy) => {
        const statusClass = {
          [PharmacyState.ACTIVE]: 'active',
          [PharmacyState.PENDING]: 'warning',
          [PharmacyState.BLOCKED]: 'inactive'
        }[pharmacy.state];
        return `
          <span class="status-badge ${statusClass}">
            <i class="fas ${pharmacy.state === PharmacyState.ACTIVE ? 'fa-check-circle' : 
                           pharmacy.state === PharmacyState.PENDING ? 'fa-clock' : 
                           'fa-ban'}"></i>
            ${pharmacy.state}
          </span>`;
      },
      align: 'center',
      headerAlign: 'center'
    } as any
  ];
  selectedItems: any[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modal = inject(NgbModal);
  private zoneService = inject(ZoneService);
  
  zones: Zone[] = [];
  customerTypes = Object.values(CustomerType);
  pharmacyStates = Object.values(PharmacyState);
  
  // Status form
  statusForm = this.fb.group({
    id: [''],
    state: [PharmacyState.PENDING, Validators.required],
    reason: ['']
  });

  constructor(public store: PharmaciesStore, public pharmacyService: PharmacyService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      zoneId: ['', [Validators.required]],
      customerType: [CustomerType.PHARMACY, [Validators.required]],
      doctorName: ['', [Validators.maxLength(100)]],
      managerName: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      location: ['', [Validators.maxLength(100)]]
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

  ngOnInit() {
    this.loadZones();
  }

  private loadZones() {
    this.zoneService.getAll().subscribe({
      next: (zones: any) => {
        this.zones = zones;
      },
      error: (error: any) => {
        console.error('Failed to load zones:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load zones',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  onAddNew() {
    this.editingId.set(null);
    this.form.reset({
      customerType: CustomerType.PHARMACY
    });
    this.modalRef = this.modal.open(this.pharmacyFormTemplate, { size: 'lg' });
  }

  onEdit(pharmacy: Pharmacy) {
    if (!pharmacy?.id) {
      console.error('Invalid pharmacy object:', pharmacy);
      return;
    }
    
    this.editingId.set(pharmacy.id);
    this.form.patchValue({
      ...pharmacy,
      zoneId: pharmacy.zone?.id
    });
    
    this.modalRef = this.modal.open(this.pharmacyFormTemplate, { size: 'lg' });
  }

  onCancel() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
    this.editingId.set(null);
  }

  onSubmit() { 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const value = this.form.value;
    this.isLoading = true;
    
    const request = this.isEditing 
      ? this.pharmacyService.update(this.editingId()!, value)
      : this.pharmacyService.create(value);
    
    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Pharmacy ${this.isEditing ? 'updated' : 'created'} successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        this.store.refresh();
        this.onCancel();
      },
      error: (error: any) => {
        console.error('Error saving pharmacy:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to ${this.isEditing ? 'update' : 'create'} pharmacy`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDelete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this pharmacy!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pharmacyService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Pharmacy has been deleted.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
            this.store.refresh();
          },
          error: (error: any) => {
            console.error('Error deleting pharmacy:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete pharmacy',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    });
  }
  
  onStatusChange(pharmacy: Pharmacy) {
    if (!pharmacy?.id) {
      console.error('Invalid pharmacy object:', pharmacy);
    }
    
    this.modalRef = this.modal.open(this.statusModalTemplate);
  }
  
  updateStatus() {
    if (this.statusForm.invalid) return;
    
    const { id, state, reason } = this.statusForm.value;
    if (!id || !state) {
      console.error('Missing required fields for status update');
      return;
    }
    
    this.isLoading = true;
    
    this.pharmacyService.updateStatus(id, state, reason).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Status updated successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        this.store.refresh();
        if (this.modalRef) {
          this.modalRef.close();
        }
      },
      error: (error: any) => {
        console.error('Error updating status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update status',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
