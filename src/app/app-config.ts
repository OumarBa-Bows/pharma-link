import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Interceptor } from './services/apis/interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([Interceptor]))]
};
