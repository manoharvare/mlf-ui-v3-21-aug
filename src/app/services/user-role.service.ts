import { Injectable, signal } from '@angular/core';
import { PageConfigMap, UserRole } from '../models/user-role.model';
import { MasterDataService, Role } from './master-data.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private currentUserRole = signal<UserRole | null>(null);
  private availableRoles = signal<UserRole[]>([]);
  
  // This will be populated with actual components once they're created
  private pageConfig: PageConfigMap = {
    'home': {
      title: 'MLF Dashboard',
      subtitle: 'Overview of recent activities, approval summaries, and key MLF metrics to help you monitor system performance and track forecast progress',
      component: {} as any // Placeholder, will be replaced with actual component
    },
    'master-data-configurations': {
      title: 'Master Data Configurations',
      subtitle: 'Set up and maintain foundational data including Global Activity Codes, Standard Craft definitions, work breakdown structures, and reference tables used across all MLF calculations',
      component: {} as any
    },
    'project-configurations': {
      title: 'Project Setup & Config',
      subtitle: 'Create, configure, and manage individual project datasets including P6 data import, activity mapping, craft assignments, and project-specific parameters for accurate labor forecasting',
      component: {} as any
    },
    'monthly-forecast': {
      title: 'Monthly Forecast',
      subtitle: 'Generate and review monthly labor forecasts using hierarchical tree structures, apply business rules, and create detailed workforce predictions by craft, activity, and time period',
      component: {} as any
    },
    'forecast-approvals': {
      title: 'Forecast Approvals',
      subtitle: 'Review, validate, and approve submitted monthly labor forecasts with detailed comparison views, approval workflows, and commentary tracking for audit trails',
      component: {} as any
    },
    'manage-mlf-rules': {
      title: 'Manage MLF Rules',
      subtitle: 'Create and configure business rules that govern MLF calculations including P6 to L4 breakdowns, task mapping logic, variance calculations, and automated forecast adjustments',
      component: {} as any
    },
    'mlf-variance-report': {
      title: 'MLF Variance Report',
      subtitle: 'Analyze differences between forecasted and actual labor hours with detailed variance breakdowns by project, craft, time period, and organizational hierarchy for performance insights',
      component: {} as any
    },
    'power-bi-reports': {
      title: 'Power BI Reports',
      subtitle: 'Access comprehensive analytics dashboards and executive reports with interactive visualizations, trend analysis, and data export capabilities for strategic decision making',
      component: {} as any
    },
    'user-management': {
      title: 'User Management',
      subtitle: 'Manage user accounts, role assignments, and access permissions across the MLF system with support for hierarchical approval workflows and audit logging',
      component: {} as any
    }
  };

  constructor(private masterDataService: MasterDataService) {
    // Load roles from backend on service initialization
    this.loadRolesFromBackend();
  }

  private loadRolesFromBackend(): void {
    // Get all roles and filter active ones
    this.masterDataService.getRoles(1, 1000).subscribe({
      next: (result) => {
        const activeRoles = result.items.filter(role => role.isActive);
        const userRoles: UserRole[] = activeRoles.map(role => this.transformBackendRoleToUserRole(role));
        this.availableRoles.set(userRoles);
        // Set default role to first available role
        if (userRoles.length > 0) {
          this.currentUserRole.set(userRoles[0]);
        }
      },
      error: (error) => {
        console.error('Failed to load roles from backend:', error);
        // Fallback to hardcoded roles if backend fails
        this.initializeFallbackRoles();
      }
    });
  }

  private transformBackendRoleToUserRole(backendRole: Role): UserRole {
    return {
      id: backendRole.code,
      name: backendRole.name,
      description: backendRole.description,
      permissions: backendRole.permissions,
      icon: backendRole.icon,
      color: backendRole.color,
      isReadOnly: backendRole.isReadOnly
    };
  }

  private initializeFallbackRoles(): void {
    // Fallback roles in case backend is not available
    const roles: UserRole[] = [
      {
        id: 'super-admin',
        name: 'All Access',
        description: 'Full system access with all menu items and administrative privileges for MLF operations',
        permissions: ['home', 'monthly-forecast', 'master-data-configurations', 'project-configurations', 'manage-mlf-rules', 'mlf-variance-report', 'power-bi-reports', 'user-management'],
        icon: 'shield',
        color: 'bg-red-500 hover:bg-red-600'
      },
      {
        id: 'planner',
        name: 'Planner',
        description: 'Standard planner with access to forecasting, variance reporting, and analytics functions',
        permissions: ['home', 'monthly-forecast', 'mlf-variance-report', 'power-bi-reports'],
        icon: 'user',
        color: 'bg-green-500 hover:bg-green-600'
      }
    ];
    
    this.availableRoles.set(roles);
    this.currentUserRole.set(roles[0]);
  }

  getCurrentUserRole() {
    return this.currentUserRole;
  }

  getAvailableRoles() {
    return this.availableRoles;
  }

  setCurrentUserRole(role: UserRole | null) {
    this.currentUserRole.set(role);
  }
  
  clearCurrentUserRole() {
    this.currentUserRole.set(null);
  }

  getPageConfig() {
    return this.pageConfig;
  }

  // Method to register components with the page config
  registerComponent(key: string, component: any) {
    if (this.pageConfig[key]) {
      this.pageConfig[key].component = component;
    }
  }

  // Method to refresh roles from backend
  refreshRoles(): Observable<UserRole[]> {
    return this.masterDataService.getRoles(1, 1000).pipe(
      map((result) => {
        const activeRoles = result.items.filter(role => role.isActive);
        const userRoles: UserRole[] = activeRoles.map(role => this.transformBackendRoleToUserRole(role));
        this.availableRoles.set(userRoles);
        return userRoles;
      })
    );
  }

  // Method to get role by code
  getRoleByCode(code: string): UserRole | null {
    return this.availableRoles().find(role => role.id === code) || null;
  }
}