import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MyPreset } from './myPreset';
import { provideHttpClient } from '@angular/common/http';



import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    MessageService,
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: ".my-app-dark"
        }
        }
      })
  ]
};
