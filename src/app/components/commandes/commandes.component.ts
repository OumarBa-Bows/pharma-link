import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { CommandService } from '../../services/apis/CommandService';
import { Router } from '@angular/router';
import { Command } from '../../model/command';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCommand } from './create-command/create-command';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
  allCommands: any[] = []; // Liste complète des commandes
  filteredCommands: any[] = []; // Liste filtrée pour l'affichage

  get displayedCommands() {
    return this.filteredCommands.length > 0 || this.search ? this.filteredCommands : this.allCommands;
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
  commandData: Command[] = [];
  isLoading: boolean;
  langSubscription: Subscription;

  onSelectionChange($event: any[]) {}

  onSearch(searchTerm: any) {
    // Si la recherche est vide, afficher toutes les commandes
    if (!searchTerm || searchTerm.length === 0) {
      this.search = '';
      this.filteredCommands = [...this.allCommands];
      return;
    }

    this.search = searchTerm.toLowerCase();

    // Filtrer les commandes par code, status, prix total, pharmacie, et date
    this.filteredCommands = this.allCommands.filter((command) => {
      const code = command.code?.toLowerCase() || '';
      const status = command.status?.toLowerCase() || '';
      const totalPrice = command.totalprice?.toString() || '';
      const pharmacy = command.pharmacy?.toLowerCase() || '';
      const date = command.date?.toString() || '';

      return (
        code.includes(this.search) ||
        status.includes(this.search) ||
        totalPrice.includes(this.search) ||
        pharmacy.includes(this.search) ||
        date.includes(this.search)
      );
    });

    console.log(`[onSearch] Recherche: "${searchTerm}", Résultats: ${this.filteredCommands.length}/${this.allCommands.length}`);
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

  getCommandByDistributor(distributorId: number) {
    this.isLoading = true;
    this.commandService.getCommandByDistributor(distributorId).subscribe((value) => {
      this.allCommands = value.data.commandes;
      this.filteredCommands = [...this.allCommands];
      this.commandData = this.displayedCommands; // Pour le template
      console.log('commandData');
      console.log(this.commandData);
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.getCommandByDistributor(1);
    this.updateColumns();
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
  }

  showDetails(command: any) {
    this.router.navigate(['/commands/details', command.id], { state: { data: command } });
  }
}
