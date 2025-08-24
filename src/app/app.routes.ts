import { Routes, Route } from '@angular/router';
import { App } from './app';


function createRoute(path: string, loadChildren: () => Promise<Routes>): Route {
  return {
    path,
    loadChildren
  };
}

const featureRoutes: Routes = [
  // All feature routes with lazy loading using loadChildren
  createRoute('', () => import('./components/pages/home/home.routes').then(m => m.routes)),
  createRoute('home', () => import('./components/pages/home/home.routes').then(m => m.routes)),
  createRoute('forecast-approvals', () => import('./components/pages/forecast-approvals/forecast-approvals.routes').then(m => m.routes)),
  createRoute('master-data-configurations', () => import('./components/pages/master-data-configurations/master-data-configurations.routes').then(m => m.routes)),
  createRoute('project-configurations', () => import('./components/pages/project-configurations/project-configurations.routes').then(m => m.routes)),
  createRoute('manage-mlf-rules', () => import('./components/pages/manage-mlf-rules/manage-mlf-rules.routes').then(m => m.routes)),
  createRoute('monthly-forecast', () => import('./components/pages/monthly-forecast/monthly-forecast.routes').then(m => m.routes)),
  createRoute('mlf-variance-report', () => import('./components/pages/mlf-variance-report/mlf-variance-report.routes').then(m => m.routes)),
  createRoute('power-bi-reports', () => import('./components/pages/power-bi-reports/power-bi-reports.routes').then(m => m.routes)),
  createRoute('user-management', () => import('./components/pages/user-management/user-management.routes').then(m => m.routes)),
  
  // Fallback route
  {
    path: '**',
    redirectTo: 'home'
  }
];

// export const routes: Routes = featureRoutes;

export const standaloneRoutes: Routes = featureRoutes;

// Routes for micro frontend mode (with App component wrapper and providers)
export const routes: Routes = [
  {
    path: '',
    component: App,
    providers: [],
    children: featureRoutes
  }
];
