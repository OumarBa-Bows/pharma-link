import {Component, inject} from '@angular/core';
import {CardComponent} from "../../../theme/shared/components/card/card.component";
import {FormBuilder, FormGroup, FormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../../theme/shared/shared.module";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../../../services/apis/user-service";

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

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['']
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log('✅ Formulaire soumis :', this.userForm.value);
      this.userService.createUser(this.userForm.value).subscribe(res =>{
        if(res){
          this.modal.close(true)
        }
      })

    } else {
      console.log('❌ Formulaire invalide');
      this.userForm.markAllAsTouched();
    }
  }


}
