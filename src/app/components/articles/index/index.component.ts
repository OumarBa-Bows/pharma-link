import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/apis/api-service';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-index',
  imports: [SharedModule, RouterModule, TranslatePipe, SpinnerComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  search = '';
  page = 1;
  pageSize = 20;

  onAddNew() {
   this.router.navigateByUrl('/articles/create');
  }

  onSearch(c: any) {
    if(c  == '' || c.length == 0) {
      this.search = '';
      this.page = 1;
      this.pageSize = 20;
      this.getArticles();
      return;
    }

    if(c.length < 2 || c == this.search) return;

    this.search = c;
    this.page = 1;
    this.pageSize = 20;
    this.getArticles();
  }

  isLoading: boolean = false;
  articles: any[] = [];
  columns = [
    { header: 'Nom', field: 'name' },
    { header: 'Code', field: 'code' },
    { header: 'Prix', field: 'price' },
    { header: "Date d'expiration", field: 'expiryDate' }
  ];

  newSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getArticles();
  }

  onSelectionChange(rows: any[]) {
    console.log('Lignes sélectionnées :', rows);
  }

  getArticles() {
    this.isLoading = true;
    this.newSubscription = this.apiService.getData(`articles?search=${this.search}&page=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (response: any) => {
        console.log('Articles fetched successfully:', response);
        this.articles = response.data.articles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
        this.isLoading = false;
      }
    });
  }

  onEdit(row: any) {
    this.router.navigateByUrl(`/articles/edit/${row['id']}`);
  }

  onDelete(row: any) {
    this.isLoading = true;
    this.apiService.getData(`articles/delete/${row['id']}`).subscribe({
      next: (response) => {
        console.log('Article supprimé :', response);
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Erreur lors de la suppression de l'article :", error);
      },
      complete: () => {
        this.getArticles(); // Rafraîchir la liste des articles
      }
    });
  }
  ngOnDestroy() {
    this.newSubscription.unsubscribe();
  }
}
