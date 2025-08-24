import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { standaloneRoutes } from './app.routes';
import { UserRoleService } from './services/user-role.service';
import { RemoteAuthService } from './core/services/remote-auth.service';
import { RemoteAuthInterceptor } from './core/interceptors/remote-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(standaloneRoutes),
    provideAnimationsAsync(),
    // HTTP Client and Auth Interceptor
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RemoteAuthInterceptor,
      multi: true
    },
    // Services
    UserRoleService,
    RemoteAuthService
  ]
};
