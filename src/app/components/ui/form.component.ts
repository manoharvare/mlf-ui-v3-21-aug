import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';

export interface FormFieldError {
  field: string;
  message: string;
}

export type FormSize = 'sm' | 'md' | 'lg';
export type FormLayout = 'vertical' | 'horizontal' | 'inline';

@Component({
  selector: 'ui-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form 
      [formGroup]="formGroup"
      [class]="formClasses"
      (ngSubmit)="onSubmit()"
      [attr.novalidate]="noValidate"
    >
      <!-- Form Title -->
      <div *ngIf="title || description" [class]="headerClasses">
        <h2 *ngIf="title" [class]="titleClasses">{{ title }}</h2>
        <p *ngIf="description" [class]="descriptionClasses">{{ description }}</p>
      </div>
      
      <!-- Form Content -->
      <div [class]="contentClasses">
        <ng-content></ng-content>
      </div>
      
      <!-- Form Errors -->
      <div *ngIf="showFormErrors && formErrors.length > 0" [class]="errorsClasses">
        <div class="text-sm font-medium text-destructive mb-2">Please fix the following errors:</div>
        <ul class="list-disc list-inside space-y-1">
          <li *ngFor="let error of formErrors" class="text-sm text-destructive">
            {{ error.message }}
          </li>
        </ul>
      </div>
      
      <!-- Form Actions -->
      <div *ngIf="showActions" [class]="actionsClasses">
        <ng-content select="[slot=actions]"></ng-content>
        
        <!-- Default Actions -->
        <div *ngIf="showDefaultActions" class="flex gap-3">
          <button
            *ngIf="showCancelButton"
            type="button"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            (click)="onCancel()"
          >
            {{ cancelText }}
          </button>
          
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            [disabled]="submitDisabled || (formGroup && formGroup.invalid)"
          >
            {{ submitText }}
          </button>
        </div>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements AfterContentInit {
  @Input() formGroup!: FormGroup;
  @Input() title = '';
  @Input() description = '';
  @Input() size: FormSize = 'md';
  @Input() layout: FormLayout = 'vertical';
  @Input() showActions = true;
  @Input() showDefaultActions = false;
  @Input() showCancelButton = true;
  @Input() submitText = 'Submit';
  @Input() cancelText = 'Cancel';
  @Input() submitDisabled = false;
  @Input() showFormErrors = true;
  @Input() noValidate = true;
  @Input() className = '';
  
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() formChange = new EventEmitter<any>();

  formErrors: FormFieldError[] = [];

  get formClasses(): string {
    const baseClasses = 'space-y-6';
    const layoutClasses = this.getLayoutClasses();
    
    return `${baseClasses} ${layoutClasses} ${this.className}`;
  }

  get headerClasses(): string {
    return 'space-y-2 pb-4 border-b border-border';
  }

  get titleClasses(): string {
    const sizeClasses = this.getTitleSizeClasses();
    return `font-semibold tracking-tight ${sizeClasses}`;
  }

  get descriptionClasses(): string {
    return 'text-sm text-muted-foreground';
  }

  get contentClasses(): string {
    const sizeClasses = this.getContentSizeClasses();
    return `space-y-4 ${sizeClasses}`;
  }

  get errorsClasses(): string {
    return 'p-4 bg-destructive/10 border border-destructive/20 rounded-md';
  }

  get actionsClasses(): string {
    const layoutClasses = this.layout === 'horizontal' ? 'flex justify-end' : 'flex justify-end';
    return `pt-4 border-t border-border ${layoutClasses}`;
  }

  ngAfterContentInit(): void {
    if (this.formGroup) {
      this.formGroup.valueChanges.subscribe(() => {
        this.updateFormErrors();
        this.formChange.emit(this.formGroup.value);
      });
      
      this.formGroup.statusChanges.subscribe(() => {
        this.updateFormErrors();
      });
    }
  }

  private getLayoutClasses(): string {
    switch (this.layout) {
      case 'horizontal':
        return 'space-y-4';
      case 'inline':
        return 'flex flex-wrap gap-4 items-end';
      case 'vertical':
      default:
        return 'space-y-4';
    }
  }

  private getTitleSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl';
      case 'lg': return 'text-2xl';
      default: return 'text-xl';
    }
  }

  private getContentSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'space-y-3';
      case 'md': return 'space-y-4';
      case 'lg': return 'space-y-6';
      default: return 'space-y-4';
    }
  }

  private updateFormErrors(): void {
    this.formErrors = [];
    
    if (this.formGroup && this.formGroup.errors) {
      this.collectErrors(this.formGroup, '');
    }
  }

  private collectErrors(control: AbstractControl, path: string): void {
    if (control.errors) {
      Object.keys(control.errors).forEach(key => {
        const error = control.errors![key];
        let message = this.getErrorMessage(key, error);
        
        if (path) {
          message = `${this.getFieldLabel(path)}: ${message}`;
        }
        
        this.formErrors.push({
          field: path,
          message: message
        });
      });
    }
    
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.get(key);
        if (childControl) {
          const childPath = path ? `${path}.${key}` : key;
          this.collectErrors(childControl, childPath);
        }
      });
    }
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required':
        return 'This field is required';
      case 'email':
        return 'Please enter a valid email address';
      case 'minlength':
        return `Minimum length is ${errorValue.requiredLength} characters`;
      case 'maxlength':
        return `Maximum length is ${errorValue.requiredLength} characters`;
      case 'min':
        return `Minimum value is ${errorValue.min}`;
      case 'max':
        return `Maximum value is ${errorValue.max}`;
      case 'pattern':
        return 'Please enter a valid format';
      default:
        return `Invalid ${errorKey}`;
    }
  }

  private getFieldLabel(path: string): string {
    // Convert camelCase to Title Case
    return path
      .split('.')
      .pop()!
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  onSubmit(): void {
    if (this.formGroup) {
      this.formGroup.markAllAsTouched();
      this.updateFormErrors();
      
      if (this.formGroup.valid) {
        this.submitted.emit(this.formGroup.value);
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // Public methods
  reset(): void {
    if (this.formGroup) {
      this.formGroup.reset();
      this.formErrors = [];
    }
  }

  markAllAsTouched(): void {
    if (this.formGroup) {
      this.formGroup.markAllAsTouched();
      this.updateFormErrors();
    }
  }

  getFieldError(fieldName: string): string | null {
    if (!this.formGroup) return null;
    
    const control = this.formGroup.get(fieldName);
    if (control && control.errors && control.touched) {
      const firstError = Object.keys(control.errors)[0];
      return this.getErrorMessage(firstError, control.errors[firstError]);
    }
    
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.formGroup) return false;
    
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}

// Form Field Component
@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <!-- Label -->
      <label *ngIf="label" [for]="fieldId" [class]="labelClasses">
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </label>
      
      <!-- Field Content -->
      <div [class]="fieldClasses">
        <ng-content></ng-content>
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
export class FormFieldComponent {
  @Input() label = '';
  @Input() fieldId = '';
  @Input() required = false;
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() layout: FormLayout = 'vertical';
  @Input() className = '';

  get containerClasses(): string {
    const baseClasses = 'space-y-2';
    const layoutClasses = this.layout === 'horizontal' ? 'flex items-center gap-4' : '';
    
    return `${baseClasses} ${layoutClasses} ${this.className}`;
  }

  get labelClasses(): string {
    const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
    const layoutClasses = this.layout === 'horizontal' ? 'min-w-[120px] text-right' : '';
    
    return `${baseClasses} ${layoutClasses}`;
  }

  get fieldClasses(): string {
    return this.layout === 'horizontal' ? 'flex-1' : '';
  }
}