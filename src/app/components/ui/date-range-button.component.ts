import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Calendar as CalendarIcon,
  X
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
      contentClass="w-auto p-0 max-w-[calc(100vw-1rem)]"
      placement="bottom-start"
    >
      <ui-button
        slot="trigger"
        variant="outline"
        class="w-64 justify-start text-left font-normal"
        [class.text-muted-foreground]="!dateRange.from"
        [class.text-foreground]="dateRange.from"
        (clicked)="togglePopover()"
      >
        <lucide-icon 
          [name]="CalendarIcon" 
          [size]="16" 
          class="mr-2"
          [class.text-primary]="dateRange.from"
          [class.text-muted-foreground]="!dateRange.from"
        ></lucide-icon>
        <span *ngIf="dateRange.from && dateRange.to">
          {{ formatDate(dateRange.from) }} - {{ formatDate(dateRange.to) }}
        </span>
        <span *ngIf="dateRange.from && !dateRange.to">
          {{ formatDate(dateRange.from) }}
        </span>
        <span *ngIf="!dateRange.from">Pick a date range</span>
      </ui-button>
      
      <ui-date-range-picker
        [selectedRange]="dateRange"
        (rangeSelected)="onRangeSelected($event)"
      ></ui-date-range-picker>
      
      <div slot="footer" class="p-3 border-t bg-muted/30">
        <ui-button 
          variant="outline" 
          class="w-full hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
          (clicked)="clearRange()"
        >
          <lucide-icon [name]="X" [size]="14" class="mr-2"></lucide-icon>
          Clear Selection
        </ui-button>
      </div>
    </ui-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeButtonComponent {
  @Input() dateRange: DateRange = { from: undefined, to: undefined };
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  CalendarIcon = CalendarIcon;
  X = X;
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

  clearRange() {
    const clearedRange: DateRange = { from: undefined, to: undefined };
    this.dateRange = clearedRange;
    this.dateRangeChange.emit(clearedRange);
    this.isOpen = false;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}