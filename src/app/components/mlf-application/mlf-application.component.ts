import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserRoleService } from '../../services/user-role.service';
import { UserRole } from '../../models/user-role.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { HomeComponent } from '../pages/home.component';
import { MasterDataConfigurationsComponent } from '../pages/master-data-configurations.component';
import { ProjectConfigurationsComponent } from '../pages/project-configurations.component';
import { ForecastApprovalsComponent } from '../pages/forecast-approvals.component';
import { ManageMLFRulesComponent } from '../pages/manage-mlf-rules.component';
import { MLFVarianceReportComponent } from '../pages/mlf-variance-report.component';
import { PowerBIReportsComponent } from '../pages/power-bi-reports.component';
import { UserManagementComponent } from '../pages/user-management.component';
import { ProjectDetailsComponent } from '../pages/project-details.component';
import { MLFForecastCompleteComponent } from '../pages/mlf-forecast-complete.component';

@Component({
  selector: 'app-mlf-application',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    HomeComponent,
    MLFForecastCompleteComponent,
    MasterDataConfigurationsComponent,
    ProjectConfigurationsComponent,
    ForecastApprovalsComponent,
    ManageMLFRulesComponent,
    MLFVarianceReportComponent,
    PowerBIReportsComponent,
    UserManagementComponent,
    ProjectDetailsComponent
  ],
  template: `
    <div class="flex h-screen bg-background">
      <!-- Sidebar wrapper with conditional width (React pattern) -->
      <div [class]="getSidebarWrapperClasses()" class="h-full transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0">
        <app-sidebar
          [activeItem]="activeItem()"
          [currentUser]="currentUser()"
          (navigate)="handleNavigate($event)"
          (onLogout)="handleLogout()"
        ></app-sidebar>
      </div>
      
      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-header
          [title]="getCurrentPageTitle()"
          [subtitle]="getCurrentPageSubtitle()"
          [currentUser]="currentUser()"
          [availableRoles]="availableRoles()"
          [showSidebarToggle]="true"
          [isSidebarCollapsed]="isSidebarCollapsed()"
          (toggleSidebar)="toggleSidebar()"
          (roleChange)="handleRoleChange($event)"
        ></app-header>
        
        <!-- Page content -->
        <main class="flex-1 overflow-auto bg-background">
          <!-- Home/Dashboard -->
          <div *ngIf="activeItem() === 'home'">
            <app-home 
              [currentUser]="currentUser()?.name || 'User'"
              (navigate)="handleNavigate($event)"
            ></app-home>
          </div>
          
          <!-- Monthly Forecast -->
          <div *ngIf="activeItem() === 'monthly-forecast'">
            <app-mlf-forecast-complete></app-mlf-forecast-complete>
          </div>
          
          <!-- Master Data Configurations -->
          <div *ngIf="activeItem() === 'master-data-configurations'">
            <app-master-data-configurations></app-master-data-configurations>
          </div>
          
          <!-- Project Configurations -->
          <div *ngIf="activeItem() === 'project-configurations' && !currentProjectId()">
            <app-project-configurations 
              (navigateToDetails)="handleNavigateToProjectDetails($event)"
              (navigateToConfig)="handleNavigateToProjectConfig($event)"
            ></app-project-configurations>
          </div>
          
          <!-- Project Details -->
          <div *ngIf="activeItem() === 'project-configurations' && currentProjectId()">
            <app-project-details 
              [projectId]="currentProjectId()!"
              (back)="handleBackToProjectList()"
            ></app-project-details>
          </div>
          
          <!-- Forecast Approvals -->
          <div *ngIf="activeItem() === 'forecast-approvals'">
            <app-forecast-approvals></app-forecast-approvals>
          </div>
          
          <!-- Manage MLF Rules -->
          <div *ngIf="activeItem() === 'manage-mlf-rules'">
            <app-manage-mlf-rules></app-manage-mlf-rules>
          </div>
          
          <!-- MLF Variance Report -->
          <div *ngIf="activeItem() === 'mlf-variance-report'">
            <app-mlf-variance-report></app-mlf-variance-report>
          </div>
          
          <!-- Power BI Reports -->
          <div *ngIf="activeItem() === 'power-bi-reports'">
            <app-power-bi-reports></app-power-bi-reports>
          </div>
          
          <!-- User Management -->
          <div *ngIf="activeItem() === 'user-management'">
            <app-user-management></app-user-management>
          </div>
        </main>
      </div>
    </div>
  `
})
export class MlfApplicationComponent implements OnInit {
  activeItem = signal<string>('home');
  currentUser = signal<UserRole | null>(null);
  availableRoles = signal<UserRole[]>([]);
  sidebarCollapsed = signal<boolean>(false);
  currentProjectId = signal<string | null>(null);

  
  constructor(
    private userRoleService: UserRoleService,
    private router: Router
  ) {
    // Set up effect to watch for user role changes
    effect(() => {
      const user = this.userRoleService.getCurrentUserRole()();
      this.currentUser.set(user);
      this.checkActiveItemPermission();
    });
  }
  
