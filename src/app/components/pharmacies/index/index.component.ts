import { Component, inject, Type } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
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
  pageSize = 20;
  currentPage = 1;
  pagesToShow = 5;
  selectedStatus: string = 'ALL';
  totalItems = 0;
  totalPages = 0;
  statusCounts: Record<string, number> = {};
  private modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);
  private searchSubject = new Subject<string>();
  searchSubscription: Subscription;

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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getPharmacies();
    }
  }

  onAddNew() {
    this.router.navigateByUrl('/pharmacy/create');
  }

  onSearch(searchTerm: any) {
    this.searchSubject.next((searchTerm || '').trim());
  }

  filterByStatus(status: string) {
    if (status === this.selectedStatus) return;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.getPharmacies();
  }

  getStatusCount(status: string): number {
    return this.statusCounts[status] ?? 0;
  }

  isLoading: boolean = false;
  pharmacies: any[] = []; // Page courante renvoyée par le serveur

  columns = [
    { header: 'Date de création', field: 'createdAt', type: 'date', format: 'dd/MM/yyyy' },
    { header: 'Nom', field: 'name' },
    { header: 'Telephone', field: 'phone' },
    { header: 'Adresse', field: 'address' },
    {
      header: 'Type',
      field: 'customerType',
      type: 'enum',
      enumMap: {
        PHARMACIE: 'Pharmacie',
        DEPOT: 'Depot',
        DEPOT_PHARMACEUTIQUE: 'Dépôt pharmaceutique',
        CLINIQUE: 'Clinique',
        HOPITAL: 'Hôpital',
        POINT_DE_SANTE: 'Point de santé',
        CENTRE_HOSPITALIER: 'Centre hospitalier'
      }
    },
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

    // Recherche côté serveur, déclenchée après 300ms sans frappe
    this.searchSubscription = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.search = term;
      this.currentPage = 1;
      this.getPharmacies();
    });

    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      { header: this.translateService.instant('common.createdAt'), field: 'createdAt', type: 'date', format: 'dd/MM/yyyy' },
      { header: this.translateService.instant('common.name'), field: 'name' },
      { header: this.translateService.instant('pharmacies.phone'), field: 'phone' },
      { header: this.translateService.instant('pharmacies.address'), field: 'address' },
      {
        header: this.translateService.instant('pharmacies.type'),
        field: 'customerType',
        type: 'enum',
        enumMap: {
          PHARMACIE: this.translateService.instant('pharmacies.pharmacie'),
          DEPOT: this.translateService.instant('pharmacies.depot'),
          DEPOT_PHARMACEUTIQUE: this.translateService.instant('pharmacies.depotPharmaceutique'),
          CLINIQUE: this.translateService.instant('pharmacies.clinique'),
          HOPITAL: this.translateService.instant('pharmacies.hopital'),
          POINT_DE_SANTE: this.translateService.instant('pharmacies.pointDeSante'),
          CENTRE_HOSPITALIER: this.translateService.instant('pharmacies.centreHospitalier')
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
    // Annuler la requête précédente pour ne pas afficher une réponse obsolète
    this.newSubscription?.unsubscribe();

    const params: any = { page: this.currentPage, limit: this.pageSize };
    if (this.search) params.search = this.search;
    if (this.selectedStatus !== 'ALL') params.status = this.selectedStatus;

    this.newSubscription = this.apiService.getData('pharmacies/paginated/limit', { params }).subscribe({
      next: (response: any) => {
        const { pharmacies, total, totalPages, statusCounts } = response.data;
        this.pharmacies = pharmacies;
        this.totalItems = total;
        this.totalPages = totalPages;
        this.statusCounts = statusCounts;
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
    this.searchSubscription?.unsubscribe();
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

  onViewStats(pharmacy: any) {
    this.router.navigateByUrl(`/pharmacy/stats/${pharmacy['id']}`);
  }

  // Password modal
  selectedPharmacy: any = null;
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  isUpdatingPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  openPasswordModal(pharmacy: any, content: any) {
    this.selectedPharmacy = pharmacy;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordMismatch = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  updatePassword(modal: any) {
    this.passwordMismatch = false;
    if (!this.newPassword || !this.confirmPassword) return;
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    this.isUpdatingPassword = true;
    this.apiService.postData(`pharmacies/${this.selectedPharmacy.id}/update-password`, { newPassword: this.newPassword }).subscribe({
      next: () => {
        this.isUpdatingPassword = false;
        this.notificationService.showSuccess(this.translateService.instant('pharmacies.password-updated'));
        modal.close();
      },
      error: () => {
        this.isUpdatingPassword = false;
        this.notificationService.showError(this.translateService.instant('pharmacies.password-update-error'));
      }
    });
  }
}
