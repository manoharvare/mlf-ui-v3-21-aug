import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export type UserRole = 'admin' | 'fab-manager' | 'fab-planner' | 'planner' | 'viewer' | 'management';
export type UserStatus = 'active' | 'inactive';
export type YardLocation = 'BFA' | 'JAY' | 'SAFIRA' | 'QFAB' | 'QMW';

export interface User {
  id: string;
  userName: string;
  emailId: string;
  role: UserRole;
  status: UserStatus;
  yardLocations: YardLocation[];
  assignedProjects: string[];
  lastLogin?: string;
  isActive: boolean;
  createdBy?: string;
  modifiedBy?: string;
  created?: number;
  modified?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateUserRequest {
  userName: string;
  emailId: string;
  role: UserRole;
  status: UserStatus;
  yardLocations: YardLocation[];
  assignedProjects: string[];
  isActive: boolean;
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly apiUrl = `${environment.mlfApi}/user`;
  
  // Signals for reactive state management
  private usersSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  public users$ = this.usersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  
  // Signals
  public users = signal<User[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get all users
   */
  getAllUsers(): Observable<User[]> {
    this.setLoading(true);
    return this.http.get<User[]>(`${this.apiUrl}`).pipe(
      map(users => users.map(user => this.transformUserFromBackend(user))),
      tap(transformedUsers => {
        this.usersSubject.next(transformedUsers);
        this.users.set(transformedUsers);
        this.setError(null);
      }),
      catchError(error => {
        this.setError('Failed to load users');
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Get active users only
   */
  getActiveUsers(): Observable<User[]> {
    this.setLoading(true);
    return this.http.get<User[]>(`${this.apiUrl}/active`).pipe(
      map(users => users.map(user => this.transformUserFromBackend(user))),
      tap(users => {
        this.setError(null);
      }),
      catchError(error => {
        this.setError('Failed to load active users');
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Get paginated users with optional filters
   */
  getPaginatedUsers(
    page: number = 1, 
    pageSize: number = 10, 
    searchTerm?: string,
    roleFilter?: string,
    statusFilter?: string
  ): Observable<PaginatedResult<User>> {
    this.setLoading(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (roleFilter) {
      params = params.set('roleFilter', roleFilter);
    }
    if (statusFilter) {
      params = params.set('statusFilter', statusFilter);
    }

    return this.http.get<PaginatedResult<User>>(`${this.apiUrl}/paginated`, { params }).pipe(
      map(result => ({
        ...result,
        items: result.items.map(user => this.transformUserFromBackend(user))
      })),
      tap(result => {
        this.setError(null);
      }),
      catchError(error => {
        this.setError('Failed to load paginated users');
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      map(user => this.transformUserFromBackend(user)),
      catchError(error => {
        this.setError(`Failed to load user with ID: ${id}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/by-email/${encodeURIComponent(email)}`).pipe(
      map(user => this.transformUserFromBackend(user)),
      catchError(error => {
        this.setError(`Failed to load user with email: ${email}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/by-role/${role}`).pipe(
      map(users => users.map(user => this.transformUserFromBackend(user))),
      catchError(error => {
        this.setError(`Failed to load users with role: ${role}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get users by yard location
   */
  getUsersByYardLocation(yardLocation: YardLocation): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/by-yard-location/${yardLocation}`).pipe(
      map(users => users.map(user => this.transformUserFromBackend(user))),
      catchError(error => {
        this.setError(`Failed to load users for yard location: ${yardLocation}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get users by project
   */
  getUsersByProject(projectId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/by-project/${projectId}`).pipe(
      map(users => users.map(user => this.transformUserFromBackend(user))),
      catchError(error => {
        this.setError(`Failed to load users for project: ${projectId}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    this.setLoading(true);
    
    // Transform the data to match backend expectations
    const backendData = {
      ...userData,
      yardLocations: JSON.stringify(userData.yardLocations),
      assignedProjects: JSON.stringify(userData.assignedProjects)
    };

    return this.http.post<User>(`${this.apiUrl}`, backendData).pipe(
      map(user => this.transformUserFromBackend(user)),
      tap(newUser => {
        // Update local state
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next([...currentUsers, newUser]);
        this.users.set([...this.users(), newUser]);
        this.setError(null);
      }),
      catchError(error => {
        this.setError('Failed to create user');
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    this.setLoading(true);
    
    // Transform the data to match backend expectations
    const backendData = {
      ...userData,
      yardLocations: JSON.stringify(userData.yardLocations),
      assignedProjects: JSON.stringify(userData.assignedProjects)
    };

    return this.http.put<User>(`${this.apiUrl}/${id}`, backendData).pipe(
      map(user => this.transformUserFromBackend(user)),
      tap(updatedUser => {
        // Update local state
        const currentUsers = this.usersSubject.value;
        const updatedUsers = currentUsers.map(user => 
          user.id === id ? updatedUser : user
        );
        this.usersSubject.next(updatedUsers);
        this.users.set(updatedUsers);
        this.setError(null);
      }),
      catchError(error => {
        this.setError('Failed to update user');
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Update local state
        const currentUsers = this.usersSubject.value;
        const filteredUsers = currentUsers.filter(user => user.id !== id);
        this.usersSubject.next(filteredUsers);
        this.users.set(filteredUsers);
        this.setError(null);
      }),
      catchError(error => {
        this.setError('Failed to delete user');
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Refresh users data
   */
  refreshUsers(): void {
    this.getAllUsers().subscribe();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.setError(null);
  }

  // Private helper methods
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.loading.set(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
    this.error.set(error);
  }

  /**
   * Transform user data from backend format to frontend format
   * Parses JSON strings back to arrays
   */
  private transformUserFromBackend(user: any): User {
    return {
      ...user,
      yardLocations: this.parseJsonField(user.yardLocations, []),
      assignedProjects: this.parseJsonField(user.assignedProjects, [])
    };
  }

  /**
   * Safely parse JSON field, return default value if parsing fails
   */
  private parseJsonField<T>(field: any, defaultValue: T): T {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Failed to parse JSON field:', field, error);
        return defaultValue;
      }
    }
    return field || defaultValue;
  }

  // Utility methods for role and status options
  getRoleOptions(): { value: UserRole; label: string; description: string }[] {
    return [
      { 
        value: 'admin', 
        label: 'Admin', 
        description: 'Full system access with administrative privileges' 
      },
      { 
        value: 'fab-manager', 
        label: 'Fab Manager', 
        description: 'Fabrication management with project oversight' 
      },
      { 
        value: 'fab-planner', 
        label: 'Fab Planner', 
        description: 'Fabrication planning and scheduling' 
      },
      { 
        value: 'planner', 
        label: 'Planner', 
        description: 'Standard planning and forecasting access' 
      },
      { 
        value: 'viewer', 
        label: 'Viewer', 
        description: 'Read-only access to reports and data' 
      },
      { 
        value: 'management', 
        label: 'Management', 
        description: 'Executive reporting and analytics access' 
      }
    ];
  }

  getStatusOptions(): { value: UserStatus; label: string }[] {
    return [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];
  }

  getYardLocationOptions(): { value: YardLocation; label: string }[] {
    return [
      { value: 'BFA', label: 'BFA - Brownsville Fabrication' },
      { value: 'JAY', label: 'JAY - Jacintoport' },
      { value: 'SAFIRA', label: 'SAFIRA - Sabine Fabrication' },
      { value: 'QFAB', label: 'QFAB - Quonset Fabrication' },
      { value: 'QMW', label: 'QMW - Quonset Marine Works' }
    ];
  }
}