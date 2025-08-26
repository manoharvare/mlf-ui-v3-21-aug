import { Component, OnInit, OnDestroy, HostListener, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { UserRoleService } from './services/user-role.service';
import { UserRole } from './models/user-role.model';
import { RemoteAuthService } from './core/services/remote-auth.service';

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
export class App implements OnInit, OnDestroy {
  activeItem = signal<string>('home');
  sidebarCollapsed = signal<boolean>(false);
  currentProjectId = signal<string | null>(null);
  private destroy$ = new Subject<void>();

  
  constructor(
    private userRoleService: UserRoleService,
    private router: Router,
    private remoteAuthService: RemoteAuthService,
    private elementRef: ElementRef
  ) {
    // Listen to route changes to update activeItem
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveItemFromRoute(event.url);
    });
  }
  
  ngOnInit(): void {
    // Initialize remote auth service
    console.log('🚀 MLF App - Initializing with remote auth service');
    
    // Subscribe to auth state changes
    this.remoteAuthService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        console.log('🔐 MLF App - Auth state updated:', authState);
        // Handle auth state changes if needed
      });
    
    // Set initial activeItem from current route
    this.updateActiveItemFromRoute(this.router.url);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.toggleSidebar();
    }
  }

  private updateActiveItemFromRoute(url: string): void {
    // Extract the route segment - handle both standalone and micro frontend contexts
    const segments = url.split('/').filter(segment => segment);
    
    // In micro frontend context, the URL might be /mlf/route-name
    // In standalone context, it might be /route-name
    let routeSegment = '';
    
    if (segments.includes('mlf') && segments.length > 1) {
      // Micro frontend context: /mlf/route-name
      const mlfIndex = segments.indexOf('mlf');
      if (segments.length > mlfIndex + 1) {
        routeSegment = segments[mlfIndex + 1];
      }
    } else if (segments.length > 0) {
      // Standalone context: /route-name or direct route
      routeSegment = segments[0];
    }
    
    if (routeSegment) {
      // Handle project configurations with ID
      if (routeSegment === 'project-configurations' && segments.length > 2) {
        this.currentProjectId.set(segments[2]);
        this.activeItem.set('project-configurations');
      } else {
        this.activeItem.set(routeSegment);
        // Reset project ID if not on project configurations
        if (routeSegment !== 'project-configurations') {
          this.currentProjectId.set(null);
        }
      }
    } else {
      // Default to home if no route segment found
      this.activeItem.set('home');
    }
  }
  

  
  handleNavigate(page: string): void {
    this.navigateTo(page);
  }

  navigateTo(route: string): void {
    // Clean the route - remove leading slash if present
    const cleanRoute = route.startsWith('/') ? route.substring(1) : route;
    
    console.log('=== MLF Navigation Debug ===');
    console.log('Original route:', route);
    console.log('Clean route:', cleanRoute);
    console.log('Current router URL:', this.router.url);
    console.log('Current window location:', window.location.pathname);

    // Check if we're in micro frontend context
    const isMicroFrontend = window.location.pathname.includes('/mlf/') || !!(window as any).__webpack_share_scopes__;
  
  
    console.log('Is micro frontend context:', isMicroFrontend);
    if (isMicroFrontend) {
        //TODO add logic to check for other remote projects that are hosted on same domain but different paths
      const remotePath = `mlf/${cleanRoute}`;
      console.log('Remote path:', remotePath);
      // In micro frontend context - navigate using absolute path within the micro frontend
      console.log('Navigating within micro frontend context...');
      this.router.navigateByUrl(`/${remotePath}`).then(success => {
        console.log('✅ Micro frontend navigation success:', success);
        console.log('New router URL:', this.router.url);
        console.log('New window location:', window.location.pathname);
      }).catch(error => {
        console.error('❌ Micro frontend navigation failed:', error);
        // Fallback: try simple navigate
        console.log('Trying simple navigate as fallback...');
        this.router.navigate([cleanRoute]).then(fallbackSuccess => {
          console.log('✅ Fallback navigation success:', fallbackSuccess);
        }).catch(fallbackError => {
          console.error('❌ Fallback navigation also failed:', fallbackError);
        });
      });
    } else {
      // In standalone mode - navigate normally
      console.log('Navigating in standalone mode...');
      this.router.navigate([cleanRoute]).then(success => {
        console.log('✅ Standalone navigation success:', success);
      }).catch(error => {
        console.error('❌ Standalone navigation failed:', error);
      });
    }
    console.log('=== End Navigation Debug ===');
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