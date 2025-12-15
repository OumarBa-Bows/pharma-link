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
  currentPage = 1;
  pagesToShow = 5;
  selectedStatus: string = 'ALL';
  private modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);

  allPharmacies: any[] = []; // Liste complète des pharmacies
  filteredPharmacies: any[] = []; // Liste filtrée pour l'affichage

  get displayedPharmacies() {
    return this.filteredPharmacies.length > 0 || this.search || this.selectedStatus !== 'ALL'
      ? this.filteredPharmacies
      : this.allPharmacies;
  }

  get totalPages(): number {
    return Math.ceil(this.displayedPharmacies.length / this.pageSize);
  }

  get paginatedPharmacies(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.displayedPharmacies.slice(start, end);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onAddNew() {
    this.router.navigateByUrl('/pharmacy/create');
  }

  onSearch(searchTerm: any) {
    // Réinitialiser la pagination lors de la recherche
    this.currentPage = 1;

    // Si la recherche est vide, afficher toutes les pharmacies
    if (!searchTerm || searchTerm.length === 0) {
      this.search = '';
      this.applyFilters();
      return;
    }

    this.search = searchTerm.toLowerCase();
    this.applyFilters();

    console.log(`[onSearch] Recherche: "${searchTerm}", Résultats: ${this.filteredPharmacies.length}/${this.allPharmacies.length}`);
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allPharmacies];

    // Filtrer par statut
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter((pharmacy) => pharmacy.state === this.selectedStatus);
    }

    // Filtrer par recherche
    if (this.search) {
      filtered = filtered.filter((pharmacy) => {
        const name = pharmacy.name?.toLowerCase() || '';
        const phone = pharmacy.phone?.toLowerCase() || '';
        const address = pharmacy.address?.toLowerCase() || '';
        const customerType = pharmacy.customerType?.toLowerCase() || '';
        const state = pharmacy.state?.toLowerCase() || '';

        return (
          name.includes(this.search) ||
          phone.includes(this.search) ||
          address.includes(this.search) ||
          customerType.includes(this.search) ||
          state.includes(this.search)
        );
      });
    }

    this.filteredPharmacies = filtered;
  }

  getStatusCount(status: string): number {
    if (status === 'ALL') {
      return this.allPharmacies.length;
    }
    return this.allPharmacies.filter((pharmacy) => pharmacy.state === status).length;
  }

  isLoading: boolean = false;
  pharmacies: any[] = []; // Propriété utilisée par le template pour afficher

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
        PHARMACY: 'Pharmacie',
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
          PHARMACY: this.translateService.instant('pharmacies.pharmacy'),
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
    this.newSubscription = this.apiService.getData(`pharmacies?page=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (response: any) => {
        console.log('Pharmacies fetched successfully:', response);
        this.allPharmacies = response.data.pharmacies;
        this.filteredPharmacies = [...this.allPharmacies];
        this.pharmacies = this.displayedPharmacies; // Pour le template
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
