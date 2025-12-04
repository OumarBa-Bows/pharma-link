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
import { Subscription } from 'rxjs';

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

  constructor(private translateService: TranslateService) {}

  columns = [
    { header: this.translateService.instant('users.columns.createdAt'), field: 'createdAt', type: 'date', format: 'dd/MM/yyyy HH:mm' },
    //{ header: this.translateService.instant('users.columns.id'), field: 'id' },
    { header: this.translateService.instant('users.columns.name'), field: 'name' },
    { header: this.translateService.instant('users.columns.email'), field: 'email' }
    //{ header: this.translateService.instant('users.columns.updatedAt'), field: 'updatedAt', type: 'date', format: 'dd/MM/yyyy HH:mm' },
    //{ header: this.translateService.instant('users.columns.role'), field: 'roles' }
  ];

  public users: User[];
  langSubscription: Subscription;

  editUser(user: User) {
    // Trouver l'utilisateur original avec les rôles non transformés
    const originalUser = this.userdata.find((u) => u.id === user.id);
    this.openCreationModal(originalUser || user, 'users.user-update.title');
  }

  private openCreationModal(user?: User, title?: string) {
    const modalRef = this.modalService.open(CreateUserComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'createDeclaration-popup'
    });

    if (user) modalRef.componentInstance.user = user;
    if (title) modalRef.componentInstance.title = title;
    const toastSuccess = user
      ? this.translateService.instant('users.toasts.userUpdated')
      : this.translateService.instant('users.toasts.userCreated');

    modalRef.closed.subscribe((res) => {
      if (res) {
        this.notificationService.showSuccess(toastSuccess);
        this.getAllUsers();
      }
    });
  }

  deleteUser(row: any) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.msg = this.translateService.instant('users.toasts.confirmDelete');
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
      // Garder les données originales
      this.userdata = result.data.users;
      // Créer une copie pour l'affichage avec les rôles transformés et traduits
      this.users = result.data.users.map((user) => ({
        ...user,
        roles: user.roles.map((r) => this.translateService.instant(`users.roles.${r.name}`)).join(', ')
      }));
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.updateColumns();
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateColumns();
    });
  }

  updateColumns() {
    this.columns = [
      { header: this.translateService.instant('users.columns.createdAt'), field: 'createdAt', type: 'date', format: 'dd/MM/yyyy HH:mm' },
      { header: this.translateService.instant('users.columns.name'), field: 'name' },
      { header: this.translateService.instant('users.columns.email'), field: 'email' }
      //{ header: this.translateService.instant('users.columns.role'), field: 'roles' }
    ];

    // Mettre à jour les rôles traduits pour tous les utilisateurs
    if (this.userdata) {
      this.users = this.userdata.map((user) => ({
        ...user,
        roles: user.roles.map((r) => this.translateService.instant(`users.roles.${r.name}`)).join(', ')
      }));
    }
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  addUser() {
    this.openCreationModal();
  }

  delete(id: number) {
    this.userService.delete(id).subscribe({
      next: () => {
        this.notificationService.showSuccess(this.translateService.instant('users.toasts.deleteSuccess'));
        this.getAllUsers();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.showError(this.translateService.instant('users.toasts.deleteError'));
      }
    });
  }
}
