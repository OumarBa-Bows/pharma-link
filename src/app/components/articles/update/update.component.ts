import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
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
  articleId: string | null = null;
  article: any = null;
  articleForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.articleForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      image: [null],
      description: [''],
      expiryDate: [null],
      barcode: ['']
    });
    this.route.paramMap.subscribe((params) => {
      this.articleId = params.get('id');
      if (this.articleId) {
        this.loadArticle(this.articleId);
      }
    });
  }

  loadArticle(id: string) {
    this.isLoading = true;
    this.apiService.getData(`articles/${id}`).subscribe({
      next: (response: any) => {
        this.article = response.data.article;
        this.isLoading = false;
        console.log('Article chargé :', this.article);
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Erreur lors du chargement de l'article :", error);
      },
      complete: () => {
        this.articleFormPatchValue();
      }
    });
  }

  onSubmit() {
    if (this.articleForm.valid) {
      this.articleForm.disable();
      this.isLoading = true;
      const formData = new FormData();
      console.log(this.articleForm.value);

      Object.keys(this.articleForm.controls).forEach((key) => {
        if (key === 'image') {
          const file = this.articleForm.get('image')?.value;
          if (file) {
            formData.append('image', file);
          }
        } else {
          const value = this.articleForm.get(key)?.value;
          // N'ajoute que si la valeur n'est pas vide, null ou undefined
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
          }
        }
      });
      this.apiService.postData(`articles/update/${this.articleId}`, formData).subscribe({
        next: (response) => {
          console.log('Article mis à jour :', response);
          this.isLoading = false;
          this.articleForm.enable();
        },
        error: (error) => {
          console.error("Erreur lors de la mise à jour de l'article :", error);
          this.isLoading = false;
          this.articleForm.enable();
        },
        complete: () => {
          this.notificationService.showSuccess('Article mis à jour avec succès!');
          this.router.navigateByUrl('/articles/index');
        }
      });
    }
  }

  articleFormPatchValue() {
    this.articleForm.patchValue({
      code: this.article.code,
      name: this.article.name,
      price: this.article.price,
      description: this.article.description,
      expiryDate: this.article.expiryDate,
      barcode: this.article.barcode
    });
  }
}
