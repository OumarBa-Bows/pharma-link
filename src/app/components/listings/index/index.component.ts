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

  onAddNew() {
    this.router.navigateByUrl('/listings/create');
  }

  onSearch(c: any) {
    if (c == '' || c.length == 0) {
      this.search = '';
      this.page = 1;
      this.pageSize = 20;
      this.getListings();
      return;
    }

    if (c.length < 2 || c == this.search) return;

    this.search = c;
    this.page = 1;
    this.pageSize = 20;
    this.getListings();
  }

  isLoading: boolean = false;
  listings: any[] = [];
  columns = [
    { header: 'Description', field: 'description' },
    { header: 'Date de fin', field: 'end_date' }
  ];

  newSubscription: Subscription;
  langSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.getListings();
    this.updateColumns();
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      { header: this.translateService.instant('common.description'), field: 'description' },
      { header: this.translateService.instant('listings.endDate'), field: 'end_date' }
    ];
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getListings() {
    this.isLoading = true;
    this.newSubscription = this.apiService.getData(`listings?search=${this.search}&page=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (response: any) => {
        console.log('Listings fetched successfully:', response);
        this.listings = response.data.listings;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching listings:', error);
        this.isLoading = false;
      }
    });
  }

  onEdit(row: any) {
    this.router.navigateByUrl(`/listings/edit/${row['id']}`);
  }

  onDelete(row: any) {
    this.isLoading = true;
    this.apiService.getData(`listings/delete/${row['id']}`).subscribe({
      next: (response) => {
        console.log('Listing supprimé :', response);
        this.notificationService.showSuccess(this.translateService.instant('listings.deleteSuccess'));
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Erreur lors de la suppression de l'Listing :", error);
        this.notificationService.showError(this.translateService.instant('listings.deleteError'));
      },
      complete: () => {
        this.getListings(); // Rafraîchir la liste des listings
      }
    });
  }
  ngOnDestroy() {
    this.newSubscription?.unsubscribe();
    this.langSubscription?.unsubscribe();
  }

  deleteListing(row: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.msg = 'listings.confirmDelete';
    modalRef.result.then((result) => {
      if (result) {
        this.onDelete(row);
      }
    });
  }

  importListing(event: any) {
    const modalRef = this.modalService.open(ImportModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    // Configure modal for Excel files
    modalRef.componentInstance.title = 'listings.importTitle';
    modalRef.componentInstance.description = 'listings.importDescription';
    modalRef.componentInstance.accept =
      '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    modalRef.result
      .then((file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        this.isLoading = true;
        this.apiService.postData('listings/import', formData).subscribe({
          next: (res) => {
            console.log('Listings uploaded successfully:', res);
            this.notificationService.showSuccess(this.translateService.instant('listings.importSuccess'));
          },
          error: (err) => {
            this.isLoading = false;
            var message = err?.error?.message;
            console.error('Erreur import articles:', err);
            this.notificationService.showError(message ?? this.translateService.instant('listings.importError'));
          },
          complete: () => {
            this.isLoading = false;
            this.getListings();
          }
        });
      })
      .catch(() => {
        // Modal dismissed
      });
  }
}
