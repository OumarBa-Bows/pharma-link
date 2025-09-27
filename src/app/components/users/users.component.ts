import { Component } from '@angular/core';
import {SharedModule} from "../../theme/shared/shared.module";

@Component({
  selector: 'app-users',
  imports: [SharedModule],
  templateUrl: './users.component.html',
  standalone: true,
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  columns = [
    {header: 'First Name', field: 'firstName'},
    {header: 'Last Name', field: 'lastName'},
    {header: 'Username', field: 'username'}
  ];

  data = [
    {firstName: 'Mark', lastName: 'Otto', username: '@mdo'},
    {firstName: 'Jacob', lastName: 'Thornton', username: '@fat'},
    {firstName: 'maex', lastName: 'Thornton', username: '@fat'},
    {firstName: 'test', lastName: 'Thornton', username: '@fat'},
    {firstName: 'ops', lastName: 'Thornton', username: '@fat'},
    {firstName: 'ras', lastName: 'Thornton', username: '@fat'},

  ];

  getAllUsers(){

  }

  addUser() {

  }

  editUser() {
  }

  deleteUser() {}

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

}
