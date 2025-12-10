import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { CommandService } from '../../../services/apis/CommandService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { COMMAND_STATUS } from '../../../models/enum';
import { Command } from '../../../model/command';
import { NotificationService } from '../../../services/notifications/notification.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from 'src/app/theme/shared/components/confirmation-modal/confirmation-modal.component';
import { EditQuantityModalComponent } from '../edit-quantity-modal/edit-quantity-modal.component';

@Component({
  selector: 'app-command-detail',
  imports: [DatePipe, DecimalPipe, NgClass, TranslatePipe],
  templateUrl: './command-detail.html',
  standalone: true,
  styleUrl: './command-detail.scss',
  providers: [CommandService]
})
export class CommandDetail implements OnInit {
  command: any;
  isCompositionVisible = false;
  isLoading = false;
  private sortedComposition: any[] = [];
  private ngbModal = inject(NgbModal);
  private commandId: number;
  private commandService = inject(CommandService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
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
          this.commandService.updateStatus(this.commandId, newStatus).subscribe((res) => {
            if (res) {
              this.getCommandById();
              this.notificationService.showSuccess(this.translateService.instant('commands.details.statusUpdateSuccess'));
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
    this.getCommandById();
    this.listenToRouteQueryParams();
  }

  getCommandById() {
    this.commandService.getById(this.commandId).subscribe((res) => {
      console.log(res);
      this.command = res.data.command;

      // Trier uniquement au premier chargement si pas encore trié
      if (this.sortedComposition.length === 0 && this.command?.composition) {
        this.sortedComposition = [...this.command.composition].sort((a, b) => {
          const aLowStock = a.article_availableQuantity <= 20;
          const bLowStock = b.article_availableQuantity <= 20;
          if (aLowStock && !bLowStock) return -1;
          if (!aLowStock && bLowStock) return 1;
          return 0;
        });
      } else if (this.command?.composition) {
        // Mettre à jour les données existantes sans retrier
        this.sortedComposition = this.sortedComposition.map((sortedItem) => {
          const updatedItem = this.command.composition.find((item: any) => item.command_detail_id === sortedItem.command_detail_id);
          return updatedItem || sortedItem;
        });

        // Filtrer les articles supprimés
        const existingIds = new Set(this.command.composition.map((item: any) => item.command_detail_id));
        this.sortedComposition = this.sortedComposition.filter((item) => existingIds.has(item.command_detail_id));
      }
    });
  }

  listenToRouteQueryParams() {
    this.route.queryParamMap.subscribe((query) => {
      if (query.has('viewed')) {
        if (this.command) this.commandService.updateCommand({ ...this.command, viewed: true } as Command);
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.translateService.instant(`commands.status.${status.toLowerCase()}`);
  }

  getSortedComposition() {
    return this.sortedComposition;
  }

  getLowStockCount(): number {
    return this.sortedComposition.filter((item) => item.article_availableQuantity <= 20).length;
  }

  toggleComposition(): void {
    this.isCompositionVisible = !this.isCompositionVisible;
  }

  onEditItem(item: any): void {
    const modalRef = this.ngbModal.open(EditQuantityModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.articleName = item.article_name;
    modalRef.componentInstance.currentQuantity = item.quantity;
    modalRef.componentInstance.availableQuantity = item.article_availableQuantity;

    modalRef.result.then(
      (newQuantity: number) => {
        if (newQuantity && newQuantity !== item.quantity) {
          this.isLoading = true;
          const data = {
            commandId: this.commandId,
            articleId: item.article_id,
            quantity: newQuantity
          };

          this.commandService.updateCommandArticleQuantity(data).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res) {
                this.notificationService.showSuccess(this.translateService.instant('commands.details.article.updateSuccess'));
                this.getCommandById();
              }
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error updating quantity:', error);
              this.notificationService.showError(this.translateService.instant('commands.details.article.updateError'));
            }
          });
        }
      },
      () => {
        console.log('Modal fermé sans modification');
      }
    );
  }

  onDeleteItem(item: any): void {
    const modalRef = this.ngbModal.open(ConfirmationModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = this.translateService.instant('commands.details.article.deleteArticle');
    modalRef.componentInstance.msg = this.translateService.instant('commands.details.article.confirmDeleteArticle', {
      article: item.article_name
    });
    modalRef.componentInstance.confirmText = this.translateService.instant('common.delete');
    modalRef.componentInstance.cancelText = this.translateService.instant('common.cancel');

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.isLoading = true;
          const data = {
            commandId: this.commandId,
            articleId: item.article_id,
            commandDetailId: item.command_detail_id
          };

          this.commandService.removeCommandArticle(data).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res) {
                this.notificationService.showSuccess(this.translateService.instant('commands.details.article.deleteSuccess'));
                this.getCommandById();
              }
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error deleting article:', error);
              this.notificationService.showError(this.translateService.instant('commands.details.article.deleteError'));
            }
          });
        }
      },
      () => {
        console.log('Modal fermé sans confirmation');
      }
    );
  }
}
