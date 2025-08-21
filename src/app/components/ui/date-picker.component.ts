import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { 
  LucideAngularModule,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-angular';

export type DatePickerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-date-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <!-- Label -->
      <label *ngIf="label" 
             [for]="inputId" 
             class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
             [ngClass]="{ 'text-destructive': hasError }">
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </label>
      
      <!-- Date Input Container -->
      <div class="relative">
        <!-- Date Input -->
        <input
          [id]="inputId"
          type="date"
          [value]="formattedValue"
          [disabled]="disabled"
          [readonly]="readonly"
          [min]="min"
          [max]="max"
          [placeholder]="placeholder"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="onFocus()"
        />
        
        <!-- Calendar Icon -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <lucide-icon [name]="Calendar" [size]="iconSize"></lucide-icon>
        </div>
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
export class DatePickerComponent implements ControlValueAccessor {
  @Input() id = `date-picker-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() placeholder = 'Select date...';
  @Input() size: DatePickerSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() min = '';
  @Input() max = '';
  
  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  // Icons
  Calendar = Calendar;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;

  value: Date | null = null;
  
  private onChange = (value: Date | null) => {};
  onTouched = () => {};

  get inputId(): string {
    return this.id;
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get formattedValue(): string {
    if (!this.value) return '';
    return this.value.toISOString().split('T')[0];
  }

  get inputClasses(): string {
    const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses();
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'md': return 20;
      case 'lg': return 28;
      default: return 20;
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'h-8 px-2 text-xs';
      case 'md':
        return 'h-12 px-4 text-base';
      case 'lg':
        return 'h-16 px-6 text-xl';
      default:
        return 'h-12 px-4 text-base';
    }
  }

  private getStateClasses(): string {
    if (this.hasError) {
      return 'border-destructive focus-visible:ring-destructive';
    }
    return '';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateValue = target.value ? new Date(target.value) : null;
    
    this.value = dateValue;
    this.onChange(dateValue);
    this.dateChange.emit(dateValue);
  }

  onFocus(): void {
    this.focused.emit();
  }

  onBlur(): void {
    this.blurred.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (value instanceof Date) {
      this.value = value;
    } else if (typeof value === 'string' && value) {
      this.value = new Date(value);
    } else {
      this.value = null;
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}