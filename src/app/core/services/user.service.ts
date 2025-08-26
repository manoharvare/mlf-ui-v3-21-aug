import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../../services/master-data.service';

export interface User {
  id: number;
  userName: string;
  emailId: string;
  role: string;
  status: string;
  yardLocations: string[];
  assignedProjects: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  lastLogin?: string;
  roleNavigation?: Role; // Navigation property to role details
}

export interface CreateUserRequest {
  userName: string;
  emailId: string;
  role: string;
  status: string;
  yardLocations: string[];
  assignedProjects: string[];
}

export interface UpdateUserRequest {
  userName: string;
  emailId: string;
  role: string;
  status: string;
  yardLocations: string[];
  assignedProjects: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export interface UserFilters {
  sortBy?: string;
  isDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.mlfApi;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of users with optional filters
   */
  getUsers(filters: UserFilters = {}): Observable<ApiResponse<PaginatedResult<User>>> {
    let params = new HttpParams();
    
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.isDescending !== undefined) {
      params = params.set('isDescending', filters.isDescending.toString());
    }
    if (filters.pageNumber) {
      params = params.set('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }
    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }

    return this.http.get<ApiResponse<PaginatedResult<User>>>(
      `${this.apiUrl}/user/paginated`,
      { params }
    );
  }

  /**
   * Get all users (for dropdown/select purposes)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/user/${id}`);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/by-email/${encodeURIComponent(email)}`);
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/user`, userData);
  }

  /**
   * Update an existing user
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/user/${id}`, userData);
  }

  /**
   * Delete a user
   */
  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/user/${id}`);
  }

  /**
   * Check if email exists
   */
  checkEmailExists(email: string, excludeId?: number): Observable<ApiResponse<{ exists: boolean }>> {
    let params = new HttpParams().set('email', email);
    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }

    return this.http.get<ApiResponse<{ exists: boolean }>>(
      `${this.apiUrl}/user/check-email`,
      { params }
    );
  }
}