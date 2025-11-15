import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {INotification} from "../../models/INotification";

@Injectable()
export class CommandNotificationServiceService{


  commandNotificationCount = new BehaviorSubject<number>(0);



  updateCommandNotificationCount(notifications: INotification[]) {
    this.commandNotificationCount.next(notifications.length);
  }

  getCommandNotificationCount() {
    return this.commandNotificationCount.asObservable()
  }

}
