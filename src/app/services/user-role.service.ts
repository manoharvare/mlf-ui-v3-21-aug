import { Injectable, signal } from '@angular/core';
import { PageConfigMap, UserRole } from '../models/user-role.model';

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

  constructor() {
    // Initialize with default roles (these would typically come from an API)
    this.initializeRoles();
  }

  private initializeRoles(): void {
    // Define user roles (simplified without actual icon components for now)
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
        id: 'mlf-admin',
        name: 'MLF Admin',
        description: 'Administrative access to MLF configurations, project setup, rules management, and user administration',
        permissions: ['home', 'master-data-configurations', 'project-configurations', 'manage-mlf-rules', 'mlf-variance-report', 'user-management'],
        icon: 'user-check',
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      {
        id: 'planner',
        name: 'Planner',
        description: 'Standard planner with access to forecasting, variance reporting, and analytics functions',
        permissions: ['home', 'monthly-forecast', 'mlf-variance-report', 'power-bi-reports'],
        icon: 'user',
        color: 'bg-green-500 hover:bg-green-600'
      },
      {
        id: 'approver',
        name: 'Approver',
        description: 'Review and approval access to forecasts, variance analysis, and comprehensive reporting',
        permissions: ['home', 'monthly-forecast', 'forecast-approvals', 'mlf-variance-report', 'power-bi-reports'],
        icon: 'check-circle',
        color: 'bg-purple-500 hover:bg-purple-600'
      },
      {
        id: 'fab-management',
        name: 'Fab Management',
        description: 'Executive reporting access with comprehensive analytics and variance reporting capabilities',
        permissions: ['home', 'mlf-variance-report', 'power-bi-reports'],
        icon: 'bar-chart-3',
        color: 'bg-indigo-500 hover:bg-indigo-600'
      },
      {
        id: 'view-only-user',
        name: 'View Only User',
        description: 'Read-only access to forecasting, variance reporting, and analytics with no editing capabilities',
        permissions: ['home', 'monthly-forecast', 'mlf-variance-report', 'power-bi-reports'],
        icon: 'eye',
        color: 'bg-gray-500 hover:bg-gray-600',
        isReadOnly: true
      }
    ];
    
    this.availableRoles.set(roles);
    // Set default role to super-admin
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
}