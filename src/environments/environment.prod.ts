import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://api.pharma-link.org/api', //https://proxy-dev.cadorim.com/api-backend/api',
  //apiUrl: 'http://localhost:8088/api',
  supabaseUrl: 'https://fpfzseglfgjrpwdmnqij.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZnpzZWdsZmdqcnB3ZG1ucWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxODIyODMsImV4cCI6MjA5ODc1ODI4M30.TV5m_zb41nKNi9QFSzYqv4ntqY4a78qVlcPwjRxFS3A',
  supabaseServiceKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZnpzZWdsZmdqcnB3ZG1ucWlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4MjI4MywiZXhwIjoyMDk4NzU4MjgzfQ.emBTlR4Hn6lWIm8p37-eIcz0MYjaMkw3na-Y3N-jUWk', // to be used server-side only
  supabaseJwtSecret: 'hUtvz0/Qnc7knfHTt3r8VT/aOZeSwcWPAZiq7YQnqJnZoS+7YAvq8042Ebn7nozfAF3J9/pSYJRJGCQVp3zOuQ=='
};
