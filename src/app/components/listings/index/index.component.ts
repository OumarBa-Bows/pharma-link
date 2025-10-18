import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'src/app/theme/shared/components/confirmation-modal/confirmation-modal.component';
import { ToastService } from 'src/app/services/apis/toast.service';
import { NotificationService } from 'src/app/services/notifications/notification.service';

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
    { header: 'Nom', field: 'name' },
    { header: 'Description', field: 'description' },
  ];

  newSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getListings();
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
        this.notificationService.showSuccess('Listing hase been deleted successfully');
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Erreur lors de la suppression de l'Listing :", error);
        this.notificationService.showError('An error occurred while deleting the Listing');
      },
      complete: () => {
        this.getListings(); // Rafraîchir la liste des listings
      }
    });
  }
  ngOnDestroy() {
    this.newSubscription.unsubscribe();
  }

  deleteListing(row: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.msg = 'Are you sure you want to delete this Listing ?';
    modalRef.result.then((result) => {
      if (result) {
        this.onDelete(row);
      }
    });
  }
}
