import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight, Home, LucideIconData } from 'lucide-angular';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIconData;
  disabled?: boolean;
  current?: boolean;
}

@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <nav [attr.aria-label]="ariaLabel" class="flex" [attr.aria-current]="'page'">
      <ol class="flex items-center space-x-1 md:space-x-3">
        <li *ngFor="let item of items; let i = index; let isLast = last" class="flex items-center">
          <!-- Breadcrumb Item -->
          <div class="flex items-center">
            <a
              *ngIf="item.href && !item.disabled && !item.current; else spanTemplate"
              [href]="item.href"
              [class]="getLinkClasses(item)"
              (click)="onItemClick($event, item, i)"
            >
              <lucide-icon
                *ngIf="item.icon"
                [name]="item.icon"
                [size]="16"
                class="mr-2"
              ></lucide-icon>
              {{ item.label }}
            </a>
            
            <ng-template #spanTemplate>
              <span [class]="getSpanClasses(item)">
                <lucide-icon
                  *ngIf="item.icon"
                  [name]="item.icon"
                  [size]="16"
                  class="mr-2"
                ></lucide-icon>
                {{ item.label }}
              </span>
            </ng-template>
          </div>
          
          <!-- Separator -->
          <lucide-icon
            *ngIf="!isLast"
            [name]="separatorIcon"
            [size]="16"
            class="mx-2 text-muted-foreground"
          ></lucide-icon>
        </li>
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() separatorIcon = ChevronRight;
  @Input() ariaLabel = 'Breadcrumb navigation';
  @Input() maxItems?: number;
  @Input() showHome = false;
  @Input() homeIcon = Home;
  @Input() homeLabel = 'Home';
  @Input() homeHref = '/';
  
  @Output() itemClick = new EventEmitter<{item: BreadcrumbItem, index: number}>();

  // Icons
  ChevronRight = ChevronRight;
  Home = Home;

  get processedItems(): BreadcrumbItem[] {
    let result = [...this.items];
    
    // Add home item if requested
    if (this.showHome && result.length > 0 && result[0].label !== this.homeLabel) {
      result.unshift({
        label: this.homeLabel,
        href: this.homeHref,
        icon: this.homeIcon
      });
    }
    
    // Truncate if maxItems is set
    if (this.maxItems && result.length > this.maxItems) {
      const start = result.slice(0, 1);
      const end = result.slice(-(this.maxItems - 2));
      const ellipsis = { label: '...', disabled: true };
      result = [...start, ellipsis, ...end];
    }
    
    // Mark the last item as current
    if (result.length > 0) {
      result[result.length - 1].current = true;
    }
    
    return result;
  }

  onItemClick(event: Event, item: BreadcrumbItem, index: number): void {
    if (item.disabled || item.current) {
      event.preventDefault();
      return;
    }
    
    this.itemClick.emit({ item, index });
  }

  getLinkClasses(item: BreadcrumbItem): string {
    const baseClasses = 'inline-flex items-center text-sm font-medium transition-colors hover:text-foreground';
    const colorClasses = 'text-muted-foreground hover:text-foreground';
    
    return `${baseClasses} ${colorClasses}`;
  }

  getSpanClasses(item: BreadcrumbItem): string {
    const baseClasses = 'inline-flex items-center text-sm font-medium';
    
    if (item.current) {
      return `${baseClasses} text-foreground`;
    }
    
    if (item.disabled) {
      return `${baseClasses} text-muted-foreground cursor-not-allowed`;
    }
    
    return `${baseClasses} text-muted-foreground`;
  }
}

// Breadcrumb Item Component for more complex layouts
@Component({
  selector: 'ui-breadcrumb-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <li class="flex items-center">
      <ng-content></ng-content>
      <lucide-icon
        *ngIf="!isLast"
        [name]="ChevronRight"
        [size]="16"
        class="mx-2 text-muted-foreground"
      ></lucide-icon>
    </li>
  `
})
export class BreadcrumbItemComponent {
  @Input() isLast = false;
  
  ChevronRight = ChevronRight;
}

// Breadcrumb Link Component
@Component({
  selector: 'ui-breadcrumb-link',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <a
      [href]="href"
      [class]="linkClasses"
      (click)="onClick($event)"
    >
      <lucide-icon
        *ngIf="icon"
        [name]="icon"
        [size]="16"
        class="mr-2"
      ></lucide-icon>
      <ng-content></ng-content>
    </a>
  `
})
export class BreadcrumbLinkComponent {
  @Input() href = '#';
  @Input() icon?: LucideIconData;
  @Input() disabled = false;
  
  @Output() clicked = new EventEmitter<Event>();

  get linkClasses(): string {
    const baseClasses = 'inline-flex items-center text-sm font-medium transition-colors';
    
    if (this.disabled) {
      return `${baseClasses} text-muted-foreground cursor-not-allowed`;
    }
    
    return `${baseClasses} text-muted-foreground hover:text-foreground`;
  }

  onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    
    this.clicked.emit(event);
  }
}

// Breadcrumb Page Component (for current page)
@Component({
  selector: 'ui-breadcrumb-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <span class="inline-flex items-center text-sm font-medium text-foreground">
      <lucide-icon
        *ngIf="icon"
        [name]="icon"
        [size]="16"
        class="mr-2"
      ></lucide-icon>
      <ng-content></ng-content>
    </span>
  `
})
export class BreadcrumbPageComponent {
  @Input() icon?: LucideIconData;
}