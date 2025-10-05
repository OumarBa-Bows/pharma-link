import { Component } from '@angular/core';
import {NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {NgTemplateOutlet} from "@angular/common";
import {ToastService} from "../../../../services/apis/toast.service";

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [
    NgbToast,
    NgTemplateOutlet
  ],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1200">
      <ngb-toast
        *ngFor="let toast of toastService.toasts()"
        [class]="toast.classname"
        [autohide]="true"
        [delay]="toast.delay || 5000"
        (hidden)="toastService.remove(toast)"
      >
        <ng-container *ngIf="toast.text; else template">
          {{ toast.text }}
        </ng-container>
        <ng-template #template>
          <ng-template [ngTemplateOutlet]="toast.template"></ng-template>
        </ng-template>
      </ngb-toast>
    </div>
  `
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
