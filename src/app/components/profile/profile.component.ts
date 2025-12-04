import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { map, Observable } from 'rxjs';
import { User } from '../../model/user';
import { UserService } from '../../services/apis/user-service';
import { CreateUserComponent } from '../users/create-user/create-user.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../services/notifications/notification.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [SharedModule, TranslatePipe],
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrl: './profile.component.scss',
  providers: [UserService]
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private modalService = inject(NgbModal);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);

  user: User;

  getConnectedUser() {
    return this.userService
      .getConnectedUser()
      .pipe(map((res) => res.data.user as User))
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnInit(): void {
    this.getConnectedUser();
  }

  getRoleTranslation(roleName: string): string {
    return this.translateService.instant(`users.roles.${roleName}`);
  }

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordChanged = false;

  changePassword() {
    if (!this.newPassword || !this.confirmPassword || !this.currentPassword) {
      alert(this.translateService.instant('profile.allFieldsRequired'));
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert(this.translateService.instant('profile.passwordMismatch'));
      return;
    }

    this.userService.changePassword(this.newPassword, this.currentPassword, this.confirmPassword).subscribe((res) => {
      if (res) {
        this.passwordChanged = true;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      }
    });
  }

  public openCreationModal(user?: User) {
    const modalRef = this.modalService.open(CreateUserComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'createDeclaration-popup'
    });

    if (this.user) modalRef.componentInstance.user = this.user;
    modalRef.componentInstance.title = this.translateService.instant('profile.updateProfile');
    const toastSuccess = this.translateService.instant('profile.updateSuccess');
    const toastError = this.translateService.instant('profile.updateError');
    modalRef.closed.subscribe((res) => {
      if (res) {
        this.notificationService.showSuccess(toastSuccess);
      }
    });
  }
}
