import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { SharedModule } from '../../shared.module';
import { TranslatePipe } from '@ngx-translate/core';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-table',
  imports: [CardComponent, TranslatePipe, DatePipe],
  templateUrl: './table.component.html',
  standalone: true,
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnChanges {
  @Input() title = '';
  @Input() columns: { header: string; field: string; img: boolean; type?: any; format?: string }[] = [];
  @Input() data: any[] = [];

  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() showImport = false;
  @Input() showSelected = false;
  @Input() showStatus = false;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() showDetatail = new EventEmitter<any>();


  @Input() page = 1;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();

  @Output() addNew = new EventEmitter<any>();
  @Output() import = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Input() total = 0;
  @Input() searchPlaceholder = 'Search...';

  currentPage = 1;
  pagesToShow = 5;
  selectedRows = new Set<number>();
  @Input()
  showAddButton = true;
  @Input()
  showDetails=  true;

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get pagedData() {
    // If data is paginated on the server, just return the data as is
    if (this.total > this.data.length) {
      return this.data;
    }
    // If paginating on the client side
    const start = (this.currentPage - 1) * this.pageSize;
    return this.data?.slice(start, start + this.pageSize);
  }

  get offset() {
    return (this.currentPage - 1) * this.pageSize;
  }

  toggleRow(globalIndex: number) {
    if (this.selectedRows.has(globalIndex)) {
      this.selectedRows.delete(globalIndex);
    } else {
      this.selectedRows.add(globalIndex);
    }
    this.emitSelection();
  }

  get allSelected() {
    return this.data.length > 0 && this.selectedRows.size === this.data.length;
  }

  toggleAll(event: any) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedRows.clear();
    if (checked) {
      this.data.forEach((_, i) => this.selectedRows.add(i));
    }
    this.emitSelection();
  }

  ngOnInit(): void {
    console.warn('list cols: ', this.columns);
    console.warn('list rows: ', this.data);
    this.currentPage = this.page;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page']) {
      this.currentPage = this.page;
    }
  }

  private emitSelection() {
    const rows = Array.from(this.selectedRows)
      .filter((i) => i >= 0 && i < this.data.length)
      .map((i) => this.data[i]);
    this.selectionChange.emit(rows);
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  onShowDetails(row: any) {
    this.showDetatail.emit(row)
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.pagesToShow;

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(max / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = max;
    }

    if (end > total) {
      end = total;
      start = total - max + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(p: number) {
  if (p < 1 || p > this.totalPages) return;
  this.currentPage = p;
  this.pageChange.emit(p);
}


}
