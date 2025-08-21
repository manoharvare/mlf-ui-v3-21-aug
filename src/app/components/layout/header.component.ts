import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Menu,
  PanelLeftClose,
  ChevronDown,
  Check,
  Shield,
  UserCheck,
  User,
  CheckCircle,
  BarChart3,
  Eye
} from 'lucide-angular';
import { UserRole } from '../../models/user-role.model';
import { DropdownComponent, DropdownItem } from '../ui/dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DropdownComponent
  ],
  template: `
    <div class="bg-white border-b border-border px-8 py-6" 
         [style.background-color]="'var(--header-background)'"
         [style.color]="'var(--header-foreground)'">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Sidebar toggle (only show if onToggleSidebar is provided) -->
          <button
            *ngIf="showSidebarToggle"
            (click)="toggleSidebar.emit()"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-muted/50 h-8 px-3"
          >
            <lucide-icon 
              [name]="isSidebarCollapsed ? Menu : PanelLeftClose" 
              [size]="20"
            ></lucide-icon>
          </button>
          
          <div>
            <h1 [style.color]="'var(--header-foreground)'">{{ title }}</h1>
            <p *ngIf="subtitle" class="text-muted-foreground mt-1">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Right side - User Role Dropdown -->
        <div class="flex items-center gap-3">
          <!-- User Role Dropdown -->
          <div *ngIf="currentUser && availableRoles && availableRoles.length > 0" class="relative">
            <div
              (click)="toggleDropdown()"
              class="flex items-center gap-2 hover:bg-gray-50 rounded-md px-2 py-1 cursor-pointer transition-colors"
            >
              <div class="w-6 h-6 rounded-full flex items-center justify-center" 
                   style="background-color: #D9DBE9;">
                <span 
                  class="text-xs font-medium"
                  style="color: #000000; font-family: 'Roboto', sans-serif;"
                >
                  {{ getUserInitials() }}
                </span>
              </div>
              <div class="flex flex-col items-start">
                <span 
                  class="text-xs leading-tight"
                  style="color: #374151; font-family: 'Roboto', sans-serif;"
                >
                  {{ currentUser.name }}
                </span>
                <span 
                  *ngIf="currentUser.isReadOnly"
                  class="leading-tight"
                  style="color: #ea580c; font-size: 10px; font-family: 'Roboto', sans-serif;"
                >
                  Read-Only
                </span>
              </div>
              <lucide-icon [name]="ChevronDown" [size]="12" style="color: #6b7280;"></lucide-icon>
            </div>
            
            <!-- Dropdown content -->
            <div 
              *ngIf="isDropdownOpen()"
              class="absolute right-0 top-full mt-1 w-64 rounded-md shadow-lg z-50"
              style="background-color: white; border: 1px solid #e5e7eb;"
            >
              <div class="text-sm font-medium p-3" 
                   style="border-bottom: 1px solid #e5e7eb; color: #111827;">
                Switch Role
              </div>
              <div class="py-1">
                <div
                  *ngFor="let role of availableRoles"
                  (click)="onRoleChange(role)"
                  class="flex items-center gap-3 p-3 cursor-pointer w-full transition-colors text-left dropdown-role-item"
                  style="border: none; background: none;"
                >
                  <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                       style="background-color: #f3f4f6; color: #4b5563;">
                    <lucide-icon [name]="getRoleIcon(role)" [size]="16"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm" style="color: #111827;">{{ role.name }}</span>
                      <lucide-icon 
                        *ngIf="isSelectedRole(role)" 
                        [name]="Check" 
                        [size]="16" 
                        style="color: #16a34a;"
                      ></lucide-icon>
                    </div>
                    <p class="text-xs" style="color: #6b7280; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;">
                      {{ role.description }}
                    </p>
                    <span 
                      *ngIf="role.isReadOnly" 
                      class="text-xs font-medium"
                      style="color: #ea580c;"
                    >
                      Read-Only Access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop to close dropdown -->
    <div 
      *ngIf="isDropdownOpen()"
      class="fixed inset-0 z-40"
      (click)="closeDropdown()"
    ></div>
  `
})
export class HeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() currentUser: UserRole | null = null;
  @Input() availableRoles: UserRole[] = [];
  @Input() isSidebarCollapsed = false;
  @Input() showSidebarToggle = false;
  
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() roleChange = new EventEmitter<UserRole>();
  
  // Dropdown state
  dropdownOpen = signal(false);
  
  // Icons
  Menu = Menu;
  PanelLeftClose = PanelLeftClose;
  ChevronDown = ChevronDown;
  Check = Check;
  Shield = Shield;
  UserCheck = UserCheck;
  User = User;
  CheckCircle = CheckCircle;
  BarChart3 = BarChart3;
  Eye = Eye;

  // Icon mapping for role icons
  private iconMap: { [key: string]: any } = {
    'shield': Shield,
    'user-check': UserCheck,
    'user': User,
    'check-circle': CheckCircle,
    'bar-chart-3': BarChart3,
    'eye': Eye
  };
  
  getUserInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
  
  isSelectedRole(role: UserRole): boolean {
    return this.currentUser?.id === role.id;
  }
  
  onRoleChange(role: UserRole): void {
    this.roleChange.emit(role);
    this.closeDropdown();
  }
  
  toggleDropdown(): void {
    this.dropdownOpen.update(open => !open);
  }
  
  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }
  
  isDropdownOpen(): boolean {
    return this.dropdownOpen();
  }

  getRoleIcon(role: UserRole): any {
    return this.iconMap[role.icon] || User;
  }
}