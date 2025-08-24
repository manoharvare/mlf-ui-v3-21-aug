import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { RemoteAuthService } from '../core/services/remote-auth.service';

export interface Project {
  id: number;
  project_name: string;
  project_source: 'p6' | 'custom';
  p6_project_id?: string;
  can_link_to_p6: boolean;
  description: string;
  yard_location: string;
  project_type: 'prospect' | 'booked';
  status: 'active' | 'inactive' | 'hold' | 'canceled';
  work_type: 'complete' | 'yard-only';
  calculations: string; // JSON string of array
  has_mlf_data: boolean;
  is_active: boolean;
  created?: number;
  created_by?: string;
  modified?: number;
  modified_by?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = environment.mlfApi;
  private loading = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private remoteAuthService: RemoteAuthService
  ) {}

  // Loading state
  isLoading(): boolean {
    return this.loading();
  }

  private setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Projects - Using paginated API by default
  getProjects(page: number = 1, pageSize: number = 50, searchTerm?: string): Observable<PaginatedResult<Project>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<Project>>(`${this.baseUrl}/project/paginated`, { 
        headers, 
        params 
      }).subscribe({
        next: (data) => {
          this.setLoading(false);
          observer.next(data);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ ProjectService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createProject(data: Partial<Project>): Observable<Project> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<Project>(`${this.baseUrl}/project`, data).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          observer.error(error);
        }
      });
    });
  }

  updateProject(id: number, data: Partial<Project>): Observable<Project> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<Project>(`${this.baseUrl}/project/${id}`, data).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          observer.error(error);
        }
      });
    });
  }

  deleteProject(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/project/${id}`).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          observer.error(error);
        }
      });
    });
  }

  // Import/Export Methods for Projects
  importProjects(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/projects/import`, formData, { 
        headers: headers.delete('Content-Type') // Remove content-type for FormData
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ ProjectService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportProjects(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/projects/export`, { 
        headers, 
        responseType: 'blob' 
      }).subscribe({
        next: (blob) => {
          this.setLoading(false);
          observer.next(blob);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ ProjectService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Helper method for downloading files
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}