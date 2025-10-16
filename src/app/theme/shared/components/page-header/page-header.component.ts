import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ title }}</h2>
      <div class="page-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .page-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
}
