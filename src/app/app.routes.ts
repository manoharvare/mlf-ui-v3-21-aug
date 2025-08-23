import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MlfApplicationComponent } from './components/mlf-application/mlf-application.component';
import { UiShowcaseComponent } from './components/ui/ui-showcase.component';
import { ProjectDetailsComponent } from './components/pages/project-details.component';
import { MLFVarianceReportComponent } from './components/pages/mlf-variance-report.component';
import { PowerBIReportsComponent } from './components/pages/power-bi-reports.component';
import { MLFForecastCompleteComponent } from './components/pages/mlf-forecast-complete.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'app', component: MlfApplicationComponent },
  { path: 'project/:id', component: ProjectDetailsComponent },
  { path: 'dashboard', redirectTo: '/app', pathMatch: 'full' },
  { path: 'ui-showcase', component: UiShowcaseComponent },
  { path: '**', redirectTo: '/login' }
];
