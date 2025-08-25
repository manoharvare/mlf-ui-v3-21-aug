import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  TriangleAlert,
  Info,
  Tag
} from 'lucide-angular';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [ngClass]="badgeClasses" (click)="handleClick($event)">
      <!-- Left Icon -->
      <lucide-icon 
        *ngIf="leftIcon" 
        [name]="leftIcon" 
        [size]="iconSize"
        class="shrink-0">
      </lucide-icon>
      
      <!-- Content -->
      <span>
        <ng-content></ng-content>
      </span>
      
      <!-- Right Icon -->
      <lucide-icon 
        *ngIf="rightIcon" 
        [name]="rightIcon" 
        [size]="iconSize"
        class="shrink-0"
        [class.cursor-pointer]="rightIconClickable"
        [class.hover:text-destructive]="rightIconClickable"
        (click)="handleRightIconClick($event)">
      </lucide-icon>
      
      <!-- Dot indicator -->
      <div *ngIf="dot" 
           class="w-2 h-2 rounded-full bg-current opacity-60">
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() leftIcon?: any;
  @Input() rightIcon?: any;
  @Input() rightIconClickable = false;
  @Input() dot = false;
  @Input() rounded = true;
  @Input() customClasses = '';
  
  @Output() clicked = new EventEmitter<Event>();
  @Output() rightIconClick = new EventEmitter<Event>();

  // Icon references for template
  CheckCircle = CheckCircle;
  Clock = Clock;
  XCircle = XCircle;
  ArrowRight = ArrowRight;
  TriangleAlert = TriangleAlert;
  Info = Info;
  Tag = Tag;

  get badgeClasses(): string {
    if (this.customClasses) {
      const baseClasses = 'inline-flex items-center gap-1 border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
      const sizeClasses = this.getSizeClasses();
      const roundedClasses = this.rounded ? 'rounded-full' : 'rounded-md';
      return `${baseClasses} ${sizeClasses} ${roundedClasses} ${this.customClasses}`.trim();
    }
    
    const baseClasses = 'inline-flex items-center gap-1 border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    const roundedClasses = this.rounded ? 'rounded-full' : 'rounded-md';
    
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${roundedClasses}`.trim();
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 10;
      case 'md': return 12;
      case 'lg': return 14;
      default: return 12;
    }
  }

  private getVariantClasses(): string {
    switch (this.variant) {
      case 'default':
        return 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80';
      case 'secondary':
        return 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80';
      case 'destructive':
        return 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80';
      case 'outline':
        return 'text-foreground border-border bg-transparent hover:bg-accent hover:text-accent-foreground';
      case 'success':
        return 'border-transparent bg-green-500 text-white shadow hover:bg-green-500/80';
      case 'warning':
        return 'border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-500/80';
      case 'info':
        return 'border-transparent bg-blue-500 text-white shadow hover:bg-blue-500/80';
      default:
        return 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80';
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  }

  handleClick(event: Event) {
    this.clicked.emit(event);
  }

  handleRightIconClick(event: Event) {
    if (this.rightIconClickable) {
      event.stopPropagation(); // Prevent the badge click event from firing
      this.rightIconClick.emit(event);
    }
  }
}