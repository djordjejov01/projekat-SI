import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './myPreset';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {importProvidersFrom } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthInterceptor } from './Services/AuthInterceptor.service';
import { DatePipe } from '@angular/common';
import { LanguageInterceptor } from './Services/LanguageInterceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'sr',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        }
      })
    ),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    MessageService,
    ConfirmationService,
    DatePipe,
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: ".my-app-dark"
        }
        }
      }),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: LanguageInterceptor,
        multi: true
      }
  ]
};
