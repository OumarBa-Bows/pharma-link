import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
  confirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  resolve?: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<Notification>();

  notifications$: Observable<Notification> = this.notificationSubject.asObservable();

  showSuccess(message: string) {
    console.log('[NotificationService] showSuccess:', message);
    this.notificationSubject.next({ type: 'success', message });
  }

  showError(message: string) {
    this.notificationSubject.next({ type: 'error', message });
  }

  showWarning(message: string) {
    this.notificationSubject.next({ type: 'warning', message });
  }

  showInfo(message: string) {
    this.notificationSubject.next({ type: 'info', message });
  }

  confirm(message: string, confirmText = 'Confirmer', cancelText = 'Annuler'): Promise<boolean> {
    return new Promise((resolve) => {
      this.notificationSubject.next({
        type: 'info',
        message,
        confirm: true,
        confirmText,
        cancelText,
        resolve
      });
    });
  }
}
