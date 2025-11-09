import {Component, inject, OnInit} from '@angular/core';
import {SharedModule} from "../../theme/shared/shared.module";
import {map, Observable} from "rxjs";
import {User} from "../../model/user";
import {UserService} from "../../services/apis/user-service";

  @Component({
    selector: 'app-profile',
    imports: [SharedModule],
    templateUrl: './profile.component.html',
    standalone: true,
    styleUrl: './profile.component.scss',
    providers: [UserService]
  })
  export class ProfileComponent implements OnInit{

    private userService = inject(UserService)

    user: User;

    getConnectedUser() {
      return this.userService.getConnectedUser()
        .pipe(map(res=> res.data.user as User))
        .subscribe(user=> {
          this.user = user;
        });
    }

    ngOnInit(): void {
      this.getConnectedUser()

    }

    newPassword = '';
    confirmPassword = '';
    passwordChanged = false;

    changePassword() {
      if (!this.newPassword || !this.confirmPassword) {
        alert('Tous les champs sont obligatoires.');
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        alert('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }

      // backend request
      console.log("this.newpass ", this.newPassword)
      this.userService.changePassword(this.user.id, this.newPassword).subscribe(res =>{
        if(res){
          console.log('Mot de passe changé avec succès ');
          this.passwordChanged = true;

          this.newPassword = '';
          this.confirmPassword = '';
        }
      })
    }

  }
