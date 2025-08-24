import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { UserRoleService } from './services/user-role.service';
import { UserRole } from './models/user-role.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './app.html',
})
export class App implements OnInit {
  activeItem = signal<string>('home');
  currentUser = signal<UserRole | null>(null);
  availableRoles = signal<UserRole[]>([]);
  sidebarCollapsed = signal<boolean>(false);
  currentProjectId = signal<string | null>(null);

  
  constructor(
    private userRoleService: UserRoleService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Set up effect to watch for user role changes
    effect(() => {
      const user = this.userRoleService.getCurrentUserRole()();
      this.currentUser.set(user);
      this.checkActiveItemPermission();
    });

    // Listen to route changes to update activeItem
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveItemFromRoute(event.url);
    });
  }
  
  ngOnInit(): void {
    // Get available roles
    this.availableRoles.set(this.userRoleService.getAvailableRoles()());
    
    // Set initial activeItem from current route
    this.updateActiveItemFromRoute(this.router.url);
  }

  private updateActiveItemFromRoute(url: string): void {
    // Extract the route segment after /dashboard/
    const segments = url.split('/');
    const dashboardIndex = segments.indexOf('dashboard');
    
    if (dashboardIndex !== -1 && segments.length > dashboardIndex + 1) {
      const routeSegment = segments[dashboardIndex + 1];
      
      // Handle project configurations with ID
      if (routeSegment === 'project-configurations' && segments.length > dashboardIndex + 2) {
        this.currentProjectId.set(segments[dashboardIndex + 2]);
        this.activeItem.set('project-configurations');
      } else {
        this.activeItem.set(routeSegment);
        // Reset project ID if not on project configurations
        if (routeSegment !== 'project-configurations') {
          this.currentProjectId.set(null);
        }
      }
    }
  }
  
  private checkActiveItemPermission(): void {
    const user = this.currentUser();
    if (user && !user.permissions.includes(this.activeItem())) {
      // If current active item is not in user permissions, switch to first available
      const availablePage = user.permissions.find(permission => 
        Object.keys(this.userRoleService.getPageConfig).includes(permission)
      );
      if (availablePage) {
        this.router.navigate(['/dashboard', availablePage]);
      }
    }
  }
  
  handleNavigate(page: string): void {
    this.router.navigate(['/dashboard', page]);
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
}