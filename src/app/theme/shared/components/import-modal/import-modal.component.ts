import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss']
})
export class ImportModalComponent {
  @Input() title = 'common.importFile';
  @Input() description = '';
  @Input() accept = '*/*';
  @Input() confirmLabel = 'common.import';
  @Input() cancelLabel = 'common.cancel';

  file: File | null = null;

  constructor(public activeModal: NgbActiveModal) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const f = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!f) {
      this.file = null;
      return;
    }
    // Basic check using accept list (extensions)
    if (this.accept && this.accept !== '*/*') {
      const parts = this.accept.split(',').map((s) => s.trim().toLowerCase());
      const name = f.name.toLowerCase();
      const type = f.type.toLowerCase();
      const ok = parts.some((p) => {
        if (p.startsWith('.')) return name.endsWith(p);
        return type === p;
      });
      if (!ok) {
        this.file = null;
        return;
      }
    }
    this.file = f;
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
