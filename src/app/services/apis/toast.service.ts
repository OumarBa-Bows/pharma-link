import { Injectable, signal, TemplateRef } from '@angular/core';

export interface Toast {
  text?: string;                     // ✅ nouveau champ pour du texte simple
  template?: TemplateRef<any>;       // optionnel
  classname?: string;
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Toast) {
    this._toasts.update((toasts) => [...toasts, toast]);
  }

  showText(message: string, classname = '', delay = 5000) {
    this.show({ text: message, classname, delay });
  }


  remove(toast: Toast) {
    this._toasts.update((toasts) => toasts.filter((t) => t !== toast));
  }

  clear() {
    this._toasts.set([]);
  }
}
