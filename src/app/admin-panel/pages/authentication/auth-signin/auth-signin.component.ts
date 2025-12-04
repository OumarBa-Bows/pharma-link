import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/apis/api-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from 'src/app/components/notification/notification.component';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, TranslatePipe, CommonModule, NotificationComponent],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent {
  loginForm: FormGroup;
  currentLang: string;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.currentLang = this.translateService.getCurrentLang() || this.translateService.defaultLang || 'fr';
  }

  changeLanguage(lang: string) {
    this.translateService.use(lang);
    this.currentLang = lang;
    localStorage.setItem('language', lang);
  }

  signIn() {
    console.log('=== Sign-in form submitted ===');
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    console.log('Signing in with', email, password);

    this.apiService.postData('auth/login', { email, password }).subscribe({
      next: (response: any) => {
        console.log('Sign-in response:', response);
        localStorage.setItem('token', response?.accessToken);
        if (response?.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('roles', JSON.stringify(response.user?.roles));
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Sign-in error:', error);
        this.notificationService.showError(this.translateService.instant('auth.signInError'));
        this.isLoading = false;
      }
    });
  }
}
