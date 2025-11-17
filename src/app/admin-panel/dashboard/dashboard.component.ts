// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DashboardService } from 'src/app/services/api/dashboard.service';
import { DashboardSummary, DashboardOrderItem, DashboardPharmacyItem } from 'src/app/models/dashboard.model';
import { PharmacyState } from 'src/app/models/pharmacy.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // life cycle event
  ngOnInit() {
    this.loadData();
  }

  private loadData(){
   this.dashboardService.getSummary().subscribe({
      next: (summary: DashboardSummary) => {
        const totals = summary.totals || { totalPharmacies: 0, activePharmacies: 0, pendingPharmacies: 0, blockedPharmacies: 0 };
        const total = totals.totalPharmacies || 0;
        const active = totals.activePharmacies || 0;
        const pending = totals.pendingPharmacies || 0;

        // Map KPIs (counts only)
        this.sales[0].amount = String(total);
        this.sales[1].amount = String(active);
        this.sales[1].percentage = total > 0 ? `${Math.round((active / total) * 100)}% active` : '0% active';
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

  constructor(private dashboardService: DashboardService) {}

  // public method
  sales = [
    {
      title: 'Total Pharmacies',
      icon: 'icon-activity text-c-blue',
      amount: '0',
      percentage: '',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme'
    },
    {
      title: 'Active Pharmacies',
      icon: 'icon-check text-c-green',
      amount: '0',
      percentage: '',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme2'
    },
    {
      title: 'Pending Approvals',
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
