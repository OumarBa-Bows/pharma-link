import { Component, inject, Input } from '@angular/core';
import { CardComponent } from '../../../theme/shared/components/card/card.component';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../theme/shared/shared.module';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../services/apis/user-service';
import { User } from '../../../model/user';
import { Role } from '../../../model/role';

@Component({
  selector: 'app-create-user',
  imports: [CardComponent, FormsModule, SharedModule],
  templateUrl: './create-user.component.html',
  standalone: true,
  styleUrl: './create-user.component.scss',
  providers: [UserService]
})
export class CreateUserComponent {
  userForm!: FormGroup;

  userService = inject(UserService);

  @Input() user?: User;
  public roles: Role[];
  public isSubmitting = false;

  @Input() title: string = 'users.user-create.title';

  constructor(
    private fb: FormBuilder,
    private modal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    // Extraire les noms des rôles si l'utilisateur a des rôles sous forme d'objets
    const userRoles = this.user?.roles
      ? Array.isArray(this.user.roles)
        ? this.user.roles.map((r: any) => (typeof r === 'string' ? r : r.name))
        : []
      : [];

    this.userForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      password: ['', this.user ? [] : [Validators.required, Validators.minLength(6)]],
      roles: [userRoles]
    });

    this.userService.getAllRoles().subscribe((roles) => {
      this.roles = roles.data;
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      const userData = { ...this.userForm.value };

      // En cas d'update, ne pas envoyer le password
      if (this.user) {
        delete userData.password;
        this.userService.update(this.user.id, userData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.modal.close(true);
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Erreur update', err);
          }
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.modal.close(true);
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Erreur create', err);
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  isRoleSelected(roleName: string): boolean {
    const selectedRoles = this.userForm.get('roles')?.value || [];
    return selectedRoles.includes(roleName);
  }

  onRoleChange(roleName: string, event: any): void {
    const selectedRoles = this.userForm.get('roles')?.value || [];
    if (event.target.checked) {
      if (!selectedRoles.includes(roleName)) {
        this.userForm.patchValue({ roles: [...selectedRoles, roleName] });
      }
    } else {
      this.userForm.patchValue({
        roles: selectedRoles.filter((r: string) => r !== roleName)
      });
    }
  }

  closeModal() {
    this.modal.close();
  }
}
