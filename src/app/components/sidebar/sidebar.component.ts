import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Home,
  BarChart3,
  Database,
  Settings,
  FileText,
  CheckCircle2,
  BookOpen,
  PieChart,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings2,
} from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { SeparatorComponent } from '../ui/separator.component';
import { AvatarComponent } from '../ui/avatar.component';
import { BadgeComponent } from '../ui/badge.component';
import { TooltipComponent } from '../ui/tooltip.component';
import { CollapsibleComponent } from '../ui/collapsible.component';
import { UserRole } from '../../models/user-role.model';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  subItems?: {
    id: string;
    label: string;
  }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent,
    SeparatorComponent,
    AvatarComponent,
    BadgeComponent,
    TooltipComponent,
    CollapsibleComponent
  ],
  template: `
    <div class="w-80 min-w-80 h-full bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/30 flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b sidebar-border">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-sidebar-primary rounded-lg">
            <lucide-icon [name]="BarChart3" [size]="24" class="text-sidebar-primary-foreground"></lucide-icon>
          </div>
          <div>
            <h1 class="text-sidebar-foreground text-lg font-semibold">MLF</h1>
            <p class="text-sidebar-foreground/70 text-sm">
              Monthly Labor Forecast
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 min-h-0">
        <ul class="space-y-1 px-4 h-full text-[rgba(141,147,162,1)]">
          <li *ngFor="let item of getFilteredNavigationItems(); trackBy: trackByItemId">
            <button
              *ngIf="!item.subItems"
              (click)="handleItemClick(item)"
              [class]="getMainItemClasses(item.id)"
            >
              <lucide-icon [name]="item.icon" [size]="18"></lucide-icon>
              <span class="flex-1 text-left">{{ item.label }}</span>
            </button>
            
            <!-- Item with sub-items -->
            <div *ngIf="item.subItems">
              <button
                (click)="toggleExpanded(item.id)"
                [class]="getMainItemClasses(item.id, true)"
              >
                <lucide-icon [name]="item.icon" [size]="18"></lucide-icon>
                <span class="flex-1 text-left">{{ item.label }}</span>
                <lucide-icon 
                  [name]="isExpanded(item.id) ? ChevronDown : ChevronRight" 
                  [size]="16" 
                  class="text-white/60"
                ></lucide-icon>
              </button>
              
              <!-- Sub Items -->
              <ul *ngIf="isExpanded(item.id)" class="mt-2 ml-6 space-y-1">
                <li *ngFor="let subItem of item.subItems">
                  <button
                    (click)="handleSubItemClick(subItem.id)"
                    [class]="getSubItemClasses(subItem.id)"
                  >
                    <div class="w-2 h-2 rounded-full bg-white/40"></div>
                    <span>{{ subItem.label }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t sidebar-border">
        <div class="text-center">
          <p class="text-sidebar-foreground/50 text-xs">
            MLF v2.1
          </p>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent {
  @Input() activeItem = 'home';
  @Input() currentUser: UserRole | null = null;
  @Input() collapsed = false;
  
  @Output() navigate = new EventEmitter<string>();
  
  // Expanded items state
  expandedItems = signal(new Set(['mlf-configuration', 'reports']));
  
  // Icons
  Home = Home;
  BarChart3 = BarChart3;
  Database = Database;
  Settings = Settings;
  Settings2 = Settings2;
  FileText = FileText;
  CheckCircle2 = CheckCircle2;
  Users = Users;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  ChevronDown = ChevronDown;
  
  navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'MLF Dashboard',
      icon: Home
    },
    {
      id: 'forecast-approvals',
      label: 'Forecast Approvals',
      icon: CheckCircle2
    },
    {
      id: 'mlf-configuration',
      label: 'MLF Configuration',
      icon: Settings,
      subItems: [
        { id: 'master-data-configurations', label: 'Master Data Configurations' },
        { id: 'project-configurations', label: 'Project Setup & Config' }
      ]
    },
    {
      id: 'manage-mlf-rules',
      label: 'Manage MLF Rules',
      icon: Settings2
    },
    {
      id: 'reports',
      label: 'MLF Toolkit & Reports',
      icon: FileText,
      subItems: [
        { id: 'monthly-forecast', label: 'Monthly Forecast' },
        { id: 'mlf-variance-report', label: 'MLF Variance Report' },
        { id: 'power-bi-reports', label: 'Power BI Reports' }
      ]
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users
    }
  ];
  
  toggleExpanded(itemId: string): void {
    const expanded = this.expandedItems();
    const newSet = new Set(expanded);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    this.expandedItems.set(newSet);
  }
  
  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }
  
  handleItemClick(item: NavigationItem): void {
    if (item.subItems) {
      this.toggleExpanded(item.id);
    } else {
      this.navigate.emit(item.id);
    }
  }
  
  handleSubItemClick(subItemId: string): void {
    this.navigate.emit(subItemId);
  }
  
  getFilteredNavigationItems(): NavigationItem[] {
    if (!this.currentUser?.permissions) {
      return [];
    }
    
    return this.navigationItems.filter(item => {
      // Check if main item is allowed
      if (this.currentUser!.permissions.includes(item.id)) return true;
      
      // Check if any sub-item is allowed
      if (item.subItems) {
        const allowedSubItems = item.subItems.filter(subItem => 
          this.currentUser!.permissions.includes(subItem.id)
        );
        if (allowedSubItems.length > 0) {
          // Create a copy with filtered sub-items
          const filteredItem = { ...item };
          filteredItem.subItems = allowedSubItems;
          return true;
        }
      }
      
      return false;
    });
  }
  
  getMainItemClasses(itemId: string, hasSubItems = false): string {
    const baseClasses = 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200';
    const isActive = this.activeItem === itemId && !hasSubItems;
    
    if (isActive) {
      return `${baseClasses} bg-white/20 text-white`;
    } else {
      return `${baseClasses} text-white/80 hover:bg-white/10 hover:text-white`;
    }
  }
  
  getSubItemClasses(subItemId: string): string {
    const baseClasses = 'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm';
    const isActive = this.activeItem === subItemId;
    
    if (isActive) {
      return `${baseClasses} bg-white/20 text-white`;
    } else {
      return `${baseClasses} text-white/70 hover:bg-white/10 hover:text-white`;
    }
  }
  
  trackByItemId(index: number, item: NavigationItem): string {
    return item.id;
  }
}