import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://proxy-dev.cadorim.com/pharma-link/api',
  supabaseUrl: 'https://your-supabase-url.supabase.co',
  supabaseAnonKey: 'your-anon-key',
  supabaseServiceKey: 'your-service-role-key', // to be used server-side only
  supabaseJwtSecret: 'your-jwt-secret',

};
