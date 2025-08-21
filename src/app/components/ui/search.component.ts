import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { 
  LucideAngularModule,
  Search,
  X,
  Loader2
} from 'lucide-angular';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  data?: any;
}

export type SearchSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative" [class.w-full]="fullWidth">
      <!-- Search Input -->
      <div class="relative">
        <!-- Search Icon -->
        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <lucide-icon [name]="Search" [size]="iconSize"></lucide-icon>
        </div>
        
        <!-- Input Field -->
        <input
          type="text"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [class]="inputClasses"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
        />
        
        <!-- Loading Spinner -->
        <div *ngIf="loading" class="absolute right-10 top-1/2 -translate-y-1/2">
          <lucide-icon [name]="Loader2" [size]="iconSize" class="animate-spin text-muted-foreground"></lucide-icon>
        </div>
        
        <!-- Clear Button -->
        <button
          *ngIf="value && showClearButton && !loading"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-sm transition-colors"
          (click)="clearSearch()"
          [disabled]="disabled"
        >
          <lucide-icon [name]="X" [size]="iconSize - 2" class="text-muted-foreground"></lucide-icon>
        </button>
      </div>
      
      <!-- Results Dropdown -->
      <div
        *ngIf="showResults && (results.length > 0 || showNoResults)"
        class="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
      >
        <!-- Results List -->
        <div *ngIf="results.length > 0" class="py-1">
          <button
            *ngFor="let result of results; let i = index; trackBy: trackByResultId"
            type="button"
            [class]="getResultClasses(i)"
            (click)="selectResult(result)"
            (mouseenter)="highlightedIndex = i"
          >
            <div class="flex flex-col items-start text-left">
              <span class="font-medium">{{ result.title }}</span>
              <span *ngIf="result.description" class="text-xs text-muted-foreground mt-1">
                {{ result.description }}
              </span>
              <span *ngIf="result.category" class="text-xs text-primary mt-1">
                {{ result.category }}
              </span>
            </div>
          </button>
        </div>
        
        <!-- No Results -->
        <div *ngIf="results.length === 0 && showNoResults" class="px-3 py-2 text-sm text-muted-foreground">
          {{ noResultsText }}
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements ControlValueAccessor {
  @Input() placeholder = 'Search...';
  @Input() size: SearchSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() loading = false;
  @Input() showClearButton = true;
  @Input() fullWidth = false;
  @Input() results: SearchResult[] = [];
  @Input() showNoResults = true;
  @Input() noResultsText = 'No results found';
  @Input() debounceTime = 300; // milliseconds
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() resultSelected = new EventEmitter<SearchResult>();
  @Output() cleared = new EventEmitter<void>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  // Icons
  Search = Search;
  X = X;
  Loader2 = Loader2;

  value = '';
  showResults = false;
  highlightedIndex = -1;
  
  private onChange = (value: string) => {};
  onTouched = () => {};
  private debounceTimer?: number;

  get inputClasses(): string {
    const baseClasses = 'flex w-full rounded-md border border-input bg-background py-2 pl-10 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
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
        return 'h-10 text-sm';
      case 'lg':
        return 'h-12 text-base';
      default:
        return 'h-10 text-sm';
    }
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    
    this.value = newValue;
    this.onChange(newValue);
    
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Set new timer for debounced search
    this.debounceTimer = window.setTimeout(() => {
      this.searchChange.emit(newValue);
      this.showResults = newValue.length > 0;
      this.highlightedIndex = -1;
    }, this.debounceTime);
  }

  onFocus(): void {
    this.showResults = this.value.length > 0 && this.results.length > 0;
    this.focused.emit();
  }

  onBlur(): void {
    // Delay hiding results to allow for result selection
    setTimeout(() => {
      this.showResults = false;
      this.highlightedIndex = -1;
    }, 150);
    this.blurred.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showResults || this.results.length === 0) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.results.length - 1);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.results.length) {
          this.selectResult(this.results[this.highlightedIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.showResults = false;
        this.highlightedIndex = -1;
        break;
    }
  }

  selectResult(result: SearchResult): void {
    this.value = result.title;
    this.onChange(this.value);
    this.showResults = false;
    this.highlightedIndex = -1;
    this.resultSelected.emit(result);
  }

  clearSearch(): void {
    this.value = '';
    this.onChange('');
    this.showResults = false;
    this.highlightedIndex = -1;
    this.cleared.emit();
    
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  getResultClasses(index: number): string {
    const baseClasses = 'w-full px-3 py-2 text-left hover:bg-accent transition-colors';
    const highlightClasses = index === this.highlightedIndex ? 'bg-accent' : '';
    
    return `${baseClasses} ${highlightClasses}`;
  }

  trackByResultId(index: number, result: SearchResult): string {
    return result.id;
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