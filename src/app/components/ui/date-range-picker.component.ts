import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-angular';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
  isOutside: boolean;
}

interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
  monthName: string;
}

@Component({
  selector: 'ui-date-range-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Professional Calendar Container -->
    <div class="calendar-container">
      <!-- Selection Status Helper -->
      <div class="mb-3 text-center">
        <div *ngIf="!selectedRange.from" class="text-sm text-muted-foreground">
          Click a date to select start date
        </div>
        <div *ngIf="selectedRange.from && !selectedRange.to" class="text-sm text-primary">
          Start: {{ formatDisplayDate(selectedRange.from) }} • Click another date to select end date
        </div>
        <div *ngIf="selectedRange.from && selectedRange.to" class="text-sm text-success">
          Selected: {{ formatDisplayDate(selectedRange.from) }} - {{ formatDisplayDate(selectedRange.to) }}
        </div>
      </div>
      
      <!-- Months Container with Separator -->
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- First Month -->
        <div class="calendar-month flex flex-col gap-3">
          <!-- Professional Caption -->
          <div class="calendar-month-header flex justify-center relative items-center w-full">
            <!-- Previous Button -->
            <button
              type="button"
              class="calendar-nav-button absolute left-1"
              (click)="previousMonth()"
              [attr.aria-label]="'Go to previous month'"
            >
              <lucide-icon [name]="ChevronLeft" [size]="16"></lucide-icon>
            </button>
            
            <!-- Month Label -->
            <div class="text-sm font-medium text-foreground">
              {{ months[0].monthName }} {{ months[0].year }}
            </div>
          </div>
          
          <!-- Calendar Grid -->
          <div class="calendar-grid w-full">
            <!-- Header Row -->
            <div class="flex gap-1 mb-1">
              <div 
                *ngFor="let day of dayHeaders" 
                class="calendar-day-header w-9 h-8 flex items-center justify-center"
              >
                {{ day }}
              </div>
            </div>
            
            <!-- Calendar Rows -->
            <div *ngFor="let week of getWeeks(months[0].days)" class="flex gap-1 mb-1">
              <div 
                *ngFor="let day of week" 
                [class]="getCellClasses(day)"
                class="relative"
              >
                <button
                  type="button"
                  [class]="getDayClasses(day)"
                  class="w-9 h-9 flex items-center justify-center relative text-sm"
                  [disabled]="day.isDisabled"
                  (click)="selectDate(day.date)"
                  [attr.aria-selected]="day.isSelected || day.isRangeStart || day.isRangeEnd"
                  [attr.aria-label]="getAriaLabel(day)"
                >
                  {{ day.date.getDate() }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Month Separator -->
        <div class="calendar-month-separator hidden sm:block"></div>
        
        <!-- Second Month -->
        <div class="calendar-month flex flex-col gap-3">
          <!-- Professional Caption -->
          <div class="calendar-month-header flex justify-center relative items-center w-full">
            <!-- Month Label -->
            <div class="text-sm font-medium text-foreground">
              {{ months[1].monthName }} {{ months[1].year }}
            </div>
            
            <!-- Next Button -->
            <button
              type="button"
              class="calendar-nav-button absolute right-1"
              (click)="nextMonth()"
              [attr.aria-label]="'Go to next month'"
            >
              <lucide-icon [name]="ChevronRight" [size]="16"></lucide-icon>
            </button>
          </div>
          
          <!-- Calendar Grid -->
          <div class="calendar-grid w-full">
            <!-- Header Row -->
            <div class="flex gap-1 mb-1">
              <div 
                *ngFor="let day of dayHeaders" 
                class="calendar-day-header w-9 h-8 flex items-center justify-center"
              >
                {{ day }}
              </div>
            </div>
            
            <!-- Calendar Rows -->
            <div *ngFor="let week of getWeeks(months[1].days)" class="flex gap-1 mb-1">
              <div 
                *ngFor="let day of week" 
                [class]="getCellClasses(day)"
                class="relative"
              >
                <button
                  type="button"
                  [class]="getDayClasses(day)"
                  class="w-9 h-9 flex items-center justify-center relative text-sm"
                  [disabled]="day.isDisabled"
                  (click)="selectDate(day.date)"
                  [attr.aria-selected]="day.isSelected || day.isRangeStart || day.isRangeEnd"
                  [attr.aria-label]="getAriaLabel(day)"
                >
                  {{ day.date.getDate() }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangePickerComponent implements OnInit {
  @Input() selectedRange: DateRange = { from: undefined, to: undefined };
  @Output() rangeSelected = new EventEmitter<DateRange>();

  // Icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  CalendarIcon = CalendarIcon;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  today = new Date();
  
  months: CalendarMonth[] = [];
  
  dayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.generateCalendarMonths();
  }

  generateCalendarMonths() {
    this.months = [
      this.generateMonth(this.currentYear, this.currentMonth),
      this.generateMonth(
        this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear,
        this.currentMonth === 11 ? 0 : this.currentMonth + 1
      )
    ];
    this.cdr.markForCheck();
  }

  generateMonth(year: number, month: number): CalendarMonth {
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Calculate the first day to show (might be from previous month)
    let startDate = new Date(firstDayOfMonth);
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days: CalendarDay[] = [];
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isOutside = !isCurrentMonth;
      
      days.push({
        date: new Date(date),
        isCurrentMonth,
        isToday: this.isSameDay(date, this.today),
        isSelected: this.isDateSelected(date),
        isInRange: this.isDateInRange(date),
        isRangeStart: this.isRangeStart(date),
        isRangeEnd: this.isRangeEnd(date),
        isDisabled: false,
        isOutside
      });
    }
    
    return {
      year,
      month,
      days,
      monthName: this.monthNames[month]
    };
  }

  getWeeks(days: CalendarDay[]): CalendarDay[][] {
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }

  selectDate(date: Date) {
    if (!this.selectedRange.from || (this.selectedRange.from && this.selectedRange.to)) {
      // Start new range - First click
      this.selectedRange = { from: new Date(date), to: undefined };
      console.log('Start date selected:', date.toDateString());
    } else if (this.selectedRange.from && !this.selectedRange.to) {
      // Complete range - Second click
      if (date < this.selectedRange.from) {
        // If second date is before first date, swap them
        this.selectedRange = { from: new Date(date), to: this.selectedRange.from };
        console.log('End date selected (swapped):', date.toDateString(), 'to', this.selectedRange.to?.toDateString());
      } else if (this.isSameDay(date, this.selectedRange.from)) {
        // If clicking the same date, clear selection to start over
        this.selectedRange = { from: undefined, to: undefined };
        console.log('Selection cleared - same date clicked');
      } else {
        // Normal case: second date is after first date
        this.selectedRange = { ...this.selectedRange, to: new Date(date) };
        console.log('End date selected:', date.toDateString());
      }
    }
    
    this.generateCalendarMonths(); // Refresh to update visual state
    this.rangeSelected.emit(this.selectedRange);
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendarMonths();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendarMonths();
  }

  clearRange() {
    this.selectedRange = { from: undefined, to: undefined };
    this.generateCalendarMonths();
    this.rangeSelected.emit(this.selectedRange);
  }

  // Cell classes - matching React DayPicker cell styling
  getCellClasses(day: CalendarDay): string {
    let classes = 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20';
    
    // Range styling for cells
    if (day.isRangeStart || day.isRangeEnd || day.isInRange) {
      classes += ' bg-accent';
    }
    
    // Range end styling
    if (day.isRangeEnd) {
      classes += ' rounded-r-md';
    }
    
    // Range start styling  
    if (day.isRangeStart) {
      classes += ' rounded-l-md';
    }
    
    return classes;
  }

  // Premium day button classes with sophisticated styling
  getDayClasses(day: CalendarDay): string {
    // Base premium calendar day classes
    let classes = 'calendar-day';
    
    // Add specific state classes for premium styling
    if (day.isToday) {
      classes += ' calendar-day-today';
    }
    
    if (day.isRangeStart) {
      classes += ' calendar-day-selected calendar-range-start';
    } else if (day.isRangeEnd) {
      classes += ' calendar-day-selected calendar-range-end';
    } else if (day.isInRange) {
      classes += ' calendar-day-range calendar-range-middle';
    }
    
    if (day.isOutside) {
      classes += ' calendar-day-outside';
    }
    
    return classes;
  }

  getAriaLabel(day: CalendarDay): string {
    const dateStr = day.date.toLocaleDateString();
    if (day.isRangeStart) return `Start of range, ${dateStr}`;
    if (day.isRangeEnd) return `End of range, ${dateStr}`;
    if (day.isInRange) return `In range, ${dateStr}`;
    if (day.isToday) return `Today, ${dateStr}`;
    return dateStr;
  }

  private isDateSelected(date: Date): boolean {
    return !!(this.selectedRange.from && this.isSameDay(date, this.selectedRange.from)) ||
           !!(this.selectedRange.to && this.isSameDay(date, this.selectedRange.to));
  }

  private isDateInRange(date: Date): boolean {
    if (!this.selectedRange.from || !this.selectedRange.to) return false;
    return date > this.selectedRange.from && date < this.selectedRange.to;
  }

  private isRangeStart(date: Date): boolean {
    return this.selectedRange.from ? this.isSameDay(date, this.selectedRange.from) : false;
  }

  private isRangeEnd(date: Date): boolean {
    return this.selectedRange.to ? this.isSameDay(date, this.selectedRange.to) : false;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}