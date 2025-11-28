import {Component, inject, Input} from '@angular/core';
import {CardComponent} from "../../../theme/shared/components/card/card.component";
import {FormBuilder, FormGroup, FormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../../theme/shared/shared.module";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../../../services/apis/user-service";
import {User} from "../../../model/user";
import {Role} from "../../../model/role";

@Component({
  selector: 'app-create-user',
  imports: [
    CardComponent,
    FormsModule,
    SharedModule
  ],
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

  @Input() title: string = 'users.user-create.title';

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      password: ['', this.user ? [] : [Validators.required, Validators.minLength(6)]],
      roles: [this.user?.roles || '']
    });

    this.userService.getAllRoles().subscribe(roles=> {
      this.roles = roles.data
    })
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = { ...this.userForm.value };
      userData.roles = [userData.roles];
      if (this.user) {
        this.userService.update(this.user.id, userData).subscribe({
          next: () => this.modal.close(true),
          error: (err) => console.error("Erreur update", err)
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => this.modal.close(true),
          error: (err) => console.error("Erreur create", err)
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  closeModal(){
    this.modal.close()
  }


}
