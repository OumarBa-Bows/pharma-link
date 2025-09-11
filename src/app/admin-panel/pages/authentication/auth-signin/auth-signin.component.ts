import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/apis/api-service';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  signIn() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('Signing in with', email, password);

    this.apiService.postData('auth/login', { email, password }).subscribe({
      next: (response: any) => {
        console.log('Sign-in response:', response);
        if (response?.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Sign-in error:', error);
        alert('Sign-in failed. Please check your credentials and try again.');
      }
    });
  }
}
