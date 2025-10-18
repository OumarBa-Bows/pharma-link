import { Routes } from '@angular/router';
import { AuthGuard } from './services/guards/auth/auth-guard';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/users.component').then((c) => c.UsersComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-panel/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'pharmacies',
        children: [
          {
            path: '',
            loadComponent: () => import('./admin-panel/pages/pharmacies/component/pharmacies.component').then((c) => c.PharmaciesComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./admin-panel/pages/pharmacies/create/create.component').then((c) => c.CreatePharmacyComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./admin-panel/pages/pharmacies/edit/edit.component').then((c) => c.EditPharmacyComponent)
          }
        ]
      },
      {
        path: 'basic',
        loadChildren: () => import('./admin-panel/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'articles',
        loadChildren: () => import('./components/articles/articles-routing-module').then((m) => m.ArticlesRoutingModule)
      },
       {
        path: 'listings',
        loadChildren: () => import('./components/listings/listings-routing-module').then((m) => m.ListingsRoutingModule)
      },
      {
        path: 'commandes',
        loadComponent: () => import('./components/commandes/commandes.component').then((m) => m.CommandesComponent)
      },
      {
        path: 'forms',
        loadComponent: () => import('./admin-panel/pages/form-element/form-element').then((c) => c.FormElement)
      },
      {
        path: 'tables',
        loadComponent: () => import('./admin-panel/pages/tables/tbl-bootstrap/tbl-bootstrap.component').then((c) => c.TblBootstrapComponent)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./admin-panel/pages/core-chart/apex-chart/apex-chart.component').then((c) => c.ApexChartComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./admin-panel/extra/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',

        loadComponent: () =>
          import('./admin-panel/pages/authentication/auth-signin/auth-signin.component').then((c) => c.AuthSigninComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./admin-panel/pages/authentication/auth-signup/auth-signup.component').then((c) => c.AuthSignupComponent)
      }
    ]
  }
];
