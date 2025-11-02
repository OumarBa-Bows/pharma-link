import {Component, inject, OnInit} from '@angular/core';
import {SharedModule} from "../../theme/shared/shared.module";
import {CommandService} from "../../services/apis/CommandService";
import {Router} from "@angular/router";

@Component({
  selector: 'app-commandes',
  imports: [SharedModule],
  templateUrl: './commandes.component.html',
  standalone: true,
  providers: [CommandService],
  styleUrl: './commandes.component.scss'
})
export class CommandesComponent implements OnInit{

  private commandService = inject(CommandService)
  private router= inject(Router)

  columns = [
    { header: 'Id', field: 'id' },
    { header: 'Code', field: 'code' },
    { header: 'Status', field: 'status' },
    { header: 'Commandreference', field: 'commandreference' },
    { header: 'Invoicereference', field: 'invoicereference' },
    { header: 'Totalprice', field: 'totalprice' },
    { header: 'Pharmacy', field: 'pharmacy' },
    { header: 'Distributor', field: 'distributor' },
    { header: 'MainDistributor', field: 'mainDistributor' },
    { header: 'Date', field: 'date' }

  ];
  protected commandData: any;

  onSelectionChange($event: any[]) {

  }

  editCommand($event: any) {

  }

  deleteCommand($event: any) {

  }

  getCommandByDistributor(distributorId: number) {
    this.commandService.getCommandByDistributor(distributorId).subscribe((value) => {
      this.commandData = value.data.commands;
    })
  }

  ngOnInit(): void {
    this.getCommandByDistributor(1);
  }

  showDetail(command: any) {
    this.router.navigate(['/commands/details', command.id], { state: { data: command } });
  }

}


