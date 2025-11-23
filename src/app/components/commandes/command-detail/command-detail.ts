import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CurrencyPipe, DatePipe, NgClass} from "@angular/common";
import {CommandService} from "../../../services/apis/CommandService";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ChangeStatusComponent} from "../change-status/change-status.component";
import {CreateUserComponent} from "../../users/create-user/create-user.component";
import {COMMAND_STATUS} from "../../../models/enum";
import {Command} from "../../../model/command";
import {NotificationService} from "../../../services/notifications/notification.service";

@Component({
  selector: 'app-command-detail',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass
  ],
  templateUrl: './command-detail.html',
  standalone: true,
  styleUrl: './command-detail.scss',
  providers: [CommandService]
})
export class CommandDetail implements OnInit {

  command: any;
  private ngbModal = inject(NgbModal)
  private commandId: number;
  private commandService = inject(CommandService);
  private notificationService = inject(NotificationService);

  constructor(private router: Router, private route: ActivatedRoute) {
    const navigation = this.router.getCurrentNavigation();
  }

  goBack(): void {
    this.router.navigateByUrl('/commands');
  }

  openModal() {
    const modalRef = this.ngbModal.open(ChangeStatusComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
      windowClass: 'createDeclaration-popup'
    });
    modalRef.componentInstance.currentStatus = this.command.status;
    modalRef.result.then(
      (newStatus: COMMAND_STATUS) => {
        if (newStatus) {
          this.command.status = newStatus;
          this.commandService.updateStatus(this.commandId, newStatus).subscribe(res => {
            if (res) {
              this.getCommandById()
              this.notificationService.showSuccess("Statut mis à jour avec succès");
            }
          });
        }
      },
      () => {
        console.log('Modal fermé sans changement');
      }
    );
  }

  ngOnInit(): void {
    this.commandId = Number(this.route.snapshot.paramMap.get('id'));
    this.getCommandById()
    this.listenToRouteQueryParams()
  }

  getCommandById(){
    this.commandService.getById(this.commandId).subscribe(res => {
      this.command = res.data.command as Command;
    })
  }

  listenToRouteQueryParams(){
    this.route.queryParamMap.subscribe(query => {
      if(query.has("viewed")){
        if(this.command)
          this.commandService.updateCommand({...this.command, viewed:true} as Command);
      }
    });
  }
}
