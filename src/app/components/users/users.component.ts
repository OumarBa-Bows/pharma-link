import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import {UserService} from "../../services/apis/user-service";
import {User} from "../../model/user";
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CreateUserComponent} from "./create-user/create-user.component";
import {ToastService} from "../../services/apis/toast.service";


@Component({
  selector: 'app-users',
  imports: [SharedModule, NgbModule],
  templateUrl: './users.component.html',
  standalone: true,
  styleUrl: './users.component.scss',
  providers: [UserService]
})
export class UsersComponent implements OnInit{

  userService = inject(UserService);
  private modalService =  inject(NgbModal)

  constructor(private toastService: ToastService) {}

  columns = [
    { header: 'Id', field: 'id' },
    { header: 'Last Name', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'CreatedAt', field: 'createdAt' },
    { header: 'UpdatedAt', field: 'updatedAt' }
  ];


  data = [
    { firstName: 'Mark', lastName: 'Otto', username: '@mdo' },
    { firstName: 'Jacob', lastName: 'Thornton', username: '@fat' },
    { firstName: 'maex', lastName: 'Thornton', username: '@fat' },
    { firstName: 'test', lastName: 'Thornton', username: '@fat' },
    { firstName: 'ops', lastName: 'Thornton', username: '@fat' },
    { firstName: 'ras', lastName: 'Thornton', username: '@fat' }
  ];

  public users: User;


  editUser(row: any) {
    // Logique de modification de l'utilisateur
    console.log('Modifier utilisateur :', row);
  }

  deleteUser(row: any) {
    // Logique de suppression de l'utilisateur
    console.log('Supprimer utilisateur :', row);
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getAllUsers(){
    this.userService.getAll().subscribe(result =>{
      this.users = result.data.users;
    })
  }

  ngOnInit(): void {
    this.getAllUsers();
  }


  addUser(){
    const modalRef = this.modalService.open(CreateUserComponent, {
      size: 'xl',
      centered: true,
      backdrop: true,
      windowClass: 'createDeclaration-popup'
    })
    modalRef.result.then(res =>{
      if(res){
        this.getAllUsers();
      }
    })
  }
}
