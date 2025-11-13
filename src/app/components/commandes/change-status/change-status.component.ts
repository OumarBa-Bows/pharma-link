import {Component, EventEmitter, Input, Output} from '@angular/core';
import {COMMAND_STATUS} from "../../../models/enum";
import {SharedModule} from "../../../theme/shared/shared.module";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-change-status',
  imports: [SharedModule],
  templateUrl: './change-status.component.html',
  standalone: true,
  styleUrl: './change-status.component.scss'
})
export class ChangeStatusComponent {
  @Input() currentStatus!: COMMAND_STATUS;

  statuses = Object.values(COMMAND_STATUS);
  selectedStatus!: COMMAND_STATUS;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.selectedStatus = this.currentStatus;
  }

  confirmChange() {
    this.activeModal.close(this.selectedStatus);
  }

  cancel() {
    this.activeModal.dismiss('cancel');
  }
}
