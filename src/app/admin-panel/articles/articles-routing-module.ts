import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'index',
        loadComponent: () => import('./index/index.component').then((c) => c.IndexComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./create/create.component').then((c) => c.CreateComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule {}
