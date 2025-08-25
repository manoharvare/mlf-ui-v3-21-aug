import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Eye,
  MoreVertical,
  MapPin,
  Building2,
  User as UserIcon,
  X,
  Check,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  AlertCircle
} from 'lucide-angular';
import { ButtonComponent } from '../../ui/button.component';
import { BadgeComponent, BadgeVariant } from '../../ui/badge.component';
import { InputComponent } from '../../ui/input.component';
import { SelectComponent } from '../../ui/select.component';
import { DialogComponent } from '../../ui/dialog.component';
import { LabelComponent } from '../../ui/label.component';
import { AvatarComponent } from '../../ui/avatar.component';
import { PopoverComponent } from '../../ui/popover.component';
import { CommandComponent } from '../../ui/command.component';
import { PaginationComponent } from '../../ui/pagination.component';
import { UserManagementService, User, UserRole, UserStatus, YardLocationCode } from '../../../services/user-management.service';
import { ProjectService } from '../../../services/project.service';

interface Project {
  id: string;
  projectName: string;
  description: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    InputComponent,
    SelectComponent,
    DialogComponent,
    LabelComponent,
    AvatarComponent,
    PopoverComponent,
    CommandComponent,
    PaginationComponent
  ],

  template: `
    <div class="p-8">
      <div class="w-full">
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-gray-600">Loading users...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error() && !loading()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2 text-red-800">
            <lucide-icon name="AlertCircle" [size]="16"></lucide-icon>
            <span class="font-medium">Error:</span>
            <span>{{ error() }}</span>
          </div>
          <ui-button 
            variant="outline" 
            size="sm" 
            class="mt-2"
            (clicked)="loadUsers()"
          >
            Retry
          </ui-button>
        </div>

        <!-- Content -->
        <div *ngIf="!loading() && !error()">
          <!-- Add User Button -->
          <div class="flex justify-end mb-6">
            <ui-button (clicked)="handleOpenDialog()" [leftIcon]="Plus">
              Add User
            </ui-button>
          </div>

        <!-- Dialog -->
        <ui-dialog 
          [isOpen]="isDialogOpen()" 
          (openChange)="setIsDialogOpen($event)"
          [title]="editingUser() ? 'Edit User' : 'Add New User'"
          [description]="editingUser() 
            ? 'Update user information, role, yard locations, and project assignments.' 
            : 'Create a new user account with role, yard access, and project assignments.'"
          size="xl"
          [showCloseButton]="true"
          [closeOnBackdropClick]="false"
          [hasFooterSlot]="true"
          class="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
              
              <div class="space-y-6">
                <!-- Basic Information Section -->
                <div class="space-y-4">
                  <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <lucide-icon [name]="UserIcon" [size]="16" class="text-gray-600"></lucide-icon>
                    <h4 class="font-medium text-gray-900">Basic Information</h4>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-4">
                    <div class="space-y-2">
                      <ui-label for="userName">User Name *</ui-label>
                      <ui-input
                        id="userName"
                        placeholder="Enter full name"
                        [(ngModel)]="formData.userName"
                      ></ui-input>
                    </div>
                    
                    <div class="space-y-2">
                      <ui-label for="emailId">Email ID *</ui-label>
                      <ui-input
                        id="emailId"
                        type="email"
                        placeholder="Enter email address"
                        [(ngModel)]="formData.emailId"
                      ></ui-input>
                    </div>
                    
                    <div class="space-y-2">
                      <ui-label for="status">Status</ui-label>
                      <ui-select 
                        id="status"
                        [(ngModel)]="formData.status"
                        [options]="statusOptions"
                        placeholder="Select status"
                      ></ui-select>
                    </div>
                  </div>
                </div>

                <!-- Roles & Access Section -->
                <div class="space-y-4">
                  <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <lucide-icon [name]="Shield" [size]="16" class="text-gray-600"></lucide-icon>
                    <h4 class="font-medium text-gray-900">Role & Access</h4>
                  </div>
                  
                  <!-- Role Selection -->
                  <div class="space-y-3">
                    <ui-label>Role *</ui-label>
                    
                    <!-- Loading state for roles -->
                    <div *ngIf="rolesLoading()" class="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span class="text-sm text-gray-600">Loading roles...</span>
                    </div>
                    
                    <!-- Role selector -->
                    <ui-select 
                      *ngIf="!rolesLoading()"
                      [(ngModel)]="formData.role"
                      [options]="roleSelectOptions"
                      placeholder="Select a role..."
                      (valueChange)="onRoleChange($event)"
                    ></ui-select>

                    <div *ngIf="isAdmin()" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div class="flex items-center gap-2 text-sm text-blue-800">
                        <lucide-icon [name]="Shield" [size]="16"></lucide-icon>
                        <span class="font-medium">Admin Access:</span>
                        <span>This user will have access to all projects automatically.</span>
                      </div>
                    </div>
                  </div>

                  <!-- Yard Locations Selection -->
                  <div class="space-y-3">
                    <ui-label>Yard Locations *</ui-label>
                    
                    <!-- Loading state for yard locations -->
                    <div *ngIf="yardLocationsLoading()" class="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span class="text-sm text-gray-600">Loading yard locations...</span>
                    </div>
                    
                    <!-- No locations available -->
                    <div *ngIf="!yardLocationsLoading() && availableYardLocations().length === 0" class="p-3 border border-gray-200 rounded-md">
                      <span class="text-sm text-gray-600">No yard locations available</span>
                    </div>
                    
                    <!-- Yard locations selector -->
                    <ui-popover 
                      *ngIf="!yardLocationsLoading() && availableYardLocations().length > 0"
                      [isOpen]="openYardSelect()" 
                      (openChange)="setOpenYardSelect($event)"
                      placement="bottom-start"
                      class="w-full"
                    >
                      <ui-button 
                        slot="trigger"
                        variant="outline"
                        class="w-full justify-between"
                        [attr.aria-expanded]="openYardSelect()"
                        [rightIcon]="openYardSelect() ? ChevronUp : ChevronDown"
                      >
                        <span>
                          {{ formData.yardLocations.length > 0 
                            ? formData.yardLocations.length + ' location(s) selected' 
                            : 'Select yard locations...' }}
                        </span>
                      </ui-button>
                      
                      <div class="w-full p-0">
                        <!-- Simple Search Input -->
                        <div class="p-2 border-b border-gray-200">
                          <ui-input
                            placeholder="Search locations..."
                            [(ngModel)]="yardLocationSearchTerm"
                            [leftIcon]="Search"
                          ></ui-input>
                        </div>
                        
                        <!-- Filtered Location List -->
                        <div class="max-h-60 overflow-auto p-1">
                          <div *ngFor="let location of filteredYardLocations" 
                               class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                               (click)="toggleYardLocation(location.value)">
                            <div class="flex items-center space-x-2 w-full">
                              <div class="w-4 h-4 border border-primary rounded-sm flex items-center justify-center"
                                   [class.bg-primary]="formData.yardLocations.includes(location.value)"
                                   [class.bg-white]="!formData.yardLocations.includes(location.value)">
                                <lucide-icon 
                                  *ngIf="formData.yardLocations.includes(location.value)"
                                  [name]="Check" 
                                  [size]="12" 
                                  class="text-primary-foreground">
                                </lucide-icon>
                              </div>
                              <div class="flex items-center gap-2">
                                <lucide-icon [name]="MapPin" [size]="16" class="text-gray-500"></lucide-icon>
                                <span class="font-medium">{{ location.label }}</span>
                              </div>
                            </div>
                          </div>
                          
                          <!-- No results message -->
                          <div *ngIf="filteredYardLocations.length === 0 && yardLocationSearchTerm" 
                               class="px-2 py-3 text-sm text-gray-500 text-center">
                            No locations found matching "{{ yardLocationSearchTerm }}"
                          </div>
                        </div>
                      </div>
                    </ui-popover>
                    
                    <!-- Selected Yard Locations Display -->
                    <div *ngIf="formData.yardLocations.length > 0" class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm text-foreground">Selected Locations:</span>
                      <ui-badge 
                        *ngFor="let location of formData.yardLocations" 
                        variant="secondary"
                        size="sm"
                        [customClasses]="getYardLocationColor(location)"
                        [leftIcon]="MapPin"
                        [rightIcon]="X"
                        [rightIconClickable]="true"
                        (rightIconClick)="removeYardLocation(location)"
                      >
                        {{ location }}
                      </ui-badge>
                    </div>
                  </div>
                </div>

                <!-- Project Access Section - Only show for non-admin users -->
                <div *ngIf="!isAdmin()" class="space-y-4">
                  <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <lucide-icon [name]="Building2" [size]="16" class="text-gray-600"></lucide-icon>
                    <h4 class="font-medium text-gray-900">Project Access</h4>
                  </div>
                  
                  <div class="space-y-3">
                    <ui-label>Assign Projects *</ui-label>
                    <p class="text-sm text-gray-600">
                      Select which projects this user can access. Admin users have access to all projects automatically.
                    </p>
                    
                    <ui-popover 
                      [isOpen]="openProjectSelect()" 
                      (openChange)="setOpenProjectSelect($event)"
                      placement="bottom-start"
                      class="w-full"
                    >
                      <ui-button 
                        slot="trigger"
                        variant="outline"
                        class="w-full justify-between"
                        [attr.aria-expanded]="openProjectSelect()"
                        [rightIcon]="openProjectSelect() ? ChevronUp : ChevronDown"
                      >
                        <span>
                          {{ formData.assignedProjects.length > 0 
                            ? formData.assignedProjects.length + ' project(s) selected' 
                            : 'Select projects...' }}
                        </span>
                      </ui-button>
                      
                      <div class="w-full p-0">
                        <!-- Loading state for projects -->
                        <div *ngIf="projectsLoading()" class="flex items-center gap-2 p-3 border-b border-gray-200">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span class="text-sm text-gray-600">Loading projects...</span>
                        </div>
                        
                        <!-- Simple Search Input -->
                        <div *ngIf="!projectsLoading()" class="p-2 border-b border-gray-200">
                          <ui-input
                            placeholder="Search projects..."
                            [(ngModel)]="projectSearchTerm"
                            [leftIcon]="Search"
                          ></ui-input>
                        </div>
                        
                        <!-- No projects available -->
                        <div *ngIf="!projectsLoading() && projects().length === 0" class="p-3 border-b border-gray-200">
                          <span class="text-sm text-gray-600">No projects available</span>
                        </div>
                        
                        <!-- Filtered Project List -->
                        <div *ngIf="!projectsLoading() && projects().length > 0" class="max-h-60 overflow-auto p-1">
                          <div *ngFor="let project of filteredProjects" 
                               class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                               (click)="toggleProjectSelection(project.id)">
                            <div class="flex items-center space-x-2 w-full">
                              <div class="w-4 h-4 border border-primary rounded-sm flex items-center justify-center"
                                   [class.bg-primary]="formData.assignedProjects.includes(project.id)"
                                   [class.bg-white]="!formData.assignedProjects.includes(project.id)">
                                <lucide-icon 
                                  *ngIf="formData.assignedProjects.includes(project.id)"
                                  [name]="Check" 
                                  [size]="12" 
                                  class="text-primary-foreground">
                                </lucide-icon>
                              </div>
                              <div class="flex items-center gap-2 flex-1">
                                <lucide-icon [name]="Building2" [size]="16" class="text-gray-500"></lucide-icon>
                                <div class="flex-1">
                                  <div class="font-medium">{{ project.projectName }}</div>
                                  <div class="text-xs text-gray-500">{{ project.description }}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- No results message -->
                          <div *ngIf="filteredProjects.length === 0 && projectSearchTerm" 
                               class="px-2 py-3 text-sm text-gray-500 text-center">
                            No projects found matching "{{ projectSearchTerm }}"
                          </div>
                        </div>
                      </div>
                    </ui-popover>
                    
                    <!-- Selected Projects Display -->
                    <div *ngIf="formData.assignedProjects.length > 0" class="space-y-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm text-foreground">Selected Projects:</span>
                        <ui-badge 
                          *ngFor="let projectId of formData.assignedProjects" 
                          variant="secondary"
                          size="sm"
                          [leftIcon]="Building2"
                          [rightIcon]="X"
                          [rightIconClickable]="true"
                          (rightIconClick)="removeProject(projectId)"
                        >
                          {{ getProjectName(projectId) }}
                        </ui-badge>
                      </div>
                      
                      <div class="text-sm text-gray-600">
                        Selected: {{ formData.assignedProjects.length }} of {{ projects().length }} projects
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
              <!-- Dialog Actions -->
              <div slot="footer" class="flex justify-end gap-2 pt-6 border-t">
                <ui-button variant="outline" (clicked)="setIsDialogOpen(false)">
                  Cancel
                </ui-button>
                <ui-button (clicked)="handleSaveUser()">
                  {{ editingUser() ? 'Update User' : 'Create User' }}
                </ui-button>
              </div>
        </ui-dialog>

        <!-- Enhanced Users Data Table -->
        <div class="space-y-4">
          <!-- Table Controls -->
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <!-- Search -->
            <div class="relative flex-1 max-w-md">
              <ui-input
                [(ngModel)]="searchTerm"
                placeholder="Search users..."
                [leftIcon]="Search"
                (ngModelChange)="onSearch($event)"
                class="pl-10"
              ></ui-input>
            </div>
            
            <!-- Filters Toggle -->
            <div class="flex items-center gap-2">
              <ui-button 
                variant="outline" 
                size="sm"
                (clicked)="toggleFilters()"
                [leftIcon]="Filter"
              >
                {{ filtersVisible ? 'Hide' : 'Show' }} Filters
              </ui-button>
              
              <!-- Page Size Selector -->
              <!-- <ui-select 
                [(ngModel)]="pageSize"
                [options]="pageSizeOptions"
                (valueChange)="onPageSizeChange($event)"
                class="w-20"
              ></ui-select> -->
            </div>
          </div>
          
          <!-- Filter Row -->
          <div *ngIf="filtersVisible" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">Role</label>
              <ui-select 
                [(ngModel)]="filters.role"
                [options]="roleFilterOptions"
                placeholder="All roles"
                (valueChange)="onFilterChange()"
              ></ui-select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <ui-select 
                [(ngModel)]="filters.status"
                [options]="statusFilterOptions"
                placeholder="All statuses"
                (valueChange)="onFilterChange()"
              ></ui-select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">Yard Location</label>
              <ui-select 
                [(ngModel)]="filters.yardLocation"
                [options]="yardLocationFilterOptions"
                placeholder="All locations"
                (valueChange)="onFilterChange()"
              ></ui-select>
            </div>
            <div class="flex items-end">
              <ui-button variant="outline" size="sm" (clicked)="clearFilters()">
                Clear Filters
              </ui-button>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-3 font-medium text-gray-900 w-12">#</th>
                    
                    <!-- Sortable User Column -->
                    <th class="text-left p-3 font-medium text-gray-900">
                      <div class="flex items-center gap-2">
                        <span>User</span>
                        <button
                          type="button"
                          (click)="onSort('userName')"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon
                            [name]="getSortIcon('userName')"
                            [size]="14"
                            [class]="getSortIconClass('userName')"
                          ></lucide-icon>
                        </button>
                      </div>
                    </th>
                    
                    <!-- Sortable Email Column -->
                    <th class="text-left p-3 font-medium text-gray-900">
                      <div class="flex items-center gap-2">
                        <span>Email</span>
                        <button
                          type="button"
                          (click)="onSort('emailId')"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon
                            [name]="getSortIcon('emailId')"
                            [size]="14"
                            [class]="getSortIconClass('emailId')"
                          ></lucide-icon>
                        </button>
                      </div>
                    </th>
                    
                    <!-- Sortable Role Column -->
                    <th class="text-left p-3 font-medium text-gray-900">
                      <div class="flex items-center gap-2">
                        <span>Role</span>
                        <button
                          type="button"
                          (click)="onSort('role')"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon
                            [name]="getSortIcon('role')"
                            [size]="14"
                            [class]="getSortIconClass('role')"
                          ></lucide-icon>
                        </button>
                      </div>
                    </th>
                    
                    <!-- Sortable Status Column -->
                    <th class="text-left p-3 font-medium text-gray-900">
                      <div class="flex items-center gap-2">
                        <span>Status</span>
                        <button
                          type="button"
                          (click)="onSort('status')"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon
                            [name]="getSortIcon('status')"
                            [size]="14"
                            [class]="getSortIconClass('status')"
                          ></lucide-icon>
                        </button>
                      </div>
                    </th>
                    
                    <th class="text-left p-3 font-medium text-gray-900">Yard Locations</th>
                    <th class="text-left p-3 font-medium text-gray-900">Projects</th>
                    
                    <!-- Sortable Created Column -->
                    <th class="text-left p-3 font-medium text-gray-900">
                      <div class="flex items-center gap-2">
                        <span>Created</span>
                        <button
                          type="button"
                          (click)="onSort('createdAt')"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon
                            [name]="getSortIcon('createdAt')"
                            [size]="14"
                            [class]="getSortIconClass('createdAt')"
                          ></lucide-icon>
                        </button>
                      </div>
                    </th>
                    
                    <!-- Sortable Last Login Column -->
                    <th class="text-left p-3 font-medium text-gray-900">
                      <div class="flex items-center gap-2">
                        <span>Last Login</span>
                        <button
                          type="button"
                          (click)="onSort('lastLogin')"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon
                            [name]="getSortIcon('lastLogin')"
                            [size]="14"
                            [class]="getSortIconClass('lastLogin')"
                          ></lucide-icon>
                        </button>
                      </div>
                    </th>
                    
                    <th class="text-left p-3 font-medium text-gray-900 w-12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of paginatedUsers(); let i = index" class="border-t hover:bg-gray-50">
                    <td class="p-3 font-medium text-gray-500">
                      {{ (currentPage - 1) * pageSize + i + 1 }}
                    </td>
                    <td class="p-3">
                      <div class="flex items-center gap-3">
                        <ui-avatar 
                          [name]="user.userName"
                          size="sm"
                          shape="circle"
                          bgColor="rgb(219 234 254)"
                          textColor="rgb(30 64 175)"
                        ></ui-avatar>
                        <div>
                          <div class="font-medium">{{ user.userName }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="p-3 text-gray-600">
                      {{ user.emailId }}
                    </td>
                    <td class="p-3">
                      <ui-badge 
                        size="sm"
                        [customClasses]="getRoleColor(user.role)"
                        [leftIcon]="Shield"
                      >
                        {{ getRoleLabel(user.role) }}
                      </ui-badge>
                    </td>
                    <td class="p-3">
                      <ui-badge 
                        size="sm"
                        [customClasses]="getStatusColor(user.status)"
                      >
                        {{ user.status }}
                      </ui-badge>
                    </td>
                    <td class="p-3">
                      <div class="flex flex-wrap gap-1">
                        <ui-badge 
                          *ngFor="let location of user.yardLocations.slice(0, 2)" 
                          size="sm"
                          [customClasses]="getYardLocationColor(location)"
                          [leftIcon]="MapPin"
                        >
                          {{ location }}
                        </ui-badge>
                        <ui-badge 
                          *ngIf="user.yardLocations.length > 2" 
                          variant="outline"
                          size="sm"
                        >
                          +{{ user.yardLocations.length - 2 }}
                        </ui-badge>
                      </div>
                    </td>
                    <td class="p-3">
                      <div *ngIf="user.role === 'admin'" class="flex items-center gap-2">
                        <lucide-icon [name]="Shield" [size]="12" class="text-blue-500"></lucide-icon>
                        <span class="text-sm text-blue-600 font-medium">All Projects</span>
                      </div>
                      <div *ngIf="user.role !== 'admin'">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="Eye" [size]="12" class="text-gray-400"></lucide-icon>
                          <span class="text-sm text-gray-600">
                            {{ user.assignedProjects.length }} project{{ user.assignedProjects.length !== 1 ? 's' : '' }}
                          </span>
                        </div>
                        <div *ngIf="user.assignedProjects.length > 0" class="flex flex-wrap gap-1 mt-1">
                          <ui-badge 
                            *ngFor="let projectId of user.assignedProjects.slice(0, 2)" 
                            variant="outline"
                            size="sm"
                          >
                            {{ getProjectName(projectId) }}
                          </ui-badge>
                          <ui-badge 
                            *ngIf="user.assignedProjects.length > 2" 
                            variant="outline"
                            size="sm"
                          >
                            +{{ user.assignedProjects.length - 2 }}
                          </ui-badge>
                        </div>
                      </div>
                    </td>
                    <td class="p-3 text-sm text-gray-600">
                      {{ user.created ? formatDate(user.created) : '-' }}
                    </td>
                    <td class="p-3 text-sm text-gray-600">
                      {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
                    </td>
                    <td class="p-3">
                      <div class="relative">
                        <ui-button 
                          variant="ghost" 
                          size="sm"
                          (clicked)="toggleDropdown(user.id)"
                        >
                          <lucide-icon [name]="MoreVertical" [size]="16"></lucide-icon>
                        </ui-button>
                        
                        <!-- Dropdown Menu -->
                        <div 
                          *ngIf="openDropdown() === user.id"
                          class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        >
                          <button 
                            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            (click)="handleOpenDialog(user)"
                          >
                            <lucide-icon [name]="Pencil" [size]="14"></lucide-icon>
                            Edit
                          </button>
                          <button 
                            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            (click)="handleDeleteUser(user.id)"
                          >
                            <lucide-icon [name]="Trash2" [size]="14"></lucide-icon>
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="paginatedUsers().length === 0" class="text-center py-12">
            <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <lucide-icon [name]="Shield" [size]="48" class="text-gray-400 mx-auto mb-4"></lucide-icon>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ searchTerm || hasActiveFilters() ? 'No matching users found' : 'No Users Yet' }}
              </h3>
              <p class="text-gray-600 mb-4">
                {{ searchTerm || hasActiveFilters() 
                  ? 'Try adjusting your search or filters to find users.' 
                  : 'Get started by adding your first user to the system.' }}
              </p>
              <ui-button 
                *ngIf="!searchTerm && !hasActiveFilters()" 
                (clicked)="handleOpenDialog()" 
                [leftIcon]="Plus"
              >
                Add Your First User
              </ui-button>
              <ui-button 
                *ngIf="searchTerm || hasActiveFilters()" 
                variant="outline"
                (clicked)="clearFilters()"
              >
                Clear Filters
              </ui-button>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="filteredUsers().length > 0" class="mt-4">
            <ui-pagination
              [currentPage]="currentPage"
              [totalPages]="totalPages"
              [totalItems]="filteredUsers().length"
              [itemsPerPage]="pageSize"
              [showInfo]="true"
              [showFirstLast]="false"
              [maxVisiblePages]="7"
              (pageChange)="goToPage($event)"
            ></ui-pagination>
          </div>
        </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  // Icons
  Plus = Plus;
  Pencil = Pencil;
  Trash2 = Trash2;
  Shield = Shield;
  Eye = Eye;
  MoreVertical = MoreVertical;
  MapPin = MapPin;
  Building2 = Building2;
  UserIcon = UserIcon;
  X = X;
  Check = Check;
  ChevronsUpDown = ChevronsUpDown;
  ChevronUp = ChevronUp;
  ChevronDown = ChevronDown;
  Search = Search;
  Filter = Filter;
  AlertCircle = AlertCircle;

  // Services
  private userManagementService = inject(UserManagementService);
  private projectService = inject(ProjectService);

  // State signals
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  isDialogOpen = signal(false);
  editingUser = signal<User | null>(null);
  openDropdown = signal<string | null>(null);
  openYardSelect = signal(false);
  openProjectSelect = signal(false);

  // Projects from master data
  projects = signal<Project[]>([]);

  // Options loaded from backend
  availableRoles = signal<{ value: string; label: string; description: string }[]>([]);
  availableYardLocations = signal<{ value: string; label: string }[]>([]);
  
  // Loading states for options
  rolesLoading = signal<boolean>(false);
  yardLocationsLoading = signal<boolean>(false);
  projectsLoading = signal<boolean>(false);
  
  // Search terms
  yardLocationSearchTerm = '';
  projectSearchTerm = '';

  formData = {
    userName: '',
    emailId: '',
    role: '' as UserRole,
    status: 'active' as UserStatus,
    yardLocations: [] as string[],
    assignedProjects: [] as string[]
  };

  roleColors: Record<string, string> = {
    'super-admin': 'bg-red-100 text-red-800 border-red-200',
    'mlf-admin': 'bg-blue-100 text-blue-800 border-blue-200',
    'planner': 'bg-green-100 text-green-800 border-green-200',
    'approver': 'bg-purple-100 text-purple-800 border-purple-200',
    'fab-management': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'view-only-user': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  yardLocationColors: Record<string, string> = {
    'BFA': 'bg-orange-100 text-orange-800 border-orange-200',
    'JAY': 'bg-teal-100 text-teal-800 border-teal-200',
    'SAFIRA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'QFAB': 'bg-pink-100 text-pink-800 border-pink-200',
    'QMW': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  // Data Table State
  searchTerm = '';
  filtersVisible = false;
  currentPage = 1;
  pageSize = 10;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filters = {
    role: '',
    status: '',
    yardLocation: ''
  };

  // Computed signals for filtered and paginated data
  filteredUsers = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  
  // Pagination state for server-side pagination
  totalRecords = signal<number>(0);
  usePagination = signal<boolean>(true);

  // Computed properties for select options
  get statusOptions() {
    return this.userManagementService.getStatusOptions();
  }

  get roleSelectOptions() {
    return this.availableRoles().map(role => ({
      value: role.value,
      label: `${role.label} - ${role.description}`
    }));
  }

  get filteredYardLocations() {
    const locations = this.availableYardLocations();
    if (!this.yardLocationSearchTerm) {
      return locations;
    }
    
    const searchTerm = this.yardLocationSearchTerm.toLowerCase();
    return locations.filter(location => 
      location.label.toLowerCase().includes(searchTerm) ||
      location.value.toLowerCase().includes(searchTerm)
    );
  }

  get filteredProjects() {
    const projects = this.projects();
    if (!this.projectSearchTerm) {
      return projects;
    }
    
    const searchTerm = this.projectSearchTerm.toLowerCase();
    return projects.filter(project => 
      project.projectName.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.id.toLowerCase().includes(searchTerm)
    );
  }

  // Data Table Computed Properties
  get pageSizeOptions() {
    return [
      { value: '5', label: '5' },
      { value: '10', label: '10' },
      { value: '20', label: '20' },
      { value: '50', label: '50' }
    ];
  }

  get roleFilterOptions() {
    return [
      { value: '', label: 'All Roles' },
      ...this.availableRoles().map(role => ({
        value: role.value,
        label: role.label
      }))
    ];
  }

  get statusFilterOptions() {
    return [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];
  }

  get yardLocationFilterOptions() {
    return [
      { value: '', label: 'All Locations' },
      ...this.availableYardLocations().map(location => ({
        value: location.value,
        label: location.label
      }))
    ];
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers().length / this.pageSize);
  }

  constructor() {
    // Constructor - initialization will happen in ngOnInit
  }

  ngOnInit(): void {
    // Load initial data
    this.loadUsers();
    this.loadProjects();
    this.loadRoleOptions();
    this.loadYardLocationOptions();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.userManagementService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
        this.updateFilteredData();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set('Failed to load users. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private loadProjects(): void {
    // Only load if not already loaded or loading
    if (this.projects().length > 0 || this.projectsLoading()) {
      return;
    }

    this.projectsLoading.set(true);
    
    // Load projects from project service
    this.projectService.getProjects(1, 100).subscribe({
      next: (result: any) => {
        // Transform projects to match interface
        const transformedProjects = result.items.map((p: any) => ({
          id: p.id,
          projectName: p.projectName,
          description: p.description || ''
        }));
        this.projects.set(transformedProjects);
        this.projectsLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        // Set empty array if projects fail to load
        this.projects.set([]);
        this.projectsLoading.set(false);
      }
    });
  }

  private loadRoleOptions(): void {
    this.rolesLoading.set(true);
    this.userManagementService.getRoleOptions().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
        this.rolesLoading.set(false);
        console.log('Loaded roles:', roles);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.availableRoles.set([]);
        this.rolesLoading.set(false);
      }
    });
  }

  private loadYardLocationOptions(): void {
    this.yardLocationsLoading.set(true);
    this.userManagementService.getYardLocationOptions().subscribe({
      next: (locations) => {
        this.availableYardLocations.set(locations);
        this.yardLocationsLoading.set(false);
        console.log('Loaded yard locations:', locations);
      },
      error: (error) => {
        console.error('Error loading yard locations:', error);
        this.availableYardLocations.set([]);
        this.yardLocationsLoading.set(false);
      }
    });
  }

  refreshData(): void {
    this.loadUsers();
    this.loadProjects();
  }

  handleOpenDialog(user?: User): void {
    // Ensure options are loaded before opening dialog
    if (this.availableRoles().length === 0 && !this.rolesLoading()) {
      this.loadRoleOptions();
    }
    if (this.availableYardLocations().length === 0 && !this.yardLocationsLoading()) {
      this.loadYardLocationOptions();
    }
    
    if (user) {
      this.editingUser.set(user);
      this.formData = {
        userName: user.userName,
        emailId: user.emailId,
        role: user.role,
        status: user.status,
        yardLocations: [...user.yardLocations],
        assignedProjects: [...user.assignedProjects]
      };
    } else {
      this.editingUser.set(null);
      this.formData = {
        userName: '',
        emailId: '',
        role: '',
        status: 'active',
        yardLocations: [],
        assignedProjects: []
      };
    }
    this.setIsDialogOpen(true);
  }

  setIsDialogOpen(open: boolean): void {
    this.isDialogOpen.set(open);
    if (!open) {
      this.openDropdown.set(null);
      // Clear search terms when dialog closes
      this.yardLocationSearchTerm = '';
      this.projectSearchTerm = '';
    }
  }

  handleSaveUser(): void {
    if (!this.formData.userName.trim() || !this.formData.emailId.trim()) {
      alert('Please fill in required fields');
      return;
    }

    if (!this.formData.role) {
      alert('Please select a role');
      return;
    }

    if (this.formData.yardLocations.length === 0) {
      alert('Please select at least one yard location');
      return;
    }

    const isAdmin = this.formData.role === 'admin';
    if (!isAdmin && this.formData.assignedProjects.length === 0) {
      alert('Please assign at least one project for non-admin users');
      return;
    }

    this.loading.set(true);
    const editingUser = this.editingUser();
    
    const userData = {
      userName: this.formData.userName.trim(),
      emailId: this.formData.emailId.trim(),
      role: this.formData.role,
      status: this.formData.status,
      yardLocations: this.formData.yardLocations,
      assignedProjects: isAdmin ? [] : this.formData.assignedProjects,
      isActive: this.formData.status === 'active'
    };

    if (editingUser) {
      // Update existing user
      this.userManagementService.updateUser(editingUser.id, { ...userData, id: editingUser.id }).subscribe({
        next: (updatedUser) => {
          this.loading.set(false);
          this.setIsDialogOpen(false);
          this.loadUsers(); // Refresh the data
          alert('User updated successfully');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading.set(false);
          alert('Failed to update user. Please try again.');
        }
      });
    } else {
      // Create new user
      this.userManagementService.createUser(userData).subscribe({
        next: (newUser) => {
          this.loading.set(false);
          this.setIsDialogOpen(false);
          this.loadUsers(); // Refresh the data
          alert('User created successfully');
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loading.set(false);
          alert('Failed to create user. Please try again.');
        }
      });
    }
  }

  handleDeleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading.set(true);
      this.userManagementService.deleteUser(userId).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadUsers(); // Refresh the data
          alert('User deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.loading.set(false);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
    this.openDropdown.set(null);
  }

  toggleDropdown(userId: string): void {
    this.openDropdown.set(this.openDropdown() === userId ? null : userId);
  }

  onRoleChange(role: UserRole): void {
    this.formData.role = role;
    if (role === 'admin') {
      this.formData.assignedProjects = [];
    }
  }

  setOpenYardSelect(open: boolean): void {
    this.openYardSelect.set(open);
  }

  setOpenProjectSelect(open: boolean): void {
    this.openProjectSelect.set(open);
    if (open) {
      this.loadProjects();
    }
  }







  toggleYardLocation(location: string): void {
    if (this.formData.yardLocations.includes(location)) {
      this.formData.yardLocations = this.formData.yardLocations.filter(l => l !== location);
    } else {
      this.formData.yardLocations = [...this.formData.yardLocations, location];
    }
  }

  removeYardLocation(locationToRemove: string): void {
    this.formData.yardLocations = this.formData.yardLocations.filter(loc => loc !== locationToRemove);
  }

  toggleProjectSelection(projectId: string): void {
    if (this.formData.assignedProjects.includes(projectId)) {
      this.formData.assignedProjects = this.formData.assignedProjects.filter(p => p !== projectId);
    } else {
      this.formData.assignedProjects = [...this.formData.assignedProjects, projectId];
    }
  }

  removeProject(projectToRemove: string): void {
    this.formData.assignedProjects = this.formData.assignedProjects.filter(proj => proj !== projectToRemove);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  isAdmin(): boolean {
    return this.formData.role === 'admin';
  }

  getRoleLabel(role: UserRole): string {
    return this.availableRoles().find(r => r.value === role)?.label || role;
  }

  getRoleColor(role: UserRole): string {
    return this.roleColors[role] || this.roleColors['view-only-user'];
  }

  getStatusColor(status: UserStatus): string {
    return this.statusColors[status];
  }

  getYardLocationColor(location: string): string {
    return this.yardLocationColors[location];
  }

  getProjectName(projectId: string): string {
    return this.projects().find(p => p.id === projectId)?.projectName || projectId;
  }

  formatDate(dateInput: string | number | undefined): string {
    if (!dateInput) return '-';
    
    if (typeof dateInput === 'number') {
      return new Date(dateInput).toLocaleDateString();
    }
    
    return new Date(dateInput).toLocaleDateString();
  }

  // Data Table Methods
  updateFilteredData(): void {
    let filtered = [...this.users()];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(searchLower) ||
        user.emailId.toLowerCase().includes(searchLower) ||
        this.getRoleLabel(user.role).toLowerCase().includes(searchLower) ||
        user.status.toLowerCase().includes(searchLower) ||
        user.yardLocations.some(location => location.toLowerCase().includes(searchLower)) ||
        user.assignedProjects.some(projectId => 
          this.getProjectName(projectId).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply role filter
    if (this.filters.role) {
      filtered = filtered.filter(user => user.role === this.filters.role);
    }

    // Apply status filter
    if (this.filters.status) {
      filtered = filtered.filter(user => user.status === this.filters.status);
    }

    // Apply yard location filter
    if (this.filters.yardLocation) {
      filtered = filtered.filter(user => 
        user.yardLocations.includes(this.filters.yardLocation)
      );
    }

    // Apply sorting
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        let aVal: any = a[this.sortColumn as keyof User];
        let bVal: any = b[this.sortColumn as keyof User];

        // Handle special cases for sorting
        if (this.sortColumn === 'lastLogin') {
          aVal = aVal === '-' ? new Date(0) : new Date(aVal);
          bVal = bVal === '-' ? new Date(0) : new Date(bVal);
        } else if (this.sortColumn === 'createdAt') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredUsers.set(filtered);
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginated = this.filteredUsers().slice(startIndex, endIndex);
    this.paginatedUsers.set(paginated);
  }

  // Search functionality
  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Reset to first page
    this.updateFilteredData();
  }

  // Filter functionality
  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page
    this.updateFilteredData();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      role: '',
      status: '',
      yardLocation: ''
    };
    this.currentPage = 1;
    this.updateFilteredData();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filters.role || this.filters.status || this.filters.yardLocation);
  }

  // Sorting functionality
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.updateFilteredData();
  }

  getSortIcon(column: string): any {
    if (this.sortColumn !== column) {
      return this.ChevronUp;
    }
    return this.sortDirection === 'asc' ? this.ChevronUp : this.ChevronDown;
  }

  getSortIconClass(column: string): string {
    if (this.sortColumn !== column) {
      return 'opacity-50';
    }
    return 'text-primary';
  }

  // Pagination functionality
  onPageSizeChange(pageSize: string): void {
    this.pageSize = parseInt(pageSize);
    this.currentPage = 1; // Reset to first page
    this.updatePaginatedData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }
}