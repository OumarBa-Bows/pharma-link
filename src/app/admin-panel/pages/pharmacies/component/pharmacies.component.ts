import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Pharmacy, PharmacyState, CustomerType, Zone } from 'src/app/models/pharmacy.model';
import { PharmacyService } from 'src/app/services/api/pharmacy.service';
import { ZoneService } from '../../../../services/api/zone.service';
import { PharmacyFormComponent } from '../components/pharmacy-form/pharmacy-form.component';
import Swal from 'sweetalert2';
import { PageHeaderComponent } from 'src/app/theme/shared/components/page-header/page-header.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pharmacies',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    PharmacyFormComponent,
    PageHeaderComponent
  ],
  templateUrl: './pharmacies.component.html',
  styleUrls: ['./pharmacies.component.scss']
})
export class PharmaciesComponent implements OnInit {
  // Component state
  showForm = signal(false);
  isEditing = signal(false);
  loading = false;
  
  // Data
  pharmacies: Pharmacy[] = [];
  zones: Zone[] = [];
  selectedPharmacy: Partial<Pharmacy> | null = null;
  
  // Enums for template
  PharmacyState = PharmacyState;
  CustomerType = CustomerType;
  
  // Services
  private pharmacyService = inject(PharmacyService);
  private zoneService = inject(ZoneService);

  // Data collections
  customerTypes = Object.values(CustomerType);
  pharmacyStates = Object.values(PharmacyState);

  ngOnInit(): void {
    this.loadPharmacies();
    //this.loadZones();
  }

  // Load pharmacies from the API
  loadPharmacies(): void {
    this.loading = true;
    this.pharmacyService.list('', 1, 50).subscribe({
      next: (page) => {
        this.pharmacies = page.items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pharmacies:', error);
        this.loading = false;
        Swal.fire('Error', 'Failed to load pharmacies', 'error');
      }
    });
  }

  // Load zones from the API
  loadZones(): void {
    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones = zones;
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        Swal.fire('Error', 'Failed to load zones', 'error');
      }
    });
  }

  // Handle add new pharmacy
  onAddNew(): void {
    this.selectedPharmacy = {};
    this.isEditing.set(false);
    this.showForm.set(true);
  }

  // Handle edit pharmacy
  onEdit(pharmacy: Pharmacy): void {
    this.selectedPharmacy = { ...pharmacy };
    this.isEditing.set(true);
    this.showForm.set(true);
  }

  // Handle delete pharmacy
  onDelete(pharmacy: Pharmacy): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete ${pharmacy.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.pharmacyService.delete(pharmacy.id).subscribe({
          next: () => {
            this.loadPharmacies();
            Swal.fire('Deleted!', 'Pharmacy has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting pharmacy:', error);
            this.loading = false;
            Swal.fire('Error', 'Failed to delete pharmacy', 'error');
          }
        });
      }
    });
  }

  // Handle save pharmacy
  onSave(pharmacyData: Partial<Pharmacy>): void {
    if (!pharmacyData) {
      console.error('No pharmacy data provided');
      return;
    }

    this.loading = true;
    const saveOperation = this.isEditing() && this.selectedPharmacy?.id
      ? this.pharmacyService.update(this.selectedPharmacy.id, pharmacyData as any)
      : this.pharmacyService.create(pharmacyData as any);

    saveOperation.pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.loadPharmacies();
        this.showForm.set(false);
        this.selectedPharmacy = null;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Pharmacy ${this.isEditing() ? 'updated' : 'created'} successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (error) => {
        console.error(`Error ${this.isEditing() ? 'updating' : 'creating'} pharmacy:`, error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to ${this.isEditing() ? 'update' : 'create'} pharmacy`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  // Handle cancel form
  onCancel(): void {
    this.showForm.set(false);
    this.selectedPharmacy = null;
  }
}
