import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-low-stock-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './low-stock-modal.component.html',
  styleUrls: ['./low-stock-modal.component.scss']
})
export class LowStockModalComponent {
  @Input() lowStockArticles: any[] = [];
  activeModal = inject(NgbActiveModal);

  close() {
    this.activeModal.close();
  }
}
