import {Injectable, NgZone} from '@angular/core';
import { createServerClient } from '../Utils/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseServerService {
  private supabase: SupabaseClient;

  constructor(private ngZone: NgZone) {
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

  listenToNewCommands(onNewCommand: (command: any) => void) {
    const channel = this.supabase
      .channel('commands-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'command' },
        (payload) => {
          this.ngZone.run(() => onNewCommand(payload.new));
        }
      )
      .subscribe();
    return channel;
  }

  stopListening(channel: any) {
    this.supabase.removeChannel(channel);
  }
}
