import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { UserService } from '../../services/apis/user-service';
import { User } from '../../model/user';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateUserComponent } from './create-user/create-user.component';
import { ToastService } from '../../services/apis/toast.service';
import { ConfirmationModalComponent } from '../../theme/shared/components/confirmation-modal/confirmation-modal.component';


import { NotificationService } from 'src/app/services/notifications/notification.service';
import { TranslateService } from '@ngx-translate/core';

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
  notify = inject(NotificationService);
  private modalService = inject(NgbModal);
  private userdata: User[];
  private notificationService = inject(NotificationService);


  constructor(private translateService: TranslateService ) {}

  columns = [
    { header: this.translateService.instant('users.columns.id'), field: 'id' },
    { header: this.translateService.instant('users.columns.name'), field: 'name' },
    { header: this.translateService.instant('users.columns.email'), field: 'email' },
    { header: this.translateService.instant('users.columns.createdAt'), field: 'createdAt' },
    { header: this.translateService.instant('users.columns.updatedAt'), field: 'updatedAt' },
    { header: this.translateService.instant('users.columns.role'), field: 'roles' }
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
    const toastSuccess = user ? 'Utilisateur mis à jour avec succès ✅' : 'Utilisateur créé avec succès ✅';
    const toastError = user ? 'Erreur lors de la mise à jour ❌' : 'Erreur lors de la création ❌';
    modalRef.closed.subscribe((res) => {
      if(res){
        this.notificationService.showSuccess(toastSuccess);
        this.getAllUsers();
      }else {
        this.notificationService.showError(toastError);
      }
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

    this.userService.delete(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Utilisateur supprimé avec succès ✅');
        this.getAllUsers();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.showError('Erreur lors de la suppression ❌');
      },
    });
  }
}
