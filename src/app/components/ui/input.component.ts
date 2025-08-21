import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { 
  LucideAngularModule,
  Mail,
  Lock,
  Search,
  User,
  X,
  Eye,
  EyeOff,
  Phone,
  Globe
} from 'lucide-angular';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
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
      
      <!-- Input Container -->
      <div class="relative">
        <!-- Left Icon -->
        <div *ngIf="leftIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <lucide-icon [name]="leftIcon" [size]="iconSize"></lucide-icon>
        </div>
        
        <!-- Input Field -->
        <input
          [id]="inputId"
          [type]="currentType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [ngClass]="inputClasses"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        
        <!-- Password Toggle -->
        <button *ngIf="type === 'password' && !disabled && !readonly"
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <lucide-icon [name]="showPassword ? EyeOff : Eye" [size]="16"></lucide-icon>
        </button>
        
        <!-- Right Icon -->
        <div *ngIf="rightIcon && type !== 'password'" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <lucide-icon [name]="rightIcon" [size]="iconSize"></lucide-icon>
        </div>
        
        <!-- Clear Button -->
        <button *ngIf="clearable && value && !disabled && !readonly && type !== 'password'"
                type="button"
                (click)="clearValue()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <lucide-icon [name]="X" [size]="14"></lucide-icon>
        </button>
      </div>
      
      <!-- Helper Text -->
      <p *ngIf="helperText && !hasError" class="text-xs text-muted-foreground">
        {{ helperText }}
      </p>
      
      <!-- Error Message -->
      <p *ngIf="errorMessage && hasError" class="text-xs text-destructive">
        {{ errorMessage }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;
  @Input() leftIcon?: any;
  @Input() rightIcon?: any;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() inputId?: string;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  value = '';
  showPassword = false;
  private onChange = (value: string) => {};
  private onTouched = () => {};

  // Icon references for template
  Mail = Mail;
  Lock = Lock;
  Search = Search;
  User = User;
  X = X;
  Eye = Eye;
  EyeOff = EyeOff;
  Phone = Phone;
  Globe = Globe;

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get currentType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get inputClasses(): string {
    const baseClasses = 'flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
    const sizeClasses = this.getSizeClasses();
    const paddingClasses = this.getPaddingClasses();
    const errorClasses = this.hasError ? 'border-destructive focus-visible:ring-destructive' : '';
    
    return `${baseClasses} ${sizeClasses} ${paddingClasses} ${errorClasses}`.trim();
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      default: return 16;
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'h-8 text-xs';
      case 'md':
        return 'h-9';
      case 'lg':
        return 'h-10';
      default:
        return 'h-9';
    }
  }

  private getPaddingClasses(): string {
    const hasLeftIcon = !!this.leftIcon;
    const hasRightIcon = !!this.rightIcon || this.clearable || this.type === 'password';
    
    if (hasLeftIcon && hasRightIcon) {
      return 'pl-10 pr-10';
    } else if (hasLeftIcon) {
      return 'pl-10';
    } else if (hasRightIcon) {
      return 'pr-10';
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  clearValue(): void {
    this.value = '';
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
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