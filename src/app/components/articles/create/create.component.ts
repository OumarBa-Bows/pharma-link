import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  articleForm: FormGroup;
  isLoading: boolean = false;
  imagePath: string = '';
  categories: any;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    this.getCategory();
    this.articleForm = this.fb.group({
      reference: ['', Validators.required],
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      image: [null],
      description: [''],
      expiryDate: [null],
      barcode: [''],
      categoryId: [null]
    });
  }

  onSubmit() {
    if (this.articleForm.valid) {
      this.articleForm.disable();
      this.isLoading = true;
      const formData = new FormData();
      Object.keys(this.articleForm.controls).forEach((key) => {
        if (key === 'image') {
          const file = this.articleForm.get('image')?.value;
          if (file) {
            formData.append('image', file);
          }
        } else {
          if (
            this.articleForm.get(key)?.value !== null &&
            this.articleForm.get(key)?.value !== undefined &&
            this.articleForm.get(key)?.value !== ''
          ) {
            formData.append(key, this.articleForm.get(key)?.value);
          }
        }
      });
      this.apiService.postData('articles', formData).subscribe({
        next: (response) => {
          console.log('Article créé :', response);
          this.isLoading = false;
          this.articleForm.enable();
          this.articleForm.reset();
        },
        error: (error) => {
          console.error("Erreur lors de la création de l'article :", error);
          this.isLoading = false;
          this.articleForm.enable();
          this.notificationService.showError(this.translateService.instant('articles.article-create.errorMessage'));
        },
        complete: () => {
          this.notificationService.showSuccess(this.translateService.instant('articles.article-create.successMessage'));
          this.router.navigateByUrl('/articles/index');
        }
      });
    }
  }

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validation taille
      if (file.size > 1 * 1024 * 1024) {
        this.notificationService.showError(this.translateService.instant('articles.article-create.fileSizeError'));

        // ❌ Réinitialiser le input
        input.value = '';
        this.imagePath = null; // supprimer le preview si déjà défini
        this.articleForm.patchValue({
          image: null
        });
        return;
      }

      this.articleForm.patchValue({
        image: file
      });

      // Créer le preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePath = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getCategory() {
    this.apiService.getData('articles/categories/get').subscribe((res: any) => {
      console.log(res);
      this.categories = res.data.categories;
    });
  }
}
