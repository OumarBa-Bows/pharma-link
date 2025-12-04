import { Component, inject, Type } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
    this.router.navigateByUrl('/pharmacy/create');
  }

  onSearch(c: any) {
    if (c == '' || c.length == 0) {
      this.search = '';
      this.page = 1;
      this.pageSize = 20;
      this.getPharmacies();
      return;
    }

    if (c.length < 2 || c == this.search) return;

    this.search = c;
    this.page = 1;
    this.pageSize = 20;
    this.getPharmacies();
  }

  isLoading: boolean = false;
  pharmacies: any[] = [];
  columns = [
    { header: 'Nom', field: 'name' },
    { header: 'Telephone', field: 'phone' },
    { header: 'Adresse', field: 'address' },
    { header: 'Type', field: 'customerType', type: 'enum', enumMap: { PHARMACY: 'Pharmacie', DEPOT: 'Depot' } },
    { header: 'Statut', field: 'state', type: 'enum', enumMap: { ACTIVE: 'Actif', BLOCKED: 'Bloqué', PENDING: 'En attente' } }
  ];

  newSubscription: Subscription;
  langSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.getPharmacies();
    this.updateColumns();
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      { header: this.translateService.instant('common.name'), field: 'name' },
      { header: this.translateService.instant('pharmacies.phone'), field: 'phone' },
      { header: this.translateService.instant('pharmacies.address'), field: 'address' },
      {
        header: this.translateService.instant('pharmacies.type'),
        field: 'customerType',
        type: 'enum',
        enumMap: {
          PHARMACY: this.translateService.instant('pharmacies.pharmacy'),
          DEPOT: this.translateService.instant('pharmacies.depot')
        }
      },
      {
        header: this.translateService.instant('pharmacies.status'),
        field: 'state',
        type: 'enum',
        enumMap: {
          ACTIVE: this.translateService.instant('pharmacies.active'),
          BLOCKED: this.translateService.instant('pharmacies.blocked'),
          PENDING: this.translateService.instant('pharmacies.pending')
        }
      }
    ];
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getPharmacies() {
    this.isLoading = true;
    this.newSubscription = this.apiService
      .getData(`pharmacies?search=${this.search}&page=${this.page}&pageSize=${this.pageSize}`)
      .subscribe({
        next: (response: any) => {
          console.log('Pharmacies fetched successfully:', response);
          this.pharmacies = response.data.pharmacies;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching pharmacies:', error);
          this.isLoading = false;
        }
      });
  }

  onEdit(row: any) {
    this.router.navigateByUrl(`/pharmacy/edit/${row['id']}`);
  }

  ngOnDestroy() {
    this.newSubscription?.unsubscribe();
    this.langSubscription?.unsubscribe();
  }

  importArticle(event: any) {
    const modalRef = this.modalService.open(ImportModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    // Configure modal for Excel files
    modalRef.componentInstance.title = 'pharmacies.importTitle';
    modalRef.componentInstance.description = 'pharmacies.importDescription';
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
            this.notificationService.showSuccess(this.translateService.instant('pharmacies.importSuccess'));
          },
          error: (err) => {
            this.isLoading = false;

            console.error('Erreur import articles:', err);
            this.notificationService.showError(this.translateService.instant('pharmacies.importError'));
          },
          complete: () => {
            this.isLoading = false;
            this.getPharmacies();
          }
        });
      })
      .catch(() => {
        // Modal dismissed
      });
  }
}
