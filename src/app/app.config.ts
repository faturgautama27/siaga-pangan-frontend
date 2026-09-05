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
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthState } from './store/auth/auth.state';
import { MasterState } from './store/master/master.state';
import { EwsState } from './store/ews/ews.state';
import { DisparitasState } from './store/disparitas/disparitas.state';
import { MessageService } from 'primeng/api';
import { definePreset } from '@primeng/themes';

const SatriaHargaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E8F0FA',
      100: '#D1E1F5',
      200: '#A3C3EB',
      300: '#75A5E1',
      400: '#4787D7',
      500: '#0B2A5B',
      600: '#092252',
      700: '#071A49',
      800: '#061B3A',
      900: '#04132B',
      950: '#020A16',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#0B2A5B',
          contrastColor: '#ffffff',
          hoverColor: '#061B3A',
          activeColor: '#071A49',
        },
        surface: {
          0: '#ffffff',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SatriaHargaPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideStore(
      [AuthState, MasterState, EwsState, DisparitasState],
      withNgxsStoragePlugin({ keys: ['auth'] }),
      withNgxsRouterPlugin(),
    ),
    MessageService
  ],
};
