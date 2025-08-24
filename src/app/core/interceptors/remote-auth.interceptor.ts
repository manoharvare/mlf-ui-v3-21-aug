import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RemoteAuthService } from '../services/remote-auth.service';

@Injectable()
export class RemoteAuthInterceptor implements HttpInterceptor {

  constructor(private remoteAuthService: RemoteAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 RemoteAuthInterceptor - Processing request:', {
      url: req.url,
      method: req.method,
      existingHeaders: req.headers.keys(),
      hasAuthHeader: req.headers.has('Authorization')
    });

    // Skip authentication for certain URLs (assets, static files, etc.)
    if (this.shouldSkipAuth(req.url)) {
      console.log('⏭️ RemoteAuthInterceptor - Skipping auth for:', req.url);
      return next.handle(req);
    }

    // Check if this URL needs a token
    if (this.needsToken(req.url)) {
      // Special debugging for status/paginated endpoint
      if (req.url.includes('status/paginated')) {
        console.log('🚨 DEBUGGING status/paginated endpoint:', {
          fullUrl: req.url,
          method: req.method,
          headers: req.headers.keys(),
          hasExistingAuth: req.headers.has('Authorization')
        });
      }
      
      // Get token from host app or RemoteAuthService
      const token = this.getToken();
      
      console.log('🔑 RemoteAuthInterceptor - Token status:', {
        url: req.url,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
      });
      
      if (token) {
        // Add token to request
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ RemoteAuthInterceptor - Token added to request:', req.url);
        return next.handle(authReq);
      } else {
        console.warn('⚠️ RemoteAuthInterceptor - No token available for:', req.url);
      }
    } else {
      console.log('❌ RemoteAuthInterceptor - URL does not need token:', req.url);
    }

    // Proceed without token
    console.log('🚫 RemoteAuthInterceptor - Proceeding without token:', req.url);
    return next.handle(req);
  }

  private getToken(): string | null {
    console.log('🎫 getToken - Attempting to retrieve token...');
    
    // Try to get token from host app first
    const hostAuth = (window as any).__CENTRALIZED_AUTH__;
    console.log('🎫 getToken - Host auth available:', !!hostAuth, hostAuth?.getToken ? 'has getToken method' : 'no getToken method');
    
    if (hostAuth && hostAuth.getToken) {
      const token = hostAuth.getToken();
      if (token) {
        console.log('🎫 getToken - Using host app token:', `${token.substring(0, 20)}...`);
        return token;
      }
    }

    // Fallback to RemoteAuthService
    const token = this.remoteAuthService.getToken();
    if (token) {
      console.log('🎫 getToken - Using RemoteAuthService token:', `${token.substring(0, 20)}...`);
      return token;
    }

    // Last fallback to localStorage
    const localToken = localStorage.getItem('authToken');
    if (localToken) {
      console.log('🎫 getToken - Using localStorage token:', `${localToken.substring(0, 20)}...`);
      return localToken;
    }

    console.warn('🎫 getToken - No token found from any source');
    return null;
  }

  private shouldSkipAuth(url: string): boolean {
    // Only skip static assets - NEVER skip API endpoints
    const excludedPatterns = [
      /\/assets\//i,                                                    // Static assets folder
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/i, // Static file extensions (removed json)
      /\/favicon\.ico$/i,                                               // Favicon (exact match)
      /\/manifest\.json$/i,                                             // PWA manifest (exact match)
    ];

    return excludedPatterns.some(pattern => pattern.test(url));
  }

  private needsToken(url: string): boolean {
    // Add token to ALL backend API calls - simple and comprehensive
    return true;
  }
}