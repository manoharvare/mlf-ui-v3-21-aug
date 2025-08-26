import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { UserRole } from '../../models/user-role.model';
import { AuthUserRoleService, AuthUserState } from '../../core/services/auth-user-role.service';
import { User as BackendUser } from '../../core/services/user.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
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
              class="h-4 w-4"
            ></lucide-icon>
          </button>
          
          <div>
            <h1 class="text-lg font-semibold" [style.color]="'var(--header-foreground)'">{{ title }}</h1>
            <p *ngIf="subtitle" class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
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
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() isSidebarCollapsed = false;
  @Input() showSidebarToggle = false;
  
  @Output() toggleSidebar = new EventEmitter<void>();
  
  // Auth user state from database
  currentUser: UserRole | null = null;
  backendUser: BackendUser | null = null;
  availableRoles: UserRole[] = [];
  isLoaded = false;
  private authSubscription?: Subscription;
  @Output() roleChange = new EventEmitter<UserRole>();
  
  // Dropdown state
  dropdownOpen = signal(false);
  
  constructor(private authUserRoleService: AuthUserRoleService) {}

  ngOnInit(): void {
    // Subscribe to auth user state changes from database
    this.authSubscription = this.authUserRoleService.authUserState$.subscribe((authUserState: AuthUserState) => {
      console.log('🎯 HeaderComponent - Auth user state changed:', authUserState);
      this.currentUser = authUserState.userRole;
      this.backendUser = authUserState.user;
      this.isLoaded = authUserState.isLoaded;
      
      // Get available roles from AuthUserRoleService
      this.availableRoles = this.authUserRoleService.getAvailableRoles();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

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
    const name = this.backendUser?.userName || this.currentUser?.name;
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }
  
  isSelectedRole(role: UserRole): boolean {
    return this.currentUser?.id === role.id;
  }
  
  onRoleChange(role: UserRole): void {
    console.log('🎯 HeaderComponent - Role change requested:', role);
    this.authUserRoleService.setUserRole(role);
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