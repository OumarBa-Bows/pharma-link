import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/apis/api-service';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-update',
  imports: [SharedModule, RouterModule, SpinnerComponent, TranslatePipe, ReactiveFormsModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent {
  pharmacyId: string | null = null;
  pharmacy: any = null;
  pharmacyForm: FormGroup;
  isLoading = false;
  imagePath: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    this.pharmacyForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      customerType: ['', Validators.required],
      state: ['', Validators.required],
      managerName: [''],
      managerPhone: [''],
      doctorName: [''],
      doctorPhone: ['']
    });
    this.route.paramMap.subscribe((params) => {
      this.pharmacyId = params.get('id');
      if (this.pharmacyId) {
        this.loadPharmacy(this.pharmacyId);
      }
    });
  }

  loadPharmacy(id: string) {
    this.isLoading = true;
    this.apiService.getData(`pharmacies/${id}`).subscribe({
      next: (response: any) => {
        this.pharmacy = response.data.pharmacy;
        this.isLoading = false;
        console.log('Pharmacie chargée :', this.pharmacy);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors du chargement de la pharmacie :', error);
      },
      complete: () => {
        this.pharmacyFormPatchValue();
      }
    });
  }

  onSubmit() {
    if (this.pharmacyForm.valid) {
      this.pharmacyForm.disable();
      this.isLoading = true;
      console.log(this.pharmacyForm.value);
      this.apiService.putData(`pharmacies/${this.pharmacyId}`, this.pharmacyForm.value).subscribe({
        next: (response) => {
          console.log('Pharmacie mis à jour :', response);
          this.isLoading = false;
          this.pharmacyForm.enable();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la pharmacie :', error);
          this.isLoading = false;
          this.pharmacyForm.enable();
        },
        complete: () => {
          this.notificationService.showSuccess(this.translateService.instant('pharmacies.updateSuccess'));
          this.router.navigateByUrl('/pharmacy/index');
        }
      });
    }
  }

  pharmacyFormPatchValue() {
    this.pharmacyForm.patchValue({
      code: this.pharmacy.code,
      name: this.pharmacy.name,
      address: this.pharmacy.address,
      phone: this.pharmacy.phone,
      customerType: this.pharmacy.customerType,
      state: this.pharmacy.state,
      managerName: this.pharmacy.managerName,
      managerPhone: this.pharmacy.managerPhone,
      doctorName: this.pharmacy.doctorName,
      doctorPhone: this.pharmacy.doctorPhone
    });
  }
}
