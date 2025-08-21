import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SliderSize = 'sm' | 'md' | 'lg';
export type SliderOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'ui-slider',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <!-- Label -->
      <div *ngIf="label || showValue" class="flex justify-between items-center">
        <label *ngIf="label" class="text-sm font-medium leading-none">
          {{ label }}
          <span *ngIf="required" class="text-destructive ml-1">*</span>
        </label>
        <span *ngIf="showValue" class="text-sm text-muted-foreground">
          {{ formatValue(value) }}{{ unit }}
        </span>
      </div>
      
      <!-- Slider Container -->
      <div [class]="containerClasses" #sliderContainer>
        <!-- Track -->
        <div [class]="trackClasses">
          <!-- Range (filled portion) -->
          <div 
            [class]="rangeClasses"
            [style]="rangeStyle"
          ></div>
        </div>
        
        <!-- Thumb -->
        <div
          [class]="thumbClasses"
          [style]="thumbStyle"
          [attr.role]="'slider'"
          [attr.aria-valuemin]="min"
          [attr.aria-valuemax]="max"
          [attr.aria-valuenow]="value"
          [attr.aria-valuetext]="formatValue(value) + unit"
          [attr.aria-disabled]="disabled"
          [attr.tabindex]="disabled ? -1 : 0"
          (mousedown)="onMouseDown($event)"
          (keydown)="onKeyDown($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        >
          <!-- Thumb Label -->
          <div *ngIf="showThumbLabel" [class]="thumbLabelClasses">
            {{ formatValue(value) }}{{ unit }}
          </div>
        </div>
        
        <!-- Step Markers -->
        <div *ngIf="showSteps" class="absolute inset-0 flex justify-between items-center pointer-events-none">
          <div
            *ngFor="let stepValue of stepMarkers"
            class="w-1 h-1 bg-border rounded-full"
            [style.left.%]="getStepPosition(stepValue)"
          ></div>
        </div>
      </div>
      
      <!-- Min/Max Labels -->
      <div *ngIf="showMinMax" class="flex justify-between text-xs text-muted-foreground">
        <span>{{ formatValue(min) }}{{ unit }}</span>
        <span>{{ formatValue(max) }}{{ unit }}</span>
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
export class SliderComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;
  
  @Input() label = '';
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() size: SliderSize = 'md';
  @Input() orientation: SliderOrientation = 'horizontal';
  @Input() disabled = false;
  @Input() required = false;
  @Input() showValue = true;
  @Input() showMinMax = false;
  @Input() showSteps = false;
  @Input() showThumbLabel = false;
  @Input() unit = '';
  @Input() formatValue = (value: number) => value.toString();
  @Input() helperText = '';
  @Input() errorMessage = '';
  
  @Output() valueChange = new EventEmitter<number>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  value = 0;
  isDragging = false;
  
  private onChange = (value: number) => {};
  onTouched = () => {};

  get containerClasses(): string {
    const baseClasses = 'relative flex items-center';
    const orientationClasses = this.orientation === 'vertical' ? 'flex-col h-32' : 'w-full h-6';
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${orientationClasses} ${disabledClasses}`;
  }

  get trackClasses(): string {
    const baseClasses = 'relative bg-secondary rounded-full';
    const sizeClasses = this.getTrackSizeClasses();
    const orientationClasses = this.orientation === 'vertical' ? 'w-full h-full' : 'w-full h-full';
    
    return `${baseClasses} ${sizeClasses} ${orientationClasses}`;
  }

  get rangeClasses(): string {
    const baseClasses = 'absolute bg-primary rounded-full transition-all duration-150';
    const orientationClasses = this.orientation === 'vertical' ? 'w-full bottom-0' : 'h-full left-0';
    
    return `${baseClasses} ${orientationClasses}`;
  }

  get thumbClasses(): string {
    const baseClasses = 'absolute bg-background border-2 border-primary rounded-full shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const sizeClasses = this.getThumbSizeClasses();
    const stateClasses = this.isDragging ? 'scale-110' : 'hover:scale-105';
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  get thumbLabelClasses(): string {
    const baseClasses = 'absolute bg-popover border border-border rounded px-2 py-1 text-xs font-medium shadow-md pointer-events-none';
    const positionClasses = this.orientation === 'vertical' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    
    return `${baseClasses} ${positionClasses}`;
  }

  get rangeStyle(): { [key: string]: string } {
    const percentage = this.getPercentage();
    
    if (this.orientation === 'vertical') {
      return { height: `${percentage}%` };
    } else {
      return { width: `${percentage}%` };
    }
  }

  get thumbStyle(): { [key: string]: string } {
    const percentage = this.getPercentage();
    
    if (this.orientation === 'vertical') {
      return { 
        bottom: `${percentage}%`,
        left: '50%',
        transform: 'translate(-50%, 50%)'
      };
    } else {
      return { 
        left: `${percentage}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
  }

  get stepMarkers(): number[] {
    const markers: number[] = [];
    for (let i = this.min; i <= this.max; i += this.step) {
      markers.push(i);
    }
    return markers;
  }

  ngAfterViewInit(): void {
    // Ensure initial value is within bounds
    this.value = this.clampValue(this.value);
  }

  private getTrackSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return this.orientation === 'vertical' ? 'w-1' : 'h-1';
      case 'md':
        return this.orientation === 'vertical' ? 'w-2' : 'h-2';
      case 'lg':
        return this.orientation === 'vertical' ? 'w-3' : 'h-3';
      default:
        return this.orientation === 'vertical' ? 'w-2' : 'h-2';
    }
  }

  private getThumbSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  }

  private getPercentage(): number {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  private clampValue(value: number): number {
    return Math.max(this.min, Math.min(this.max, value));
  }

  private snapToStep(value: number): number {
    return Math.round(value / this.step) * this.step;
  }

  getStepPosition(stepValue: number): number {
    return ((stepValue - this.min) / (this.max - this.min)) * 100;
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    this.isDragging = true;
    
    const handleMouseMove = (e: MouseEvent) => {
      this.updateValueFromEvent(e);
    };
    
    const handleMouseUp = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;
    
    let newValue = this.value;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        newValue = this.value + this.step;
        break;
        
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        newValue = this.value - this.step;
        break;
        
      case 'Home':
        event.preventDefault();
        newValue = this.min;
        break;
        
      case 'End':
        event.preventDefault();
        newValue = this.max;
        break;
        
      case 'PageUp':
        event.preventDefault();
        newValue = this.value + (this.step * 10);
        break;
        
      case 'PageDown':
        event.preventDefault();
        newValue = this.value - (this.step * 10);
        break;
    }
    
    if (newValue !== this.value) {
      this.updateValue(newValue);
    }
  }

  private updateValueFromEvent(event: MouseEvent): void {
    const rect = this.sliderContainer.nativeElement.getBoundingClientRect();
    let percentage: number;
    
    if (this.orientation === 'vertical') {
      percentage = 1 - ((event.clientY - rect.top) / rect.height);
    } else {
      percentage = (event.clientX - rect.left) / rect.width;
    }
    
    percentage = Math.max(0, Math.min(1, percentage));
    const rawValue = this.min + (percentage * (this.max - this.min));
    const snappedValue = this.snapToStep(rawValue);
    
    this.updateValue(snappedValue);
  }

  private updateValue(newValue: number): void {
    const clampedValue = this.clampValue(newValue);
    
    if (clampedValue !== this.value) {
      this.value = clampedValue;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
    }
  }

  onFocus(): void {
    this.focused.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.value = this.clampValue(value || this.min);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}