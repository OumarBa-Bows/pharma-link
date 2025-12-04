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

    const { data, error, count } = await this.client.from('users').select('*', { count: 'exact' }).range(from, to);

    if (error) throw error;
    return { data, total: count };
  }

  async getUnviewedCommands() {
    if (!this.isBrowser) {
      console.warn('[getUnviewedCommands] Not in browser environment, skipping');
      return [];
    }

    console.log('[getUnviewedCommands] Fetching unviewed commands...');
    try {
      const { data, error } = await this.client
        .from('command')
        .select('*')
        .eq('viewed', false)
        .eq('status', 'PENDING')
        .order('id', { ascending: false });

      if (error) {
        console.error('[getUnviewedCommands] Error fetching commands:', error);
        throw error;
      }

      console.log('[getUnviewedCommands] ✅ Fetched', data?.length || 0, 'unviewed commands');
      return data || [];
    } catch (error) {
      console.error('[getUnviewedCommands] ❌ Exception:', error);
      return [];
    }
  }

  async markCommandAsViewed(commandId: number) {
    if (!this.isBrowser) {
      console.warn('[markCommandAsViewed] Not in browser environment, skipping');
      return { success: false, error: 'Not in browser' };
    }

    console.log('[markCommandAsViewed] Marking command as viewed:', commandId);
    try {
      const { data, error } = await this.client.from('command').update({ viewed: true }).eq('id', commandId).select();

      if (error) {
        console.error('[markCommandAsViewed] ❌ Error updating command:', error);
        return { success: false, error };
      }

      console.log('[markCommandAsViewed] ✅ Command marked as viewed:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[markCommandAsViewed] ❌ Exception:', error);
      return { success: false, error };
    }
  }

  listenToNewCommands(onNewCommand: (command: any) => void) {
    if (!this.isBrowser) {
      console.warn('[listenToNewCommands] Not in browser environment, skipping');
      return;
    }

    console.log('[listenToNewCommands] Initializing Supabase Realtime channel...');

    const channel = this.client
      .channel('commands-realtime')
      .on(
        'postgres_changes' as any, // Temporary type casting
        { event: '*', schema: 'public', table: 'command' } as any, // Temporary type casting
        (payload: { new: any }) => {
          // Explicitly typing payload
          try {
            console.log('[listenToNewCommands] New INSERT event received:', payload);
            console.log('[listenToNewCommands] Command data:', payload.new);
            this.ngZone.run(() => {
              console.log('[listenToNewCommands] Executing callback in NgZone');
              onNewCommand(payload.new);
            });
          } catch (error) {
            console.error('[listenToNewCommands] Error processing command:', error);
          }
        }
      )
      .subscribe((status: string) => {
        console.log('[listenToNewCommands] Supabase Realtime channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[listenToNewCommands] ✅ Successfully subscribed to commands channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[listenToNewCommands] ❌ CHANNEL_ERROR - Failed to connect to Realtime channel');
          console.error('[listenToNewCommands] Check: 1) Supabase URL/Key, 2) Realtime enabled, 3) RLS policies');
        } else if (status === 'TIMED_OUT') {
          console.error('[listenToNewCommands] ❌ TIMED_OUT - Connection timeout');
        } else if (status === 'CLOSED') {
          console.warn('[listenToNewCommands] ⚠️ Channel closed');
        }
      });

    console.log('[listenToNewCommands] Channel created:', channel);
    return channel;
  }

  stopListening(channel: any) {
    if (!this.isBrowser) return;
    this.client.removeChannel(channel);
  }
}
