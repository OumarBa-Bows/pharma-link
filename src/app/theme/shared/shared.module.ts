// angular import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// project import
import { CardComponent } from './components/card/card.component';

// bootstrap import
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import {TranslateModule} from '@ngx-translate/core';
import {TableComponent} from "./components/table/table.component";

@NgModule({
  declarations: [],
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule, CardComponent, NgbModule, NgScrollbarModule, NgbCollapseModule,TableComponent],
  exports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule, CardComponent, NgbModule, NgScrollbarModule, NgbCollapseModule,TableComponent]
})
export class SharedModule {}
