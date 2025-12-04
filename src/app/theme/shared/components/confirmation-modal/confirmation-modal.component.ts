import { Component, inject, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [SharedModule, TranslatePipe],
  templateUrl: './confirmation-modal.component.html',
  standalone: true,
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() title = 'common.confirmation';
  @Input() msg: string;
  @Input() confirmLabel = 'common.confirm';
  @Input() cancelLabel = 'common.cancel';

  closeModal() {
    this.modal.close();
  }

  confirm() {
    this.modal.close(true);
  }

  private modal = inject(NgbActiveModal);
}
