import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, HostListener, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  ChevronDown,
  Check,
  Shield,
  User,
  Eye,
  LucideIconData
} from 'lucide-angular';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: LucideIconData;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <!-- Label -->
      <label *ngIf="label" 
             [for]="selectId" 
             class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
             [ngClass]="{ 'text-destructive': hasError }">
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </label>
      
      <!-- Select Container -->
      <div class="relative" #selectContainer>
        <!-- Select Trigger -->
        <button
          type="button"
          [id]="selectId"
          [disabled]="disabled"
          [ngClass]="triggerClasses"
          (click)="toggleDropdown()"
          (keydown)="onKeyDown($event)"
        >
          <div class="flex items-center gap-2">
            <!-- Selected option icon -->
            <lucide-icon 
              *ngIf="selectedOption?.icon" 
              [name]="selectedOption?.icon" 
              [size]="16"
              class="shrink-0 text-muted-foreground">
            </lucide-icon>
            
            <!-- Selected text or placeholder -->
            <span [ngClass]="{ 'text-muted-foreground': !selectedOption }">
              {{ selectedOption?.label || placeholder || 'Select an option...' }}
            </span>
          </div>
          
          <!-- Chevron -->
          <lucide-icon 
            [name]="ChevronDown" 
            [size]="16"
            class="shrink-0 text-muted-foreground transition-transform duration-200"
            [ngClass]="{ 'rotate-180': isOpen }">
          </lucide-icon>
        </button>
        
        <!-- Dropdown -->
        <div *ngIf="isOpen" 
             class="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md animate-in fade-in-0 zoom-in-95"
             [ngClass]="dropdownPosition">
          
          <!-- Search input -->
          <div *ngIf="searchable" class="p-2 border-b border-border">
            <input
              #searchInput
              type="text"
              placeholder="Search options..."
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="w-full px-2 py-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
            />
          </div>
          
          <!-- Options -->
          <div class="max-h-60 overflow-auto p-1">
            <div *ngIf="filteredOptions.length === 0" 
                 class="px-2 py-1.5 text-sm text-muted-foreground text-center">
              No options found
            </div>
            
            <button
              *ngFor="let option of filteredOptions; trackBy: trackByValue"
              type="button"
              [disabled]="option.disabled"
              (click)="selectOption(option)"
              class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              [ngClass]="{ 'bg-accent text-accent-foreground': isSelected(option) }"
            >
              <!-- Option icon -->
              <lucide-icon 
                *ngIf="option.icon" 
                [name]="option.icon" 
                [size]="16"
                class="mr-2 shrink-0">
              </lucide-icon>
              
              <!-- Option label -->
              <span class="flex-1 text-left">{{ option.label }}</span>
              
              <!-- Check mark for selected option -->
              <lucide-icon 
                *ngIf="isSelected(option)" 
                [name]="Check" 
                [size]="16"
                class="ml-2 shrink-0">
              </lucide-icon>
            </button>
          </div>
        </div>
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
export class SelectComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() options: SelectOption[] = [];
  @Input() disabled = false;
  @Input() required = false;
  @Input() searchable = false;
  @Input() clearable = false;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() selectId?: string;
  @Input() dropdownPosition: 'top' | 'bottom' | 'auto' = 'auto';
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() optionSelected = new EventEmitter<SelectOption>();
  
  @ViewChild('selectContainer') selectContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Icon references for template
  ChevronDown = ChevronDown;
  Check = Check;
  Shield = Shield;
  User = User;
  Eye = Eye;

  value: any = null;
  isOpen = false;
  searchTerm = '';
  filteredOptions: SelectOption[] = [];
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get selectedOption(): SelectOption | undefined {
    return this.options.find(option => option.value === this.value);
  }

  get triggerClasses(): string {
    const baseClasses = 'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground';
    const errorClasses = this.hasError ? 'border-destructive focus-visible:ring-destructive' : '';
    
    return `${baseClasses} ${errorClasses}`.trim();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.searchTerm = '';
      this.filteredOptions = [...this.options];
      
      // Focus search input if searchable
      if (this.searchable) {
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
        });
      }
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;
    
    this.value = option.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.optionSelected.emit(option);
    this.isOpen = false;
    this.onTouched();
  }

  isSelected(option: SelectOption): boolean {
    return option.value === this.value;
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredOptions = this.options.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
    } else if (event.key === 'Escape') {
      this.isOpen = false;
    }
  }

  trackByValue(index: number, option: SelectOption): any {
    return option.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.selectContainer?.nativeElement?.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}