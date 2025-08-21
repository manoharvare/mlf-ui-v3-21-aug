import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Check,
  ChevronsUpDown,
  Edit2,
  X,
  RefreshCw,
  Calendar as CalendarIcon,
  ChevronDown,
  Save,
  RotateCcw,
  Filter,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-angular';

// Date-fns imports for advanced date handling
import { 
  format, 
  parseISO, 
  eachDayOfInterval, 
  isWeekend, 
  startOfWeek, 
  endOfWeek, 
  isSameWeek 
} from 'date-fns';

// UI Components
import { ButtonComponent } from '../ui/button.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { InputComponent } from '../ui/input.component';
import { TableComponent, TableHeaderComponent, TableBodyComponent, TableRowComponent, TableHeadComponent, TableCellComponent } from '../ui/table.component';
import { BadgeComponent } from '../ui/badge.component';
import { SwitchComponent } from '../ui/switch.component';
import { PopoverComponent } from '../ui/popover.component';
import { CommandComponent } from '../ui/command.component';
import { TooltipComponent } from '../ui/tooltip.component';
import { TextareaComponent } from '../ui/textarea.component';
import { CalendarComponent } from '../ui/calendar.component';

// Define hierarchical data interfaces
interface ActivitySpread {
  activityCode: string;
  description: string;
  attributes: string;
  hours: (string | number)[];
}

interface L4Activity {
  jobNumber: string;
  activityCode: string;
  hours: number;
  spcCode: string;
  start: string;
  end: string;
  comment: string;
  weekly: (string | number)[];
}

interface SPCActivity {
  activityCode: string;
  jobNumber: string;
  spcCode: string;
  subCode: string;
  start: string;
  end: string;
  weekly: (string | number)[];
}

interface WeeklyDate {
  display: string;
  fullDate: Date;
}

interface CraftData {
  craftName: string;
  weeklyData: number[];
}

interface AvailableDate {
  display: string;
  full: Date;
}

// Helper function to parse date string (dd-MMM-yy format)
const parseProjectDate = (dateStr: string): Date => {
  try {
    // Convert format like "07-Aug-25" to "2025-08-07"
    const parts = dateStr.split('-');
    if (parts.length !== 3) throw new Error('Invalid date format');
    
    const day = parts[0].padStart(2, '0');
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const month = monthMap[parts[1]] || '01';
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    
    return new Date(`${year}-${month}-${day}`);
  } catch {
    return new Date(); // Fallback to current date
  }
};

// Helper function to calculate working days between two dates (excluding weekends)
const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  if (startDate > endDate) return 0;
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
};

// Helper function to calculate working days in a specific week for a date range
const calculateWorkingDaysInWeek = (weekStartDate: Date, startDate: Date, endDate: Date): number => {
  const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 }); // Friday (we only care about working days)
  
  // Find the overlap between the project date range and this week
  const overlapStart = new Date(Math.max(startDate.getTime(), weekStart.getTime()));
  const overlapEnd = new Date(Math.min(endDate.getTime(), weekEnd.getTime()));
  
  if (overlapStart > overlapEnd) return 0;
  
  // Count working days in the overlap period
  return calculateWorkingDays(overlapStart, overlapEnd);
};

// Helper function to get current week cutoff (start of next week)
const getCurrentWeekCutoff = (): Date => {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + (7 - now.getDay() + 1) % 7); // Next Monday
  nextWeek.setHours(0, 0, 0, 0);
  return nextWeek;
};

// Helper function to distribute hours across weekly columns with freeze logic
const distributeHoursWithFreeze = (
  toGoHours: number, 
  startDateStr: string, 
  endDateStr: string,
  weeklyDates: Array<{ display: string; fullDate: Date }>,
  existingHours: number[] = [],
  preservePastValues: boolean = true
): number[] => {
  const startDate = parseProjectDate(startDateStr);
  const endDate = parseProjectDate(endDateStr);
  const currentWeekCutoff = getCurrentWeekCutoff();
  
  // If start date is before current week cutoff and we're preserving past values
  const effectiveStartDate = preservePastValues && startDate < currentWeekCutoff ? currentWeekCutoff : startDate;
  
  const totalWorkingDays = calculateWorkingDays(effectiveStartDate, endDate);
  if (totalWorkingDays === 0) {
    // If no future working days, return existing values or zeros
    return weeklyDates.map((_, index) => existingHours[index] || 0);
  }
  
  const dailyRate = toGoHours / totalWorkingDays;
  
  return weeklyDates.map((weekData, index) => {
    // If this week is before the cutoff and we have existing data, preserve it
    if (preservePastValues && weekData.fullDate < currentWeekCutoff && existingHours[index] !== undefined) {
      return existingHours[index];
    }
    
    // Calculate new value for future weeks
    const workingDaysInWeek = calculateWorkingDaysInWeek(weekData.fullDate, effectiveStartDate, endDate);
    return Math.round(dailyRate * workingDaysInWeek);
  });
};

