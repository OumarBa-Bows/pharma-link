import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createBrowserClient } from '../Utils/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseBrowserService {
  private supabase!: SupabaseClient;
  private isBrowser: boolean;

  constructor(private ngZone: NgZone) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    if (this.isBrowser) {
      this.supabase = createBrowserClient();
    } else {
      console.warn('[SupabaseBrowserService] Running on server → browser client disabled');
    }
  }

  get client(): SupabaseClient {
    if (!this.isBrowser) {
      throw new Error('SupabaseBrowserService.client called on SSR');
    }
    return this.supabase;
  }

  async getUsers(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.client
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return { data, total: count };
  }

  listenToNewCommands(onNewCommand: (command: any) => void) {
    if (!this.isBrowser) return;

    const channel = this.client
      .channel('commands-realtime')
      .on(
        'postgres_changes' as any, // Temporary type casting
        { event: 'INSERT', schema: 'public', table: 'command' } as any, // Temporary type casting
        (payload: { new: any }) => { // Explicitly typing payload
          this.ngZone.run(() => onNewCommand(payload.new));
        }
      )
      .subscribe((status: string) => {
        console.log('Supabase Realtime channel status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to connect to the Realtime channel. Check your configuration.');
        }
      });

    return channel;
  }

stopListening(channel: any) {
    if (!this.isBrowser) return;
    this.client.removeChannel(channel);
  }
}
