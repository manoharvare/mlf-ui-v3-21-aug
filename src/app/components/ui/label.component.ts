import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LabelSize = 'sm' | 'md' | 'lg';
export type LabelVariant = 'default' | 'secondary' | 'muted' | 'destructive';

@Component({
  selector: 'ui-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label 
      [for]="htmlFor"
      [class]="labelClasses"
      [attr.aria-required]="required"
    >
      <ng-content></ng-content>
      <span *ngIf="required" class="text-destructive ml-1">*</span>
      <span *ngIf="optional" class="text-muted-foreground ml-1 font-normal">(optional)</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelComponent {
  @Input() htmlFor = '';
  @Input() size: LabelSize = 'md';
  @Input() variant: LabelVariant = 'default';
  @Input() required = false;
  @Input() optional = false;
  @Input() className = '';

  get labelClasses(): string {
    const baseClasses = 'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
    const sizeClasses = this.getSizeClasses();
    const variantClasses = this.getVariantClasses();
    
    return `${baseClasses} ${sizeClasses} ${variantClasses} ${this.className}`;
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  }

  private getVariantClasses(): string {
    switch (this.variant) {
      case 'default':
        return 'text-foreground';
      case 'secondary':
        return 'text-secondary-foreground';
      case 'muted':
        return 'text-muted-foreground';
      case 'destructive':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  }
}

// Field Label Component - for form fields with description
@Component({
  selector: 'ui-field-label',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  template: `
    <div class="space-y-1">
      <ui-label 
        [htmlFor]="htmlFor"
        [size]="size"
        [variant]="variant"
        [required]="required"
        [optional]="optional"
        [className]="labelClassName">
        <ng-content select="[slot=label]"></ng-content>
        <ng-content></ng-content>
      </ui-label>
      
      <div *ngIf="description" class="text-xs text-muted-foreground">
        {{ description }}
      </div>
      
      <div *ngIf="hasDescriptionSlot">
        <ng-content select="[slot=description]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldLabelComponent {
  @Input() htmlFor = '';
  @Input() size: LabelSize = 'md';
  @Input() variant: LabelVariant = 'default';
  @Input() required = false;
  @Input() optional = false;
  @Input() description = '';
  @Input() labelClassName = '';
  @Input() hasDescriptionSlot = false;
}