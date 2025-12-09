import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-quantity-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './edit-quantity-modal.component.html',
  styleUrl: './edit-quantity-modal.component.scss'
})
export class EditQuantityModalComponent {
  @Input() articleName: string = '';
  @Input() currentQuantity: number = 0;
  @Input() availableQuantity: number = 0;

  newQuantity: number = 0;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.newQuantity = this.currentQuantity;
  }

  confirm() {
    if (this.newQuantity && this.newQuantity > 0) {
      this.activeModal.close(this.newQuantity);
    }
  }

  cancel() {
    this.activeModal.dismiss();
  }
}
