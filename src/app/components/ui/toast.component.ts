import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, CheckCircle, AlertCircle, Info, AlertTriangle, LucideIconData } from 'lucide-angular';
import { slideInFromRight } from './animations';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastData {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: LucideIconData;
}

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      [class]="toastClasses"
      role="alert"
      [attr.aria-live]="variant === 'error' ? 'assertive' : 'polite'"
      [@slideInFromRight]
    >
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <lucide-icon
            [name]="displayIcon"
            [size]="20"
            [class]="iconClasses"
          ></lucide-icon>
        </div>
        
        <div class="flex-1 min-w-0">
          <div *ngIf="title" class="text-sm font-medium text-foreground">
            {{ title }}
          </div>
          <div *ngIf="description" [class]="descriptionClasses">
            {{ description }}
          </div>
          <div *ngIf="action" class="mt-3">
            <button
              type="button"
              (click)="onActionClick()"
              class="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        
        <button
          *ngIf="showCloseButton"
          type="button"
          (click)="close()"
          class="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <lucide-icon [name]="X" [size]="16"></lucide-icon>
        </button>
      </div>
      
      <div *ngIf="showProgress && duration > 0" class="mt-3">
        <div class="w-full bg-background/20 rounded-full h-1">
          <div
            class="bg-current h-1 rounded-full transition-all ease-linear"
            [style.width.%]="progressWidth"
          ></div>
        </div>
      </div>
    </div>
  `,
  animations: [slideInFromRight]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() id = `toast-${Math.random().toString(36).substr(2, 9)}`;
  @Input() title = '';
  @Input() description = '';
  @Input() variant: ToastVariant = 'default';
  @Input() duration = 5000; // 5 seconds
  @Input() showCloseButton = true;
  @Input() showProgress = false;
  @Input() action?: { label: string; onClick: () => void };
  @Input() icon?: LucideIconData;
  
  @Output() closed = new EventEmitter<string>();

  // Icons
  X = X;
  CheckCircle = CheckCircle;
  AlertCircle = AlertCircle;
  Info = Info;
  AlertTriangle = AlertTriangle;

  progressWidth = 100;
  private timer?: number;
  private progressTimer?: number;

  get toastClasses(): string {
    const baseClasses = 'relative w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all';
    const variantClasses = this.getVariantClasses();
    
    return `${baseClasses} ${variantClasses}`;
  }

  get iconClasses(): string {
    const baseClasses = 'w-5 h-5';
    const variantClasses = this.getIconVariantClasses();
    
    return `${baseClasses} ${variantClasses}`;
  }

  get descriptionClasses(): string {
    const baseClasses = 'text-sm';
    const marginClasses = this.title ? 'mt-1' : '';
    const colorClasses = 'text-muted-foreground';
    
    return `${baseClasses} ${marginClasses} ${colorClasses}`;
  }

  get displayIcon(): LucideIconData {
    if (this.icon) {
      return this.icon;
    }
    
    const iconMap = {
      default: this.Info,
      success: this.CheckCircle,
      error: this.AlertCircle,
      warning: this.AlertTriangle,
      info: this.Info
    };
    
    return iconMap[this.variant];
  }

  private getVariantClasses(): string {
    const variantMap = {
      default: 'bg-background border-border text-foreground',
      success: 'bg-background border-green-200 text-foreground',
      error: 'bg-background border-red-200 text-foreground',
      warning: 'bg-background border-yellow-200 text-foreground',
      info: 'bg-background border-blue-200 text-foreground'
    };
    
    return variantMap[this.variant];
  }

  private getIconVariantClasses(): string {
    const variantMap = {
      default: 'text-foreground',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    };
    
    return variantMap[this.variant];
  }

  ngOnInit(): void {
    if (this.duration > 0) {
      this.startTimer();
      if (this.showProgress) {
        this.startProgressTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  close(): void {
    this.clearTimers();
    this.closed.emit(this.id);
  }

  onActionClick(): void {
    if (this.action) {
      this.action.onClick();
    }
  }

  private startTimer(): void {
    this.timer = window.setTimeout(() => {
      this.close();
    }, this.duration);
  }

  private startProgressTimer(): void {
    const interval = 50; // Update every 50ms
    const steps = this.duration / interval;
    const decrement = 100 / steps;
    
    this.progressTimer = window.setInterval(() => {
      this.progressWidth -= decrement;
      if (this.progressWidth <= 0) {
        this.progressWidth = 0;
        this.clearProgressTimer();
      }
    }, interval);
  }

  private clearTimers(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.clearProgressTimer();
  }

  private clearProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = undefined;
    }
  }

  // Pause timer on hover
  onMouseEnter(): void {
    this.clearTimers();
  }

  // Resume timer on mouse leave
  onMouseLeave(): void {
    if (this.duration > 0) {
      this.startTimer();
      if (this.showProgress) {
        this.startProgressTimer();
      }
    }
  }
}

// Toast Container Component
@Component({
  selector: 'ui-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div [class]="containerClasses">
      <ui-toast
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        [id]="toast.id!"
        [title]="toast.title!"
        [description]="toast.description!"
        [variant]="toast.variant!"
        [duration]="toast.duration!"
        [action]="toast.action"
        [icon]="toast.icon"
        (closed)="removeToast($event)"
      ></ui-toast>
    </div>
  `
})
export class ToastContainerComponent {
  @Input() position: ToastPosition = 'top-right';
  @Input() toasts: ToastData[] = [];
  
  @Output() toastRemoved = new EventEmitter<string>();

  get containerClasses(): string {
    const baseClasses = 'fixed z-50 flex flex-col space-y-2 max-w-sm';
    const positionClasses = this.getPositionClasses();
    
    return `${baseClasses} ${positionClasses}`;
  }

  private getPositionClasses(): string {
    const positionMap = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    return positionMap[this.position];
  }

  removeToast(toastId: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== toastId);
    this.toastRemoved.emit(toastId);
  }

  trackByToastId(index: number, toast: ToastData): string {
    return toast.id!;
  }
}