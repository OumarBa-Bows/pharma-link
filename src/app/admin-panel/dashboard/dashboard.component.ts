// angular import
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DashboardService } from 'src/app/services/api/dashboard.service';
import { DashboardSummary, DashboardOrderItem, DashboardPharmacyItem } from 'src/app/models/dashboard.model';
import { PharmacyState } from 'src/app/models/pharmacy.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private langSubscription?: Subscription;
  // life cycle event
  ngOnInit() {
    this.updateKpiTitles();
    this.loadData();
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.updateKpiTitles();
    });
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private updateKpiTitles() {
    this.sales[0].title = this.translateService.instant('dashboard.kpis.totalPharmacies');
    this.sales[1].title = this.translateService.instant('dashboard.kpis.activePharmacies');
    this.sales[2].title = this.translateService.instant('dashboard.kpis.pendingApprovals');
  }

  getOrderStatusTranslation(status: string): string {
    return this.translateService.instant(`dashboard.recentOrders.statuses.${status}`);
  }

  private loadData() {
    this.dashboardService.getSummary().subscribe({
      next: (summary: DashboardSummary) => {
        const totals = summary.totals || { totalPharmacies: 0, activePharmacies: 0, pendingPharmacies: 0, blockedPharmacies: 0 };
        const total = totals.totalPharmacies || 0;
        const active = totals.activePharmacies || 0;
        const pending = totals.pendingPharmacies || 0;

        // Map KPIs (counts only)
        this.sales[0].amount = String(total);
        this.sales[1].amount = String(active);
        const activeText = this.translateService.instant('dashboard.kpis.active');
        this.sales[1].percentage = total > 0 ? `${Math.round((active / total) * 100)}% ${activeText}` : `0% ${activeText}`;
        this.sales[2].amount = String(pending);

        // Tables
        this.recentOrders = summary.recentOrders ?? this.recentOrders;
        this.recentPharmacies = summary.recentPharmacies ?? this.recentPharmacies;
      },
      error: () => {
        // Keep sample data as fallback
      }
    });
  }

  constructor(
    private dashboardService: DashboardService,
    private translateService: TranslateService
  ) {}

  // public method
  sales = [
    {
      title: '',
      icon: 'icon-activity text-c-blue',
      amount: '0',
      percentage: '',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme'
    },
    {
      title: '',
      icon: 'icon-check text-c-green',
      amount: '0',
      percentage: '',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme2'
    },
    {
      title: '',
      icon: 'icon-clock text-c-yellow',
      amount: '0',
      percentage: '',
      progress: 0,
      design: 'col-md-12',
      progress_bg: 'progress-c-theme'
    }
  ];

  recentOrders: DashboardOrderItem[] = [];

  recentPharmacies: DashboardPharmacyItem[] = [];
}
