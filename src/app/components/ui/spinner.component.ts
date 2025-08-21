import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'secondary';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <div [class]="spinnerClasses" [attr.aria-label]="label || 'Loading'">
        <div class="animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      </div>
      <div *ngIf="label" class="mt-2 text-sm text-muted-foreground">
        {{ label }}
      </div>
    </div>
  `
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() variant: SpinnerVariant = 'default';
  @Input() label = '';
  @Input() centered = false;

  get containerClasses(): string {
    const baseClasses = 'flex flex-col items-center';
    const centeredClasses = this.centered ? 'justify-center min-h-[200px]' : '';
    
    return `${baseClasses} ${centeredClasses}`;
  }

  get spinnerClasses(): string {
    const baseClasses = 'inline-block';
    const sizeClasses = this.getSizeClasses();
    const variantClasses = this.getVariantClasses();
    
    return `${baseClasses} ${sizeClasses} ${variantClasses}`;
  }

  private getSizeClasses(): string {
    const sizeMap = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };
    return sizeMap[this.size];
  }

  private getVariantClasses(): string {
    const variantMap = {
      default: 'text-foreground',
      primary: 'text-primary',
      secondary: 'text-muted-foreground'
    };
    return variantMap[this.variant];
  }
}

// Loading overlay component
@Component({
  selector: 'ui-loading-overlay',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div *ngIf="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div class="flex flex-col items-center space-y-4">
        <ui-spinner [size]="spinnerSize" [variant]="spinnerVariant"></ui-spinner>
        <div *ngIf="message" class="text-sm text-muted-foreground">
          {{ message }}
        </div>
      </div>
    </div>
  `
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() message = '';
  @Input() spinnerSize: SpinnerSize = 'lg';
  @Input() spinnerVariant: SpinnerVariant = 'primary';
}