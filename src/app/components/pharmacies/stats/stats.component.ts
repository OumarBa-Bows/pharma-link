import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../theme/shared/shared.module';
import { ApiService } from 'src/app/services/apis/api-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface Stats {
  total: number;
  validated: number;
  pending: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule, RouterModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
  stats: Stats | null = null;
  isLoading = false;
  id: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
    });
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;

    this.apiService.getData(`pharmacies/${this.id}/command-count`).subscribe({
      next: (data: Stats) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });
  }
}
