// angular import
import {Component, inject, OnInit} from '@angular/core';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {UserService} from "../../../../../services/apis/user-service";
import {map} from "rxjs";
import {User} from "../../../../../model/user";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterLink],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  standalone: true,
  providers: [NgbDropdownConfig, UserService]
})
export class NavRightComponent implements OnInit {
  // public props

  private userService = inject(UserService);

  // constructor
  connectedUser: User
  constructor() {
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
  }
}
