import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

export interface CentralizedAuth {
  getToken: () => string | null;
  getAuthState: () => AuthState;
  onAuthStateChange: (callback: (state: AuthState) => void) => any;
  login: () => void;
  logout: () => void;
  refreshToken: (scopes?: string[]) => Promise<string>;
  isTokenValid: (token?: string) => boolean;
  getTokenForUrl: (url: string, scopes?: string[]) => Promise<string>;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteAuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();
  private centralizedAuth: CentralizedAuth | null = null;
  private authSubscription: any = null;

  constructor() {
    this.initializeCentralizedAuth();
  }

  private initializeCentralizedAuth(): void {
    // Check if centralized auth is available from host
    const globalAuth = (window as any).__CENTRALIZED_AUTH__;
    
    if (globalAuth) {
      console.log('🔗 RemoteAuthService - Centralized auth found, connecting...');
      this.centralizedAuth = globalAuth;
      
      // Subscribe to auth state changes from host
      this.authSubscription = this.centralizedAuth!.onAuthStateChange((state: AuthState) => {
        console.log('🔄 RemoteAuthService - Auth state updated from host:', state);
        this.authStateSubject.next(state);
      });

      // Get initial auth state
      const initialState = this.centralizedAuth!.getAuthState();
      console.log('🔍 RemoteAuthService - Initial auth state:', initialState);
      this.authStateSubject.next(initialState);
    } else {
      console.warn('⚠️ RemoteAuthService - Centralized auth not available. Retrying in 1 second...');
      // Retry after a short delay in case the host hasn't loaded yet
      setTimeout(() => this.initializeCentralizedAuth(), 1000);
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    if (this.centralizedAuth) {
      const token = this.centralizedAuth.getToken();
      console.log('🎫 RemoteAuthService - Token requested, available:', !!token);
      return token;
    }
    console.warn('⚠️ RemoteAuthService - No centralized auth available for token request');
    return null;
  }

  /**
   * Get token for specific URL with optional scopes
   */
  async getTokenForUrl(url: string, scopes: string[] = ['user.read']): Promise<string> {
    if (this.centralizedAuth) {
      console.log('🔄 RemoteAuthService - Token requested for URL:', url);
      return await this.centralizedAuth.getTokenForUrl(url, scopes);
    }
    console.warn('⚠️ RemoteAuthService - No centralized auth available for URL token request');
    return '';
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(scopes: string[] = ['user.read']): Promise<string> {
    if (this.centralizedAuth) {
      console.log('🔄 RemoteAuthService - Token refresh requested');
      return await this.centralizedAuth.refreshToken(scopes);
    }
    console.warn('⚠️ RemoteAuthService - No centralized auth available for token refresh');
    return '';
  }

  /**
   * Check if token is valid
   */
  isTokenValid(token?: string): boolean {
    if (this.centralizedAuth) {
      return this.centralizedAuth.isTokenValid(token);
    }
    return false;
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user information
   */
  getUser(): any {
    return this.authStateSubject.value.user;
  }

  /**
   * Trigger login (delegates to host)
   */
  login(): void {
    if (this.centralizedAuth) {
      console.log('🔐 RemoteAuthService - Login requested, delegating to host');
      this.centralizedAuth.login();
    } else {
      console.warn('⚠️ RemoteAuthService - No centralized auth available for login');
    }
  }

  /**
   * Trigger logout (delegates to host)
   */
  logout(): void {
    if (this.centralizedAuth) {
      console.log('🚪 RemoteAuthService - Logout requested, delegating to host');
      this.centralizedAuth.logout();
    } else {
      console.warn('⚠️ RemoteAuthService - No centralized auth available for logout');
    }
  }

  /**
   * Clean up subscriptions
   */
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}