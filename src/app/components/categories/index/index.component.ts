import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NotificationService } from 'src/app/services/notifications/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';

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

  private notificationService = inject(NotificationService);
  private modalService = inject(NgbModal);
  private currentModalRef: any;
  private translateService = inject(TranslateService);

  allCategories: any[] = []; // Liste complète des catégories
  filteredCategories: any[] = []; // Liste filtrée pour l'affichage

  onAddNew() {
    this.currentModalRef = this.modalService.open(AddCategoryModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    const modalComponent = this.currentModalRef.componentInstance;

    // Remplacer onSubmit du modal pour gérer la soumission ici
    modalComponent.onSubmit = () => {
      if (modalComponent.categoryForm.valid && !modalComponent.isSubmitting) {
        modalComponent.isSubmitting = true;
        const formData = modalComponent.categoryForm.value;
        this.onSubmit(formData, modalComponent);
      }
    };
  }

  onSearch(searchTerm: any) {
    // Si la recherche est vide, afficher toutes les catégories
    if (!searchTerm || searchTerm.length === 0) {
      this.search = '';
      this.filteredCategories = [...this.allCategories];
      return;
    }

    this.search = searchTerm.toLowerCase();

    // Filtrer les catégories par nom (fr), nom (ar), et date de création
    this.filteredCategories = this.allCategories.filter((category) => {
      const name = category.name?.toLowerCase() || '';
      const nameAr = category.nameAr?.toLowerCase() || '';
      const createdAt = category.createdAt?.toString() || '';

      return name.includes(this.search) || nameAr.includes(this.search) || createdAt.includes(this.search);
    });

    console.log(`[onSearch] Recherche: "${searchTerm}", Résultats: ${this.filteredCategories.length}/${this.allCategories.length}`);
  }

  isLoading: boolean = false;
  categories: any[] = []; // Propriété utilisée par le template pour afficher

  get displayedCategories() {
    return this.filteredCategories.length > 0 || this.search ? this.filteredCategories : this.allCategories;
  }

  columns = [
    { header: 'Date de création', field: 'createdAt', type: 'date', format: 'dd/MM/yyyy' },
    { header: 'Nom fr', field: 'name' },
    { header: 'Nom ar', field: 'nameAr' }
  ];

  newSubscription: Subscription;
  langSubscription: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getCategories();
    this.updateColumns();

    // S'abonner aux changements de langue
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      { header: this.translateService.instant('common.createdAt'), field: 'createdAt', type: 'date', format: 'dd/MM/yyyy' },
      { header: this.translateService.instant('common.name'), field: 'name' },
      { header: this.translateService.instant('common.nameAr'), field: 'nameAr' }
    ];
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getCategories() {
    this.isLoading = true;
    this.newSubscription = this.apiService.getData(`categories`).subscribe({
      next: (response: any) => {
        console.log('categories fetched successfully:', response);
        this.allCategories = response.data.categories;
        this.filteredCategories = [...this.allCategories];
        this.categories = this.displayedCategories; // Pour le template
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    });
  }

  onEdit(row: any) {
    this.currentModalRef = this.modalService.open(AddCategoryModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    const modalComponent = this.currentModalRef.componentInstance;
    modalComponent.initEditMode(row);

    // Remplacer onSubmit du modal pour gérer la modification
    modalComponent.onSubmit = () => {
      if (modalComponent.categoryForm.valid && !modalComponent.isSubmitting) {
        modalComponent.isSubmitting = true;
        const formData = modalComponent.categoryForm.value;
        this.onUpdate(row.id, formData, modalComponent);
      }
    };
  }

  ngOnDestroy() {
    if (this.newSubscription) {
      this.newSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onSubmit(formData: any, modalComponent?: any) {
    this.isLoading = true;
    const data = new FormData();
    data.append('name', formData.name);
    data.append('nameAr', formData.nameAr);

    this.apiService.postData('categories', data).subscribe({
      next: (response) => {
        console.log('Catégorie créée :', response);
        this.isLoading = false;
        this.notificationService.showSuccess(this.translateService.instant('categories.category-create.successMessage'));
        this.getCategories();
        // Fermer le modal uniquement en cas de succès
        if (this.currentModalRef) {
          this.currentModalRef.close();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création de la catégorie :', error);
        this.isLoading = false;
        // Réactiver le formulaire dans le modal
        if (modalComponent) {
          modalComponent.isSubmitting = false;
        }
        if (error.error && error.error?.message?.includes('ExceptionNameExists')) {
          this.notificationService.showError(this.translateService.instant('categories.category-create.duplicateErrorMessage'));
          return;
        }
        this.notificationService.showError(this.translateService.instant('categories.category-create.errorMessage'));
      }
    });
  }

  onUpdate(categoryId: string, formData: any, modalComponent?: any) {
    this.isLoading = true;
    const data = new FormData();
    data.append('name', formData.name);
    data.append('nameAr', formData.nameAr);

    this.apiService.postData(`categories/update/${categoryId}`, data).subscribe({
      next: (response) => {
        console.log('Catégorie modifiée :', response);
        this.isLoading = false;
        this.notificationService.showSuccess('Catégorie modifiée avec succès!');
        this.getCategories();
        // Fermer le modal uniquement en cas de succès
        if (this.currentModalRef) {
          this.currentModalRef.close();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la modification de la catégorie :', error);
        this.isLoading = false;
        // Réactiver le formulaire dans le modal
        if (modalComponent) {
          modalComponent.isSubmitting = false;
        }
        if (error.error && error.error?.message?.includes('ExceptionNameExists')) {
          this.notificationService.showError(this.translateService.instant('categories.category-update.duplicateErrorMessage'));
          return;
        }
        this.notificationService.showError(this.translateService.instant('categories.category-update.errorMessage'));
      }
    });
  }
}
