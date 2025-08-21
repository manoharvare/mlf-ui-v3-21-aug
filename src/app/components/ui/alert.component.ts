import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, CheckCircle, Info, AlertTriangle, X, LucideIconData } from 'lucide-angular';

export type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="alertClasses" role="alert">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <lucide-icon
            [name]="displayIcon"
            [size]="20"
            [class]="iconClasses"
          ></lucide-icon>
        </div>
        
        <div class="flex-1 min-w-0">
          <div *ngIf="title" class="font-medium text-sm mb-1">
            {{ title }}
          </div>
          <div *ngIf="description" class="text-sm">
            {{ description }}
          </div>
          <div *ngIf="!title && !description">
            <ng-content></ng-content>
          </div>
          
          <div *ngIf="actions.length > 0" class="mt-3 flex space-x-2">
            <button
              *ngFor="let action of actions"
              type="button"
              (click)="onActionClick(action)"
              class="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        
        <button
          *ngIf="dismissible"
          type="button"
          (click)="dismiss()"
          class="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          [attr.aria-label]="dismissLabel"
        >
          <lucide-icon [name]="X" [size]="16"></lucide-icon>
        </button>
      </div>
    </div>
  `
})
export class AlertComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() variant: AlertVariant = 'default';
  @Input() dismissible = false;
  @Input() dismissLabel = 'Dismiss';
  @Input() icon?: LucideIconData;
  @Input() actions: { label: string; onClick: () => void }[] = [];
  
  @Output() dismissed = new EventEmitter<void>();

  // Icons
  AlertCircle = AlertCircle;
  CheckCircle = CheckCircle;
  Info = Info;
  AlertTriangle = AlertTriangle;
  X = X;

  get alertClasses(): string {
    const baseClasses = 'relative w-full rounded-lg border p-4';
    const variantClasses = this.getVariantClasses();
    
    return `${baseClasses} ${variantClasses}`;
  }

  get iconClasses(): string {
    const variantClasses = this.getIconVariantClasses();
    return variantClasses;
  }

  get displayIcon(): LucideIconData {
    if (this.icon) {
      return this.icon;
    }
    
    const iconMap = {
      default: this.Info,
      success: this.CheckCircle,
      warning: this.AlertTriangle,
      error: this.AlertCircle,
      info: this.Info
    };
    
    return iconMap[this.variant];
  }

  private getVariantClasses(): string {
    const variantMap = {
      default: 'bg-background text-foreground border-border',
      success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
      error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
      info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800'
    };
    
    return variantMap[this.variant];
  }

  private getIconVariantClasses(): string {
    const variantMap = {
      default: 'text-foreground',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400'
    };
    
    return variantMap[this.variant];
  }

  dismiss(): void {
    this.dismissed.emit();
  }

  onActionClick(action: { label: string; onClick: () => void }): void {
    action.onClick();
  }
}