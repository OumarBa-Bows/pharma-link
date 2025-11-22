import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrivilegeService {

  getPrivilege(values: string[]): boolean {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]') as string[];
    return roles.some(role => values.includes(role));
  }

}
