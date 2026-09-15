import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'src/app/theme/shared/components/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { ImportModalComponent } from 'src/app/theme/shared/components/import-modal/import-modal.component';
import { LowStockModalComponent } from '../low-stock-modal/low-stock-modal.component';

@Component({
  selector: 'app-index',
  imports: [SharedModule, RouterModule, TranslatePipe, SpinnerComponent, NgbModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  search = '';
  pageSize = 20;
  currentPage = 1;
  pagesToShow = 5;
  totalItems = 0;
  totalPages = 0;
  lowStockCount = 0;
  private modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);
  private http = inject(HttpClient);
  private searchSubject = new Subject<string>();

  onAddNew() {
    this.router.navigateByUrl('/articles/create');
  }

  onSearch(searchTerm: any) {
    this.searchSubject.next((searchTerm || '').trim());
  }

  isLoading: boolean = false;
  articles: any[] = []; // Page courante renvoyée par le serveur

  columns = [
    //{ header: 'Image', field: 'imageLink', img: false },
    { header: 'Nom', field: 'name' },
    { header: 'Référence', field: 'reference' },
    { header: 'Prix', field: 'price' },
    { header: 'Stock disponible', field: 'availableQuantity' },
    { header: 'Catégorie', field: 'category' },
    {
      header: 'Publié',
      field: 'isPublished',
      type: 'enum',
      enumMap: {
        true: 'Oui',
        false: 'Non'
      },
      badgeColors: {
        true: 'bg-success text-white',
        false: 'bg-secondary text-white'
      }
    }
  ];

  newSubscription: Subscription;
  langSubscription: Subscription;
  searchSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getArticles();
    this.updateColumns();

    // Recherche côté serveur, déclenchée après 300ms sans frappe
    this.searchSubscription = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.search = term;
      this.currentPage = 1;
      this.getArticles();
    });

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
      { header: this.translateService.instant('listings.availableQuantity'), field: 'availableQuantity' },
      { header: this.translateService.instant('common.category'), field: 'category' },
      {
        header: this.translateService.instant('articles.isPublished'),
        field: 'isPublished',
        type: 'enum',
        enumMap: {
          true: this.translateService.instant('common.yes'),
          false: this.translateService.instant('common.no')
        },
        badgeColors: {
          true: 'bg-success text-white',
          false: 'bg-secondary text-white'
        }
      }
    ];
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  openLowStockModal() {
    const params: any = { page: 1, limit: 100, lowStock: true };
    if (this.search) params.search = this.search;

    this.isLoading = true;
    this.apiService.getData('articles/paginated/limit', { params }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const modalRef = this.modalService.open(LowStockModalComponent, {
          size: 'lg',
          centered: true,
          backdrop: 'static'
        });
        modalRef.componentInstance.lowStockArticles = response.data.articles;
      },
      error: (error) => {
        console.error('Error fetching low stock articles:', error);
        this.isLoading = false;
      }
    });
  }

  get pages(): number[] {
    const half = Math.floor(this.pagesToShow / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.pagesToShow - 1);

    if (end - start < this.pagesToShow - 1) {
      start = Math.max(1, end - this.pagesToShow + 1);
    }

    const pagesArray = [];
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getArticles();
    }
  }

  getArticles() {
    this.isLoading = true;
    // Annuler la requête précédente pour ne pas afficher une réponse obsolète
    this.newSubscription?.unsubscribe();

    const params: any = { page: this.currentPage, limit: this.pageSize };
    if (this.search) params.search = this.search;

    this.newSubscription = this.apiService.getData('articles/paginated/limit', { params }).subscribe({
      next: (response: any) => {
        console.log('Fetched articles response:', response);
        const { articles, total, totalPages, lowStockCount } = response.data;

        // La page courante peut ne plus exister (ex : suppression du dernier article de la page)
        if (this.currentPage > 1 && this.currentPage > totalPages) {
          this.currentPage = Math.max(totalPages, 1);
          this.getArticles();
          return;
        }

        this.articles = articles;
        this.totalItems = total;
        this.totalPages = totalPages;
        this.lowStockCount = lowStockCount;
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

  onDiscount(row: any) {
    this.router.navigateByUrl(`/articles/remise/${row['id']}`);
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
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
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

  togglePublish(row: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });

    const isPublished = row['isPublished'];
    const confirmMessage = isPublished
      ? this.translateService.instant('articles.confirmUnpublish')
      : this.translateService.instant('articles.confirmPublish');

    modalRef.componentInstance.msg = confirmMessage;

    modalRef.result.then((result) => {
      if (result) {
        this.isLoading = true;
        this.apiService.getData(`articles/set/publish/${row['id']}`).subscribe({
          next: (response) => {
            console.log('Article publish status toggled:', response);
            const newStatus = !isPublished;
            const message = newStatus
              ? this.translateService.instant('articles.publishSuccess')
              : this.translateService.instant('articles.unpublishSuccess');
            this.notificationService.showSuccess(message);
            this.getArticles(); // Rafraîchir la liste
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erreur lors du changement de statut de publication:', error);
            this.notificationService.showError(this.translateService.instant('articles.publishError'));
          }
        });
      }
    });
  }

  importArticle(event: any) {
    const modalRef = this.modalService.open(ImportModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    // Configure modal for Excel files
    modalRef.componentInstance.title = this.translateService.instant('articles.article-list.import.title');
    modalRef.componentInstance.description = this.translateService.instant('articles.article-list.import.description');
    modalRef.componentInstance.accept =
      '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Intercepter le clic sur le bouton d'import
    const originalOnImport = modalRef.componentInstance.onImport.bind(modalRef.componentInstance);
    modalRef.componentInstance.onImport = () => {
      const file = modalRef.componentInstance.file;
      if (!file) return;

      modalRef.componentInstance.isUploading = true;

      const formData = new FormData();
      formData.append('file', file);

      this.apiService.postData('articles/upload', formData).subscribe({
        next: (res) => {
          console.log('Articles uploaded successfully:', res);
          this.notificationService.showSuccess(this.translateService.instant('articles.article-list.import.successMessage'));
          modalRef.close();
          this.getArticles();
        },
        error: (err) => {
          console.error('Erreur import articles:', err);
          this.notificationService.showError(this.translateService.instant('articles.article-list.import.errorMessage'));
          modalRef.close();
        }
      });
    };
  }

  downloadTemplate() {
    const templateUrl = `${environment.apiUrl}/articles/download/template`;
    this.http.get(templateUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'template.xlsx';
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        this.notificationService.showSuccess(this.translateService.instant('articles.article-list.template.downloadSuccess'));
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du template:', err);
        this.notificationService.showError(this.translateService.instant('articles.article-list.template.downloadError'));
      }
    });
  }
}
