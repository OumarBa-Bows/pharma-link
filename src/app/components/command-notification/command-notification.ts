import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {INotification} from "../../models/INotification";
import {Subscription} from "rxjs";
import {NotificationService} from "../../services/notifications/notification.service";
import {SupabaseBrowserService} from "../../Utils/supabase-server";
import {CommandNotificationServiceService} from "../../services/apis/CommandNotificationService";
import {Command} from "../../model/command";
import {Router, RouterLink} from "@angular/router";
import {DatePipe, NgClass} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-command-notification',
  imports: [
    RouterLink,
    DatePipe,
    NgClass,
    TranslatePipe
  ],
  templateUrl: './command-notification.html',
  standalone: true,
  providers: [],
  styleUrl: './command-notification.scss'
})
export class CommandNotification implements OnInit, OnDestroy {

  notifications: Command[] = [];
  private channel: any;
  private sub!: Subscription;
  private commandNotificationService= inject(CommandNotificationServiceService);
  private router= inject(Router);


  constructor(private notificationService: NotificationService, private supabaseServerService: SupabaseBrowserService) {
    console.log('NotificationComponent initialized');
  }

  ngOnInit() {
    /*   this.sub = this.notificationService.notifications$.subscribe((notif) => {
         console.log('[NotificationComponent] Notification reçue:', notif);
         this.notifications.push(notif);
         if (!notif.confirm) {
           setTimeout(() => this.close(notif), 3000);
         }
       }); */
    this.channel = this.supabaseServerService.listenToNewCommands((command) => {
      console.log("command received from supabase:", command);
      this.notifications.push(command as Command);
      console.log("New command notification added", this.notifications);
      const activeNotifications = this.notifications.filter(notif => !notif.viewed)
      this.commandNotificationService.updateCommandNotificationCount(activeNotifications);
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  buildNotification(): any {
      return {
        code: "FGYHJK",
        commandreference: "ref",
        date: new Date(),
        details: [],
        distributor: undefined,
        distributorid: 1,
        invoicereference: "",
        mainDistributor: undefined,
        pharmacy: undefined,
        pharmacyId: "",
        status: "",
        totalprice: 0,
        viewed: false,
        id: "1"
      };

  /*  return {
      description:`Nouvelle commande reçue (code : ${command.code} – ${command?.pharmacy?.name}) — cliquez pour voir les détails`,
      status: 'new',
      commandId: command.id,
      command: command,
      createdAt: new Date(),
      updatedAt: new Date()
    } */
  }
  /*
  close(notif: Notification) {
    this.notifications = this.notifications.filter((n) => n !== notif);
    if (notif.confirm && notif.resolve) notif.resolve(false);
  }

  confirm(notif: Notification, result: boolean) {
    this.notifications = this.notifications.filter((n) => n !== notif);
    if (notif.resolve) notif.resolve(result);
  } */


  onClick(notification: Command) {
    this.router.navigate(['/commands/details', notification.id],  {
      queryParams: {
        viewed: true,
        type: 'command'
      }
    });
  }


}
