import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, timeout, take } from 'rxjs/operators';
import { AuthUserRoleService } from './auth-user-role.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionRefreshService {

  constructor(private authUserRoleService: AuthUserRoleService) {}

  /**
   * Refreshes user permissions from database before page load
   * Returns an observable that completes when permissions are refreshed
   */
  refreshPermissions(): Observable<boolean> {
    console.log('🔄 PermissionRefreshService - Refreshing permissions from database...');
    
    // Check if user is authenticated first using the service method
    if (!this.authUserRoleService.isAuthenticated()) {
      console.log('🔄 PermissionRefreshService - User not authenticated, skipping refresh');
      return of(true);
    }

    // Trigger permission refresh
    this.authUserRoleService.refreshUserRole();

    // Wait for the refresh to complete by monitoring the auth state
    return this.authUserRoleService.authUserState$.pipe(
      // Wait for the state to be loaded after refresh
      map(authState => {
        if (authState.isLoaded) {
          console.log('✅ PermissionRefreshService - Permissions refreshed successfully:', {
            user: authState.user?.userName,
            role: authState.userRole?.name,
            permissions: authState.permissions,
            timestamp: new Date().toISOString()
          });
          return true;
        }
        return false;
      }),
      // Take the first successful refresh
      timeout(5000), // 5 second timeout
      catchError(error => {
        console.error('❌ PermissionRefreshService - Failed to refresh permissions:', error);
        // Don't block navigation on refresh failure
        return of(true);
      })
    );
  }

  /**
   * Force refresh permissions and return a promise
   * Useful for manual refresh triggers
   */
  async forceRefreshPermissions(): Promise<boolean> {
    try {
      console.log('🔄 PermissionRefreshService - Force refreshing permissions...');
      const result = await this.refreshPermissions().pipe(take(1)).toPromise();
      console.log('✅ PermissionRefreshService - Force refresh completed:', result);
      return result || false;
    } catch (error) {
      console.error('❌ PermissionRefreshService - Force refresh failed:', error);
      return false;
    }
  }
}