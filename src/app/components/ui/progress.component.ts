import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { progressAnimation } from './animations';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-progress',
  standalone: true,
  imports: [CommonModule],
  animations: [progressAnimation],
  template: `
    <div class="w-full">
      <div *ngIf="showLabel || showPercentage" class="flex justify-between items-center mb-2">
        <span *ngIf="showLabel && label" class="text-sm font-medium text-foreground">
          {{ label }}
        </span>
        <span *ngIf="showPercentage" class="text-sm text-muted-foreground">
          {{ value }}%
        </span>
      </div>
      
      <div [class]="containerClasses" role="progressbar" [attr.aria-valuenow]="value" [attr.aria-valuemin]="min" [attr.aria-valuemax]="max">
        <div
          [class]="barClasses"
          [style.width.%]="percentage"
          [style.transition]="animated ? 'width 0.3s ease-in-out' : 'none'"
          [@progressAnimation]
        >
          <div *ngIf="showStripes" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      <div *ngIf="helperText" class="mt-1">
        <p class="text-xs text-muted-foreground">{{ helperText }}</p>
      </div>
    </div>
  `
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() label = '';
  @Input() helperText = '';
  @Input() variant: ProgressVariant = 'default';
  @Input() size: ProgressSize = 'md';
  @Input() showLabel = false;
  @Input() showPercentage = false;
  @Input() showStripes = false;
  @Input() animated = true;
  @Input() indeterminate = false;

  get percentage(): number {
    if (this.indeterminate) return 100;
    const clampedValue = Math.max(this.min, Math.min(this.max, this.value));
    return ((clampedValue - this.min) / (this.max - this.min)) * 100;
  }

  get containerClasses(): string {
    const baseClasses = 'relative w-full overflow-hidden rounded-full bg-secondary';
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  }

  get barClasses(): string {
    const baseClasses = 'relative h-full rounded-full transition-all';
    const variantClasses = this.getVariantClasses();
    const indeterminateClasses = this.indeterminate ? 'animate-pulse' : '';
    
    return `${baseClasses} ${variantClasses} ${indeterminateClasses}`;
  }

  private getSizeClasses(): string {
    const sizeMap = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };
    return sizeMap[this.size];
  }

  private getVariantClasses(): string {
    const variantMap = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };
    return variantMap[this.variant];
  }
}

// Circular Progress Component
@Component({
  selector: 'ui-circular-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center">
      <svg
        [attr.width]="size"
        [attr.height]="size"
        class="transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <!-- Background circle -->
        <circle
          cx="50"
          cy="50"
          [attr.r]="radius"
          stroke="currentColor"
          [attr.stroke-width]="strokeWidth"
          fill="none"
          class="text-secondary"
        />
        <!-- Progress circle -->
        <circle
          cx="50"
          cy="50"
          [attr.r]="radius"
          stroke="currentColor"
          [attr.stroke-width]="strokeWidth"
          fill="none"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="strokeDashoffset"
          [class]="progressClasses"
          stroke-linecap="round"
        />
      </svg>
      
      <!-- Center content -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div *ngIf="showPercentage" [class]="percentageClasses">
            {{ value }}%
          </div>
          <div *ngIf="label" class="text-xs text-muted-foreground mt-1">
            {{ label }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class CircularProgressComponent {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() size = 120;
  @Input() strokeWidth = 8;
  @Input() label = '';
  @Input() variant: ProgressVariant = 'default';
  @Input() showPercentage = true;
  @Input() animated = true;

  get radius(): number {
    return (100 - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get percentage(): number {
    const clampedValue = Math.max(this.min, Math.min(this.max, this.value));
    return ((clampedValue - this.min) / (this.max - this.min)) * 100;
  }

  get strokeDashoffset(): number {
    return this.circumference - (this.percentage / 100) * this.circumference;
  }

  get progressClasses(): string {
    const baseClasses = 'transition-all duration-300 ease-in-out';
    const variantClasses = this.getVariantClasses();
    const animatedClasses = this.animated ? baseClasses : '';
    
    return `${variantClasses} ${animatedClasses}`;
  }

  get percentageClasses(): string {
    const sizeClasses = this.size >= 120 ? 'text-lg font-semibold' : 'text-sm font-medium';
    return `${sizeClasses} text-foreground`;
  }

  private getVariantClasses(): string {
    const variantMap = {
      default: 'text-primary',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500'
    };
    return variantMap[this.variant];
  }
}