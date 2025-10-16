import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { UserService } from '../../services/apis/user-service';
import { User } from '../../model/user';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateUserComponent } from './create-user/create-user.component';
import { ToastService } from '../../services/apis/toast.service';
import { ConfirmationModalComponent } from '../../theme/shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-users',
  imports: [SharedModule, NgbModule],
  templateUrl: './users.component.html',
  standalone: true,
  styleUrl: './users.component.scss',
  providers: [UserService]
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  private modalService = inject(NgbModal);
  private userdata: User[];

  constructor(private toastService: ToastService) {}

  columns = [
    { header: 'Id', field: 'id' },
    { header: 'Last Name', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'CreatedAt', field: 'createdAt' },
    { header: 'UpdatedAt', field: 'updatedAt' },
    { header: 'UpdatedAt', field: 'updatedAt' },
    { header: 'Role', field: 'roles' }
  ];

  public users: User[];

  editUser(user: User) {
    this.openCreationModal(user);
  }

  private openCreationModal(user?: User) {
    const modalRef = this.modalService.open(CreateUserComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'createDeclaration-popup'
    });

    if (user) modalRef.componentInstance.user = user;
    modalRef.closed.subscribe((res) => {
      this.getAllUsers();
    });
  }

  deleteUser(row: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.msg = 'Are you sure you want to delete this user ?';
    modalRef.result.then((result) => {
      if (result) {
        this.delete(row.id);
      }
    });
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getAllUsers() {
    this.userService.getAll().subscribe((result) => {
      this.users = result.data.users;
      this.users.forEach((user) => {
        user.roles = user.roles.map((r) => r.name).join(',');
      });
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  addUser() {
    this.openCreationModal();
  }

  delete(id: number) {
    this.userService.delete(id).subscribe((res) => {
      this.getAllUsers();
    });
  }
}
