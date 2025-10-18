import { Component } from '@angular/core';
import {SharedModule} from "../../theme/shared/shared.module";

@Component({
  selector: 'app-commandes',
  imports: [SharedModule],
  templateUrl: './commandes.component.html',
  standalone: true,
  styleUrl: './commandes.component.scss'
})
export class CommandesComponent {
  columns = [
    { header: 'Id', field: 'id' },
    { header: 'Last Name', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'CreatedAt', field: 'createdAt' },
    { header: 'UpdatedAt', field: 'updatedAt' },
    { header: 'UpdatedAt', field: 'updatedAt' },
    { header: 'Role', field: 'roles' }
  ];

  onSelectionChange($event: any[]) {
    
  }

  editCommand($event: any) {
    
  }

  deleteCommand($event: any) {
    
  }
}
