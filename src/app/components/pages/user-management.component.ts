import { Component, signal } from '@angular/core';
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
  ChevronsUpDown
} from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { BadgeComponent, BadgeVariant } from '../ui/badge.component';
import { InputComponent } from '../ui/input.component';
import { SelectComponent } from '../ui/select.component';
import { DialogComponent } from '../ui/dialog.component';
import { LabelComponent } from '../ui/label.component';
import { AvatarComponent } from '../ui/avatar.component';
import { PopoverComponent } from '../ui/popover.component';
import { CommandComponent } from '../ui/command.component';

type UserRole = 'admin' | 'fab-manager' | 'fab-planner' | 'planner' | 'viewer' | 'management';
type UserStatus = 'active' | 'inactive';
type YardLocation = 'BFA' | 'JAY' | 'SAFIRA' | 'QFAB' | 'QMW';

interface User {
  id: string;
  userName: string;
  emailId: string;
  role: UserRole;
  status: UserStatus;
  yardLocations: YardLocation[];
  assignedProjects: string[];
  createdAt: string;
  lastLogin: string;
}

interface Project {
  id: string;
  name: string;
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
    CommandComponent
  ],

  template: `
    <div class="p-8">
      <div class="w-full">
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
                    <ui-select 
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
                    <ui-popover 
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
                      >
                        <span>
                          {{ formData.yardLocations.length > 0 
                            ? formData.yardLocations.length + ' location(s) selected' 
                            : 'Select yard locations...' }}
                        </span>
                        <lucide-icon [name]="ChevronsUpDown" [size]="16" class="ml-2 shrink-0 opacity-50"></lucide-icon>
                      </ui-button>
                      
                      <div class="w-full p-0">
                        <ui-command 
                          placeholder="Search locations..."
                          [items]="yardLocationCommandItems"
                          (itemSelected)="onYardLocationSelect($event)"
                          class="w-full"
                        >
                          <div class="max-h-60 overflow-auto p-1">
                            <div *ngFor="let location of availableYardLocations" 
                                 class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                 (click)="toggleYardLocation(location)">
                              <div class="flex items-center space-x-2 w-full">
                                <div class="w-4 h-4 border border-primary rounded-sm flex items-center justify-center"
                                     [class.bg-primary]="formData.yardLocations.includes(location)"
                                     [class.bg-white]="!formData.yardLocations.includes(location)">
                                  <lucide-icon 
                                    *ngIf="formData.yardLocations.includes(location)"
                                    [name]="Check" 
                                    [size]="12" 
                                    class="text-primary-foreground">
                                  </lucide-icon>
                                </div>
                                <div class="flex items-center gap-2">
                                  <lucide-icon [name]="MapPin" [size]="16" class="text-gray-500"></lucide-icon>
                                  <span class="font-medium">{{ location }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ui-command>
                      </div>
                    </ui-popover>
                    
                    <!-- Selected Yard Locations Display -->
                    <div *ngIf="formData.yardLocations.length > 0" class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm text-foreground">Selected Locations:</span>
                      <ui-badge 
                        *ngFor="let location of formData.yardLocations" 
                        variant="secondary"
                        size="sm"
                        [customClasses]="getYardLocationColor(location) + ' gap-1'"
                        [leftIcon]="MapPin"
                      >
                        {{ location }}
                        <lucide-icon 
                          [name]="X" 
                          [size]="12" 
                          class="cursor-pointer hover:text-destructive"
                          (click)="removeYardLocation(location)"
                        ></lucide-icon>
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
                      >
                        <span>
                          {{ formData.assignedProjects.length > 0 
                            ? formData.assignedProjects.length + ' project(s) selected' 
                            : 'Select projects...' }}
                        </span>
                        <lucide-icon [name]="ChevronsUpDown" [size]="16" class="ml-2 shrink-0 opacity-50"></lucide-icon>
                      </ui-button>
                      
                      <div class="w-full p-0">
                        <ui-command 
                          placeholder="Search projects..."
                          [items]="projectCommandItems"
                          (itemSelected)="onProjectSelect($event)"
                          class="w-full"
                        >
                          <div class="max-h-60 overflow-auto p-1">
                            <div *ngFor="let project of projects" 
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
                                <div class="flex-1">
                                  <div class="font-medium">{{ project.name }}</div>
                                  <div class="text-xs text-gray-500">{{ project.description }}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ui-command>
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
                          class="gap-1"
                          [leftIcon]="Building2"
                        >
                          {{ getProjectName(projectId) }}
                          <lucide-icon 
                            [name]="X" 
                            [size]="12" 
                            class="cursor-pointer hover:text-destructive"
                            (click)="removeProject(projectId)"
                          ></lucide-icon>
                        </ui-badge>
                      </div>
                      
                      <div class="text-sm text-gray-600">
                        Selected: {{ formData.assignedProjects.length }} of {{ projects.length }} projects
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

        <!-- Users Table -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-3 font-medium text-gray-900 w-12">#</th>
                <th class="text-left p-3 font-medium text-gray-900">User</th>
                <th class="text-left p-3 font-medium text-gray-900">Email</th>
                <th class="text-left p-3 font-medium text-gray-900">Role</th>
                <th class="text-left p-3 font-medium text-gray-900">Status</th>
                <th class="text-left p-3 font-medium text-gray-900">Yard Locations</th>
                <th class="text-left p-3 font-medium text-gray-900">Projects</th>
                <th class="text-left p-3 font-medium text-gray-900">Created</th>
                <th class="text-left p-3 font-medium text-gray-900">Last Login</th>
                <th class="text-left p-3 font-medium text-gray-900 w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users(); let i = index" class="border-t hover:bg-gray-50">
                <td class="p-3 font-medium text-gray-500">
                  {{ i + 1 }}
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
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="p-3 text-sm text-gray-600">
                  {{ user.lastLogin === '-' ? 'Never' : formatDate(user.lastLogin) }}
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

        <!-- Empty State -->
        <div *ngIf="users().length === 0" class="text-center py-12">
          <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <lucide-icon [name]="Shield" [size]="48" class="text-gray-400 mx-auto mb-4"></lucide-icon>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Users Yet</h3>
            <p class="text-gray-600 mb-4">
              Get started by adding your first user to the system.
            </p>
            <ui-button (clicked)="handleOpenDialog()" [leftIcon]="Plus">
              Add Your First User
            </ui-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent {
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

  // State signals
  users = signal<User[]>([
    {
      id: '1',
      userName: 'John Smith',
      emailId: 'john.smith@company.com',
      role: 'admin',
      status: 'active',
      yardLocations: ['BFA', 'JAY'],
      assignedProjects: [],
      createdAt: '2024-01-01',
      lastLogin: '2024-01-22'
    },
    {
      id: '2',
      userName: 'Sarah Johnson',
      emailId: 'sarah.johnson@company.com',
      role: 'fab-manager',
      status: 'active',
      yardLocations: ['SAFIRA', 'QFAB'],
      assignedProjects: ['project-1', 'project-4', 'project-5'],
      createdAt: '2024-01-05',
      lastLogin: '2024-01-21'
    },
    {
      id: '3',
      userName: 'Mike Davis',
      emailId: 'mike.davis@company.com',
      role: 'planner',
      status: 'active',
      yardLocations: ['BFA'],
      assignedProjects: ['project-2', 'project-6'],
      createdAt: '2024-01-10',
      lastLogin: '2024-01-20'
    },
    {
      id: '4',
      userName: 'Emily Wilson',
      emailId: 'emily.wilson@company.com',
      role: 'viewer',
      status: 'inactive',
      yardLocations: ['QMW'],
      assignedProjects: ['project-1'],
      createdAt: '2024-01-15',
      lastLogin: '2024-01-18'
    },
    {
      id: '5',
      userName: 'David Brown',
      emailId: 'david.brown@company.com',
      role: 'management',
      status: 'active',
      yardLocations: ['JAY', 'SAFIRA', 'QFAB'],
      assignedProjects: ['project-3', 'project-7', 'project-8'],
      createdAt: '2024-01-12',
      lastLogin: '2024-01-19'
    }
  ]);

  isDialogOpen = signal(false);
  editingUser = signal<User | null>(null);
  openDropdown = signal<string | null>(null);
  openYardSelect = signal(false);
  openProjectSelect = signal(false);

  // Sample projects from master data
  projects: Project[] = [
    { id: 'project-1', name: 'Project Alpha', description: 'Main construction project' },
    { id: 'project-2', name: 'Project Beta', description: 'Infrastructure development' },
    { id: 'project-3', name: 'Project Gamma', description: 'Equipment installation' },
    { id: 'project-4', name: 'Project Delta', description: 'Site preparation' },
    { id: 'project-5', name: 'Project Epsilon', description: 'Quality assurance' },
    { id: 'project-6', name: 'Project Zeta', description: 'Final commissioning' },
    { id: 'project-7', name: 'Project Eta', description: 'Maintenance operations' },
    { id: 'project-8', name: 'Project Theta', description: 'Training program' },
    { id: 'project-9', name: 'Project Iota', description: 'Documentation review' },
    { id: 'project-10', name: 'Project Kappa', description: 'System integration' }
  ];

  availableRoles: { value: UserRole; label: string; description: string }[] = [
    { value: 'admin', label: 'Admin', description: 'Full system access to all projects' },
    { value: 'fab-manager', label: 'Fab Manager', description: 'Fabrication management and oversight' },
    { value: 'fab-planner', label: 'Fab Planner', description: 'Fabrication planning and scheduling' },
    { value: 'planner', label: 'Planner', description: 'Project planning and coordination' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to assigned projects' },
    { value: 'management', label: 'Management', description: 'Management oversight and reporting' }
  ];

  availableYardLocations: YardLocation[] = ['BFA', 'JAY', 'SAFIRA', 'QFAB', 'QMW'];

  formData = {
    userName: '',
    emailId: '',
    role: 'viewer' as UserRole,
    status: 'active' as UserStatus,
    yardLocations: [] as YardLocation[],
    assignedProjects: [] as string[]
  };

  roleColors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    'fab-manager': 'bg-blue-100 text-blue-800 border-blue-200',
    'fab-planner': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    planner: 'bg-green-100 text-green-800 border-green-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
    management: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  yardLocationColors: Record<YardLocation, string> = {
    BFA: 'bg-orange-100 text-orange-800 border-orange-200',
    JAY: 'bg-teal-100 text-teal-800 border-teal-200',
    SAFIRA: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    QFAB: 'bg-pink-100 text-pink-800 border-pink-200',
    QMW: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  // Computed properties for select options
  get statusOptions() {
    return [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];
  }

  get roleSelectOptions() {
    return this.availableRoles.map(role => ({
      value: role.value,
      label: `${role.label} - ${role.description}`
    }));
  }

  get yardLocationCommandItems() {
    return this.availableYardLocations.map(location => ({
      id: location,
      label: location,
      icon: this.MapPin,
      data: location
    }));
  }

  get projectCommandItems() {
    return this.projects.map(project => ({
      id: project.id,
      label: project.name,
      description: project.description,
      icon: this.Building2,
      data: project
    }));
  }

  handleOpenDialog(user?: User): void {
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
        role: 'viewer',
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

    const editingUser = this.editingUser();
    if (editingUser) {
      // Update existing user
      this.users.update(users => users.map(user => 
        user.id === editingUser.id 
          ? {
              ...user,
              ...this.formData,
              assignedProjects: isAdmin ? [] : this.formData.assignedProjects
            }
          : user
      ));
      alert('User updated successfully');
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...this.formData,
        assignedProjects: isAdmin ? [] : this.formData.assignedProjects,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '-'
      };
      this.users.update(users => [...users, newUser]);
      alert('User created successfully');
    }

    this.setIsDialogOpen(false);
  }

  handleDeleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users.update(users => users.filter(user => user.id !== userId));
      alert('User deleted successfully');
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
  }

  onYardLocationSelect(item: any): void {
    if (item && item.data) {
      this.toggleYardLocation(item.data);
    }
  }

  onProjectSelect(item: any): void {
    if (item && item.data) {
      this.toggleProjectSelection(item.data.id);
    }
  }

  toggleYardLocation(location: YardLocation): void {
    if (this.formData.yardLocations.includes(location)) {
      this.formData.yardLocations = this.formData.yardLocations.filter(l => l !== location);
    } else {
      this.formData.yardLocations = [...this.formData.yardLocations, location];
    }
  }

  removeYardLocation(locationToRemove: YardLocation): void {
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
    return this.availableRoles.find(r => r.value === role)?.label || role;
  }

  getRoleColor(role: UserRole): string {
    return this.roleColors[role] || this.roleColors.viewer;
  }

  getStatusColor(status: UserStatus): string {
    return this.statusColors[status];
  }

  getYardLocationColor(location: YardLocation): string {
    return this.yardLocationColors[location];
  }

  getProjectName(projectId: string): string {
    return this.projects.find(p => p.id === projectId)?.name || projectId;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}