import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap, delay, filter, timeout, catchError, switchMap } from 'rxjs/operators';
import { AuthUserRoleService } from '../services/auth-user-role.service';
import { PermissionRefreshService } from '../services/permission-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRoleGuard implements CanActivate {

  constructor(
    private authUserRoleService: AuthUserRoleService,
    private permissionRefreshService: PermissionRefreshService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🛡️ AuthRoleGuard - Checking access for route:', state.url);

    // First refresh permissions from database, then check access
    return this.permissionRefreshService.refreshPermissions().pipe(
      switchMap(() => this.authUserRoleService.authUserState$),
      // Wait for auth state to be loaded, with timeout
      filter(authUserState => authUserState.isLoaded),
      take(1),
      timeout(10000), // 10 second timeout
      map(authUserState => {
        // If not authenticated, allow access to home, deny others
        if (!authUserState.isAuthenticated) {
          const pageName = this.extractPageNameFromRoute(state.url);
          if (pageName === 'home') {
            console.log('🛡️ AuthRoleGuard - Allowing access to home for unauthenticated user');
            return true;
          }
          console.log('🛡️ AuthRoleGuard - User not authenticated, redirecting to home');
          this.router.navigate(['/home']);
          return false;
        }

        // Extract the page name from the route
        const pageName = this.extractPageNameFromRoute(state.url);
        
        // Always allow access to home
        if (pageName === 'home') {
          console.log('🛡️ AuthRoleGuard - Allowing access to home');
          return true;
        }
        
        // Check if user can access this page based on database permissions
        const canAccess = authUserState.canAccessPage(pageName);
        
        if (!canAccess) {
          console.log('🛡️ AuthRoleGuard - Access denied for route:', state.url);
          console.log('🛡️ AuthRoleGuard - User role:', authUserState.userRole?.name);
          console.log('🛡️ AuthRoleGuard - User permissions from database:', authUserState.permissions);
          console.log('🛡️ AuthRoleGuard - Required page permission:', pageName);
          
          // Redirect to home page
          this.router.navigate(['/home']);
          return false;
        }

        console.log('✅ AuthRoleGuard - Access granted for route:', state.url);
        return true;
      }),
    catchError(error => {
          console.error('🛡️ AuthRoleGuard - Error or timeout:', error);
        // On error or timeout, allow access to home, deny others
        const pageName = this.extractPageNameFromRoute(state.url);
        if (pageName === 'home') {
          return of(true);
        }
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }

  private extractPageNameFromRoute(url: string): string {
    // Remove leading slash and split into segments
    const segments = url.replace(/^\//, '').split('/');
    
    // For micro frontend URLs like /mlf/forecast-approvals, take the second segment
    // For standalone URLs like /forecast-approvals, take the first segment
    if (segments.length > 1 && segments[0] === 'mlf') {
      return segments[1] || 'home';
    }
    
    return segments[0] || 'home';
  }
}

// Guard for admin-only routes (user-management)
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authUserRoleService: AuthUserRoleService,
    private permissionRefreshService: PermissionRefreshService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🛡️ AdminGuard - Checking admin access for route:', state.url);

    // First refresh permissions from database, then check access
    return this.permissionRefreshService.refreshPermissions().pipe(
      switchMap(() => this.authUserRoleService.authUserState$),
      filter(authUserState => authUserState.isLoaded),
      take(1),
      timeout(10000),
      map(authUserState => {
        if (!authUserState.isAuthenticated) {
          console.log('🛡️ AdminGuard - User not authenticated');
          this.router.navigate(['/home']);
          return false;
        }

        // Check if user has user-management permission from database
        const isAdmin = authUserState.permissions.includes('user-management');
        
        if (!isAdmin) {
          console.log('🛡️ AdminGuard - Access denied. User does not have user-management permission:', {
            isLoaded: authUserState.isLoaded,
            isAuthenticated: authUserState.isAuthenticated,
            role: authUserState.userRole?.name,
            permissions: authUserState.permissions,
            backendRole: authUserState.backendRole?.name
          });
          this.router.navigate(['/home']);
          return false;
        }

        console.log('✅ AdminGuard - Admin access granted for route:', state.url);
        return true;
      }),
      catchError(error => {
        console.error('🛡️ AdminGuard - Error or timeout:', error);
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}

// Guard for project management routes
@Injectable({
  providedIn: 'root'
})
export class ProjectManagementGuard implements CanActivate {

  constructor(
    private authUserRoleService: AuthUserRoleService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🛡️ ProjectManagementGuard - Checking project management access for route:', state.url);

    return this.authUserRoleService.authUserState$.pipe(
      filter(authUserState => authUserState.isLoaded),
      take(1),
      timeout(10000),
      map(authUserState => {
        if (!authUserState.isAuthenticated) {
          console.log('🛡️ ProjectManagementGuard - User not authenticated');
          this.router.navigate(['/home']);
          return false;
        }

        const pageName = this.extractPageNameFromRoute(state.url);
        
        // Check if user has the specific permission for this page from database
        const canAccess = authUserState.permissions.includes(pageName);
        
        if (!canAccess) {
          console.log('🛡️ ProjectManagementGuard - Access denied for project management route:', {
            route: state.url,
            pageName: pageName,
            userPermissions: authUserState.permissions,
            role: authUserState.userRole?.name
          });
          this.router.navigate(['/home']);
          return false;
        }

        console.log('✅ ProjectManagementGuard - Project management access granted for route:', state.url);
        return true;
      }),
      catchError(error => {
        console.error('🛡️ ProjectManagementGuard - Error or timeout:', error);
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }

  private extractPageNameFromRoute(url: string): string {
    // Remove leading slash and split into segments
    const segments = url.replace(/^\//, '').split('/');
    
    // For micro frontend URLs like /mlf/forecast-approvals, take the second segment
    // For standalone URLs like /forecast-approvals, take the first segment
    if (segments.length > 1 && segments[0] === 'mlf') {
      return segments[1] || 'home';
    }
    
    return segments[0] || 'home';
  }
}

// Guard for reporting routes
@Injectable({
  providedIn: 'root'
})
export class ReportingGuard implements CanActivate {

  constructor(
    private authUserRoleService: AuthUserRoleService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🛡️ ReportingGuard - Checking reporting access for route:', state.url);

    return this.authUserRoleService.authUserState$.pipe(
      filter(authUserState => authUserState.isLoaded),
      take(1),
      timeout(10000),
      map(authUserState => {
        if (!authUserState.isAuthenticated) {
          console.log('🛡️ ReportingGuard - User not authenticated');
          this.router.navigate(['/home']);
          return false;
        }

        const pageName = this.extractPageNameFromRoute(state.url);
        
        // Check if user has the specific permission for this page from database
        const canAccess = authUserState.permissions.includes(pageName);
        
        if (!canAccess) {
          console.log('🛡️ ReportingGuard - Access denied for reporting route:', {
            route: state.url,
            pageName: pageName,
            userPermissions: authUserState.permissions,
            role: authUserState.userRole?.name
          });
          this.router.navigate(['/home']);
          return false;
        }

        console.log('✅ ReportingGuard - Reporting access granted for route:', state.url);
        return true;
      }),
      catchError(error => {
        console.error('🛡️ ReportingGuard - Error or timeout:', error);
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }

  private extractPageNameFromRoute(url: string): string {
    // Remove leading slash and split into segments
    const segments = url.replace(/^\//, '').split('/');
    
    // For micro frontend URLs like /mlf/forecast-approvals, take the second segment
    // For standalone URLs like /forecast-approvals, take the first segment
    if (segments.length > 1 && segments[0] === 'mlf') {
      return segments[1] || 'home';
    }
    
    return segments[0] || 'home';
  }
}