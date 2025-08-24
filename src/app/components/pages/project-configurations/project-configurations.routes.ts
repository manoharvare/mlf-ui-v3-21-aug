import { Routes } from '@angular/router';
import { ProjectConfigurationsComponent } from './project-configurations.component';
import { ProjectDetailsComponent } from './project-details.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectConfigurationsComponent
  },
  {
    path: ':id',
    component: ProjectDetailsComponent
  }
];