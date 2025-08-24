import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { RemoteAuthService } from '../services/remote-auth.service';

@Injectable()
export class RemoteAuthInterceptor implements HttpInterceptor {

  constructor(private remoteAuthService: RemoteAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 RemoteAuthInterceptor - Intercepting request:', {
      url: req.url,
      method: req.method,
      headers: req.headers.keys()
    });

    // Skip authentication for certain URLs
    if (this.shouldSkipAuth(req.url)) {
      console.log('⏭️ RemoteAuthInterceptor - Skipping auth for:', req.url);
      return next.handle(req);
    }

    // Get token from centralized auth service
    const token = this.remoteAuthService.getToken();
    console.log('🔑 RemoteAuthInterceptor - Token status:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      isValid: token ? this.remoteAuthService.isTokenValid(token) : false
    });
    
    if (token && this.remoteAuthService.isTokenValid(token)) {
      // Add token to request
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('🔐 RemoteAuthInterceptor - Added token to request:', {
        url: req.url,
        method: req.method,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      });
      return next.handle(authReq);
    }

    // Try to refresh token if current token is invalid
    if (this.needsToken(req.url)) {
      console.log('🔄 RemoteAuthInterceptor - Token invalid/missing, attempting refresh for:', req.url);
      
      return from(this.remoteAuthService.getTokenForUrl(req.url)).pipe(
        switchMap(refreshedToken => {
          if (refreshedToken) {
            const authReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`
              }
            });
            console.log('✅ RemoteAuthInterceptor - Token refreshed and added to request:', {
              url: req.url,
              method: req.method,
              tokenLength: refreshedToken.length,
              tokenPreview: refreshedToken.substring(0, 20) + '...',
              timestamp: new Date().toISOString()
            });
            return next.handle(authReq);
          } else {
            console.warn('⚠️ RemoteAuthInterceptor - Failed to refresh token for:', req.url);
            return next.handle(req);
          }
        }),
        catchError(error => {
          console.error('❌ RemoteAuthInterceptor - Error refreshing token:', error);
          return next.handle(req);
        })
      );
    }

    // Proceed without token for non-protected URLs
    console.log('⚠️ RemoteAuthInterceptor - Proceeding without token for:', req.url);
    return next.handle(req);
  }

  private shouldSkipAuth(url: string): boolean {
    const excludedPatterns = [
      /\/assets\//i,
      /\.(json|js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/i,
      /\/favicon\.ico/i,
      /\/manifest\.json/i,
      /\/health/i,
      /\/ping/i,
      /\/status/i,
    ];

    return excludedPatterns.some(pattern => pattern.test(url));
  }

  private needsToken(url: string): boolean {
    // Check if URL needs authentication token
    const protectedPatterns = [
      /graph\.microsoft\.com/i,
      /forecast-dev-api\.mcdermott\.com/i,
      /forecast-api\.mcdermott\.com/i,
      /login\.microsoftonline\.com.*\/oauth2/i,
      /\/api\//i, // Generic API pattern
    ];

    // Check exclusions first
    if (this.shouldSkipAuth(url)) {
      return false;
    }

    // Check if URL matches protected patterns
    if (protectedPatterns.some(pattern => pattern.test(url))) {
      return true;
    }

    // For relative URLs (internal API calls), add token
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return true;
    }

    return false;
  }
}