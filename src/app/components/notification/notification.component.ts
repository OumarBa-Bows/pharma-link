import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from 'src/app/services/notifications/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
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
