import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Calendar as CalendarIcon
} from 'lucide-angular';
import { PopoverComponent } from './popover.component';
import { ButtonComponent } from './button.component';
import { DateRangePickerComponent } from './date-range-picker.component';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

@Component({
  selector: 'ui-date-range-button',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    PopoverComponent, 
    ButtonComponent, 
    DateRangePickerComponent
  ],
  template: `
    <ui-popover 
      [isOpen]="isOpen" 
      (openChange)="onOpenChange($event)" 
      contentClass="calendar-popover w-auto p-0"
      placement="bottom-start"
    >
      <div slot="trigger">
        <ui-button
          variant="outline"
          class="w-64 justify-start text-left font-normal"
          [leftIcon]="CalendarIcon"
          (clicked)="togglePopover()"
        >
          {{ getButtonText() }}
        </ui-button>
      </div>
      
      <div slot="content" class="p-4">
        <ui-date-range-picker
          [selectedRange]="dateRange"
          (rangeSelected)="onRangeSelected($event)"
        ></ui-date-range-picker>
      </div>
    </ui-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeButtonComponent {
  @Input() dateRange: DateRange = { from: undefined, to: undefined };
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  CalendarIcon = CalendarIcon;
  isOpen = false;

  togglePopover() {
    this.isOpen = !this.isOpen;
  }

  onOpenChange(open: boolean) {
    this.isOpen = open;
  }

  onRangeSelected(range: DateRange) {
    this.dateRange = range;
    this.dateRangeChange.emit(range);
    
    // Close popover when complete range is selected
    if (range.from && range.to) {
      this.isOpen = false;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getButtonText(): string {
    if (this.dateRange.from && this.dateRange.to) {
      return `${this.formatDate(this.dateRange.from)} - ${this.formatDate(this.dateRange.to)}`;
    } else if (this.dateRange.from && !this.dateRange.to) {
      return `${this.formatDate(this.dateRange.from)} (select end date)`;
    } else {
      return 'Pick a date range';
    }
  }
}