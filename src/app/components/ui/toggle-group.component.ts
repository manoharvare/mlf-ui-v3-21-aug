import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: any;
  disabled?: boolean;
  tooltip?: string;
}

export type ToggleGroupSize = 'sm' | 'md' | 'lg';
export type ToggleGroupVariant = 'default' | 'outline';
export type ToggleGroupType = 'single' | 'multiple';

@Component({
  selector: 'ui-toggle-group',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleGroupComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <!-- Label -->
      <label *ngIf="label" class="text-sm font-medium leading-none">
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </label>
      
      <!-- Toggle Group -->
      <div [class]="containerClasses" [attr.role]="'group'" [attr.aria-label]="label">
        <button
          *ngFor="let option of options; trackBy: trackByValue"
          type="button"
          [class]="getToggleClasses(option)"
          [disabled]="disabled || option.disabled"
          [attr.aria-pressed]="isSelected(option.value)"
          [attr.title]="option.tooltip"
          (click)="toggleOption(option.value)"
        >
          <!-- Icon -->
          <ng-container *ngIf="option.icon">
            <lucide-icon [name]="option.icon" [size]="iconSize" class="shrink-0"></lucide-icon>
          </ng-container>
          
          <!-- Label -->
          <span *ngIf="option.label" [class]="labelClasses">{{ option.label }}</span>
        </button>
      </div>
      
      <!-- Helper Text -->
      <div *ngIf="helperText && !errorMessage" class="mt-1">
        <p class="text-xs text-muted-foreground">{{ helperText }}</p>
      </div>
      
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mt-1">
        <p class="text-xs text-destructive">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleGroupComponent implements ControlValueAccessor {
  @Input() options: ToggleOption[] = [];
  @Input() type: ToggleGroupType = 'single';
  @Input() size: ToggleGroupSize = 'md';
  @Input() variant: ToggleGroupVariant = 'default';
  @Input() label = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() fullWidth = false;
  
  @Output() valueChange = new EventEmitter<string | string[]>();
  @Output() optionToggled = new EventEmitter<{ value: string; selected: boolean }>();

  value: string | string[] = this.type === 'multiple' ? [] : '';
  
  private onChange = (value: string | string[]) => {};
  onTouched = () => {};

  get containerClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground';
    const widthClasses = this.fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${widthClasses}`;
  }

  get labelClasses(): string {
    const hideOnSmall = this.size === 'sm' ? 'hidden sm:inline' : '';
    return hideOnSmall;
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      default: return 16;
    }
  }

  getToggleClasses(option: ToggleOption): string {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const sizeClasses = this.getSizeClasses();
    const variantClasses = this.getVariantClasses(option);
    const stateClasses = this.getStateClasses(option);
    const spacingClasses = option.icon && option.label ? 'gap-2' : '';
    
    return `${baseClasses} ${sizeClasses} ${variantClasses} ${stateClasses} ${spacingClasses}`;
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'h-8 px-2 text-xs';
      case 'md':
        return 'h-9 px-3 text-sm';
      case 'lg':
        return 'h-10 px-4 text-base';
      default:
        return 'h-9 px-3 text-sm';
    }
  }

  private getVariantClasses(option: ToggleOption): string {
    const isSelected = this.isSelected(option.value);
    
    switch (this.variant) {
      case 'default':
        return isSelected 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-muted/80';
      case 'outline':
        return isSelected
          ? 'bg-accent text-accent-foreground border border-input shadow-sm'
          : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      default:
        return isSelected 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-muted/80';
    }
  }

  private getStateClasses(option: ToggleOption): string {
    if (option.disabled) {
      return 'opacity-50 cursor-not-allowed';
    }
    return '';
  }

  isSelected(value: string): boolean {
    if (this.type === 'multiple') {
      return Array.isArray(this.value) && this.value.includes(value);
    } else {
      return this.value === value;
    }
  }

  toggleOption(value: string): void {
    if (this.disabled) return;
    
    const option = this.options.find(opt => opt.value === value);
    if (option?.disabled) return;
    
    let newValue: string | string[];
    let isSelected: boolean;
    
    if (this.type === 'multiple') {
      const currentArray = Array.isArray(this.value) ? this.value : [];
      if (currentArray.includes(value)) {
        newValue = currentArray.filter(v => v !== value);
        isSelected = false;
      } else {
        newValue = [...currentArray, value];
        isSelected = true;
      }
    } else {
      if (this.value === value) {
        newValue = ''; // Allow deselection in single mode
        isSelected = false;
      } else {
        newValue = value;
        isSelected = true;
      }
    }
    
    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
    this.optionToggled.emit({ value, selected: isSelected });
  }

  trackByValue(index: number, option: ToggleOption): string {
    return option.value;
  }

  // ControlValueAccessor implementation
  writeValue(value: string | string[]): void {
    this.value = value || (this.type === 'multiple' ? [] : '');
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Public methods
  selectAll(): void {
    if (this.type !== 'multiple' || this.disabled) return;
    
    const allValues = this.options
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    this.value = allValues;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  deselectAll(): void {
    const newValue = this.type === 'multiple' ? [] : '';
    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  getSelectedValues(): string[] {
    if (this.type === 'multiple') {
      return Array.isArray(this.value) ? this.value : [];
    } else {
      return this.value ? [this.value as string] : [];
    }
  }
}