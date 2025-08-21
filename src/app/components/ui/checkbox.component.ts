import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Check, Minus, LucideIconData } from 'lucide-angular';

export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex items-center space-x-2">
      <div class="relative">
        <input
          type="checkbox"
          [id]="id"
          [checked]="checked"
          [disabled]="disabled"
          [indeterminate]="indeterminate"
          (change)="onCheckboxChange($event)"
          (blur)="onTouched()"
          class="sr-only"
        />
        <label
          [for]="id"
          [class]="checkboxClasses"
          [attr.aria-checked]="indeterminate ? 'mixed' : checked"
          [attr.aria-disabled]="disabled"
          role="checkbox"
          tabindex="0"
          (keydown)="onKeyDown($event)"
        >
          <lucide-icon
            *ngIf="checked && !indeterminate"
            [name]="Check"
            [class]="iconClasses"
          ></lucide-icon>
          <lucide-icon
            *ngIf="indeterminate"
            [name]="Minus"
            [class]="iconClasses"
          ></lucide-icon>
        </label>
      </div>
      <label
        *ngIf="label"
        [for]="id"
        [class]="labelClasses"
      >
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </label>
    </div>
    <div *ngIf="helperText && !errorMessage" class="mt-1">
      <p class="text-xs text-muted-foreground">{{ helperText }}</p>
    </div>
    <div *ngIf="errorMessage" class="mt-1">
      <p class="text-xs text-destructive">{{ errorMessage }}</p>
    </div>
  `
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() id = `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() size: CheckboxSize = 'md';
  @Input() disabled = false;
  @Input() required = false;
  @Input() indeterminate = false;
  @Input() helperText = '';
  @Input() errorMessage = '';
  
  @Output() checkedChange = new EventEmitter<boolean>();

  // Icons
  Check = Check;
  Minus = Minus;

  checked = false;
  
  private onChange = (value: boolean) => {};
  onTouched = () => {};

  get checkboxClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center border-2 rounded cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses();
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  get iconClasses(): string {
    const sizeMap = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    return `${sizeMap[this.size]} text-primary-foreground`;
  }

  get labelClasses(): string {
    const baseClasses = 'text-sm font-medium leading-none cursor-pointer';
    const disabledClasses = this.disabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground';
    
    return `${baseClasses} ${disabledClasses}`;
  }

  private getSizeClasses(): string {
    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    return sizeMap[this.size];
  }

  private getStateClasses(): string {
    if (this.disabled) {
      return 'border-muted bg-muted cursor-not-allowed';
    }
    
    if (this.checked || this.indeterminate) {
      return 'border-primary bg-primary hover:bg-primary/90';
    }
    
    if (this.errorMessage) {
      return 'border-destructive hover:border-destructive/80';
    }
    
    return 'border-border hover:border-primary';
  }

  onCheckboxChange(event: Event): void {
    if (this.disabled) return;
    
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;
    
    this.onChange(this.checked);
    this.checkedChange.emit(this.checked);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.checked = !this.checked;
      this.indeterminate = false;
      
      this.onChange(this.checked);
      this.checkedChange.emit(this.checked);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}