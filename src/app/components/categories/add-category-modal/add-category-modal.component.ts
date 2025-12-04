import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-category-modal.component.html',
  styleUrl: './add-category-modal.component.scss'
})
export class AddCategoryModalComponent {
  categoryForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  categoryId: string | null = null;

  activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private translateService = inject(TranslateService);

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      nameAr: ['', Validators.required]
    });
  }

  initEditMode(category: any) {
    this.isEditMode = true;
    this.categoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      nameAr: category.nameAr
    });
  }

  onCancel() {
    this.activeModal.dismiss();
  }

  onSubmit() {
    // Cette méthode sera remplacée par le composant parent
  }
}
