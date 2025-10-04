import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() page = 1; // 1-based
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();

  pages = computed(() => {
    const count = Math.max(1, Math.ceil(this.total / this.pageSize));
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  get canPrev() { return this.page > 1; }
  get canNext() { return this.page < this.pages().length; }

  goTo(p: number) {
    if (p === this.page) return;
    if (p < 1 || p > this.pages().length) return;
    this.pageChange.emit(p);
  }

  prev() { if (this.canPrev) this.goTo(this.page - 1); }
  next() { if (this.canNext) this.goTo(this.page + 1); }
}
