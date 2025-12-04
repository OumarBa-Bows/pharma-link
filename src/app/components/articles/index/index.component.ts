import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'src/app/theme/shared/components/confirmation-modal/confirmation-modal.component';
import { ToastService } from 'src/app/services/apis/toast.service';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { ImportModalComponent } from 'src/app/theme/shared/components/import-modal/import-modal.component';

@Component({
  selector: 'app-index',
  imports: [SharedModule, RouterModule, TranslatePipe, SpinnerComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  search = '';
  page = 1;
  pageSize = 20;
  private modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);

  onAddNew() {
    this.router.navigateByUrl('/articles/create');
  }

  onSearch(c: any) {
    if (c == '' || c.length == 0) {
      this.search = '';
      this.page = 1;
      this.pageSize = 20;
      this.getArticles();
      return;
    }

    if (c.length < 2 || c == this.search) return;

    this.search = c;
    this.page = 1;
    this.pageSize = 20;
    this.getArticles();
  }

  isLoading: boolean = false;
  articles: any[] = [];
  columns = [
    //{ header: 'Image', field: 'imageLink', img: false },
    { header: 'Nom', field: 'name' },
    { header: 'Référence', field: 'reference' },
    { header: 'Prix', field: 'price' },
    { header: 'Catégorie', field: 'category' }
  ];

  newSubscription: Subscription;
  langSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getArticles();
    this.updateColumns();

    // S'abonner aux changements de langue
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      //{ header: this.translateService.instant('common.image'), field: 'imageLink', img: false },
      { header: this.translateService.instant('common.name'), field: 'name' },
      { header: this.translateService.instant('common.reference'), field: 'reference' },
      { header: this.translateService.instant('common.price'), field: 'price' },
      { header: this.translateService.instant('common.category'), field: 'category' }
    ];
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getArticles() {
    this.isLoading = true;
    this.newSubscription = this.apiService.getData(`articles?search=${this.search}&page=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (response: any) => {
        console.log('Articles fetched successfully:', response);
        this.articles = response.data.articles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
        this.isLoading = false;
      }
    });
  }

  onEdit(row: any) {
    this.router.navigateByUrl(`/articles/edit/${row['id']}`);
  }

  onDelete(row: any) {
    this.isLoading = true;
    this.apiService.getData(`articles/delete/${row['id']}`).subscribe({
      next: (response) => {
        console.log('Article supprimé :', response);
        this.notificationService.showSuccess(this.translateService.instant('articles.article-list.delete.successMessage'));
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Erreur lors de la suppression de l'article :", error);
        this.notificationService.showError(this.translateService.instant('articles.article-list.delete.errorMessage'));
      },
      complete: () => {
        this.getArticles(); // Rafraîchir la liste des articles
      }
    });
  }
  ngOnDestroy() {
    if (this.newSubscription) {
      this.newSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  deleteArticle(row: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.msg = this.translateService.instant('articles.article-list.delete.confirmDelete');
    modalRef.result.then((result) => {
      if (result) {
        this.onDelete(row);
      }
    });
  }

  importArticle(event: any) {
    const modalRef = this.modalService.open(ImportModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    // Configure modal for Excel files
    modalRef.componentInstance.title = this.translateService.instant('articles.article-list.import.title');
    modalRef.componentInstance.description = this.translateService.instant('articles.article-list.import.description');
    modalRef.componentInstance.accept =
      '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    modalRef.result
      .then((file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        this.isLoading = true;
        this.apiService.postData('articles/upload', formData).subscribe({
          next: (res) => {
            console.log('Articles uploaded successfully:', res);
            this.notificationService.showSuccess(this.translateService.instant('articles.article-list.import.successMessage'));
          },
          error: (err) => {
            this.isLoading = false;

            console.error('Erreur import articles:', err);
            this.notificationService.showError(this.translateService.instant('articles.article-list.import.errorMessage'));
          },
          complete: () => {
            this.isLoading = false;
            this.getArticles();
          }
        });
      })
      .catch(() => {
        // Modal dismissed
      });
  }
}
