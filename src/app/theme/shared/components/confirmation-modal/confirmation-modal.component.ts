import {Component, inject, Input} from '@angular/core';
import {SharedModule} from "../../shared.module";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-confirmation-modal',
  imports: [SharedModule],
  templateUrl: './confirmation-modal.component.html',
  standalone: true,
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {

  @Input() msg: string;

  closeModal(){
    this.modal.close()
  }


  confirm(){
    this.modal.close(true)
  }

  private modal= inject(NgbActiveModal)

}
