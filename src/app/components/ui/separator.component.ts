import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorVariant = 'default' | 'dashed' | 'dotted';
export type SeparatorSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-separator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="separatorClasses"
      [attr.role]="'separator'"
      [attr.aria-orientation]="orientation"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeparatorComponent {
  @Input() orientation: SeparatorOrientation = 'horizontal';
  @Input() variant: SeparatorVariant = 'default';
  @Input() size: SeparatorSize = 'md';
  @Input() className = '';

  get separatorClasses(): string {
    const baseClasses = 'shrink-0 bg-border';
    const orientationClasses = this.getOrientationClasses();
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${orientationClasses} ${variantClasses} ${sizeClasses} ${this.className}`;
  }

  private getOrientationClasses(): string {
    switch (this.orientation) {
      case 'horizontal':
        return 'w-full';
      case 'vertical':
        return 'h-full';
      default:
        return 'w-full';
    }
  }

  private getVariantClasses(): string {
    switch (this.variant) {
      case 'default':
        return '';
      case 'dashed':
        return 'border-dashed border-t border-b-0 border-l-0 border-r-0 bg-transparent';
      case 'dotted':
        return 'border-dotted border-t border-b-0 border-l-0 border-r-0 bg-transparent';
      default:
        return '';
    }
  }

  private getSizeClasses(): string {
    if (this.variant === 'dashed' || this.variant === 'dotted') {
      // For dashed/dotted variants, we use border thickness
      switch (this.size) {
        case 'sm': return 'border-t';
        case 'md': return 'border-t-2';
        case 'lg': return 'border-t-4';
        default: return 'border-t-2';
      }
    } else {
      // For solid variants, we use height/width
      if (this.orientation === 'horizontal') {
        switch (this.size) {
          case 'sm': return 'h-px';
          case 'md': return 'h-0.5';
          case 'lg': return 'h-1';
          default: return 'h-px';
        }
      } else {
        switch (this.size) {
          case 'sm': return 'w-px';
          case 'md': return 'w-0.5';
          case 'lg': return 'w-1';
          default: return 'w-px';
        }
      }
    }
  }
}

// Separator with Text Component
@Component({
  selector: 'ui-separator-with-text',
  standalone: true,
  imports: [CommonModule, SeparatorComponent],
  template: `
    <div [class]="containerClasses">
      <ui-separator 
        [orientation]="orientation"
        [variant]="variant"
        [size]="size"
        [className]="separatorClassName">
      </ui-separator>
      
      <div [class]="textContainerClasses">
        <span [class]="textClasses">
          <ng-content></ng-content>
        </span>
      </div>
      
      <ui-separator 
        [orientation]="orientation"
        [variant]="variant"
        [size]="size"
        [className]="separatorClassName">
      </ui-separator>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeparatorWithTextComponent {
  @Input() orientation: SeparatorOrientation = 'horizontal';
  @Input() variant: SeparatorVariant = 'default';
  @Input() size: SeparatorSize = 'md';
  @Input() textPosition: 'center' | 'left' | 'right' = 'center';
  @Input() className = '';

  get containerClasses(): string {
    const baseClasses = 'flex items-center';
    const orientationClasses = this.orientation === 'horizontal' ? 'w-full' : 'h-full flex-col';
    
    return `${baseClasses} ${orientationClasses} ${this.className}`;
  }

  get textContainerClasses(): string {
    const baseClasses = 'flex shrink-0';
    const spacingClasses = this.orientation === 'horizontal' ? 'mx-4' : 'my-4';
    
    return `${baseClasses} ${spacingClasses}`;
  }

  get textClasses(): string {
    return 'text-sm text-muted-foreground bg-background px-2';
  }

  get separatorClassName(): string {
    return 'flex-1';
  }
}