@Component({
  selector: 'app-mlf-forecast-complete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    SelectComponent,
    InputComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    BadgeComponent,
    SwitchComponent,
    PopoverComponent,
    CommandComponent,
    TooltipComponent,
    TextareaComponent,
    CalendarComponent
  ],
  template: `
    <div class="p-4">
      <div class="max-w-full mx-auto">
        <!-- Combined Filter Controls -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <!-- Main Selection Controls -->
          <div class="flex flex-wrap gap-3 mb-3">
            <!-- Location Selection -->
            <div class="space-y-2 max-w-48">
              <label class="text-sm font-medium text-gray-700">Select Location</label>
              <ui-select
                [options]="locationOptions()"
                [(ngModel)]="selectedLocation"
                placeholder="Choose location..."
                (valueChange)="onLocationChange($event)">
              </ui-select>
            </div>

            <!-- Project Selection with Search -->
            <div class="space-y-2 flex-1 min-w-80">
              <label class="text-sm font-medium text-gray-700">Select Project</label>
              <ui-select
                [options]="projectOptions()"
                [(ngModel)]="selectedProject"
                placeholder="Search and select project..."
                [searchable]="true"
                (valueChange)="onProjectChange($event)">
              </ui-select>
            </div>

            <!-- MLF Filter Selection -->
            <div class="space-y-2 max-w-48 ml-auto">
              <label class="text-sm font-medium text-gray-700">Select MLF Filter</label>
              <ui-select
                [options]="mlfFilterOptions()"
                [(ngModel)]="selectedMLFFilter"
                placeholder="Choose MLF filter..."
                (valueChange)="onMLFFilterChange($event)">
              </ui-select>
            </div>
          </div>

          <!-- Additional Filters - Only show when MLF Filter is selected -->
          <div *ngIf="selectedMLFFilter()">
            <div class="border-t border-gray-200 pt-3">
              <div class="flex flex-wrap gap-3 items-end">
                <!-- Craft Multi-select -->
                <div class="space-y-2 flex-1 min-w-64">
                  <label class="text-sm font-medium text-gray-700">Filter by Craft</label>
                  <ui-select
                    [options]="craftOptions()"
                    [(ngModel)]="selectedCraftFilter"
                    placeholder="Select crafts..."
                    [searchable]="true"
                    (valueChange)="onCraftFilterChange($event)">
                  </ui-select>
                </div>

                <!-- Show Negative Variance Only Toggle -->
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Show Negative Variance Only</label>
                  <div class="flex items-center space-x-2">
                    <ui-switch
                      [checked]="showNegativeOnly()"
                      (checkedChange)="onNegativeOnlyChange($event)">
                    </ui-switch>
                    <label class="text-sm text-gray-600">
                      Negative variance only
                    </label>
                  </div>
                </div>
              </div>

              <!-- Active Filters Summary -->
              <div *ngIf="selectedCraftFilter() || showNegativeOnly()" 
                   class="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-3">
                <div class="flex items-center gap-2 text-sm text-blue-800">
                  <span class="font-medium">Active Filters:</span>
                  <ui-badge *ngIf="selectedCraftFilter()" variant="outline">
                    Craft: {{ selectedCraftFilter() }}
                  </ui-badge>
                  <ui-badge *ngIf="showNegativeOnly()" variant="outline">
                    Negative Variance Only
                  </ui-badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Check if all selections are made -->
        <div *ngIf="selectedLocation() && selectedProject() && selectedMLFFilter(); else noSelection">
          <!-- Custom Material Design Tabs -->
          <div class="border-b border-border mb-4">
            <div class="flex space-x-6">
              <button
                *ngFor="let tab of tabs"
                (click)="setActiveTab(tab.id)"
                [class]="getTabClasses(tab.id)">
                {{ tab.name }}
                <div *ngIf="activeTab() === tab.id" 
                     class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full">
                </div>
              </button>
            </div>
          </div>
          
          <!-- Tab Content -->
          <div class="space-y-4">
            <div *ngFor="let tab of tabs" class="bg-white rounded-lg border border-gray-200 p-4">
              <div *ngIf="activeTab() === tab.id">
                
                <!-- L4 Craft Report Edit - Complete Implementation -->
                <div *ngIf="tab.id === 'l4-craft-edit'" class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">L4 (Craft Report Edit)</h3>
                    <div class="flex items-center gap-4">
                      <!-- Date Selection Interface -->
                      <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600">Select dates:</label>
                        <ui-popover [isOpen]="openDatePicker()" (openChange)="onDatePickerOpenChange($event)">
                          <button 
                            ui-popover-trigger
                            class="w-48 justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
                            {{ selectedDates().length > 0 
                              ? selectedDates().length + ' dates selected'
                              : 'Select dates...'
                            }}
                            <lucide-icon [name]="CalendarIconRef" [size]="16" class="ml-2 opacity-50"></lucide-icon>
                          </button>
                          <div ui-popover-content class="w-80 p-0">
                            <ui-command>
                              <input ui-command-input placeholder="Search dates..." />
                              <div ui-command-empty>No dates found.</div>
                              <div ui-command-group>
                                <div ui-command-list>
                                  <div ui-command-item (click)="clearAllDates()">
                                    Clear All
                                  </div>
                                  <div ui-command-item (click)="selectAllDates()">
                                    Select All
                                  </div>
                                  <div 
                                    *ngFor="let dateObj of availableDates()"
                                    ui-command-item 
                                    (click)="toggleDateSelection(dateObj.full)">
                                    <div class="flex items-center space-x-2">
                                      <div [class]="getDateCheckboxClasses(dateObj.full)">
                                        <lucide-icon 
                                          *ngIf="isDateSelected(dateObj.full)" 
                                          [name]="CheckIcon" 
                                          [size]="12" 
                                          class="text-primary-foreground">
                                        </lucide-icon>
                                      </div>
                                      <span>{{ dateObj.display }}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </ui-command>
                          </div>
                        </ui-popover>
                      </div>
                    </div>
                  </div>

                  <!-- Selected Dates Display -->
                  <div *ngIf="selectedDates().length > 0" class="space-y-2 mb-3">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm text-foreground">Selected Dates:</span>
                      <ui-badge 
                        *ngFor="let date of selectedDates(); trackBy: trackByDate" 
                        variant="secondary" 
                        class="gap-1">
                        {{ formatDateDisplay(date) }}
                        <lucide-icon 
                          [name]="XIcon" 
                          [size]="12" 
                          class="cursor-pointer hover:text-destructive" 
                          (click)="removeSelectedDate(date)">
                        </lucide-icon>
                      </ui-badge>
                    </div>

                    <!-- Column Visibility Controls -->
                    <div *ngIf="weeklyDates().length > 0" class="border-t pt-2">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-foreground">Column Visibility:</span>
                        <div class="flex items-center gap-2">
                          <ui-button variant="outline" size="sm" (clicked)="showAllColumns()">
                            Show All
                          </ui-button>
                          <ui-button variant="outline" size="sm" (clicked)="hideAllColumns()">
                            Hide All
                          </ui-button>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <ui-badge 
                          *ngFor="let date of weeklyDates(); let index = index; trackBy: trackByWeeklyDate" 
                          [variant]="isColumnVisible(index) ? 'default' : 'secondary'"
                          [class]="getColumnVisibilityClasses(index)"
                          (click)="toggleColumnVisibility(index)">
                          {{ date.display }}
                          <lucide-icon 
                            [name]="isColumnVisible(index) ? CheckIcon : XIcon" 
                            [size]="12">
                          </lucide-icon>
                        </ui-badge>
                      </div>
                      <div *ngIf="filteredWeeklyDates().length !== weeklyDates().length" 
                           class="text-xs text-muted-foreground mt-2">
                        Showing {{ filteredWeeklyDates().length }} of {{ weeklyDates().length }} columns
                      </div>
                    </div>
                  </div>
                  
                  <!-- Craft Data Grid - Exact React Layout -->
                  <div *ngIf="filteredCraftData().length > 0; else noCrafts" class="grid gap-4">
                    <div 
                      *ngFor="let craft of filteredCraftData(); let craftIndex = index; trackBy: trackByCraft" 
                      class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <!-- Craft Header -->
                      <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 class="font-medium text-gray-900">{{ craft.craftName }}</h4>
                      </div>
                      
                      <!-- Week Blocks - Table Layout with Common Headers -->
                      <div class="p-4">
                        <div class="overflow-x-auto mb-3">
                          <div class="min-w-max">
                            <!-- Row Headers Column -->
                            <div class="flex">
                              <div class="flex-shrink-0 w-20">
                                <div class="h-6"></div> <!-- Empty space for date row -->
                                <div class="flex flex-col gap-1">
                                  <div class="h-8 flex items-center justify-center text-xs text-gray-600 font-medium bg-blue-50 border border-blue-200 rounded">
                                    P6 Craft
                                  </div>
                                  <div class="h-8 flex items-center justify-center text-xs text-gray-600 font-medium bg-indigo-50 border border-indigo-200 rounded">
                                    L4 Original
                                  </div>
                                  <div class="h-8 flex items-center justify-center text-xs text-gray-600 font-medium bg-gray-50 border border-gray-200 rounded">
                                    L4 Updated
                                  </div>
                                  <div class="h-8 flex items-center justify-center text-xs text-gray-600 font-medium bg-purple-50 border border-purple-200 rounded">
                                    L4 Variance
                                  </div>
                                  <div class="h-8 flex items-center justify-center text-xs text-gray-600 font-medium bg-orange-50 border border-orange-200 rounded">
                                    P6 vs L4
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Week Columns -->
                              <div class="flex gap-2 ml-2">
                                <div 
                                  *ngFor="let date of filteredWeeklyDates(); let displayIndex = index; trackBy: trackByFilteredDate" 
                                  class="flex-shrink-0 w-20">
                                  <!-- Date Header - Clickable for selection -->
                                  <button
                                    (click)="toggleGridColumnSelection(getCraftKey(craftIndex), getOriginalIndex(date))"
                                    [class]="getDateHeaderClasses(craftIndex, date)">
                                    <div class="flex items-center gap-1">
                                      {{ date.display }}
                                      <lucide-icon 
                                        *ngIf="isGridColumnSelected(getCraftKey(craftIndex), getOriginalIndex(date))" 
                                        [name]="CheckIcon" 
                                        [size]="12">
                                      </lucide-icon>
                                    </div>
                                  </button>
                                  
                                  <!-- Value Column -->
                                  <div class="flex flex-col gap-1">
                                    <!-- P6 Craft Value -->
                                    <button
                                      (click)="toggleBlockExpansion(craftIndex, getOriginalIndex(date))"
                                      [class]="getP6CraftButtonClasses(craftIndex, getOriginalIndex(date))">
                                      <div class="text-xs text-gray-900 font-medium">
                                        {{ getP6CraftValue(craft, displayIndex) }}
                                      </div>
                                    </button>
                                    
                                    <!-- L4 Original Value -->
                                    <button
                                      (click)="toggleBlockExpansion(craftIndex, getOriginalIndex(date))"
                                      [class]="getL4OriginalButtonClasses(craftIndex, getOriginalIndex(date))">
                                      <div class="text-xs text-gray-900 font-medium">
                                        {{ calculateOriginalTotalActivityHours(getOriginalIndex(date)) }}
                                      </div>
                                    </button>
                                    
                                    <!-- L4 Updated Value -->
                                    <button
                                      (click)="toggleBlockExpansion(craftIndex, getOriginalIndex(date))"
                                      [class]="getL4UpdatedButtonClasses(craftIndex, getOriginalIndex(date))">
                                      <div [class]="getL4UpdatedTextClasses(getOriginalIndex(date))">
                                        {{ calculateTotalActivityHours(getOriginalIndex(date)) }}
                                      </div>
                                    </button>
                                    
                                    <!-- L4 Variance (L4 Original - L4 Updated) -->
                                    <div [class]="getL4VarianceClasses(getOriginalIndex(date))">
                                      <div [class]="getL4VarianceTextClasses(getOriginalIndex(date))">
                                        {{ formatVariance(getL4Variance(getOriginalIndex(date))) }}
                                      </div>
                                    </div>
                                    
                                    <!-- P6 vs L4 Variance (P6 Craft - L4 Updated) -->
                                    <div [class]="getP6VsL4VarianceClasses(craft, displayIndex, getOriginalIndex(date))">
                                      <div [class]="getP6VsL4VarianceTextClasses(craft, displayIndex, getOriginalIndex(date))">
                                        {{ formatVariance(getP6VsL4Variance(craft, displayIndex, getOriginalIndex(date))) }}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Individual Craft Sections - Show when this craft has grid columns selected -->
                        <div *ngIf="hasSelectedGridColumns(getCraftKey(craftIndex))" class="mt-4 border-t border-gray-200 pt-4">
                          <div class="mb-3">
                            <div class="flex items-center justify-between mb-3">
                              <h5 class="font-medium text-gray-900">
                                Details for {{ craft.craftName }} - Selected Dates
                              </h5>
                              
                              <!-- Activity Filter and Action Buttons -->
                              <div class="flex items-center gap-2">
                                <lucide-icon [name]="FilterIcon" [size]="16" class="text-gray-500"></lucide-icon>
                                <ui-popover [isOpen]="getActivitySelectOpen(getCraftKey(craftIndex))" (openChange)="onActivitySelectOpenChange(getCraftKey(craftIndex), $event)">
                                  <button 
                                    ui-popover-trigger
                                    class="h-8 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
                                    {{ getSelectedActivitiesText(getCraftKey(craftIndex)) }}
                                    <lucide-icon [name]="ChevronDownIcon" [size]="14" class="ml-1"></lucide-icon>
                                  </button>
                                  <div ui-popover-content class="w-64 p-0">
                                    <ui-command>
                                      <input ui-command-input placeholder="Search activities..." />
                                      <div ui-command-empty>No activities found.</div>
                                      <div ui-command-group>
                                        <div ui-command-list>
                                          <div ui-command-item (click)="clearActivityFilter(getCraftKey(craftIndex))">
                                            Clear Filter
                                          </div>
                                          <div 
                                            *ngFor="let activity of getAvailableActivities()"
                                            ui-command-item 
                                            (click)="toggleActivitySelection(getCraftKey(craftIndex), activity)">
                                            <div class="flex items-center space-x-2">
                                              <div [class]="getActivityCheckboxClasses(getCraftKey(craftIndex), activity)">
                                                <lucide-icon 
                                                  *ngIf="isActivitySelected(getCraftKey(craftIndex), activity)" 
                                                  [name]="CheckIcon" 
                                                  [size]="12" 
                                                  class="text-primary-foreground">
                                                </lucide-icon>
                                              </div>
                                              <span>{{ activity }}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </ui-command>
                                  </div>
                                </ui-popover>
                                
                                <!-- Action Buttons -->
                                <ui-button variant="outline" size="sm" (clicked)="recalculateSelectedColumns(getCraftKey(craftIndex))">
                                  <lucide-icon [name]="CalculatorIcon" [size]="14" class="mr-1"></lucide-icon>
                                  Recalculate
                                </ui-button>
                                <ui-button variant="outline" size="sm" (clicked)="clearSelectedColumns(getCraftKey(craftIndex))">
                                  <lucide-icon [name]="XIcon" [size]="14" class="mr-1"></lucide-icon>
                                  Clear
                                </ui-button>
                              </div>
                            </div>

                            <!-- Selected Activities Display -->
                            <div *ngIf="getSelectedActivities(getCraftKey(craftIndex)).length > 0" class="flex items-center gap-2 flex-wrap mb-3">
                              <span class="text-sm text-foreground">Filtered Activities:</span>
                              <ui-badge 
                                *ngFor="let activityCode of getSelectedActivities(getCraftKey(craftIndex)); trackBy: trackByActivityString"
                                variant="secondary" 
                                class="gap-1">
                                {{ activityCode }}
                                <lucide-icon 
                                  [name]="XIcon" 
                                  [size]="12" 
                                  class="cursor-pointer hover:text-destructive" 
                                  (click)="removeActivityFromFilter(getCraftKey(craftIndex), activityCode)">
                                </lucide-icon>
                              </ui-badge>
                            </div>
                          </div>
                          
                          <div class="space-y-4">
                            <!-- Section 1: Forecast Plan Hours -->
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div class="mb-3">
                                <h6 class="font-medium text-blue-900">
                                  1. Forecast Plan Hours (Read Only)
                                </h6>
                                <p class="text-xs text-blue-700 mt-1">Activity data with weekly hours multiplied by 60</p>
                              </div>
                              <div class="overflow-x-auto">
                                <ui-table>
                                  <ui-table-header>
                                    <ui-table-row>
                                      <ui-table-head class="min-w-20">Activity ID</ui-table-head>
                                      <ui-table-head class="min-w-32">Activity Description</ui-table-head>
                                      <ui-table-head 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                        class="min-w-16 text-center">
                                        {{ dateObj.display }}
                                      </ui-table-head>
                                    </ui-table-row>
                                  </ui-table-header>
                                  <ui-table-body>
                                    <ui-table-row 
                                      *ngFor="let activity of getFilteredActivitySpread(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackByActivityCode">
                                      <ui-table-cell class="font-medium">{{ activity.activityCode }}</ui-table-cell>
                                      <ui-table-cell>{{ activity.description }}</ui-table-cell>
                                      <ui-table-cell 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                        class="text-center">
                                        <div class="w-16 mx-auto">
                                          <div [class]="getForecastHoursCellClasses(activity, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                            {{ getForecastHoursValue(activity, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                          </div>
                                        </div>
                                      </ui-table-cell>
                                    </ui-table-row>
                                  </ui-table-body>
                                </ui-table>
                              </div>
                            </div>

                            <!-- Section 2: Level 4 Craft (Calculated) -->
                            <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div class="flex items-center justify-between mb-3">
                                <h6 class="font-medium text-green-900">
                                  2. Level 4 Craft (Calculated - Read Only)
                                </h6>
                                <div class="text-xs text-green-700">
                                  Auto-calculated distributed workforce (Forecasted Hours ÷ 60)
                                </div>
                              </div>
                              <div class="overflow-x-auto">
                                <ui-table>
                                  <ui-table-header>
                                    <ui-table-row>
                                      <ui-table-head class="min-w-20">Link Code</ui-table-head>
                                      <ui-table-head class="min-w-32">Link Code Description</ui-table-head>
                                      <ui-table-head class="min-w-16">AFC Hr</ui-table-head>
                                      <ui-table-head class="min-w-16">WP Hrs</ui-table-head>
                                      <ui-table-head class="min-w-16">To Go Hrs</ui-table-head>
                                      <ui-table-head class="min-w-24">Fcst Start</ui-table-head>
                                      <ui-table-head class="min-w-24">Fcst Finish</ui-table-head>
                                      <ui-table-head 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                        class="min-w-16 text-center">
                                        {{ dateObj.display }}
                                      </ui-table-head>
                                    </ui-table-row>
                                  </ui-table-header>
                                  <ui-table-body>
                                    <ui-table-row 
                                      *ngFor="let l4 of getFilteredL4Activities(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackByL4JobNumber">
                                      <ui-table-cell class="font-medium text-blue-700">{{ l4.jobNumber }}</ui-table-cell>
                                      <ui-table-cell>{{ l4.activityCode }} - Link Description</ui-table-cell>
                                      <ui-table-cell class="text-center">{{ getAfcHours(l4) }}</ui-table-cell>
                                      <ui-table-cell class="text-center">{{ getWpHours(l4) }}</ui-table-cell>
                                      <ui-table-cell class="text-center font-medium">{{ getToGoHours(l4) }}</ui-table-cell>
                                      <ui-table-cell class="text-center text-xs">{{ l4.start }}</ui-table-cell>
                                      <ui-table-cell class="text-center text-xs">{{ l4.end }}</ui-table-cell>
                                      <ui-table-cell 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                        class="text-center">
                                        <div class="w-16 mx-auto">
                                          <div [class]="getWorkforceCellClasses(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                            {{ getWorkforceValue(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                          </div>
                                        </div>
                                      </ui-table-cell>
                                    </ui-table-row>
                                  </ui-table-body>
                                </ui-table>
                              </div>
                            </div>

                            <!-- Section 3: Level 4 Forecasted Hours (Calculated) - EDITABLE DATES -->
                            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <div class="flex items-center justify-between mb-3">
                                <h6 class="font-medium text-indigo-900">
                                  3. Level 4 Forecasted Hours (Calculated - Editable Dates)
                                </h6>
                                <div class="text-xs text-indigo-700">
                                  Edit dates to auto-calculate distributed hours. Hours = To Go Hrs ÷ Working Days × Days in Week
                                </div>
                              </div>
                              <div class="overflow-x-auto">
                                <ui-table>
                                  <ui-table-header>
                                    <ui-table-row>
                                      <ui-table-head class="min-w-20">Link Code</ui-table-head>
                                      <ui-table-head class="min-w-32">Link Code Description</ui-table-head>
                                      <ui-table-head class="min-w-16">AFC Hr</ui-table-head>
                                      <ui-table-head class="min-w-16">WP Hrs</ui-table-head>
                                      <ui-table-head class="min-w-16">To Go Hrs</ui-table-head>
                                      <ui-table-head class="min-w-24">Fcst Start</ui-table-head>
                                      <ui-table-head class="min-w-24">Fcst Finish</ui-table-head>
                                      <ui-table-head 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                        class="min-w-16 text-center">
                                        {{ dateObj.display }}
                                      </ui-table-head>
                                    </ui-table-row>
                                  </ui-table-header>
                                  <ui-table-body>
                                    <ui-table-row 
                                      *ngFor="let l4 of getFilteredL4Activities(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackByL4JobNumber">
                                      <ui-table-cell class="font-medium text-blue-700">{{ l4.jobNumber }}</ui-table-cell>
                                      <ui-table-cell>{{ l4.activityCode }} - Link Description</ui-table-cell>
                                      <ui-table-cell class="text-center">{{ getAfcHours(l4) }}</ui-table-cell>
                                      <ui-table-cell class="text-center">{{ getWpHours(l4) }}</ui-table-cell>
                                      <ui-table-cell class="text-center font-medium">{{ getToGoHours(l4) }}</ui-table-cell>
                                      <ui-table-cell>
                                        <ui-popover>
                                          <ui-button 
                                            ui-popover-trigger
                                            variant="outline"
                                            [class]="getDateButtonClasses(l4, 'start')"
                                            size="sm">
                                            <lucide-icon [name]="CalendarIconRef" [size]="14" class="mr-1"></lucide-icon>
                                            {{ l4.start }}
                                          </ui-button>
                                          <div ui-popover-content class="w-auto p-0">
                                            <ui-calendar 
                                              (dateSelected)="updateL4Date(l4, 'start', $event)">
                                            </ui-calendar>
                                          </div>
                                        </ui-popover>
                                      </ui-table-cell>
                                      <ui-table-cell>
                                        <ui-popover>
                                          <ui-button 
                                            ui-popover-trigger
                                            variant="outline"
                                            [class]="getDateButtonClasses(l4, 'end')"
                                            size="sm">
                                            <lucide-icon [name]="CalendarIconRef" [size]="14" class="mr-1"></lucide-icon>
                                            {{ l4.end }}
                                          </ui-button>
                                          <div ui-popover-content class="w-auto p-0">
                                            <ui-calendar 
                                              (dateSelected)="updateL4Date(l4, 'end', $event)">
                                            </ui-calendar>
                                          </div>
                                        </ui-popover>
                                      </ui-table-cell>
                                      <ui-table-cell 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                        class="text-center">
                                        <div class="w-16 mx-auto">
                                          <div [class]="getDistributedHoursCellClasses(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                            {{ getDistributedHoursValue(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                          </div>
                                        </div>
                                      </ui-table-cell>
                                    </ui-table-row>
                                  </ui-table-body>
                                </ui-table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ng-template #noCrafts>
                    <div class="bg-gray-50 rounded-lg p-6 text-center">
                      <p class="text-gray-500">
                        No crafts match the current filter criteria. Try adjusting your filters.
                      </p>
                    </div>
                  </ng-template>
                </div>

                <!-- P6 Craft Report Table -->
                <div *ngIf="tab.id === 'original-craft-report'" class="space-y-3">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">P6 Craft Report</h3>
                    <div class="text-sm text-gray-500">
                      {{ filteredCraftData().length > 0 ? 
                        'Showing ' + filteredCraftData().length + ' craft' + (filteredCraftData().length === 1 ? '' : 's') :
                        'No crafts match current filters'
                      }}
                    </div>
                  </div>
                  
                  <div *ngIf="filteredCraftData().length > 0; else noCraftsP6" class="overflow-x-auto">
                    <ui-table>
                      <ui-table-header>
                        <ui-table-row class="bg-gray-50 border-b border-gray-200">
                          <ui-table-head class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                            Craft Name
                          </ui-table-head>
                          <ui-table-head 
                            *ngFor="let date of filteredWeeklyDates(); let i = index" 
                            class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24 border-r border-gray-200">
                            {{ date.display }}
                          </ui-table-head>
                        </ui-table-row>
                      </ui-table-header>
                      <ui-table-body class="bg-white divide-y divide-gray-200">
                        <ui-table-row 
                          *ngFor="let craft of filteredCraftData(); let craftIndex = index" 
                          class="hover:bg-gray-50">
                          <ui-table-cell class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                            {{ craft.craftName }}
                          </ui-table-cell>
                          <ui-table-cell 
                            *ngFor="let value of craft.weeklyData; let weekIndex = index" 
                            class="px-4 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                            {{ value !== 0 ? value : '-' }}
                          </ui-table-cell>
                        </ui-table-row>
                      </ui-table-body>
                    </ui-table>
                  </div>

                  <ng-template #noCraftsP6>
                    <div class="bg-gray-50 rounded-lg p-6 text-center">
                      <p class="text-gray-500">
                        No crafts match the current filter criteria. Try adjusting your filters.
                      </p>
                    </div>
                  </ng-template>
                </div>

              </div>
            </div>
          </div>
        </div>

        <ng-template #noSelection>
          <div class="bg-gray-50 rounded-lg p-6 text-center">
            <p class="text-gray-500">
              Please select all required filters (Location, Project, and MLF Filter) to view the forecast data.
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MLFForecastCompleteComponent implements OnInit {
  // Icon references for template
  Edit2Icon = Edit2;
  XIcon = X;
  RefreshCwIcon = RefreshCw;
  CalendarIconRef = CalendarIcon;
  ChevronDownIcon = ChevronDown;
  SaveIcon = Save;
  RotateCcwIcon = RotateCcw;
  FilterIcon = Filter;
  CalculatorIcon = Calculator;
  TrendingUpIcon = TrendingUp;
  AlertTriangleIcon = AlertTriangle;
  CheckIcon = Check;

  // State signals
  activeTab = signal<string>('l4-craft-edit');
  selectedLocation = signal<string>('');
  selectedProject = signal<string>('');
  selectedMLFFilter = signal<string>('');
  selectedCraftFilter = signal<string>('');
  showNegativeOnly = signal<boolean>(false);
  selectedDates = signal<Date[]>([]);
  openDatePicker = signal<boolean>(false);
  visibleColumns = signal<Set<number>>(new Set());
  expandedBlocks = signal<Set<string>>(new Set());
  selectedGridColumns = signal<{[key: string]: Set<number>}>({});
  hasUnsavedChanges = signal<boolean>(false);
  
  // Activity filter states
  selectedActivities = signal<{[key: string]: string[]}>({});
  openActivitySelects = signal<{[key: string]: boolean}>({});
  expandedSPCGroups = signal<Set<string>>(new Set());
  
  // Editing states
  editingL4 = signal<{rowIndex: number, field: 'start' | 'end'} | null>(null);
  editingL4Hour = signal<{rowIndex: number, weekIndex: number} | null>(null);
  editingSPCHour = signal<{rowIndex: number, weekIndex: number} | null>(null);
  
  // Data signals
  activitySpreadData = signal<ActivitySpread[]>([]);
  originalActivitySpreadData = signal<ActivitySpread[]>([]);
  l4Data = signal<L4Activity[]>([]);
  originalL4Data = signal<L4Activity[]>([]);
  spcData = signal<SPCActivity[]>([]);
  originalSPCData = signal<SPCActivity[]>([]);
  
  // Auto-calculated tracking
  l4AutoCalculated = signal<{[key: string]: boolean}>({});
  changedValues = signal<{[key: string]: boolean}>({});

  // Computed properties
  locationOptions = computed(() => [
    { value: 'bfa', label: 'Brownsville Fabrication' },
    { value: 'jay', label: 'Jacksonville Yard' },
    { value: 'safira', label: 'Safira Facility' },
    { value: 'qfab', label: 'Qatar Fabrication' },
    { value: 'qmw', label: 'Qatar Marine Works' }
  ]);

  projectOptions = computed(() => {
    const projects = [];
    for (let i = 1; i <= 20; i++) {
      projects.push({ value: `project-${i}`, label: `Project ${i}` });
    }
    return projects;
  });

  mlfFilterOptions = computed(() => [
    { value: 'prefab', label: 'Prefab' },
    { value: 'erection', label: 'Erection' },
    { value: 'precom', label: 'Precom' },
    { value: 'huc', label: 'HUC' },
    { value: 'yard', label: 'Yard' },
    { value: 'yard-huc', label: 'Yard + HUC' }
  ]);

  craftNames = [
    'Str. Fitters', 'Str. Welders', 'Mech Fitters', 'Pipe Fitters', 'Pipe Welders',
    'Electrical Fitters', 'Electrical Tech.', 'Instrument Fitters', 'Instrument Tech.',
    'Painters', 'Rolling Ops (Max 8)', 'Rolling - Welders', 'Rev Orders', 'Spare - Main',
    'Riggers (Incl. Operators)', 'QA/QC', "Mat'l. Handl'g.", 'Scaffolding', 'Facility Craft - Services'
  ];

  craftOptions = computed(() => [
    { value: '', label: 'All Crafts' },
    ...this.craftNames.map(craft => ({ value: craft, label: craft }))
  ]);

  tabs = [
    { id: 'l4-craft-edit', name: 'L4 (Craft Report Edit)' },
    { id: 'original-craft-report', name: 'P6 Craft Report' }
  ];

  // Generate weekly dates (default 10 weeks starting from July 3, 2025)
  weeklyDates = computed(() => {
    const dates = [];
    const startDate = new Date('2025-07-03'); // Thursday, July 3, 2025
    const numWeeks = 10;
    
    for (let i = 0; i < numWeeks; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (i * 7));
      dates.push({
        display: `${date.getDate()}-${date.toLocaleDateString('en-US', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`,
        fullDate: date
      });
    }
    return dates;
  });

  filteredWeeklyDates = computed(() => 
    this.weeklyDates().filter((_, index) => this.visibleColumns().has(index))
  );

  // Available dates for selection
  availableDates = computed(() => {
    return this.weeklyDates().map(date => ({
      display: date.display,
      full: date.fullDate
    }));
  });

  // Generate craft data
  craftData = computed(() => {
    return this.craftNames.map((craftName, craftIndex) => {
      const weeklyData = this.weeklyDates().map((_, weekIndex) => {
        // Use a seed based on craft index and week index for consistent results
        const seed = craftIndex * 100 + weekIndex;
        return Math.floor(Math.random() * 50) + 10; // Random between 10-60
      });
      
      return {
        craftName,
        weeklyData
      };
    });
  });

  filteredCraftData = computed(() => {
    let filtered = this.craftData();
    
    // Apply craft filter
    if (this.selectedCraftFilter()) {
      filtered = filtered.filter(craft => craft.craftName === this.selectedCraftFilter());
    }
    
    // Apply negative variance filter
    if (this.showNegativeOnly()) {
      filtered = filtered.filter(craft => 
        craft.weeklyData.some(value => value < 0)
      );
    }
    
    return filtered;
  });

  ngOnInit() {
    this.initializeData();
    this.initializeVisibleColumns();
  }

  private initializeData() {
    // Initialize Activity Spread data
    const activityData: ActivitySpread[] = [
      { activityCode: 'STR-001', description: 'Structural Steel Installation', attributes: 'Critical Path', hours: [40, 45, 38, 42, 48, 35, 40, 44, 39, 41] },
      { activityCode: 'PIP-001', description: 'Piping System Assembly', attributes: 'High Priority', hours: [32, 28, 35, 40, 33, 38, 42, 30, 36, 34] },
      { activityCode: 'ELE-001', description: 'Electrical Installation', attributes: 'Standard', hours: [24, 26, 22, 28, 25, 30, 27, 24, 29, 23] },
      { activityCode: 'EQP-001', description: 'Equipment Positioning', attributes: 'Resource Heavy', hours: [16, 18, 20, 15, 22, 19, 17, 21, 18, 16] },
      { activityCode: 'INS-001', description: 'Instrumentation Work', attributes: 'Precision Required', hours: [12, 14, 13, 16, 15, 11, 14, 13, 15, 12] },
      { activityCode: 'PAI-001', description: 'Painting & Coating', attributes: 'Weather Dependent', hours: [8, 10, 9, 12, 11, 7, 10, 9, 11, 8] },
      { activityCode: 'TES-001', description: 'Testing & Commissioning', attributes: 'Final Phase', hours: [6, 8, 7, 10, 9, 5, 8, 7, 9, 6] },
      { activityCode: 'COM-001', description: 'Commissioning Activities', attributes: 'Quality Critical', hours: [4, 5, 4, 6, 5, 3, 5, 4, 6, 4] }
    ];

    // Initialize L4 data
    const l4Activities: L4Activity[] = [
      { jobNumber: 'JOB-001', activityCode: 'STR-001', hours: 160, spcCode: 'SPC-A01', start: '01-Jul-25', end: '15-Aug-25', comment: 'Weather dependent', weekly: [20, 22, 18, 24, 21, 19, 23, 20, 22, 18] },
      { jobNumber: 'JOB-002', activityCode: 'PIP-001', hours: 120, spcCode: 'SPC-B02', start: '08-Jul-25', end: '30-Jul-25', comment: 'Material delay risk', weekly: [15, 18, 16, 20, 17, 14, 19, 16, 18, 15] },
      { jobNumber: 'JOB-003', activityCode: 'ELE-001', hours: 96, spcCode: 'SPC-C03', start: '15-Jul-25', end: '12-Aug-25', comment: 'Standard schedule', weekly: [12, 14, 13, 16, 15, 11, 14, 13, 15, 12] },
      { jobNumber: 'JOB-004', activityCode: 'EQP-001', hours: 80, spcCode: 'SPC-D04', start: '22-Jul-25', end: '19-Aug-25', comment: 'Resource constraint', weekly: [10, 12, 11, 14, 13, 9, 12, 11, 13, 10] },
      { jobNumber: 'JOB-005', activityCode: 'INS-001', hours: 64, spcCode: 'SPC-E05', start: '29-Jul-25', end: '26-Aug-25', comment: 'Quality checkpoints', weekly: [8, 10, 9, 12, 11, 7, 10, 9, 11, 8] },
      { jobNumber: 'JOB-006', activityCode: 'PAI-001', hours: 48, spcCode: 'SPC-F06', start: '05-Aug-25', end: '02-Sep-25', comment: 'Weather dependent', weekly: [6, 8, 7, 10, 9, 5, 8, 7, 9, 6] },
      { jobNumber: 'JOB-007', activityCode: 'TES-001', hours: 40, spcCode: 'SPC-G07', start: '12-Aug-25', end: '09-Sep-25', comment: 'Final testing phase', weekly: [5, 6, 5, 8, 7, 4, 6, 5, 7, 5] },
      { jobNumber: 'JOB-008', activityCode: 'COM-001', hours: 32, spcCode: 'SPC-H08', start: '19-Aug-25', end: '16-Sep-25', comment: 'Commissioning', weekly: [4, 5, 4, 6, 5, 3, 5, 4, 6, 4] }
    ];

    // Initialize SPC data
    const spcActivities: SPCActivity[] = [
      { activityCode: 'STR-001', jobNumber: 'JOB-001', spcCode: 'SPC-A01', subCode: 'STR-001-01', start: '01-Jul-25', end: '08-Jul-25', weekly: [8, 10, 6, 12, 9, 7, 10, 8, 11, 7] },
      { activityCode: 'STR-001', jobNumber: 'JOB-001', spcCode: 'SPC-A01', subCode: 'STR-001-02', start: '08-Jul-25', end: '15-Jul-25', weekly: [12, 12, 12, 12, 12, 12, 13, 12, 11, 11] },
      { activityCode: 'PIP-001', jobNumber: 'JOB-002', spcCode: 'SPC-B02', subCode: 'PIP-001-01', start: '08-Jul-25', end: '15-Jul-25', weekly: [7, 9, 8, 10, 8, 6, 9, 8, 9, 7] },
      { activityCode: 'PIP-001', jobNumber: 'JOB-002', spcCode: 'SPC-B02', subCode: 'PIP-001-02', start: '15-Jul-25', end: '22-Jul-25', weekly: [8, 9, 8, 10, 9, 8, 10, 8, 9, 8] },
      { activityCode: 'ELE-001', jobNumber: 'JOB-003', spcCode: 'SPC-C03', subCode: 'ELE-001-01', start: '15-Jul-25', end: '22-Jul-25', weekly: [5, 7, 6, 8, 7, 5, 7, 6, 7, 5] },
      { activityCode: 'ELE-001', jobNumber: 'JOB-003', spcCode: 'SPC-C03', subCode: 'ELE-001-02', start: '22-Jul-25', end: '29-Jul-25', weekly: [7, 7, 7, 8, 8, 6, 7, 7, 8, 7] }
    ];

    this.activitySpreadData.set([...activityData]);
    this.originalActivitySpreadData.set([...activityData]);
    this.l4Data.set([...l4Activities]);
    this.originalL4Data.set([...l4Activities]);
    this.spcData.set([...spcActivities]);
    this.originalSPCData.set([...spcActivities]);
  }

  private initializeVisibleColumns() {
    // Show all columns by default
    const allIndices = this.weeklyDates().map((_, index) => index);
    this.visibleColumns.set(new Set(allIndices));
  }

  // Helper functions for calculations
  calculateTotalActivityHours(weekIndex: number): number {
    return this.l4Data().reduce((sum, l4) => {
      const value = typeof l4.weekly[weekIndex] === 'string' ? parseFloat(l4.weekly[weekIndex] as string) || 0 : l4.weekly[weekIndex] as number;
      return sum + value;
    }, 0);
  }

  calculateOriginalTotalActivityHours(weekIndex: number): number {
    return this.originalL4Data().reduce((sum, l4) => {
      const value = typeof l4.weekly[weekIndex] === 'string' ? parseFloat(l4.weekly[weekIndex] as string) || 0 : l4.weekly[weekIndex] as number;
      return sum + value;
    }, 0);
  }

  // Event handlers
  onLocationChange(value: string) {
    this.selectedLocation.set(value);
  }

  onProjectChange(value: string) {
    this.selectedProject.set(value);
  }

  onMLFFilterChange(value: string) {
    this.selectedMLFFilter.set(value);
  }

  onCraftFilterChange(value: string) {
    this.selectedCraftFilter.set(value);
  }

  onNegativeOnlyChange(value: boolean) {
    this.showNegativeOnly.set(value);
  }

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  getTabClasses(tabId: string): string {
    const baseClasses = 'pb-3 px-1 text-sm font-medium transition-colors relative';
    const activeClasses = this.activeTab() === tabId 
      ? 'text-primary' 
      : 'text-muted-foreground hover:text-foreground';
    return `${baseClasses} ${activeClasses}`;
  }

  // Date selection functions
  clearAllDates() {
    this.selectedDates.set([]);
  }

  selectAllDates() {
    this.selectedDates.set([...this.availableDates().map(d => d.full)]);
  }

  toggleDateSelection(date: Date) {
    const current = this.selectedDates();
    const exists = current.some(d => d.getTime() === date.getTime());
    
    if (exists) {
      this.selectedDates.set(current.filter(d => d.getTime() !== date.getTime()));
    } else {
      this.selectedDates.set([...current, date]);
    }
  }

  removeSelectedDate(date: Date) {
    const current = this.selectedDates();
    this.selectedDates.set(current.filter(d => d.getTime() !== date.getTime()));
  }

  isDateSelected(date: Date): boolean {
    return this.selectedDates().some(d => d.getTime() === date.getTime());
  }

  formatDateDisplay(date: Date): string {
    return `${date.getDate()}-${date.toLocaleDateString('en-US', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
  }

  // Column visibility functions
  showAllColumns() {
    const allIndices = this.weeklyDates().map((_, index) => index);
    this.visibleColumns.set(new Set(allIndices));
  }

  hideAllColumns() {
    this.visibleColumns.set(new Set());
  }

  toggleColumnVisibility(index: number) {
    const current = new Set(this.visibleColumns());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    this.visibleColumns.set(current);
  }

  isColumnVisible(index: number): boolean {
    return this.visibleColumns().has(index);
  }

  // Grid column selection functions
  toggleGridColumnSelection(craftKey: string, originalIndex: number) {
    const current = { ...this.selectedGridColumns() };
    if (!current[craftKey]) {
      current[craftKey] = new Set();
    }
    
    if (current[craftKey].has(originalIndex)) {
      current[craftKey].delete(originalIndex);
    } else {
      current[craftKey].add(originalIndex);
    }
    
    this.selectedGridColumns.set(current);
  }

  isGridColumnSelected(craftKey: string, originalIndex: number): boolean {
    return this.selectedGridColumns()[craftKey]?.has(originalIndex) || false;
  }

  // Block expansion functions
  toggleBlockExpansion(craftIndex: number, originalIndex: number) {
    const blockId = `${craftIndex}-${originalIndex}`;
    const current = new Set(this.expandedBlocks());
    
    if (current.has(blockId)) {
      current.delete(blockId);
    } else {
      current.add(blockId);
    }
    
    this.expandedBlocks.set(current);
  }

  isBlockExpanded(craftIndex: number, originalIndex: number): boolean {
    const blockId = `${craftIndex}-${originalIndex}`;
    return this.expandedBlocks().has(blockId);
  }

  // Helper functions for template
  getCraftKey(craftIndex: number): string {
    return `craft-${craftIndex}`;
  }

  getOriginalIndex(date: WeeklyDate): number {
    return this.weeklyDates().findIndex(d => d.display === date.display);
  }

  getP6CraftValue(craft: CraftData, displayIndex: number): number {
    return craft.weeklyData[displayIndex] || 0;
  }

  getL4Variance(originalIndex: number): number {
    const original = this.calculateOriginalTotalActivityHours(originalIndex);
    const updated = this.calculateTotalActivityHours(originalIndex);
    return original - updated;
  }

  getP6VsL4Variance(craft: CraftData, displayIndex: number, originalIndex: number): number {
    const p6Value = this.getP6CraftValue(craft, displayIndex);
    const l4Updated = this.calculateTotalActivityHours(originalIndex);
    return p6Value - l4Updated;
  }

  getL4ActivitiesForCraft(craftName: string): L4Activity[] {
    // This is a simplified mapping - in real implementation, you'd have proper craft-to-activity mapping
    return this.l4Data().slice(0, 3); // Return first 3 for demo
  }

  getL4WeeklyValue(l4: L4Activity, originalIndex: number): string | number {
    return l4.weekly[originalIndex] || 0;
  }

  // CSS class helper functions
  getDateCheckboxClasses(date: Date): string {
    const baseClasses = 'w-4 h-4 border border-primary rounded-sm flex items-center justify-center';
    const selectedClasses = this.isDateSelected(date) ? 'bg-primary' : 'bg-white';
    return `${baseClasses} ${selectedClasses}`;
  }

  getColumnVisibilityClasses(index: number): string {
    const baseClasses = 'cursor-pointer gap-1 transition-colors';
    const visibilityClasses = this.isColumnVisible(index) 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-gray-200 text-gray-600 hover:bg-gray-300';
    return `${baseClasses} ${visibilityClasses}`;
  }

  getDateHeaderClasses(craftIndex: number, date: WeeklyDate): string {
    const baseClasses = 'w-full text-xs mb-1 text-center font-medium h-6 flex items-center justify-center rounded-md transition-colors';
    const selectedClasses = this.isGridColumnSelected(this.getCraftKey(craftIndex), this.getOriginalIndex(date))
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-gray-600 hover:bg-gray-100';
    return `${baseClasses} ${selectedClasses}`;
  }

  getP6CraftButtonClasses(craftIndex: number, originalIndex: number): string {
    const baseClasses = 'w-full p-2 text-center border rounded-md transition-all hover:shadow-sm h-8 flex items-center justify-center';
    const expandedClasses = this.isBlockExpanded(craftIndex, originalIndex)
      ? 'bg-blue-100 border-blue-400 shadow-sm'
      : 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    return `${baseClasses} ${expandedClasses}`;
  }

  getL4OriginalClasses(): string {
    return 'w-full p-2 text-center border rounded-md h-8 flex items-center justify-center bg-indigo-50 border-indigo-200';
  }

  getL4UpdatedClasses(originalIndex: number): string {
    const baseClasses = 'w-full p-2 text-center border rounded-md h-8 flex items-center justify-center';
    const hasChanges = this.hasL4Changes(originalIndex);
    const changeClasses = hasChanges 
      ? 'bg-yellow-100 border-yellow-400' 
      : 'bg-gray-50 border-gray-200';
    return `${baseClasses} ${changeClasses}`;
  }

  getL4VarianceClasses(originalIndex: number): string {
    const baseClasses = 'w-full p-2 text-center border rounded-md h-8 flex items-center justify-center';
    const variance = this.getL4Variance(originalIndex);
    const varianceClasses = variance > 0 
      ? 'bg-green-50 border-green-200 text-green-800'
      : variance < 0 
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-purple-50 border-purple-200';
    return `${baseClasses} ${varianceClasses}`;
  }

  getP6VsL4VarianceClasses(craft: CraftData, displayIndex: number, originalIndex: number): string {
    const baseClasses = 'w-full p-2 text-center border rounded-md h-8 flex items-center justify-center';
    const variance = this.getP6VsL4Variance(craft, displayIndex, originalIndex);
    const varianceClasses = variance > 0 
      ? 'bg-green-50 border-green-200 text-green-800'
      : variance < 0 
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-orange-50 border-orange-200';
    return `${baseClasses} ${varianceClasses}`;
  }

  hasL4Changes(originalIndex: number): boolean {
    return this.l4Data().some((l4, rowIndex) => {
      const currentValue = l4.weekly[originalIndex];
      const originalValue = this.originalL4Data()[rowIndex]?.weekly[originalIndex];
      return currentValue !== originalValue;
    });
  }

  // TrackBy functions for performance
  trackByDate(index: number, date: Date): number {
    return date.getTime();
  }

  trackByWeeklyDate(index: number, date: WeeklyDate): string {
    return date.display;
  }

  trackByCraft(index: number, craft: CraftData): string {
    return craft.craftName;
  }

  trackByFilteredDate(index: number, date: WeeklyDate): string {
    return date.display;
  }

  trackByL4Activity(index: number, l4: L4Activity): string {
    return l4.jobNumber;
  }

  // Additional methods for the enhanced L4 layout

  // Format variance display
  formatVariance(variance: number): string {
    if (variance === 0) return '0';
    return variance > 0 ? `+${variance}` : `${variance}`;
  }

  // Enhanced CSS class methods
  getL4OriginalButtonClasses(craftIndex: number, originalIndex: number): string {
    const baseClasses = 'w-full p-2 text-center border rounded-md transition-all hover:shadow-sm h-8 flex items-center justify-center';
    const expandedClasses = this.isBlockExpanded(craftIndex, originalIndex)
      ? 'bg-indigo-100 border-indigo-400 shadow-sm'
      : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100';
    return `${baseClasses} ${expandedClasses}`;
  }

  getL4UpdatedButtonClasses(craftIndex: number, originalIndex: number): string {
    const baseClasses = 'w-full p-2 text-center rounded-md transition-all hover:shadow-sm h-8 flex items-center justify-center';
    const l4OriginalValue = this.calculateOriginalTotalActivityHours(originalIndex);
    const l4UpdatedValue = this.calculateTotalActivityHours(originalIndex);
    const hasChanges = l4UpdatedValue !== l4OriginalValue;
    const isExpanded = this.isBlockExpanded(craftIndex, originalIndex);
    
    let classes = '';
    if (isExpanded) {
      classes = hasChanges 
        ? 'bg-yellow-100 shadow-sm border border-orange-300'
        : 'bg-gray-100 shadow-sm border border-transparent';
    } else {
      classes = hasChanges 
        ? 'bg-yellow-50 hover:bg-yellow-100 border border-orange-300'
        : 'bg-gray-50 hover:bg-gray-100 border border-transparent';
    }
    
    return `${baseClasses} ${classes}`;
  }

  getL4UpdatedTextClasses(originalIndex: number): string {
    const l4OriginalValue = this.calculateOriginalTotalActivityHours(originalIndex);
    const l4UpdatedValue = this.calculateTotalActivityHours(originalIndex);
    const hasChanges = l4UpdatedValue !== l4OriginalValue;
    
    return hasChanges 
      ? 'text-xs font-medium text-yellow-800'
      : 'text-xs font-medium text-gray-600';
  }

  getL4VarianceTextClasses(originalIndex: number): string {
    const variance = this.getL4Variance(originalIndex);
    const baseClasses = 'text-xs font-medium';
    
    if (variance === 0) return `${baseClasses} text-gray-600`;
    return variance < 0 
      ? `${baseClasses} text-red-600`
      : `${baseClasses} text-green-600`;
  }

  getP6VsL4VarianceTextClasses(craft: CraftData, displayIndex: number, originalIndex: number): string {
    const variance = this.getP6VsL4Variance(craft, displayIndex, originalIndex);
    const baseClasses = 'text-xs font-medium';
    
    if (variance === 0) return `${baseClasses} text-gray-600`;
    return variance < 0 
      ? `${baseClasses} text-red-600`
      : `${baseClasses} text-green-600`;
  }

  // Grid column selection methods
  hasSelectedGridColumns(craftKey: string): boolean {
    return (this.selectedGridColumns()[craftKey]?.size || 0) > 0;
  }

  getSelectedColumnIndices(craftKey: string): number[] {
    const selected = this.selectedGridColumns()[craftKey];
    return selected ? Array.from(selected).sort((a, b) => a - b) : [];
  }

  removeGridColumnSelection(craftKey: string, columnIndex: number) {
    const current = { ...this.selectedGridColumns() };
    if (current[craftKey]) {
      current[craftKey].delete(columnIndex);
      if (current[craftKey].size === 0) {
        delete current[craftKey];
      }
    }
    this.selectedGridColumns.set(current);
  }

  getWeekDisplayByIndex(index: number): string {
    return this.weeklyDates()[index]?.display || '';
  }

  // Activity filter methods
  getActivitySelectOpen(craftKey: string): boolean {
    return this.openActivitySelects()[craftKey] || false;
  }

  getSelectedActivitiesText(craftKey: string): string {
    const selected = this.selectedActivities()[craftKey];
    if (!selected || selected.length === 0) return 'All Activities';
    if (selected.length === 1) return selected[0];
    return `${selected.length} activities selected`;
  }

  getAvailableActivities(): string[] {
    return ['STR-001', 'PIP-001', 'ELE-001', 'EQP-001', 'INS-001', 'PAI-001', 'TES-001', 'COM-001'];
  }

  clearActivityFilter(craftKey: string) {
    const current = { ...this.selectedActivities() };
    current[craftKey] = [];
    this.selectedActivities.set(current);
  }

  toggleActivitySelection(craftKey: string, activity: string) {
    const current = { ...this.selectedActivities() };
    if (!current[craftKey]) current[craftKey] = [];
    
    const index = current[craftKey].indexOf(activity);
    if (index > -1) {
      current[craftKey].splice(index, 1);
    } else {
      current[craftKey].push(activity);
    }
    
    this.selectedActivities.set(current);
  }

  isActivitySelected(craftKey: string, activity: string): boolean {
    return this.selectedActivities()[craftKey]?.includes(activity) || false;
  }

  getActivityCheckboxClasses(craftKey: string, activity: string): string {
    const baseClasses = 'w-4 h-4 border border-primary rounded-sm flex items-center justify-center';
    const selectedClasses = this.isActivitySelected(craftKey, activity) ? 'bg-primary' : 'bg-white';
    return `${baseClasses} ${selectedClasses}`;
  }

  // Action methods
  recalculateSelectedColumns(craftKey: string) {
    console.log('Recalculate selected columns for', craftKey);
    // Implementation for recalculation logic
  }

  clearSelectedColumns(craftKey: string) {
    const current = { ...this.selectedGridColumns() };
    delete current[craftKey];
    this.selectedGridColumns.set(current);
  }

  // Data filtering methods

  getFilteredL4Activities(craftKey: string): L4Activity[] {
    const selectedActivities = this.getSelectedActivities(craftKey);
    return this.l4Data().filter(l4 => 
      !selectedActivities.length || selectedActivities.includes(l4.activityCode)
    );
  }

  getForecastPlanHours(activity: ActivitySpread, columnIndex: number): number {
    const value = typeof activity.hours[columnIndex] === 'string' 
      ? parseFloat(activity.hours[columnIndex] as string) || 0 
      : activity.hours[columnIndex] as number;
    return value * 60; // Multiply by 60 for display
  }

  getL4HourCellClasses(l4Index: number, columnIndex: number): string {
    const isChanged = this.changedValues()[`l4-${l4Index}-${columnIndex}`] || false;
    return isChanged ? 'text-yellow-600 font-bold' : '';
  }

  // SPC Activities methods
  getGroupedSPCActivities(craftKey: string): Array<{key: string, jobNumber: string, activityCode: string, activities: SPCActivity[]}> {
    const selectedActivities = this.selectedActivities()[craftKey];
    let filteredSPC = this.spcData();
    
    if (selectedActivities && selectedActivities.length > 0) {
      filteredSPC = filteredSPC.filter(spc => 
        selectedActivities.includes(spc.activityCode)
      );
    }

    const groups: {[key: string]: SPCActivity[]} = {};
    filteredSPC.forEach(spc => {
      const key = `${spc.jobNumber}-${spc.activityCode}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(spc);
    });

    return Object.entries(groups).map(([key, activities]) => ({
      key,
      jobNumber: activities[0].jobNumber,
      activityCode: activities[0].activityCode,
      activities
    }));
  }

  toggleSPCExpansion(groupKey: string) {
    const current = new Set(this.expandedSPCGroups());
    if (current.has(groupKey)) {
      current.delete(groupKey);
    } else {
      current.add(groupKey);
    }
    this.expandedSPCGroups.set(current);
  }

  isSPCExpanded(groupKey: string): boolean {
    return this.expandedSPCGroups().has(groupKey);
  }

  getSPCChevronClasses(groupKey: string): string {
    const baseClasses = 'transition-transform';
    const rotatedClasses = this.isSPCExpanded(groupKey) ? 'rotate-180' : '';
    return `${baseClasses} ${rotatedClasses}`;
  }

  getSPCGroupTotal(activities: SPCActivity[], columnIndex: number): number {
    return activities.reduce((sum, spc) => {
      const value = typeof spc.weekly[columnIndex] === 'string' 
        ? parseFloat(spc.weekly[columnIndex] as string) || 0 
        : spc.weekly[columnIndex] as number;
      return sum + value;
    }, 0);
  }

  getSPCWeeklyValue(spc: SPCActivity, columnIndex: number): string | number {
    return spc.weekly[columnIndex] || 0;
  }

  getSPCHourCellClasses(spcIndex: number, columnIndex: number): string {
    const isChanged = this.changedValues()[`spc-${spcIndex}-${columnIndex}`] || false;
    return isChanged ? 'text-yellow-600 font-bold' : '';
  }

  // Additional TrackBy functions
  trackByColumnIndex(index: number, columnIndex: number): number {
    return columnIndex;
  }

  trackByActivityCode(index: number, activity: ActivitySpread): string {
    return activity.activityCode;
  }

  trackByActivityString(index: number, activityCode: string): string {
    return activityCode;
  }

  trackByL4JobNumber(index: number, l4: L4Activity): string {
    return l4.jobNumber;
  }

  trackBySPCGroup(index: number, group: {key: string, jobNumber: string, activityCode: string, activities: SPCActivity[]}): string {
    return group.key;
  }

  trackBySPCSubCode(index: number, spc: SPCActivity): string {
    return spc.subCode;
  }

  // Popover state management methods
  onDatePickerOpenChange(isOpen: boolean) {
    this.openDatePicker.set(isOpen);
  }

  onActivitySelectOpenChange(craftKey: string, isOpen: boolean) {
    const current = { ...this.openActivitySelects() };
    current[craftKey] = isOpen;
    this.openActivitySelects.set(current);
  }

  // New methods for React-style table implementation
  getSelectedActivities(craftKey: string): string[] {
    return this.selectedActivities()[craftKey] || [];
  }

  removeActivityFromFilter(craftKey: string, activityCode: string): void {
    const current = { ...this.selectedActivities() };
    if (current[craftKey]) {
      current[craftKey] = current[craftKey].filter(code => code !== activityCode);
    }
    this.selectedActivities.set(current);
  }

  getFilteredDatesForCraft(craftKey: string): { display: string; full: string }[] {
    return this.selectedDates().map(date => {
      return {
        display: this.formatDateDisplay(date),
        full: date.toISOString()
      };
    });
  }

  trackByDateDisplay(index: number, dateObj: { display: string; full: string }): string {
    return dateObj.display;
  }

  getFilteredActivitySpread(craftKey: string): ActivitySpread[] {
    const selectedActivities = this.getSelectedActivities(craftKey);
    return this.activitySpreadData().filter(activity => 
      !selectedActivities.length || selectedActivities.includes(activity.activityCode)
    );
  }

  // Forecast Hours methods (Section 1)
  getForecastHoursValue(activity: ActivitySpread, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    const originalIndex = this.weeklyDates().findIndex(d => d.display === filteredDates[displayIndex].display);
    const activityValue = typeof activity.hours[originalIndex] === 'string' 
      ? parseFloat(activity.hours[originalIndex] as string) || 0 
      : activity.hours[originalIndex] as number;
    return activityValue * 60; // Multiply by 60
  }

  getForecastHoursCellClasses(activity: ActivitySpread, displayIndex: number, filteredDates: { display: string; full: string }[]): string {
    const forecastHours = this.getForecastHoursValue(activity, displayIndex, filteredDates);
    const isChanged = this.isForecastHoursValueChanged(forecastHours, displayIndex, filteredDates);
    return isChanged 
      ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-yellow-100 border-yellow-300 text-yellow-800"
      : "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-gray-50 border-gray-200";
  }

  isForecastHoursValueChanged(forecastHours: number, displayIndex: number, filteredDates: { display: string; full: string }[]): boolean {
    // Implement change detection logic here
    return false; // Placeholder
  }

  // Level 4 Craft methods (Section 2)
  getAfcHours(l4: L4Activity): number {
    return 2700; // Fixed value as per React implementation
  }

  getWpHours(l4: L4Activity): number {
    return 400; // Fixed value as per React implementation
  }

  getToGoHours(l4: L4Activity): number {
    return this.getAfcHours(l4) - this.getWpHours(l4);
  }

  getWorkforceValue(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    const distributedHours = this.getDistributedHoursForL4(l4, displayIndex, filteredDates);
    return Math.round(distributedHours / 60); // Convert to workforce by dividing by 60
  }

  getWorkforceCellClasses(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): string {
    const workforceValue = this.getWorkforceValue(l4, displayIndex, filteredDates);
    const isChanged = this.isWorkforceValueChanged(workforceValue, displayIndex, filteredDates, l4);
    return isChanged 
      ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-yellow-100 border-yellow-300 text-yellow-800"
      : "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-green-100 border-green-300 text-green-800";
  }

  isWorkforceValueChanged(workforceValue: number, displayIndex: number, filteredDates: { display: string; full: string }[], l4: L4Activity): boolean {
    // Implement change detection logic here
    return false; // Placeholder
  }

  // Level 4 Forecasted Hours methods (Section 3)
  getDistributedHoursValue(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    return this.getDistributedHoursForL4(l4, displayIndex, filteredDates);
  }

  getDistributedHoursCellClasses(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): string {
    const distributedHours = this.getDistributedHoursValue(l4, displayIndex, filteredDates);
    const isChanged = this.isDistributedHoursValueChanged(distributedHours, displayIndex, filteredDates, l4);
    return isChanged 
      ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-yellow-100 border-yellow-300 text-yellow-800"
      : "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-indigo-100 border-indigo-300 text-indigo-800";
  }

  isDistributedHoursValueChanged(distributedHours: number, displayIndex: number, filteredDates: { display: string; full: string }[], l4: L4Activity): boolean {
    // Implement change detection logic here
    return false; // Placeholder
  }

  getDistributedHoursForL4(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    const originalIndex = this.weeklyDates().findIndex(d => d.display === filteredDates[displayIndex].display);
    return typeof l4.weekly[originalIndex] === 'string' 
      ? parseFloat(l4.weekly[originalIndex] as string) || 0 
      : l4.weekly[originalIndex] as number;
  }

  // Date picker methods
  getDateButtonClasses(l4: L4Activity, dateType: 'start' | 'end'): string {
    const isChanged = this.isL4DateChanged(l4, dateType);
    return isChanged 
      ? "w-full justify-start text-left font-normal text-xs px-2 py-1 h-8 bg-yellow-100 border-yellow-300 text-yellow-800"
      : "w-full justify-start text-left font-normal text-xs px-2 py-1 h-8";
  }

  isL4DateChanged(l4: L4Activity, dateType: 'start' | 'end'): boolean {
    // Implement change detection logic here
    return false; // Placeholder
  }

  parseDate(dateString: string): Date {
    return parseProjectDate(dateString);
  }

  updateL4Date(l4: L4Activity, dateType: 'start' | 'end', newDate: Date | Date[] | { start: Date; end: Date } | null): void {
    if (!newDate || !(newDate instanceof Date)) {
      return; // Handle only Date objects
    }
    
    const date = newDate as Date;
    // Format date as dd-MMM-yy (e.g., "07-Aug-25")
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const dateString = `${day}-${month}-${year}`;
    
    if (dateType === 'start') {
      l4.start = dateString;
    } else {
      l4.end = dateString;
    }
    // Trigger recalculation if needed
    this.markAsChanged();
  }

  private markAsChanged(): void {
    // Mark component as having unsaved changes
    // This would trigger change detection and update UI accordingly
  }
}