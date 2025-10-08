import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PharmaciesStore } from 'src/app/services/stores/pharmacies.store';
import { NotificationService } from 'src/app/services/notifications/notification.service';

@Component({
  selector: 'app-pharmacy-create',
  standalone: true,
  imports: [SharedModule, RouterModule, TranslatePipe, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreatePharmacyComponent {
  pharmacyForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notification: NotificationService,
    private store: PharmaciesStore
  ) {
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

  async onSubmit() {
    if (this.pharmacyForm.valid) {
      this.pharmacyForm.disable();
      this.isLoading = true;
      
      try {
        await this.store.create(this.pharmacyForm.value);
        this.notification.showSuccess('Pharmacy created successfully');
        this.router.navigate(['/pharmacies']);
      } catch (error) {
        this.pharmacyForm.enable();
        this.isLoading = false;
        this.notification.showError('Failed to create pharmacy');
        console.error('Error creating pharmacy:', error);
      }
    }
  }
}
