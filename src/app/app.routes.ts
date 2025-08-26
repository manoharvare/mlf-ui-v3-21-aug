import { Routes, Route } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { App } from './app';
import { RemoteAuthService } from './core/services/remote-auth.service';
import { RemoteAuthInterceptor } from './core/interceptors/remote-auth.interceptor';
import { UserRoleService } from './services/user-role.service';
import { AuthUserRoleService } from './core/services/auth-user-role.service';
import { PermissionRefreshService } from './core/services/permission-refresh.service';
import { PermissionRefreshResolver } from './core/resolvers/permission-refresh.resolver';
import { AuthRoleGuard, AdminGuard, ProjectManagementGuard, ReportingGuard } from './core/guards/auth-role.guard';


function createRoute(path: string, loadChildren: () => Promise<Routes>, guards?: any[]): Route {
  return {
    path,
    loadChildren,
    canActivate: guards
  };
}

const featureRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  // All feature routes with lazy loading using loadChildren and database-driven role guards
  createRoute('home', () => import('./components/pages/home/home.routes').then(m => m.routes)),
  
  createRoute('forecast-approvals', 
    () => import('./components/pages/forecast-approvals/forecast-approvals.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('master-data-configurations', 
    () => import('./components/pages/master-data-configurations/master-data-configurations.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('project-configurations', 
    () => import('./components/pages/project-configurations/project-configurations.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('manage-mlf-rules', 
    () => import('./components/pages/manage-mlf-rules/manage-mlf-rules.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('monthly-forecast', 
    () => import('./components/pages/monthly-forecast/monthly-forecast.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('mlf-variance-report', 
    () => import('./components/pages/mlf-variance-report/mlf-variance-report.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('power-bi-reports', 
    () => import('./components/pages/power-bi-reports/power-bi-reports.routes').then(m => m.routes),
    [AuthRoleGuard]
  ),
  
  createRoute('user-management', 
    () => import('./components/pages/user-management/user-management.routes').then(m => m.routes),
    [AdminGuard]
  ),
  
  // Fallback route
  {
    path: '**',
    redirectTo: 'home'
  }
];

// Routes for standalone mode (used when running independently)
// In standalone mode, we bootstrap the App component directly, so we just need the feature routes
export const standaloneRoutes: Routes = featureRoutes;

// Routes for micro frontend mode (with App component wrapper and providers)
export const routes: Routes = [
  {
    path: '',
    component: App,
    providers: [
      // HTTP Client and Auth Interceptor
      provideHttpClient(withInterceptorsFromDi()),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: RemoteAuthInterceptor,
        multi: true
      },
      // Auth services
      RemoteAuthService,
      RemoteAuthInterceptor,
      // User role services
      UserRoleService,
      AuthUserRoleService,
      // Permission refresh services
      PermissionRefreshService,
      PermissionRefreshResolver,
      // Guards
      AuthRoleGuard,
      AdminGuard,
      ProjectManagementGuard,
      ReportingGuard
    ],
    children: featureRoutes
  }
];
