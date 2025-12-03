import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { CommandService } from '../../services/apis/CommandService';
import { Router } from '@angular/router';
import { Command } from '../../model/command';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCommand } from './create-command/create-command';
import { TranslateService } from '@ngx-translate/core';

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

  columns = [
    { header: this.translateService.instant('commands.columns.date'), field: 'date', type: 'date', format: 'dd/MM/yyyy HH:mm' },
    { header: this.translateService.instant('commands.columns.code'), field: 'code' },
    {
      header: this.translateService.instant('commands.columns.status'),
      field: 'status',
      type: 'enum',
      enumMap: { PENDING: 'En attente', VALIDATED: 'Validé', CANCELLED: 'Annulé', SHIPPED: 'Livré', DELIVERED: 'Livré' }
    },
    { header: this.translateService.instant('commands.columns.commandReference'), field: 'commandreference' },
    { header: this.translateService.instant('commands.columns.invoiceReference'), field: 'invoicereference' },
    { header: this.translateService.instant('commands.columns.totalPrice'), field: 'totalprice' },
    { header: this.translateService.instant('commands.columns.pharmacy'), field: 'pharmacy' }
  ];
  commandData: Command[] = [];
  isLoading: boolean;

  onSelectionChange($event: any[]) {}

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
      this.commandData = value.data.commandes;
      console.log('commandData');
      console.log(this.commandData);
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.getCommandByDistributor(1);
  }

  showDetail(command: any) {
    this.router.navigate(['/commands/details', command.id], { state: { data: command } });
  }
}
