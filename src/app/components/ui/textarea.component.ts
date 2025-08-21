import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
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
      
      <!-- Textarea -->
      <textarea
        [id]="inputId"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [rows]="rows"
        [cols]="cols"
        [attr.minlength]="minLength"
        [attr.maxlength]="maxLength"
        [class]="textareaClasses"
        [style.resize]="resize"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        (keydown)="onKeyDown($event)"
      ></textarea>
      
      <!-- Character Count -->
      <div *ngIf="showCharacterCount && maxLength" class="flex justify-between items-center text-xs">
        <span class="text-muted-foreground">{{ helperText }}</span>
        <span [ngClass]="characterCountClasses">
          {{ value.length }}/{{ maxLength }}
        </span>
      </div>
      
      <!-- Helper Text (when no character count) -->
      <div *ngIf="helperText && !errorMessage && (!showCharacterCount || !maxLength)" class="mt-1">
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
export class TextareaComponent implements ControlValueAccessor {
  @Input() id = `textarea-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() size: TextareaSize = 'md';
  @Input() resize: TextareaResize = 'vertical';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() rows = 4;
  @Input() cols?: number;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() showCharacterCount = false;
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() autoResize = false;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();
  @Output() keyPressed = new EventEmitter<KeyboardEvent>();

  value = '';
  
  private onChange = (value: string) => {};
  onTouched = () => {};

  get inputId(): string {
    return this.id;
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get textareaClasses(): string {
    const baseClasses = 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses();
    const resizeClasses = this.getResizeClasses();
    
    return `${baseClasses} ${sizeClasses} ${stateClasses} ${resizeClasses}`;
  }

  get characterCountClasses(): string {
    if (!this.maxLength) return 'text-muted-foreground';
    
    const percentage = (this.value.length / this.maxLength) * 100;
    
    if (percentage >= 100) {
      return 'text-destructive font-medium';
    } else if (percentage >= 80) {
      return 'text-warning font-medium';
    } else {
      return 'text-muted-foreground';
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'min-h-[60px] px-2 py-1 text-xs';
      case 'md':
        return 'min-h-[80px] px-3 py-2 text-sm';
      case 'lg':
        return 'min-h-[100px] px-4 py-3 text-base';
      default:
        return 'min-h-[80px] px-3 py-2 text-sm';
    }
  }

  private getStateClasses(): string {
    if (this.hasError) {
      return 'border-destructive focus-visible:ring-destructive';
    }
    return '';
  }

  private getResizeClasses(): string {
    if (this.autoResize) {
      return 'resize-none overflow-hidden';
    }
    return '';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    
    // Auto-resize functionality
    if (this.autoResize) {
      this.adjustHeight(target);
    }
    
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(): void {
    this.focused.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keyPressed.emit(event);
    
    // Handle Ctrl+Enter or Cmd+Enter for form submission
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      // Emit a custom event that parent can listen to
      this.keyPressed.emit(new KeyboardEvent('submit', { bubbles: true }));
    }
  }

  private adjustHeight(element: HTMLTextAreaElement): void {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
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

  // Public methods
  focus(): void {
    const textarea = document.getElementById(this.inputId) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }

  blur(): void {
    const textarea = document.getElementById(this.inputId) as HTMLTextAreaElement;
    if (textarea) {
      textarea.blur();
    }
  }

  selectAll(): void {
    const textarea = document.getElementById(this.inputId) as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
    }
  }

  insertText(text: string): void {
    const textarea = document.getElementById(this.inputId) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = this.value.substring(0, start) + text + this.value.substring(end);
      
      this.value = newValue;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
      });
    }
  }
}