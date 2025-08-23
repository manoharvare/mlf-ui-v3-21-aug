import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MlfApplicationComponent } from './components/mlf-application/mlf-application.component';
import { UiShowcaseComponent } from './components/ui/ui-showcase.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: MlfApplicationComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      
      // MLF Dashboard
      { 
        path: 'home', 
        loadComponent: () => import('./components/pages/home.component').then(m => m.HomeComponent)
      },
      
      // Forecast Approvals
      { 
        path: 'forecast-approvals', 
        loadComponent: () => import('./components/pages/forecast-approvals.component').then(m => m.ForecastApprovalsComponent)
      },
      
      // MLF Configuration Routes
      { 
        path: 'master-data-configurations', 
        loadComponent: () => import('./components/pages/master-data-configurations.component').then(m => m.MasterDataConfigurationsComponent)
      },
      { 
        path: 'project-configurations', 
        loadComponent: () => import('./components/pages/project-configurations.component').then(m => m.ProjectConfigurationsComponent)
      },
      { 
        path: 'project-configurations/:id', 
        loadComponent: () => import('./components/pages/project-details.component').then(m => m.ProjectDetailsComponent)
      },
      
      // Manage MLF Rules
      { 
        path: 'manage-mlf-rules', 
        loadComponent: () => import('./components/pages/manage-mlf-rules.component').then(m => m.ManageMLFRulesComponent)
      },
      
      // MLF Toolkit & Reports Routes
      { 
        path: 'monthly-forecast', 
        loadComponent: () => import('./components/pages/mlf-forecast-complete.component').then(m => m.MLFForecastCompleteComponent)
      },
      { 
        path: 'mlf-variance-report', 
        loadComponent: () => import('./components/pages/mlf-variance-report.component').then(m => m.MLFVarianceReportComponent)
      },
      { 
        path: 'power-bi-reports', 
        loadComponent: () => import('./components/pages/power-bi-reports.component').then(m => m.PowerBIReportsComponent)
      },
      
      // User Management
      { 
        path: 'user-management', 
        loadComponent: () => import('./components/pages/user-management.component').then(m => m.UserManagementComponent)
      }
    ]
  },
  { path: 'ui-showcase', component: UiShowcaseComponent },
  { path: '**', redirectTo: '/dashboard/home' }
];
