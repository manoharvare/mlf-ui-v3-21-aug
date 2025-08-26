import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { PermissionRefreshService } from '../services/permission-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionRefreshResolver implements Resolve<boolean> {

  constructor(private permissionRefreshService: PermissionRefreshService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🔄 PermissionRefreshResolver - Refreshing permissions for route:', state.url);
    
    return this.permissionRefreshService.refreshPermissions().pipe(
      timeout(3000), // 3 second timeout for route resolution
      catchError(error => {
        console.error('❌ PermissionRefreshResolver - Refresh failed, allowing navigation:', error);
        // Don't block navigation if refresh fails
        return of(true);
      })
    );
  }
}