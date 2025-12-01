// angular import
import {Component, inject, OnInit} from '@angular/core';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {UserService} from "../../../../../services/apis/user-service";
import {map, Observable} from "rxjs";
import {User} from "../../../../../model/user";
import {NotificationComponent} from "../../../../../components/notification/notification.component";
import {CommandNotification} from "../../../../../components/command-notification/command-notification";
import {CommandNotificationServiceService} from "../../../../../services/apis/CommandNotificationService";
import {Router, RouterLink} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterLink, NotificationComponent, CommandNotification],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  standalone: true,
  providers: [NgbDropdownConfig, UserService, CommandNotificationServiceService]
})
export class NavRightComponent implements OnInit {
  // public props

  private userService = inject(UserService);
  private commandNotificationServiceService = inject(CommandNotificationServiceService);


  private router = inject(Router);
  // constructor
  connectedUser: User
  countCommandNotifications$: Observable<number>;
   count: number;
  constructor(private translateService: TranslateService) {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }


  getConnectedUser() {
    return this.userService.getConnectedUser()
      .pipe(map(res=> res.data.user as User))
      .subscribe(user=> {
        this.connectedUser = user;
    });
  }

  ngOnInit(): void {
    this.getConnectedUser()
    this.commandNotificationServiceService.count$.subscribe(c => {
      this.count = c;
    });


  }

  onDropdownChange($event: boolean) {
    if($event){
      this.commandNotificationServiceService.reset();
    }
  }

  logOut(){
      localStorage.removeItem('token');
       localStorage.removeItem('user');
      this.router.navigate(['/login']);
  }

  changeLanguage(lang: string) {
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
  }

}
