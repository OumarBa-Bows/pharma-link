import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { INotification } from '../../models/INotification';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notifications/notification.service';
import { SupabaseBrowserService } from '../../Utils/supabase-server';
import { CommandNotificationServiceService } from '../../services/apis/CommandNotificationService';
import { Command } from '../../model/command';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-command-notification',
  imports: [RouterLink, DatePipe, NgClass, TranslatePipe],
  templateUrl: './command-notification.html',
  standalone: true,
  providers: [],
  styleUrl: './command-notification.scss'
})
export class CommandNotification implements OnInit, OnDestroy {
  @Input() dropdown?: NgbDropdown;
  notifications: Command[] = [];
  private channel: any;
  private sub!: Subscription;
  private commandNotificationService = inject(CommandNotificationServiceService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  constructor(
    private notificationService: NotificationService,
    private supabaseServerService: SupabaseBrowserService
  ) {
    console.log('NotificationComponent initialized');
  }

  getStatusTranslation(status: string): string {
    return this.translateService.instant(`commands.status.${status.toLowerCase()}`);
  }

  ngOnInit() {
    console.log('[CommandNotification] ngOnInit - Starting Supabase listener...');

    // Charger les commandes non vues au démarrage
    this.loadUnviewedCommands();

    /*   this.sub = this.notificationService.notifications$.subscribe((notif) => {
         console.log('[NotificationComponent] Notification reçue:', notif);
         this.notifications.push(notif);
         if (!notif.confirm) {
           setTimeout(() => this.close(notif), 3000);
         }
       }); */
    try {
      this.channel = this.supabaseServerService.listenToNewCommands(async (command) => {
        console.log('[CommandNotification] ✅ Event received from Supabase:', command);
        console.log('[CommandNotification] Reloading all unviewed commands...');

        try {
          // Recharger toutes les commandes non vues au lieu d'ajouter juste la nouvelle
          await this.loadUnviewedCommands();
          console.log('[CommandNotification] Successfully reloaded unviewed commands');
        } catch (error) {
          console.error('[CommandNotification] ❌ Error reloading commands:', error);
        }
      });
      console.log('[CommandNotification] Listener setup complete, channel:', this.channel);
    } catch (error) {
      console.error('[CommandNotification] ❌ Error setting up Supabase listener:', error);
    }
  }

  private async loadUnviewedCommands() {
    console.log('[CommandNotification] Loading unviewed commands...');
    try {
      const commands = await this.supabaseServerService.getUnviewedCommands();
      this.notifications = commands as Command[];
      console.log('[CommandNotification] Loaded', this.notifications.length, 'unviewed commands');
      console.log('[CommandNotification] Updated notifications:', this.notifications);

      const activeNotifications = this.notifications.filter((notif) => !notif.viewed);
      console.log('[CommandNotification] Active (unviewed) notifications count:', activeNotifications.length);

      this.commandNotificationService.updateCommandNotificationCount(activeNotifications);
      console.log('[CommandNotification] Notification count updated');
    } catch (error) {
      console.error('[CommandNotification] ❌ Error loading unviewed commands:', error);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  buildNotification(): any {
    return {
      code: 'FGYHJK',
      commandreference: 'ref',
      date: new Date(),
      details: [],
      distributor: undefined,
      distributorid: 1,
      invoicereference: '',
      mainDistributor: undefined,
      pharmacy: undefined,
      pharmacyId: '',
      status: '',
      totalprice: 0,
      viewed: false,
      id: '1'
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

  async onClick(notification: Command) {
    console.log('[CommandNotification] onClick - Marking notification as viewed:', notification.id);

    try {
      // Marquer la commande comme vue dans Supabase
      const result = await this.supabaseServerService.markCommandAsViewed(notification.id);

      if (result.success) {
        console.log('[CommandNotification] ✅ Successfully marked as viewed');

        // Recharger les notifications pour mettre à jour le badge
        await this.loadUnviewedCommands();

        // Fermer le dropdown
        if (this.dropdown) {
          this.dropdown.close();
          console.log('[CommandNotification] Dropdown closed');
        }

        // Naviguer vers les détails
        this.router.navigate(['/commands/details', notification.id], {
          queryParams: {
            viewed: true,
            type: 'command'
          }
        });
      } else {
        console.error('[CommandNotification] ❌ Failed to mark as viewed:', result.error);
      }
    } catch (error) {
      console.error('[CommandNotification] ❌ Error in onClick:', error);
    }
  }
}
