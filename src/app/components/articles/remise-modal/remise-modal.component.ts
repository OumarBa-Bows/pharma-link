import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

interface Remise {
  id?: string;
  min: number;
  max: number;
  percent: number;
}

@Component({
  selector: 'app-remise-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './remise-modal.component.html',
  styleUrl: './remise-modal.component.scss'
})
export class RemiseModalComponent implements OnInit {
  @Input() remise: Remise | null = null;
  @Input() articleId: string | null = null;
  @Input() onSave: ((data: Remise) => Promise<void>) | null = null;

  remiseForm: FormGroup;
  isLoading = false;
  isEditMode = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.remiseForm = this.fb.group(
      {
        min: [0, [Validators.required, Validators.min(0)]],
        max: [0, [Validators.required, Validators.min(0)]],
        percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
      },
      { validators: this.maxGreaterThanMinValidator }
    );
  }

  ngOnInit(): void {
    if (this.remise) {
      this.isEditMode = true;
      this.remiseForm.patchValue({
        min: this.remise.min,
        max: this.remise.max,
        percent: this.remise.percent
      });
    }
  }

  maxGreaterThanMinValidator(form: FormGroup) {
    const min = form.get('min')?.value;
    const max = form.get('max')?.value;

    if (min !== null && max !== null && max <= min) {
      return { maxLessThanMin: true };
    }
    return null;
  }

  close() {
    this.activeModal.dismiss();
  }

  async save() {
    if (this.remiseForm.invalid) {
      Object.keys(this.remiseForm.controls).forEach((key) => {
        this.remiseForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData: Remise = {
      ...this.remiseForm.value
    };

    if (this.isEditMode && this.remise?.id) {
      formData.id = this.remise.id;
    }

    if (this.onSave) {
      this.isLoading = true;
      try {
        await this.onSave(formData);
        this.activeModal.close(true);
      } catch (error) {
        this.isLoading = false;
      }
    } else {
      this.activeModal.close(formData);
    }
  }
}
