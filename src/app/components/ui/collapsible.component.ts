import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  ChevronDown,
  ChevronRight
} from 'lucide-angular';

export type CollapsibleSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-collapsible',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="containerClasses">
      <!-- Trigger -->
      <button
        type="button"
        [class]="triggerClasses"
        [disabled]="disabled"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="contentId"
      >
        <!-- Icon -->
        <lucide-icon 
          [name]="isOpen ? ChevronDown : ChevronRight" 
          [size]="iconSize"
          [class]="iconClasses">
        </lucide-icon>
        
        <!-- Title -->
        <span [class]="titleClasses">
          <ng-content select="[slot=trigger]"></ng-content>
          <span *ngIf="title">{{ title }}</span>
        </span>
        
        <!-- Badge/Counter -->
        <span *ngIf="badge" [class]="badgeClasses">
          {{ badge }}
        </span>
      </button>
      
      <!-- Content -->
      <div 
        [id]="contentId"
        [class]="contentWrapperClasses"
        [style.height]="contentHeight"
        [attr.aria-hidden]="!isOpen"
      >
        <div [class]="contentClasses">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: CollapsibleSize = 'md';
  @Input() disabled = false;
  @Input() badge?: string | number;
  @Input() animated = true;
  @Input() bordered = false;
  @Input() className = '';
  
  @Output() openChange = new EventEmitter<boolean>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  // Icons
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;

  contentId = `collapsible-content-${Math.random().toString(36).substr(2, 9)}`;

  get containerClasses(): string {
    const baseClasses = 'w-full';
    const borderedClasses = this.bordered ? 'border border-border rounded-md' : '';
    
    return `${baseClasses} ${borderedClasses} ${this.className}`;
  }

  get triggerClasses(): string {
    const baseClasses = 'flex w-full items-center justify-between text-left font-medium transition-all hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const sizeClasses = this.getTriggerSizeClasses();
    const borderedClasses = this.bordered ? 'px-4' : '';
    
    return `${baseClasses} ${sizeClasses} ${borderedClasses}`;
  }

  get iconClasses(): string {
    const baseClasses = 'shrink-0 transition-transform duration-200';
    const animatedClasses = this.animated ? 'ease-in-out' : '';
    
    return `${baseClasses} ${animatedClasses}`;
  }

  get titleClasses(): string {
    return 'flex-1 text-left';
  }

  get badgeClasses(): string {
    return 'ml-2 inline-flex items-center justify-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground';
  }

  get contentWrapperClasses(): string {
    const baseClasses = 'overflow-hidden';
    const animatedClasses = this.animated ? 'transition-all duration-200 ease-in-out' : '';
    
    return `${baseClasses} ${animatedClasses}`;
  }

  get contentClasses(): string {
    const baseClasses = 'text-sm text-muted-foreground';
    const sizeClasses = this.getContentSizeClasses();
    const borderedClasses = this.bordered ? 'px-4 pb-4' : '';
    
    return `${baseClasses} ${sizeClasses} ${borderedClasses}`;
  }

  get contentHeight(): string {
    return this.isOpen ? 'auto' : '0px';
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      default: return 16;
    }
  }

  private getTriggerSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'py-2 text-sm';
      case 'md':
        return 'py-3 text-base';
      case 'lg':
        return 'py-4 text-lg';
      default:
        return 'py-3 text-base';
    }
  }

  private getContentSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'pt-1 text-xs';
      case 'md':
        return 'pt-2 text-sm';
      case 'lg':
        return 'pt-3 text-base';
      default:
        return 'pt-2 text-sm';
    }
  }

  toggle(): void {
    if (this.disabled) return;
    
    this.isOpen = !this.isOpen;
    this.openChange.emit(this.isOpen);
    
    if (this.isOpen) {
      this.opened.emit();
    } else {
      this.closed.emit();
    }
  }

  open(): void {
    if (this.disabled || this.isOpen) return;
    
    this.isOpen = true;
    this.openChange.emit(true);
    this.opened.emit();
  }

  close(): void {
    if (this.disabled || !this.isOpen) return;
    
    this.isOpen = false;
    this.openChange.emit(false);
    this.closed.emit();
  }
}

// Collapsible Group Component
@Component({
  selector: 'ui-collapsible-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleGroupComponent {
  @Input() allowMultiple = false;
  @Input() className = '';

  get containerClasses(): string {
    const baseClasses = 'space-y-2';
    
    return `${baseClasses} ${this.className}`;
  }
}