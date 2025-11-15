import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {INotification} from "../../models/INotification";
import {Subscription} from "rxjs";
import {NotificationService} from "../../services/notifications/notification.service";
import {SupabaseServerService} from "../../Utils/supabase-server";
import {CommandNotificationServiceService} from "../../services/apis/CommandNotificationService";
import {Command} from "../../model/command";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-command-notification',
  imports: [
    RouterLink
  ],
  templateUrl: './command-notification.html',
  standalone: true,
  providers: [CommandNotificationServiceService],
  styleUrl: './command-notification.scss'
})
export class CommandNotification implements OnInit, OnDestroy {

  notifications: INotification[] = [];
  private channel: any;
  private sub!: Subscription;
  private commandNotificationService= inject(CommandNotificationServiceService);
  private router= inject(Router);


  constructor(private notificationService: NotificationService, private supabaseServerService: SupabaseServerService) {
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
      this.notifications.push(this.buildNotification(command as Command));
      console.log("New command notification added", this.notifications);
      this.commandNotificationService.updateCommandNotificationCount(this.notifications);
    });
  // this.notifications.push(this.buildNotification("command") );
    //

   // this.commandNotificationService.updateCommandNotificationCount(this.notifications);

    //
  }

  buildNotification(command: Command | any): INotification {
    return {
      description:`Nouvelle commande reçue (code : ${command.code} – ${command?.pharmacy?.name}) — cliquez pour voir les détails`,
      status: 'new',
      commandId: command.id,
      command: command,
      createdAt: new Date(),
      updatedAt: new Date()
    }
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

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }


  onClick(notification: INotification) {
    this.router.navigate(['/commands/details', notification.commandId]);
  }
}
