import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from 'src/app/services/notifications/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <div class="notification-container">
      <div *ngFor="let notif of notifications" [ngClass]="'notification ' + notif.type">
        <span>{{ notif.message }}</span>
        <ng-container *ngIf="notif.confirm">
          <button (click)="confirm(notif, true)">{{ notif.confirmText || 'Confirmer' }}</button>
          <button (click)="confirm(notif, false)">{{ notif.cancelText || 'Annuler' }}</button>
        </ng-container>
        <button *ngIf="!notif.confirm" (click)="close(notif)">×</button>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .notification {
        min-width: 250px;
        padding: 16px 24px;
        border-radius: 4px;
        color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        animation: fadeIn 0.3s;
      }
      .notification.success {
        background: #43a047;
      }
      .notification.error {
        background: #e53935;
      }
      .notification.warning {
        background: #fbc02d;
        color: #222;
      }
      .notification.info {
        background: #1e88e5;
      }
      .notification button {
        margin-left: 12px;
        background: transparent;
        border: none;
        color: inherit;
        font-weight: bold;
        cursor: pointer;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private sub!: Subscription;

  constructor(private notificationService: NotificationService) {
    console.log('NotificationComponent initialized');
  }

  ngOnInit() {
    this.sub = this.notificationService.notifications$.subscribe((notif) => {
      console.log('[NotificationComponent] Notification reçue:', notif);
      this.notifications.push(notif);
      if (!notif.confirm) {
        setTimeout(() => this.close(notif), 3000);
      }
    });
  }

  close(notif: Notification) {
    this.notifications = this.notifications.filter((n) => n !== notif);
    if (notif.confirm && notif.resolve) notif.resolve(false);
  }

  confirm(notif: Notification, result: boolean) {
    this.notifications = this.notifications.filter((n) => n !== notif);
    if (notif.resolve) notif.resolve(result);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
