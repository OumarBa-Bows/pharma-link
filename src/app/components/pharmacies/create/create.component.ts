import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ApiService } from 'src/app/services/apis/api-service';
import { NotificationService } from 'src/app/services/notifications/notification.service';

@Component({
  selector: 'app-create-article',
  imports: [SharedModule, RouterModule, SpinnerComponent, TranslatePipe, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  pharmacyForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    this.pharmacyForm = this.fb.group(
      {
        code: ['', Validators.required],
        name: ['', Validators.required],
        phone: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        zipCode: [''],
        customerType: ['', Validators.required],
        state: ['', Validators.required],
        managerName: ['', Validators.required],
        managerPhone: ['', Validators.required],
        doctorName: [''],
        doctorPhone: [''],
        email: [''],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.pharmacyForm.valid) {
      this.pharmacyForm.disable();
      this.isLoading = true;
      this.apiService.postData('pharmacies', this.pharmacyForm.value).subscribe({
        next: (response) => {
          console.log('Pharmacie créée :', response);
          this.isLoading = false;
          this.pharmacyForm.enable();
          this.pharmacyForm.reset();
        },
        error: (error) => {
          console.error('Erreur lors de la création de la pharmacie :', error);
          this.isLoading = false;
          this.pharmacyForm.enable();

          // Vérifier si l'erreur contient PhoneNumberAlreadyExists ou CodeAlreadyExists
          const errorMessage = error?.error?.message || error?.message || '';
          if (errorMessage.includes('PhoneNumberAlreadyExists')) {
            this.notificationService.showError(this.translateService.instant('pharmacies.pharmacy-create.phoneAlreadyExists'));
          } else if (errorMessage.includes('CodeAlreadyExists')) {
            this.notificationService.showError(this.translateService.instant('pharmacies.pharmacy-create.codeAlreadyExists'));
          } else {
            this.notificationService.showError(this.translateService.instant('pharmacies.pharmacy-create.errorMessage'));
          }
        },
        complete: () => {
          this.notificationService.showSuccess(this.translateService.instant('pharmacies.pharmacy-create.successMessage'));
          this.router.navigateByUrl('/pharmacy/index');
        }
      });
    }
  }
}
