import { Injectable } from '@angular/core';
import { createServerClient } from '../Utils/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseServerService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createServerClient();
  }

  async getUsers(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return { data, total: count };
  }
}
