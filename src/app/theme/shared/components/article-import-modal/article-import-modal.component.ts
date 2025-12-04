import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-article-import-modal',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './article-import-modal.component.html',
  styleUrls: ['./article-import-modal.component.scss']
})
export class ArticleImportModalComponent {
  file: File | null = null;

  constructor(public activeModal: NgbActiveModal) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const f = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!f) {
      this.file = null;
      return;
    }
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const allowedExt = ['.xls', '.xlsx'];
    const nameOk = allowedExt.some((ext) => f.name.toLowerCase().endsWith(ext));
    const typeOk = allowedTypes.includes(f.type);
    if (nameOk || typeOk) {
      this.file = f;
    } else {
      this.file = null;
    }
  }

  onCancel() {
    this.activeModal.dismiss();
  }

  onImport() {
    if (this.file) {
      this.activeModal.close(this.file);
    }
  }
}
