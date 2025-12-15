import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://proxy-dev.cadorim.com/api-backend/api',
  //apiUrl: 'http://localhost:8088/api',
  supabaseUrl: 'https://xijniizcthuwwrmaqxtk.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpam5paXpjdGh1d3dybWFxeHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTkwODksImV4cCI6MjA3NDE5NTA4OX0.6_CP9xSExFZtP8DKpXL5-xnCOBLUAVhVP5CL9FEC8cY',
  supabaseServiceKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpam5paXpjdGh1d3dybWFxeHRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYxOTA4OSwiZXhwIjoyMDc0MTk1MDg5fQ.RVyBCRr94UH1X3RHr7WQrpP3MYD4k5gv_JtL9lUf8fs', // to be used server-side only
  supabaseJwtSecret: 'Dt5uR/gID2/dzN8uTBahilUDJgzpRZWasfSBFAAAkymnYMOcfiX0T6/HjlqNuKUuf9uFgjK2Y5px5OrhvMebhg=='
};
