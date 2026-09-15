import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { CommandService } from '../../services/apis/CommandService';
import { Router } from '@angular/router';
import { Command } from '../../model/command';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCommand } from './create-command/create-command';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-commandes',
  imports: [SharedModule, SpinnerComponent],
  templateUrl: './commandes.component.html',
  standalone: true,
  providers: [CommandService],
  styleUrl: './commandes.component.scss'
})
export class CommandesComponent implements OnInit {
  private commandService = inject(CommandService);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private translateService = inject(TranslateService);

  search = '';
  currentPage = 1;
  pageSize = 20;
  pagesToShow = 5;
  selectedStatus: string = 'ALL';
  commands: any[] = []; // Page courante renvoyée par le serveur
  totalItems = 0;
  totalPages = 0;
  statusCounts: Record<string, number> = {};
  private searchSubject = new Subject<string>();
  private commandsSubscription: Subscription;
  private searchSubscription: Subscription;

  get pages(): number[] {
    const half = Math.floor(this.pagesToShow / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.pagesToShow - 1);

    if (end - start < this.pagesToShow - 1) {
      start = Math.max(1, end - this.pagesToShow + 1);
    }

    const pagesArray = [];
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getCommands();
    }
  }

  columns = [
    { header: this.translateService.instant('commands.columns.date'), field: 'date', type: 'date', format: 'dd/MM/yyyy HH:mm' },
    { header: this.translateService.instant('commands.columns.code'), field: 'code' },
    {
      header: this.translateService.instant('commands.columns.status'),
      field: 'status',
      type: 'enum',
      enumMap: {
        PENDING: this.translateService.instant('commands.status.pending'),
        VALIDATED: this.translateService.instant('commands.status.validated'),
        CANCELLED: this.translateService.instant('commands.status.cancelled'),
        SHIPPED: this.translateService.instant('commands.status.shipped'),
        DELIVERED: this.translateService.instant('commands.status.delivered')
      }
    },
    // { header: this.translateService.instant('commands.columns.commandReference'), field: 'commandreference' },
    // { header: this.translateService.instant('commands.columns.invoiceReference'), field: 'invoicereference' },
    { header: this.translateService.instant('commands.columns.totalPrice'), field: 'totalprice' },
    { header: this.translateService.instant('pharmacies.code'), field: 'pharmacyCode' },
    { header: this.translateService.instant('commands.columns.pharmacy'), field: 'pharmacy' }
  ];
  isLoading: boolean;
  langSubscription: Subscription;

  onSelectionChange($event: any[]) {}

  onSearch(searchTerm: any) {
    this.searchSubject.next((searchTerm || '').trim());
  }

  filterByStatus(status: string) {
    if (status === this.selectedStatus) return;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.getCommands();
  }

  getStatusCount(status: string): number {
    return this.statusCounts[status] ?? 0;
  }

  editCommand(command: Command) {
    this.openCreateCommandModal(command);
  }

  openCreateCommandModal(command?: Command) {
    const modalRef = this.modalService.open(CreateCommand, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'createDeclaration-popup'
    });
  }
  deleteCommand($event: any) {}

  getCommands() {
    this.isLoading = true;
    // Annuler la requête précédente pour ne pas afficher une réponse obsolète
    this.commandsSubscription?.unsubscribe();

    const params: any = { page: this.currentPage, limit: this.pageSize };
    if (this.search) params.search = this.search;
    if (this.selectedStatus !== 'ALL') params.status = this.selectedStatus;

    this.commandsSubscription = this.commandService.getPaginated(params).subscribe({
      next: (response) => {
        const { commandes, total, totalPages, statusCounts } = response.data;
        this.commands = commandes;
        this.totalItems = total;
        this.totalPages = totalPages;
        this.statusCounts = statusCounts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching commands:', error);
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.getCommands();
    this.updateColumns();

    // Recherche côté serveur, déclenchée après 300ms sans frappe
    this.searchSubscription = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.search = term;
      this.currentPage = 1;
      this.getCommands();
    });
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      { header: this.translateService.instant('commands.columns.date'), field: 'date', type: 'date', format: 'dd/MM/yyyy HH:mm' },
      { header: this.translateService.instant('commands.columns.code'), field: 'code' },
      {
        header: this.translateService.instant('commands.columns.status'),
        field: 'status',
        type: 'enum',
        enumMap: {
          PENDING: this.translateService.instant('commands.status.pending'),
          VALIDATED: this.translateService.instant('commands.status.validated'),
          CANCELLED: this.translateService.instant('commands.status.cancelled'),
          SHIPPED: this.translateService.instant('commands.status.shipped'),
          DELIVERED: this.translateService.instant('commands.status.delivered')
        }
      },
      // { header: this.translateService.instant('commands.columns.commandReference'), field: 'commandreference' },
      // { header: this.translateService.instant('commands.columns.invoiceReference'), field: 'invoicereference' },
      { header: this.translateService.instant('commands.columns.totalPrice'), field: 'totalprice' },
      { header: this.translateService.instant('pharmacies.code'), field: 'pharmacyCode' },
      { header: this.translateService.instant('commands.columns.pharmacy'), field: 'pharmacy' }
    ];
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.commandsSubscription?.unsubscribe();
  }

  showDetails(command: any) {
    this.router.navigate(['/commands/details', command.id], { state: { data: command } });
  }
}
