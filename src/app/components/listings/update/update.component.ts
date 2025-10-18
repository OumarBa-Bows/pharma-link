import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ApiService } from 'src/app/services/apis/api-service';
import { NotificationService } from 'src/app/services/notifications/notification.service';

@Component({
  selector: 'app-update-listing',
  imports: [SharedModule, RouterModule, SpinnerComponent, TranslatePipe, ReactiveFormsModule],
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  listingForm: FormGroup;
  isLoading: boolean = false;
  imagePath: string = '';
  articles: any[] = [];
  listing: any;
  isArticlesLoading: boolean = false;
  articleSearch: string = '';
  listingId: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
     this.listingForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      articleIds: [[],Validators.required]
    });
    this.route.paramMap.subscribe((params) => {
      this.listingId = params.get('id');
      if (this.listingId) {
        this.loadListing(this.listingId);
      }
    });
  }

  ngOnInit(): void {
    this.getArticles();
  }

  onSubmit() {
    if (this.listingForm.valid) {
      console.log(this.listingForm.value);
      this.listingForm.disable();
      this.isLoading = true;
      this.apiService.postData('listings', this.listingForm.value).subscribe({
        next: (response) => {
          console.log('listing créé :', response);
          this.isLoading = false;
          this.listingForm.enable();
          this.listingForm.reset();
        },
        error: (error) => {
          console.error("Erreur lors de la création de listing :", error);
          this.isLoading = false;
          this.listingForm.enable();
        },
        complete: () => {
          this.notificationService.showSuccess('listing créé avec succès!');
          this.router.navigateByUrl('/listings/index');
        }
      });
    }
  }

  isArticleSelected(id: any): boolean {
    const ids = this.listingForm.get('articleIds')?.value || [];
    return Array.isArray(ids) && ids.includes(id);
  }

  onArticleToggle(id: any, checked: boolean) {
    const ctrl = this.listingForm.get('articleIds');
    const current: any[] = (ctrl?.value || []).slice();
    if (checked) {
      if (!current.includes(id)) current.push(id);
    } else {
      const idx = current.indexOf(id);
      if (idx > -1) current.splice(idx, 1);
    }
    ctrl?.setValue(current);
    ctrl?.markAsDirty();
    ctrl?.updateValueAndValidity();
  }


  getArticles() {
    this.isArticlesLoading = true;
    this.apiService.getData(`articles?page=1&pageSize=1000`).subscribe({
      next: (response: any) => {
        this.articles = response.data?.articles || [];
        this.isArticlesLoading = false;
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
        this.isArticlesLoading = false;
      }
    });
  }

  get filteredArticles() {
    const q = (this.articleSearch || '').toLowerCase().trim();
    const base = !q
      ? this.articles
      : this.articles.filter((a: any) => {
          const name = (a?.name || '').toLowerCase();
          const code = (a?.code || '').toLowerCase();
          return name.includes(q) || code.includes(q);
        });

    const selectedIds: any[] = this.listingForm.get('articleIds')?.value || [];
    const selectedSet = new Set(selectedIds);
    return base.slice().sort((a: any, b: any) => {
      const aSel = selectedSet.has(a.id) ? 0 : 1;
      const bSel = selectedSet.has(b.id) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel; // selected first
      const an = (a?.name || '').toLowerCase();
      const bn = (b?.name || '').toLowerCase();
      return an.localeCompare(bn);
    });
  }

  loadListing(id: string) {
    this.isLoading = true;
    this.apiService.getData(`listings/${id}`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.listing = response.data.listing;
        this.listingFormPatchValue();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching listing:', error);
        this.isLoading = false;
      }
    });
  }

  listingFormPatchValue() {
    const details = Array.isArray(this.listing?.listingDetails) ? this.listing.listingDetails : [];
    const selectedIds = details.map((d: any) => d.articleId).filter((id: any) => !!id);
    this.listingForm.patchValue({
      id: this.listing?.id || '',
      name: this.listing?.name || '',
      description: this.listing?.description || '',
      articleIds: selectedIds
    });
  }
}
