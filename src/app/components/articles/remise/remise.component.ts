import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'src/app/theme/shared/components/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormBuilder } from '@angular/forms';
import { RemiseModalComponent } from '../remise-modal/remise-modal.component';

interface Remise {
  id: string;
  min: number;
  max: number;
  percent: number;
}

@Component({
  selector: 'app-remise',
  imports: [SharedModule, RouterModule, TranslatePipe, SpinnerComponent, NgbModule],
  templateUrl: './remise.component.html',
  styleUrl: './remise.component.scss'
})
export class RemiseComponent {
  isLoading = false;
  idArticle: string | null = null;
  remises: Remise[] = [];
  articleName = '';
  private modalService = inject(NgbModal);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.idArticle = params.get('id');
      if (this.idArticle) {
        this.getArticlesRemise();
      }
    });
  }

  getArticlesRemise() {
    this.isLoading = true;
    this.apiService.getData(`articles/remises/get/${this.idArticle}`).subscribe({
      next: (response: any) => {
        console.log('Remises loaded:', response);
        this.isLoading = false;
        this.remises = response.data.remises || [];
        this.articleName = response.data.articleName || '';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading remises:', error);
        this.notificationService.showError(this.translateService.instant('articles.remise.loadError'));
      }
    });
  }

  onAddNew() {
    const modalRef = this.modalService.open(RemiseModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.articleId = this.idArticle;
    modalRef.componentInstance.onSave = async (data: any) => {
      await this.createRemise(data);
    };

    modalRef.result.then(
      (result) => {
        if (result) {
          this.getArticlesRemise();
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  createRemise(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = {
        ...data,
        articleId: this.idArticle
      };

      this.apiService.postData(`articles/add/remise/${this.idArticle}`, payload).subscribe({
        next: (response) => {
          console.log('Remise created:', response);
          this.notificationService.showSuccess(this.translateService.instant('articles.remise.createSuccess'));
          resolve();
        },
        error: (error) => {
          console.error('Error creating remise:', error);
          this.notificationService.showError(this.translateService.instant('articles.remise.createError'));
          reject(error);
        }
      });
    });
  }

  onEdit(remise: Remise) {
    const modalRef = this.modalService.open(RemiseModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.remise = remise;
    modalRef.componentInstance.articleId = this.idArticle;
    modalRef.componentInstance.onSave = async (data: any) => {
      await this.updateRemise(data);
    };

    modalRef.result.then(
      (result) => {
        if (result) {
          this.getArticlesRemise();
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  updateRemise(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.putData(`articles/update/remise/${this.idArticle}/${data.id}`, data).subscribe({
        next: (response) => {
          console.log('Remise updated:', response);
          this.notificationService.showSuccess(this.translateService.instant('articles.remise.updateSuccess'));
          resolve();
        },
        error: (error) => {
          console.error('Error updating remise:', error);
          this.notificationService.showError(this.translateService.instant('articles.remise.updateError'));
          reject(error);
        }
      });
    });
  }

  deleteRemise(remise: Remise) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.msg = this.translateService.instant('articles.remise.confirmDelete');

    modalRef.result.then((result) => {
      if (result) {
        this.onDelete(remise);
      }
    });
  }

  onDelete(remise: Remise) {
    this.isLoading = true;
    this.apiService.deleteData(`articles/remove/remise/${this.idArticle}/${remise.id}`).subscribe({
      next: (response) => {
        console.log('Remise deleted:', response);
        this.notificationService.showSuccess(this.translateService.instant('articles.remise.deleteSuccess'));
        this.getArticlesRemise(); // Rafraîchir la liste
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting remise:', error);
        this.notificationService.showError(this.translateService.instant('articles.remise.deleteError'));
      }
    });
  }
}
