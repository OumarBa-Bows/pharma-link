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
import { LowStockModalComponent } from '../low-stock-modal/low-stock-modal.component';
import { HttpEventType } from '@angular/common/http';

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
  currentPage = 1;
  pagesToShow = 5;
  private modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);

  allArticles: any[] = []; // Liste complète des articles
  filteredArticles: any[] = []; // Liste filtrée pour l'affichage

  onAddNew() {
    this.router.navigateByUrl('/articles/create');
  }

  onSearch(searchTerm: any) {
    // Si la recherche est vide, afficher tous les articles
    if (!searchTerm || searchTerm.length === 0) {
      this.search = '';
      this.filteredArticles = [...this.allArticles];
      return;
    }

    this.search = searchTerm.toLowerCase();

    // Filtrer les articles par nom, catégorie, prix et référence
    this.filteredArticles = this.allArticles.filter((article) => {
      const name = article.name?.toLowerCase() || '';
      const category = article.category?.toLowerCase() || '';
      const reference = article.reference?.toLowerCase() || '';
      const price = article.price?.toString() || '';

      return name.includes(this.search) || category.includes(this.search) || reference.includes(this.search) || price.includes(this.search);
    });

    console.log(`[onSearch] Recherche: "${searchTerm}", Résultats: ${this.filteredArticles.length}/${this.allArticles.length}`);
  }

  isLoading: boolean = false;
  articles: any[] = []; // Propriété utilisée par le template pour afficher

  get displayedArticles() {
    return this.filteredArticles.length > 0 || this.search ? this.filteredArticles : this.allArticles;
  }

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

  getLowStockCount(): number {
    return this.displayedArticles.filter((article) => article.availableQuantity <= 20).length;
  }

  openLowStockModal() {
    const lowStockArticles = this.displayedArticles.filter((article) => article.availableQuantity <= 20);
    const modalRef = this.modalService.open(LowStockModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.lowStockArticles = lowStockArticles;
  }

  get totalPages(): number {
    return Math.ceil(this.displayedArticles.length / this.pageSize);
  }

  get pagedArticles() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.displayedArticles.slice(start, end);
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getArticles() {
    this.isLoading = true;
    this.newSubscription = this.apiService.getData(`articles?page=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (response: any) => {
        console.log('Articles fetched successfully:', response);
        this.allArticles = response.data.articles;
        this.filteredArticles = [...this.allArticles];
        this.articles = this.displayedArticles; // Pour le template
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
}
