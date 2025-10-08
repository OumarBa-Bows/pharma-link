import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PharmaciesStore } from 'src/app/services/stores/pharmacies.store';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { Subscription } from 'rxjs';
import { Pharmacy } from 'src/app/models/pharmacy.model';
import { PharmaciesFakeService } from 'src/app/services/fakes/pharmacies.fake.service';

@Component({
  selector: 'app-pharmacy-edit',
  standalone: true,
  imports: [SharedModule, RouterModule, TranslatePipe, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditPharmacyComponent implements OnInit, OnDestroy {
  pharmacyForm: FormGroup;
  isLoading = false;
  private subscription = new Subscription();
  private pharmacyId: string | null = null;
  private pharmacy: Pharmacy | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notification: NotificationService,
    private store: PharmaciesStore,
    private pharmacyService: PharmaciesFakeService
  ) {
    if(this.pharmacyService.selectedItem() == null) {
      this.router.navigate(['/pharmacies']);
      return;
    }
    
    this.pharmacyForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      type: ['', [Validators.required, Validators.maxLength(40)]],
      address: ['', [Validators.required, Validators.maxLength(160)]],
      managerName: ['', [Validators.maxLength(80)]],
      doctorName: ['', [Validators.maxLength(80)]]
    });
  }

  ngOnInit() {
    this.pharmacyId = this.route.snapshot.paramMap.get('id');
    if (this.pharmacyId) {
      this.loadPharmacy(this.pharmacyId);
    }
  }

  private async loadPharmacy(id: string): Promise<void> {
    this.isLoading = true;
    try {
      // Try to get from service first (in case we came from list)
      const selectedPharmacy = this.pharmacyService.selectedItem();
      
      if (selectedPharmacy && selectedPharmacy.id === id) {
        this.pharmacy = selectedPharmacy;
        this.pharmacyForm.patchValue(selectedPharmacy);
        this.isLoading = false;
        return;
      }

      // If not in service, fetch from store
      const pharmacy = await this.store.getById(id);
      if (!pharmacy) {
        this.notification.showError('Pharmacy not found');
        this.router.navigate(['/pharmacies']);
        return;
      }
      
      this.pharmacy = pharmacy;
      this.pharmacyForm.patchValue(pharmacy);
    } catch (error) {
      this.notification.showError('Failed to load pharmacy details');
      console.error('Error loading pharmacy:', error);
      this.router.navigate(['/pharmacies']);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.pharmacyForm.valid && this.pharmacyId) {
      this.pharmacyForm.disable();
      this.isLoading = true;
      
      try {
        await this.store.update(this.pharmacyId, this.pharmacyForm.value);
        this.notification.showSuccess('Pharmacy updated successfully');
        this.router.navigate(['/pharmacies']);
      } catch (error) {
        this.notification.showError('Failed to update pharmacy');
        console.error('Error updating pharmacy:', error);
      } finally {
        this.pharmacyForm.enable();
        this.isLoading = false;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/pharmacies']);
  }

  ngOnDestroy(): void {
    this.pharmacyService.selectedItem.set(null);
    this.subscription.unsubscribe();
  }
}