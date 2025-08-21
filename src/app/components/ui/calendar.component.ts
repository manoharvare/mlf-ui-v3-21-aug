import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { 
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-angular';

export type CalendarMode = 'single' | 'multiple' | 'range';
export type CalendarSize = 'sm' | 'md' | 'lg';

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
}

@Component({
  selector: 'ui-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses">
      <!-- Header -->
      <div [class]="headerClasses">
        <!-- Previous Month Button -->
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7"
          (click)="previousMonth()"
          [attr.aria-label]="'Previous month'"
        >
          <lucide-icon [name]="ChevronLeft" [size]="16"></lucide-icon>
        </button>
        
        <!-- Month/Year Display -->
        <div class="flex items-center gap-2">
          <select 
            [value]="currentMonth"
            (change)="onMonthChange($event)"
            class="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
          >
            <option *ngFor="let month of months; let i = index" [value]="i">
              {{ month }}
            </option>
          </select>
          
          <select 
            [value]="currentYear"
            (change)="onYearChange($event)"
            class="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
          >
            <option *ngFor="let year of availableYears" [value]="year">
              {{ year }}
            </option>
          </select>
        </div>
        
        <!-- Next Month Button -->
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7"
          (click)="nextMonth()"
          [attr.aria-label]="'Next month'"
        >
          <lucide-icon [name]="ChevronRight" [size]="16"></lucide-icon>
        </button>
      </div>
      
      <!-- Calendar Grid -->
      <div [class]="gridClasses">
        <!-- Day Headers -->
        <div *ngFor="let day of dayHeaders" [class]="dayHeaderClasses">
          {{ day }}
        </div>
        
        <!-- Calendar Days -->
        <button
          *ngFor="let calendarDate of calendarDates; trackBy: trackByDate"
          type="button"
          [class]="getDayClasses(calendarDate)"
          [disabled]="calendarDate.isDisabled"
          (click)="selectDate(calendarDate.date)"
          [attr.aria-label]="getDateAriaLabel(calendarDate)"
        >
          {{ calendarDate.date.getDate() }}
        </button>
      </div>
      
      <!-- Footer -->
      <div *ngIf="showFooter" [class]="footerClasses">
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            (click)="goToToday()"
          >
            Today
          </button>
          
          <div *ngIf="mode === 'range' && selectedRange" class="text-xs text-muted-foreground">
            {{ formatDateRange(selectedRange) }}
          </div>
          
          <button
            *ngIf="showClearButton && hasSelection"
            type="button"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            (click)="clear()"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements ControlValueAccessor {
  @Input() mode: CalendarMode = 'single';
  @Input() size: CalendarSize = 'md';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabledDates: Date[] = [];
  @Input() showFooter = true;
  @Input() showClearButton = true;
  @Input() weekStartsOn: 0 | 1 = 1; // 0 = Sunday, 1 = Monday
  
  @Output() dateSelected = new EventEmitter<Date | Date[] | { start: Date; end: Date } | null>();
  @Output() monthChanged = new EventEmitter<{ month: number; year: number }>();

  // Icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  CalendarIcon = CalendarIcon;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  today = new Date();
  
  selectedDate: Date | null = null;
  selectedDates: Date[] = [];
  selectedRange: { start: Date; end: Date } | null = null;
  
  private onChange = (value: any) => {};
  onTouched = () => {};

  get containerClasses(): string {
    const baseClasses = 'p-3 bg-background border border-border rounded-md shadow-sm';
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  }

  get headerClasses(): string {
    return 'flex items-center justify-between mb-4';
  }

  get gridClasses(): string {
    return 'grid grid-cols-7 gap-1';
  }

  get dayHeaderClasses(): string {
    return 'h-9 w-9 text-center text-xs font-medium text-muted-foreground flex items-center justify-center';
  }

  get footerClasses(): string {
    return 'mt-4 pt-3 border-t border-border';
  }

  get months(): string[] {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }

  get dayHeaders(): string[] {
    const days = this.weekStartsOn === 0 
      ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    return days;
  }

  get availableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    for (let year = currentYear - 50; year <= currentYear + 50; year++) {
      years.push(year);
    }
    
    return years;
  }

  get calendarDates(): CalendarDate[] {
    const dates: CalendarDate[] = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Calculate the first day to show (might be from previous month)
    let startDate = new Date(firstDayOfMonth);
    const dayOfWeek = (firstDayOfMonth.getDay() - this.weekStartsOn + 7) % 7;
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      dates.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: this.isSameDay(date, this.today),
        isSelected: this.isDateSelected(date),
        isDisabled: this.isDateDisabled(date),
        isInRange: this.isDateInRange(date),
        isRangeStart: this.isRangeStart(date),
        isRangeEnd: this.isRangeEnd(date)
      });
    }
    
    return dates;
  }

  get hasSelection(): boolean {
    switch (this.mode) {
      case 'single':
        return !!this.selectedDate;
      case 'multiple':
        return this.selectedDates.length > 0;
      case 'range':
        return !!this.selectedRange;
      default:
        return false;
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  }

  getDayClasses(calendarDate: CalendarDate): string {
    const baseClasses = 'h-9 w-9 text-center text-sm p-0 font-normal transition-colors rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    let classes = baseClasses;
    
    if (!calendarDate.isCurrentMonth) {
      classes += ' text-muted-foreground opacity-50';
    }
    
    if (calendarDate.isToday) {
      classes += ' bg-accent text-accent-foreground font-medium';
    }
    
    if (calendarDate.isSelected) {
      classes += ' bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground';
    }
    
    if (calendarDate.isInRange && !calendarDate.isSelected) {
      classes += ' bg-secondary text-secondary-foreground';
    }
    
    if (calendarDate.isRangeStart || calendarDate.isRangeEnd) {
      classes += ' bg-primary text-primary-foreground';
    }
    
    return classes;
  }

  selectDate(date: Date): void {
    if (this.isDateDisabled(date)) return;
    
    switch (this.mode) {
      case 'single':
        this.selectedDate = new Date(date);
        this.onChange(this.selectedDate);
        this.dateSelected.emit(this.selectedDate);
        break;
        
      case 'multiple':
        const existingIndex = this.selectedDates.findIndex(d => this.isSameDay(d, date));
        if (existingIndex >= 0) {
          this.selectedDates.splice(existingIndex, 1);
        } else {
          this.selectedDates.push(new Date(date));
        }
        this.onChange([...this.selectedDates]);
        this.dateSelected.emit([...this.selectedDates]);
        break;
        
      case 'range':
        if (!this.selectedRange || (this.selectedRange.start && this.selectedRange.end)) {
          // Start new range
          this.selectedRange = { start: new Date(date), end: new Date(date) };
        } else if (this.selectedRange.start && !this.selectedRange.end) {
          // Complete range
          if (date < this.selectedRange.start) {
            this.selectedRange = { start: new Date(date), end: this.selectedRange.start };
          } else {
            this.selectedRange.end = new Date(date);
          }
        }
        this.onChange(this.selectedRange);
        this.dateSelected.emit(this.selectedRange);
        break;
    }
    
    this.onTouched();
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.monthChanged.emit({ month: this.currentMonth, year: this.currentYear });
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.monthChanged.emit({ month: this.currentMonth, year: this.currentYear });
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currentMonth = parseInt(target.value);
    this.monthChanged.emit({ month: this.currentMonth, year: this.currentYear });
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currentYear = parseInt(target.value);
    this.monthChanged.emit({ month: this.currentMonth, year: this.currentYear });
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.monthChanged.emit({ month: this.currentMonth, year: this.currentYear });
  }

  clear(): void {
    switch (this.mode) {
      case 'single':
        this.selectedDate = null;
        break;
      case 'multiple':
        this.selectedDates = [];
        break;
      case 'range':
        this.selectedRange = null;
        break;
    }
    
    this.onChange(null);
    this.dateSelected.emit(null);
  }

  private isDateSelected(date: Date): boolean {
    switch (this.mode) {
      case 'single':
        return !!this.selectedDate && this.isSameDay(date, this.selectedDate);
      case 'multiple':
        return this.selectedDates.some(d => this.isSameDay(d, date));
      case 'range':
        return !!this.selectedRange && (
          this.isSameDay(date, this.selectedRange.start) ||
          (this.selectedRange.end && this.isSameDay(date, this.selectedRange.end))
        );
      default:
        return false;
    }
  }

  private isDateInRange(date: Date): boolean {
    if (this.mode !== 'range' || !this.selectedRange) return false;
    
    const { start, end } = this.selectedRange;
    if (!start || !end) return false;
    
    return date > start && date < end;
  }

  private isRangeStart(date: Date): boolean {
    return this.mode === 'range' && !!this.selectedRange && this.isSameDay(date, this.selectedRange.start);
  }

  private isRangeEnd(date: Date): boolean {
    return this.mode === 'range' && !!this.selectedRange?.end && this.isSameDay(date, this.selectedRange.end);
  }

  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    
    return this.disabledDates.some(disabledDate => this.isSameDay(date, disabledDate));
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getDateAriaLabel(calendarDate: CalendarDate): string {
    const dateStr = calendarDate.date.toLocaleDateString();
    let label = dateStr;
    
    if (calendarDate.isToday) label += ', today';
    if (calendarDate.isSelected) label += ', selected';
    if (calendarDate.isDisabled) label += ', disabled';
    
    return label;
  }

  formatDateRange(range: { start: Date; end: Date }): string {
    const startStr = range.start.toLocaleDateString();
    const endStr = range.end.toLocaleDateString();
    return `${startStr} - ${endStr}`;
  }

  trackByDate(index: number, calendarDate: CalendarDate): string {
    return calendarDate.date.toISOString();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    switch (this.mode) {
      case 'single':
        this.selectedDate = value ? new Date(value) : null;
        break;
      case 'multiple':
        this.selectedDates = Array.isArray(value) ? value.map(d => new Date(d)) : [];
        break;
      case 'range':
        this.selectedRange = value ? {
          start: new Date(value.start),
          end: new Date(value.end)
        } : null;
        break;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}