import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { SharedModule } from '../../shared.module';
import { TranslatePipe } from '@ngx-translate/core';
import { start } from '@popperjs/core';
import { p } from '@angular/cdk/overlay-module.d-C2CxnwqT';
import { Event } from '@angular/router';

@Component({
  selector: 'app-table',
  imports: [CardComponent, TranslatePipe],
  templateUrl: './table.component.html',
  standalone: true,
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  @Input() title = '';
  @Input() columns: { header: string; field: string }[] = [];
  @Input() data: any[] = [];

  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() showSelected = false;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  @Output() selectionChange = new EventEmitter<any[]>();

  pageSize = 10;
  currentPage = 1;

  selectedRows = new Set<number>();

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  get pagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.data?.slice(start, start + this.pageSize);
  }

  get offset() {
    return (this.currentPage - 1) * this.pageSize;
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
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

  ngOnInit(): void {}

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
}
