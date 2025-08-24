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
        if (state.token) {
          console.log('🎫 RemoteAuthService - Auth token received from host:', {
            tokenLength: state.token.length,
            tokenPreview: state.token.substring(0, 20) + '...',
            isAuthenticated: state.isAuthenticated,
            user: state.user?.displayName || state.user?.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('⚠️ RemoteAuthService - No token in auth state from host');
        }
        this.authStateSubject.next(state);
      });

      // Get initial auth state
      const initialState = this.centralizedAuth!.getAuthState();
      console.log('🔍 RemoteAuthService - Initial auth state:', initialState);
      if (initialState.token) {
        console.log('🎫 RemoteAuthService - Initial auth token received from host:', {
          tokenLength: initialState.token.length,
          tokenPreview: initialState.token.substring(0, 20) + '...',
          isAuthenticated: initialState.isAuthenticated,
          user: initialState.user?.displayName || initialState.user?.name || 'Unknown',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('⚠️ RemoteAuthService - No initial token available from host');
      }
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
      if (token) {
        console.log('🎫 RemoteAuthService - Token retrieved from host:', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('⚠️ RemoteAuthService - Token requested but not available from host');
      }
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
      console.log('🔄 RemoteAuthService - Token requested for URL:', url, 'with scopes:', scopes);
      const token = await this.centralizedAuth.getTokenForUrl(url, scopes);
      if (token) {
        console.log('🎫 RemoteAuthService - Token received from host for URL:', {
          url: url,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          scopes: scopes,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('⚠️ RemoteAuthService - No token received from host for URL:', url);
      }
      return token;
    }
    console.warn('⚠️ RemoteAuthService - No centralized auth available for URL token request');
    return '';
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(scopes: string[] = ['user.read']): Promise<string> {
    if (this.centralizedAuth) {
      console.log('🔄 RemoteAuthService - Token refresh requested with scopes:', scopes);
      const token = await this.centralizedAuth.refreshToken(scopes);
      if (token) {
        console.log('🎫 RemoteAuthService - Refreshed token received from host:', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          scopes: scopes,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('⚠️ RemoteAuthService - Token refresh failed - no token received from host');
      }
      return token;
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