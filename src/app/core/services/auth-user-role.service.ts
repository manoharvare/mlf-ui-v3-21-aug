import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { RemoteAuthService } from './remote-auth.service';
import { UserService, User } from './user.service';
import { MasterDataService, Role } from '../../services/master-data.service';
import { UserRoleService } from '../../services/user-role.service';
import { UserRole } from '../../models/user-role.model';

export interface AuthUserState {
  isLoaded: boolean;
  isAuthenticated: boolean;
  user: User | null;
  userRole: UserRole | null;
  backendRole: Role | null;
  permissions: string[];
  canAccessPage: (page: string) => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthUserRoleService {
  private authUserStateSubject = new BehaviorSubject<AuthUserState>({
    isLoaded: false,
    isAuthenticated: false,
    user: null,
    userRole: null,
    backendRole: null,
    permissions: [],
    canAccessPage: () => false
  });

  public authUserState$ = this.authUserStateSubject.asObservable();

  constructor(
    private remoteAuthService: RemoteAuthService,
    private userService: UserService,
    private masterDataService: MasterDataService,
    private userRoleService: UserRoleService
  ) {
    this.initializeAuthUserRole();
  }

  private initializeAuthUserRole(): void {
    // Subscribe to auth state changes from the remote auth service
    this.remoteAuthService.authState$.subscribe(authState => {
      if (authState.isAuthenticated && authState.token && authState.user) {
        console.log('🔐 AuthUserRoleService - Auth state changed, loading user role...');
        this.loadUserFromToken(authState.token, authState.user);
      } else {
        console.log('🔐 AuthUserRoleService - User not authenticated, clearing state');
        this.clearAuthUserState();
      }
    });
  }

  private async loadUserFromToken(token: string, authUser: any): Promise<void> {
    try {
      // Extract email from token (upn field)
      const userEmail = this.extractEmailFromToken(token) || 
                       authUser.email || 
                       authUser.preferredUsername || 
                       authUser.upn;

      if (!userEmail) {
        console.error('🔐 AuthUserRoleService - Could not extract email from token or auth user');
        this.setDefaultAuthUserState(authUser);
        return;
      }

      console.log('🔐 AuthUserRoleService - Extracted user email:', userEmail);

      // Validate user against backend using email
      this.validateUserWithBackend(userEmail).subscribe({
        next: (user) => {
          console.log('✅ AuthUserRoleService - User validated successfully:', user);
          this.loadUserRoleFromBackend(user);
        },
        error: (error) => {
          console.error('❌ AuthUserRoleService - Failed to validate user:', error);
          // Set default state if user validation fails
          this.setDefaultAuthUserState(authUser, userEmail);
        }
      });

    } catch (error) {
      console.error('🔐 AuthUserRoleService - Error loading user from token:', error);
      this.setDefaultAuthUserState(authUser);
    }
  }

  private extractEmailFromToken(token: string): string | null {
    try {
      // Decode JWT token to extract email
      const payload = this.parseJwt(token);
      
      // Try different possible email fields in JWT
      return payload.upn || 
             payload.email || 
             payload.preferred_username || 
             payload.unique_name || 
             null;
    } catch (error) {
      console.error('🔐 AuthUserRoleService - Error parsing JWT token:', error);
      return null;
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('🔐 AuthUserRoleService - Error decoding JWT:', error);
      throw error;
    }
  }

  private validateUserWithBackend(email: string): Observable<User> {
    console.log('🔍 AuthUserRoleService - Validating user with backend:', email);
    
    // Use direct email lookup endpoint
    return this.userService.getUserByEmail(email).pipe(
      map(user => {
        console.log('🔍 AuthUserRoleService - Backend response:', user);
        console.log('🔍 AuthUserRoleService - Found user in backend:', user);
        console.log('🔍 AuthUserRoleService - User role field value:', user.role);
        console.log('🔍 AuthUserRoleService - User role type:', typeof user.role);
        console.log('🔍 AuthUserRoleService - User role === "admin":', user.role === 'admin');
        return user;
      }),
      catchError(error => {
        console.error('🔍 AuthUserRoleService - User validation failed:', error);
        throw error;
      })
    );
  }

  private loadUserRoleFromBackend(user: User): void {
    console.log('🔍 AuthUserRoleService - Loading role from backend for user role:', user.role);
    
    // Check if user already has roleNavigation loaded from backend
    if (user.roleNavigation) {
      console.log('✅ AuthUserRoleService - User already has role navigation loaded:', user.roleNavigation);
      this.setAuthUserStateFromBackendRole(user, user.roleNavigation);
      return;
    }
    
    console.log('🔍 AuthUserRoleService - Role navigation not loaded, fetching from master data service');
    console.log('🔍 AuthUserRoleService - Looking for role with code:', user.role);
    
    // Fallback: Get all roles from backend and find the user's role
    this.masterDataService.getRoles(1, 1000).subscribe({
      next: (result) => {
        console.log('🔍 AuthUserRoleService - All roles from backend:', result);
        console.log('🔍 AuthUserRoleService - Available role codes:', result.items.map(r => r.code));
        
        const backendRole = result.items.find(role => 
          role.code === user.role && role.isActive
        );
        
        console.log('🔍 AuthUserRoleService - Searching for role code:', user.role);
        console.log('🔍 AuthUserRoleService - Found matching role:', backendRole);
        
        if (backendRole) {
          console.log('✅ AuthUserRoleService - Found backend role:', backendRole);
          this.setAuthUserStateFromBackendRole(user, backendRole);
        } else {
          console.warn('🔐 AuthUserRoleService - Backend role not found for user role:', user.role);
          console.warn('🔐 AuthUserRoleService - Available roles:', result.items.map(r => ({ code: r.code, name: r.name, isActive: r.isActive })));
          this.setDefaultAuthUserState(null, user.emailId);
        }
      },
      error: (error) => {
        console.error('❌ AuthUserRoleService - Failed to load roles from backend:', error);
        this.setDefaultAuthUserState(null, user.emailId);
      }
    });
  }

  private setAuthUserStateFromBackendRole(user: User, backendRole: Role): void {
    // Transform backend role to UserRole format for the UserRoleService
    const userRole: UserRole = {
      id: backendRole.code,
      name: backendRole.name,
      description: backendRole.description,
      permissions: backendRole.permissionsList || [],
      icon: backendRole.icon,
      color: backendRole.color,
      isReadOnly: backendRole.isReadOnly
    };

    // Set the current user role in the UserRoleService
    this.userRoleService.setCurrentUserRole(userRole);

    const newState: AuthUserState = {
      isLoaded: true,
      isAuthenticated: true,
      user: user,
      userRole: userRole,
      backendRole: backendRole,
      permissions: backendRole.permissionsList || [],
      canAccessPage: (page: string) => (backendRole.permissionsList || []).includes(page)
    };

    console.log('🔐 AuthUserRoleService - Setting auth user state from backend role:', {
      userName: user.userName,
      email: user.emailId,
      roleCode: backendRole.code,
      roleName: backendRole.name,
      permissions: backendRole.permissionsList || []
    });

    this.authUserStateSubject.next(newState);
  }

  private setDefaultAuthUserState(authUser: any, email?: string): void {
    // Create a default user when validation fails
    const defaultUser: User = {
      id: 0,
      userName: authUser?.name || email || 'Unknown User',
      emailId: email || authUser?.email || 'unknown@example.com',
      role: '', 
      status: 'inactive',
      yardLocations: [],
      assignedProjects: []
    };

    // Get the default role from UserRoleService (fallback roles)
    const availableRoles = this.userRoleService.getAvailableRoles()();
    const defaultRole = availableRoles.length > 0 ? availableRoles[0] : null;

    if (defaultRole) {
      this.userRoleService.setCurrentUserRole(defaultRole);
    }

    const newState: AuthUserState = {
      isLoaded: true,
      isAuthenticated: true,
      user: defaultUser,
      userRole: defaultRole,
      backendRole: null,
      permissions: defaultRole?.permissions || [],
      canAccessPage: (page: string) => defaultRole?.permissions.includes(page) || false
    };

    console.log('🔐 AuthUserRoleService - Setting default auth user state:', newState);
    this.authUserStateSubject.next(newState);
  }

  private clearAuthUserState(): void {
    this.userRoleService.clearCurrentUserRole();
    
    this.authUserStateSubject.next({
      isLoaded: false,
      isAuthenticated: false,
      user: null,
      userRole: null,
      backendRole: null,
      permissions: [],
      canAccessPage: () => false
    });
  }

  // Public methods for components to use
  getCurrentUser(): User | null {
    return this.authUserStateSubject.value.user;
  }

  getCurrentUserRole(): UserRole | null {
    return this.authUserStateSubject.value.userRole;
  }

  getBackendRole(): Role | null {
    return this.authUserStateSubject.value.backendRole;
  }

  getPermissions(): string[] {
    return this.authUserStateSubject.value.permissions;
  }

  hasPermission(permission: string): boolean {
    return this.authUserStateSubject.value.permissions.includes(permission);
  }

  canAccessPage(page: string): boolean {
    return this.authUserStateSubject.value.canAccessPage(page);
  }

  isLoaded(): boolean {
    return this.authUserStateSubject.value.isLoaded;
  }

  isAuthenticated(): boolean {
    return this.authUserStateSubject.value.isAuthenticated;
  }

  // Method to refresh user role (useful for admin changes)
  refreshUserRole(): void {
    const authState = this.remoteAuthService.getAuthState();
    if (authState.isAuthenticated && authState.token && authState.user) {
      this.loadUserFromToken(authState.token, authState.user);
    }
  }

  // Get available roles from UserRoleService
  getAvailableRoles(): UserRole[] {
    return this.userRoleService.getAvailableRoles()();
  }

  // Set user role (for role switching)
  setUserRole(role: UserRole): void {
    this.userRoleService.setCurrentUserRole(role);
    
    // Update the current auth state with the new role
    const currentState = this.authUserStateSubject.value;
    if (currentState.user) {
      const newState: AuthUserState = {
        ...currentState,
        userRole: role,
        permissions: role.permissions,
        canAccessPage: (page: string) => role.permissions.includes(page)
      };
      this.authUserStateSubject.next(newState);
    }
  }
}