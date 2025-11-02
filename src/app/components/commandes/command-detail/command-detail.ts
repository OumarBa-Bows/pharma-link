import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {CurrencyPipe, DatePipe} from "@angular/common";

@Component({
  selector: 'app-command-detail',
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './command-detail.html',
  standalone: true,
  styleUrl: './command-detail.scss'
})
export class CommandDetail {

  command: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.command = navigation?.extras?.state?.['data'];
  }

  goBack(): void {
    this.router.navigateByUrl('/commands');
  }
}
