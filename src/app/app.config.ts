import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AuthState } from './store/auth/auth.state';
import { MasterState } from './store/master/master.state';
import { EwsState } from './store/ews/ews.state';
import { MessageService } from 'primeng/api';
import { definePreset } from '@primeng/themes';

const SiagaPanganPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SiagaPanganPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideStore(
      [AuthState, MasterState, EwsState],
      withNgxsStoragePlugin({ keys: ['auth'] }),
      withNgxsRouterPlugin(),
    ),
    MessageService
  ],
};
