import { Component, inject, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listing-items-modal',
  imports: [SharedModule, TranslatePipe, CommonModule],
  templateUrl: './listing-items-modal.component.html',
  standalone: true,
  styleUrl: './listing-items-modal.component.scss'
})
export class ListingItemsModalComponent {
  @Input() items: any[] = [];
  @Input() title = 'Liste des articles';

  private modal = inject(NgbActiveModal);

  closeModal() {
    this.modal.close();
  }
}
