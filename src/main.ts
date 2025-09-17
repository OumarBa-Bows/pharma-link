import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app-config';
import {provideTranslateService, TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {provideTranslateHttpLoader, TranslateHttpLoader} from "@ngx-translate/http-loader";

if (environment.production) {
  enableProdMode();
}


bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserModule),   provideTranslateService({
    defaultLanguage: 'fr', // langue par défaut
    loader: provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    })
  }),provideAnimations(), ...appConfig.providers, provideClientHydration(withEventReplay())]
}).catch((err) => console.error(err));
