import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {INotification} from "../../models/INotification";
import {Command} from "../../model/command";

@Injectable({ providedIn: 'root' })
export class CommandNotificationServiceService{

  private readonly _count = new BehaviorSubject<number>(0);

  // Observable public en lecture seule
  readonly count$: Observable<number> = this._count.asObservable();

  constructor() {}

  updateCommandNotificationCount(notifications: Command[]): void {
    const value = notifications?.length ?? 0;
    this._count.next(value);
  }

  setCount(count: number): void {
    this._count.next(count);
  }

  increment(): void {
    this._count.next(this._count.value + 1);
  }

  decrement(): void {
    const newValue = Math.max(0, this._count.value - 1);
    this._count.next(newValue);
  }

  reset(): void {
    this._count.next(0);
  }

}
