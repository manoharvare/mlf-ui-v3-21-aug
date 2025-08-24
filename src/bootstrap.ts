import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { App } from './app/app';
import { standaloneRoutes } from './app/app.routes';
import { RemoteAuthService } from './app/core/services/remote-auth.service';
import { RemoteAuthInterceptor } from './app/core/interceptors/remote-auth.interceptor';

// Check if running as micro frontend or standalone
const isMicroFrontend = (window as any).__webpack_share_scopes__;

if (!isMicroFrontend) {
  // Bootstrap for standalone application
  bootstrapApplication(App, {
    providers: [
      // HTTP Client and Auth Interceptor
      provideHttpClient(withInterceptorsFromDi()),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: RemoteAuthInterceptor,
        multi: true
      },
      // Router with standalone routes
      provideRouter(standaloneRoutes, withComponentInputBinding()),
      // Auth services
      RemoteAuthService,
      RemoteAuthInterceptor
    ],
  }).catch(err => console.error('Bootstrap error:', err));
} else {
  console.log('MLF UI loaded as micro frontend - skipping standalone bootstrap');
}