  ngOnInit(): void {
    // Get available roles
    this.availableRoles.set(this.userRoleService.getAvailableRoles()());
  }
  
  private checkActiveItemPermission(): void {
    const user = this.currentUser();
    if (user && !user.permissions.includes(this.activeItem())) {
      // If current active item is not in user permissions, switch to first available
      const availablePage = user.permissions.find(permission => 
        Object.keys(this.userRoleService.getPageConfig).includes(permission)
      );
      if (availablePage) {
        this.activeItem.set(availablePage);
      }
    }
  }
  
  handleNavigate(page: string): void {
    this.activeItem.set(page);
    // Reset project details when switching pages
    if (page !== 'project-configurations') {
      this.currentProjectId.set(null);
    }
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }
  
  isSidebarCollapsed(): boolean {
    return this.sidebarCollapsed();
  }
  
  getSidebarWrapperClasses(): string {
    return this.sidebarCollapsed() ? 'w-0' : 'w-80';
  }
  
  handleLogout(): void {
    this.userRoleService.clearCurrentUserRole();
    this.router.navigate(['/login']);
  }
  
  handleRoleChange(role: UserRole): void {
    this.userRoleService.setCurrentUserRole(role);
  }
  
  handleNavigateToProjectDetails(projectId: string): void {
    console.log('Navigate to project details:', projectId);
    this.currentProjectId.set(projectId);
  }

  handleNavigateToProjectConfig(projectId: string): void {
    console.log('Navigate to project config:', projectId);
    this.currentProjectId.set(projectId);
  }

  handleBackToProjectList(): void {
    this.currentProjectId.set(null);
  }
  
  getCurrentPageTitle(): string {
    if (this.activeItem() === 'project-configurations' && this.currentProjectId()) {
      return `Project ${this.currentProjectId()?.split('-')[1] || '1'} Dataset Details`;
    }
    return this.userRoleService.getPageConfig()[this.activeItem()]?.title || '';
  }
  
  getCurrentPageSubtitle(): string {
    if (this.activeItem() === 'project-configurations' && this.currentProjectId()) {
      return `Detailed dataset analysis and management for Project ${this.currentProjectId()?.split('-')[1] || '1'}`;
    }
    return this.userRoleService.getPageConfig()[this.activeItem()]?.subtitle || '';
  }
  
  getRoleDisplayName(): string {
    const roleDisplayNames: { [key: string]: string } = {
      'super-admin': 'Super Admin',
      'mlf-admin': 'MLF Admin',
      'planner': 'Planner',
      'approver': 'Approver',
      'fab-management': 'Fab Management',
      'view-only-user': 'View Only'
    };
    
    return this.currentUser()?.id 
      ? roleDisplayNames[this.currentUser()!.id] || this.currentUser()!.id 
      : 'User';
  }
}