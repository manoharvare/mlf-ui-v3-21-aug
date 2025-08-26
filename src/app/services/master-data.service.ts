import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { RemoteAuthService } from '../core/services/remote-auth.service';

// Interfaces for Master Data entities
export interface GlobalActivityCode {
  id: number;
  activityCode: string;
  description: string;
  area: string;
  discipline: string;
  faceGrouping: string;
  progressGrouping: string;
  structure: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface StandardCraft {
  id: number;
  jobDisciplineName: string;
  standardCraftName: string;
  craftGrouping: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface YardLocation {
  id: number;
  code: string;
  name: string;
  region: string;
  capacity: number;
  status: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface ProjectType {
  id: number;
  code: string;
  name: string;
  description: string;
  defaultStatus: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface Status {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface WorkType {
  id: number;
  code: string;
  name: string;
  description: string;
  defaultCalculations: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  permissions: string; // Raw JSON string from backend
  permissionsList: string[]; // Parsed array from backend
  icon: string;
  color: string;
  isReadOnly: boolean;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly baseUrl = environment.mlfApi;
  
  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private remoteAuthService: RemoteAuthService
  ) {}

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private getHeaders(): HttpHeaders {
    // Only set content-type and accept headers
    // Let the interceptor handle Authorization header
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Global Activity Codes - Using paginated API by default
  getGlobalActivityCodes(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<GlobalActivityCode>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<GlobalActivityCode>>(`${this.baseUrl}/global-activity-code/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createGlobalActivityCode(data: Partial<GlobalActivityCode>): Observable<GlobalActivityCode> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<GlobalActivityCode>(`${this.baseUrl}/global-activity-code`, data).subscribe({
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

  updateGlobalActivityCode(id: number, data: Partial<GlobalActivityCode>): Observable<GlobalActivityCode> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<GlobalActivityCode>(`${this.baseUrl}/global-activity-code/${id}`, data).subscribe({
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

  deleteGlobalActivityCode(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/global-activity-code/${id}`).subscribe({
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

  // Standard Crafts - Using paginated API by default
  getStandardCrafts(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<StandardCraft>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<StandardCraft>>(`${this.baseUrl}/standard-craft/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createStandardCraft(data: Partial<StandardCraft>): Observable<StandardCraft> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<StandardCraft>(`${this.baseUrl}/standard-craft`, data).subscribe({
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

  updateStandardCraft(id: number, data: Partial<StandardCraft>): Observable<StandardCraft> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<StandardCraft>(`${this.baseUrl}/standard-craft/${id}`, data).subscribe({
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

  deleteStandardCraft(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/standard-craft/${id}`).subscribe({
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

  // Yard Locations - Using paginated API by default
  getYardLocations(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<YardLocation>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<YardLocation>>(`${this.baseUrl}/yard-location/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createYardLocation(data: Partial<YardLocation>): Observable<YardLocation> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<YardLocation>(`${this.baseUrl}/yard-location`, data).subscribe({
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

  updateYardLocation(id: number, data: Partial<YardLocation>): Observable<YardLocation> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<YardLocation>(`${this.baseUrl}/yard-location/${id}`, data).subscribe({
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

  deleteYardLocation(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/yard-location/${id}`).subscribe({
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

  // Project Types - Using paginated API by default
  getProjectTypes(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<ProjectType>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<ProjectType>>(`${this.baseUrl}/project-type/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createProjectType(data: Partial<ProjectType>): Observable<ProjectType> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<ProjectType>(`${this.baseUrl}/project-type`, data).subscribe({
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

  updateProjectType(id: number, data: Partial<ProjectType>): Observable<ProjectType> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<ProjectType>(`${this.baseUrl}/project-type/${id}`, data).subscribe({
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

  deleteProjectType(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/project-type/${id}`).subscribe({
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

  // Status - Using paginated API by default
  getStatuses(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<Status>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<Status>>(`${this.baseUrl}/status/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createStatus(data: Partial<Status>): Observable<Status> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<Status>(`${this.baseUrl}/status`, data).subscribe({
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

  updateStatus(id: number, data: Partial<Status>): Observable<Status> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<Status>(`${this.baseUrl}/status/${id}`, data).subscribe({
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

  deleteStatus(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/status/${id}`).subscribe({
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

  // Work Types - Using paginated API by default
  getWorkTypes(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<WorkType>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<WorkType>>(`${this.baseUrl}/work-type/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createWorkType(data: Partial<WorkType>): Observable<WorkType> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<WorkType>(`${this.baseUrl}/work-type`, data).subscribe({
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

  updateWorkType(id: number, data: Partial<WorkType>): Observable<WorkType> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<WorkType>(`${this.baseUrl}/work-type/${id}`, data).subscribe({
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

  deleteWorkType(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/work-type/${id}`).subscribe({
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

  // Import/Export Methods for Global Activity Codes
  importGlobalActivityCodes(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/global-activity-codes/import`, formData, { 
        headers: headers.delete('Content-Type') // Remove content-type for FormData
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportGlobalActivityCodes(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/global-activity-codes/export`, { 
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
          console.error('❌ MasterDataService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Import/Export Methods for Standard Crafts
  importStandardCrafts(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/standard-crafts/import`, formData, { 
        headers: headers.delete('Content-Type')
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportStandardCrafts(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/standard-crafts/export`, { 
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
          console.error('❌ MasterDataService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Import/Export Methods for Yard Locations
  importYardLocations(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/yard-locations/import`, formData, { 
        headers: headers.delete('Content-Type')
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportYardLocations(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/yard-locations/export`, { 
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
          console.error('❌ MasterDataService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Import/Export Methods for Project Types
  importProjectTypes(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/project-types/import`, formData, { 
        headers: headers.delete('Content-Type')
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportProjectTypes(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/project-types/export`, { 
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
          console.error('❌ MasterDataService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Import/Export Methods for Status
  importStatus(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/status/import`, formData, { 
        headers: headers.delete('Content-Type')
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportStatus(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/status/export`, { 
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
          console.error('❌ MasterDataService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Import/Export Methods for Work Types
  importWorkTypes(file: File, overwriteExisting: boolean = false): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', overwriteExisting.toString());

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.post(`${this.baseUrl}/master-data/work-types/import`, formData, { 
        headers: headers.delete('Content-Type')
      }).subscribe({
        next: (result) => {
          this.setLoading(false);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - Import Error:', error);
          observer.error(error);
        }
      });
    });
  }

  exportWorkTypes(): Observable<Blob> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get(`${this.baseUrl}/master-data/work-types/export`, { 
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
          console.error('❌ MasterDataService - Export Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Roles - Using paginated API by default
  getRoles(page: number = 1, pageSize: number = 50, searchTerm?: string, sortBy?: string, sortDirection?: string): Observable<PaginatedResult<Role>> {
    this.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<PaginatedResult<Role>>(`${this.baseUrl}/role/paginated`, { 
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
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  getAllRoles(): Observable<Role[]> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<Role[]>(`${this.baseUrl}/role`, { headers }).subscribe({
        next: (data) => {
          this.setLoading(false);
          observer.next(data);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  getActiveRoles(): Observable<Role[]> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<Role[]>(`${this.baseUrl}/role/active`, { headers }).subscribe({
        next: (data) => {
          this.setLoading(false);
          observer.next(data);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  createRole(data: Partial<Role>): Observable<Role> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.post<Role>(`${this.baseUrl}/role`, data).subscribe({
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

  updateRole(id: number, data: Partial<Role>): Observable<Role> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.put<Role>(`${this.baseUrl}/role/${id}`, data).subscribe({
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

  deleteRole(id: number): Observable<boolean> {
    this.setLoading(true);
    return new Observable(observer => {
      this.http.delete<boolean>(`${this.baseUrl}/role/${id}`).subscribe({
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

  // Helper method to get active yard locations for dropdowns
  getActiveYardLocations(): Observable<YardLocation[]> {
    this.setLoading(true);
    return new Observable(observer => {
      const headers = this.getHeaders();
      this.http.get<YardLocation[]>(`${this.baseUrl}/yard-location/active`, { headers }).subscribe({
        next: (data) => {
          this.setLoading(false);
          observer.next(data);
          observer.complete();
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ MasterDataService - API Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Helper method to download blob as file
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