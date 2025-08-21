import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  helperText?: string;
}

@Component({
  selector: 'ui-radio-group',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-3">
      <div *ngIf="label" class="text-sm font-medium text-foreground">
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </div>
      
      <div [class]="containerClasses">
        <div
          *ngFor="let option of options; trackBy: trackByValue"
          class="flex items-start space-x-3"
        >
          <div class="relative">
            <input
              type="radio"
              [id]="getOptionId(option.value)"
              [name]="name"
              [value]="option.value"
              [checked]="selectedValue === option.value"
              [disabled]="disabled || option.disabled"
              (change)="onRadioChange(option.value)"
              (blur)="onTouched()"
              class="sr-only"
            />
            <label
              [for]="getOptionId(option.value)"
              [class]="getRadioClasses(option)"
              [attr.aria-checked]="selectedValue === option.value"
              [attr.aria-disabled]="disabled || option.disabled"
              role="radio"
              tabindex="0"
              (keydown)="onKeyDown($event, option.value)"
            >
              <div [class]="getDotClasses(option)"></div>
            </label>
          </div>
          
          <div class="flex-1 min-w-0">
            <label
              [for]="getOptionId(option.value)"
              [class]="getLabelClasses(option)"
            >
              {{ option.label }}
            </label>
            <div *ngIf="option.helperText" class="mt-1">
              <p class="text-xs text-muted-foreground">{{ option.helperText }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="helperText && !errorMessage" class="text-xs text-muted-foreground">
        {{ helperText }}
      </div>
      <div *ngIf="errorMessage" class="text-xs text-destructive">
        {{ errorMessage }}
      </div>
    </div>
  `
})
export class RadioGroupComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  @Input() options: RadioOption[] = [];
  @Input() size: RadioSize = 'md';
  @Input() disabled = false;
  @Input() required = false;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  @Input() helperText = '';
  @Input() errorMessage = '';
  
  @Output() valueChange = new EventEmitter<string>();

  selectedValue = '';
  
  private onChange = (value: string) => {};
  onTouched = () => {};

  get containerClasses(): string {
    return this.orientation === 'horizontal' 
      ? 'flex flex-wrap gap-6' 
      : 'space-y-3';
  }

  getOptionId(value: string): string {
    return `${this.name}-${value}`;
  }

  getRadioClasses(option: RadioOption): string {
    const baseClasses = 'inline-flex items-center justify-center border-2 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses(option);
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  getDotClasses(option: RadioOption): string {
    const baseClasses = 'rounded-full transition-all';
    const sizeClasses = this.getDotSizeClasses();
    const isSelected = this.selectedValue === option.value;
    const isDisabled = this.disabled || option.disabled;
    
    let stateClasses = '';
    if (isSelected && !isDisabled) {
      stateClasses = 'bg-primary-foreground';
    } else if (isSelected && isDisabled) {
      stateClasses = 'bg-muted-foreground';
    } else {
      stateClasses = 'bg-transparent';
    }
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  getLabelClasses(option: RadioOption): string {
    const baseClasses = 'text-sm font-medium leading-none cursor-pointer';
    const isDisabled = this.disabled || option.disabled;
    const disabledClasses = isDisabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground';
    
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

  private getDotSizeClasses(): string {
    const sizeMap = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3'
    };
    return sizeMap[this.size];
  }

  private getStateClasses(option: RadioOption): string {
    const isSelected = this.selectedValue === option.value;
    const isDisabled = this.disabled || option.disabled;
    
    if (isDisabled) {
      return isSelected 
        ? 'border-muted bg-muted cursor-not-allowed'
        : 'border-muted bg-background cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'border-primary bg-primary hover:bg-primary/90';
    }
    
    if (this.errorMessage) {
      return 'border-destructive hover:border-destructive/80 bg-background';
    }
    
    return 'border-border hover:border-primary bg-background';
  }

  onRadioChange(value: string): void {
    if (this.disabled) return;
    
    this.selectedValue = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onKeyDown(event: KeyboardEvent, value: string): void {
    if (this.disabled) return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.onRadioChange(value);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.selectNext();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.selectPrevious();
    }
  }

  private selectNext(): void {
    const enabledOptions = this.options.filter(opt => !opt.disabled);
    const currentIndex = enabledOptions.findIndex(opt => opt.value === this.selectedValue);
    const nextIndex = (currentIndex + 1) % enabledOptions.length;
    this.onRadioChange(enabledOptions[nextIndex].value);
  }

  private selectPrevious(): void {
    const enabledOptions = this.options.filter(opt => !opt.disabled);
    const currentIndex = enabledOptions.findIndex(opt => opt.value === this.selectedValue);
    const prevIndex = currentIndex <= 0 ? enabledOptions.length - 1 : currentIndex - 1;
    this.onRadioChange(enabledOptions[prevIndex].value);
  }

  trackByValue(index: number, option: RadioOption): string {
    return option.value;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}