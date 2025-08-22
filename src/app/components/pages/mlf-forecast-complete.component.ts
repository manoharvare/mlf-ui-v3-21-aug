import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject, HostListener } from '@angular/core';
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
  TriangleAlert,
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
// Removed table components - using native HTML table elements to match React implementation
import { BadgeComponent } from '../ui/badge.component';
import { SwitchComponent } from '../ui/switch.component';
import { PopoverComponent } from '../ui/popover.component';
import { CommandComponent, CommandItem } from '../ui/command.component';
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
                  <ui-popover [isOpen]="openCraftSelect()" (openChange)="onCraftSelectOpenChange($event)">
                    <button 
                      ui-popover-trigger
                      class="w-full justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
                      {{ selectedCrafts().length > 0 
                        ? selectedCrafts().length + ' crafts selected'
                        : 'Select crafts...'
                      }}
                      <lucide-icon [name]="ChevronDownIcon" [size]="16" class="ml-2 opacity-50"></lucide-icon>
                    </button>
                    <div ui-popover-content class="w-80 p-0">
                      <ui-command>
                        <input ui-command-input placeholder="Search crafts..." />
                        <div ui-command-empty>No crafts found.</div>
                        <div ui-command-group>
                          <div ui-command-list>
                            <div ui-command-item (click)="clearAllCrafts()">
                              Clear All
                            </div>
                            <div ui-command-item (click)="selectAllCrafts()">
                              Select All
                            </div>
                            <div 
                              *ngFor="let craft of craftNames"
                              ui-command-item 
                              (click)="toggleCraftSelection(craft)">
                              <div class="flex items-center space-x-2">
                                <div [class]="getCraftCheckboxClasses(craft)">
                                  <lucide-icon 
                                    *ngIf="isCraftSelected(craft)" 
                                    [name]="CheckIcon" 
                                    [size]="12" 
                                    class="text-primary-foreground">
                                  </lucide-icon>
                                </div>
                                <span>{{ craft }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ui-command>
                    </div>
                  </ui-popover>
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

              <!-- Selected Crafts Display -->
              <div *ngIf="selectedCrafts().length > 0" class="flex items-center gap-2 flex-wrap mt-3">
                <span class="text-sm text-foreground">Selected Crafts:</span>
                <ui-badge 
                  *ngFor="let craft of selectedCrafts(); trackBy: trackByCraftName" 
                  variant="secondary" 
                  [rightIcon]="XIcon"
                  customClasses="gap-1 cursor-pointer"
                  (clicked)="removeCraft(craft)">
                  {{ craft }}
                </ui-badge>
              </div>

              <!-- Active Filters Summary -->
              <div *ngIf="selectedCrafts().length > 0 || showNegativeOnly()" 
                   class="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-3">
                <div class="flex items-center gap-2 text-sm text-blue-800">
                  <span class="font-medium">Active Filters:</span>
                  <ui-badge *ngIf="selectedCrafts().length > 0" variant="outline">
                    {{ selectedCrafts().length }} Crafts Selected
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
                        <ui-popover 
                          [isOpen]="openDatePicker()" 
                          (openChange)="onDatePickerOpenChange($event)"
                          [contentClass]="'w-80 p-0'">
                          <button 
                            slot="trigger"
                            class="w-48 justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
                            {{ selectedDates().length > 0 
                              ? selectedDates().length + ' dates selected'
                              : 'Select dates...'
                            }}
                            <lucide-icon [name]="CalendarIconRef" [size]="16" class="ml-2 opacity-50"></lucide-icon>
                          </button>
                          
                          <!-- Popover Content -->
                          <ui-command
                            [items]="getDateCommandItems()"
                            [placeholder]="'Search dates...'"
                            [emptyMessage]="'No dates found.'"
                            [showFooter]="false"
                            (itemSelected)="onDateItemSelected($event)">
                          </ui-command>
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
                        [leftIcon]="CalendarIconRef"
                        [rightIcon]="XIcon"
                        customClasses="gap-1 cursor-pointer"
                        (clicked)="removeSelectedDate(date)">
                        {{ formatDateDisplay(date) }}
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
                          [leftIcon]="isColumnVisible(index) ? EyeIcon : EyeOffIcon"
                          [rightIcon]="isColumnVisible(index) ? CheckIcon : XIcon"
                          [customClasses]="getColumnVisibilityClasses(index)"
                          (clicked)="toggleColumnVisibility(index)">
                          {{ date.display }}
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
                                  class="flex-shrink-0 w-24">
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
                                <div class="relative activity-dropdown">
                                  <button 
                                    (click)="toggleActivityDropdown(getCraftKey(craftIndex))"
                                    class="h-8 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
                                    {{ getSelectedActivitiesText(getCraftKey(craftIndex)) }}
                                    <lucide-icon [name]="ChevronDownIcon" [size]="14" class="ml-1"></lucide-icon>
                                  </button>
                                  
                                  <!-- Dropdown Menu -->
                                  <div *ngIf="getActivitySelectOpen(getCraftKey(craftIndex))" 
                                       class="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <!-- Search Input -->
                                    <div class="p-2 border-b border-gray-200">
                                      <input 
                                        type="text"
                                        placeholder="Search activities..."
                                        [(ngModel)]="activitySearchTerm"
                                        (click)="$event.stopPropagation()"
                                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    </div>
                                    
                                    <!-- Activity List -->
                                    <div class="max-h-48 overflow-y-auto">
                                      <!-- Clear All Option -->
                                      <div 
                                        (click)="clearActivityFilter(getCraftKey(craftIndex)); closeActivityDropdown(getCraftKey(craftIndex))"
                                        class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-100">
                                        Clear All
                                      </div>
                                      
                                      <!-- Activity Options -->
                                      <div 
                                        *ngFor="let activity of getFilteredAvailableActivities()"
                                        (click)="toggleActivitySelection(getCraftKey(craftIndex), activity)"
                                        class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                                        <div class="flex items-center space-x-2">
                                          <!-- Checkbox -->
                                          <div [class]="getActivityCheckboxClasses(getCraftKey(craftIndex), activity)">
                                            <lucide-icon 
                                              *ngIf="isActivitySelected(getCraftKey(craftIndex), activity)" 
                                              [name]="CheckIcon" 
                                              [size]="12" 
                                              class="text-white">
                                            </lucide-icon>
                                          </div>
                                          <!-- Activity Info -->
                                          <div>
                                            <div class="font-medium">{{ activity }}</div>
                                            <div class="text-xs text-gray-500">{{ getActivityDescription(activity) }}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <!-- No Results -->
                                      <div *ngIf="getFilteredAvailableActivities().length === 0" 
                                           class="px-3 py-2 text-sm text-gray-500">
                                        No activities found.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="flex items-center gap-2 ml-4">
                                  <ui-button 
                                    variant="outline" 
                                    size="sm"
                                    [leftIcon]="TrendingUpIcon"
                                    (clicked)="recalculateAllTotals()">
                                    Recalculate All
                                  </ui-button>
                                  <ui-button 
                                    [variant]="hasUnsavedChanges() ? 'primary' : 'outline'"
                                    size="sm"
                                    [leftIcon]="SaveIcon"
                                    (clicked)="saveAllChanges()"
                                    [class]="getSaveButtonClasses()">
                                    Save
                                    <span *ngIf="hasUnsavedChanges()" class="ml-1 bg-white/20 text-xs px-1 rounded">
                                      •
                                    </span>
                                  </ui-button>
                                  <ui-button 
                                    variant="outline" 
                                    size="sm"
                                    [leftIcon]="RotateCcwIcon"
                                    (clicked)="resetAllData()">
                                    Reset
                                  </ui-button>
                                  <ui-button 
                                    variant="outline" 
                                    size="sm"
                                    [leftIcon]="RefreshCwIcon"
                                    (clicked)="refreshAllData()">
                                    Refresh
                                  </ui-button>
                                </div>
                              </div>
                            </div>

                            <!-- Selected Activities Display -->
                            <div *ngIf="getSelectedActivities(getCraftKey(craftIndex)).length > 0" 
                                 class="flex items-center gap-2 flex-wrap mb-3">
                              <span class="text-sm text-foreground">Filtered Activities:</span>
                              <ui-badge 
                                *ngFor="let activity of getSelectedActivities(getCraftKey(craftIndex)); trackBy: trackByActivity" 
                                variant="secondary" 
                                [rightIcon]="XIcon"
                                customClasses="gap-1 cursor-pointer"
                                (clicked)="removeActivitySelection(getCraftKey(craftIndex), activity)">
                                {{ activity }}
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
                                <table class="w-full border-collapse border border-gray-200 rounded-lg">
                                  <thead class="bg-gray-50">
                                    <tr>
                                      <th class="min-w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Activity ID</th>
                                      <th class="min-w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Activity Description</th>
                                      <th 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                        class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        {{ dateObj.display }}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="bg-white divide-y divide-gray-200">
                                    <tr 
                                      *ngFor="let activity of getFilteredActivitySpread(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackByActivityCode"
                                      class="hover:bg-gray-50">
                                      <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ activity.activityCode }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ activity.description }}</td>
                                      <td 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                        class="px-3 py-2 whitespace-nowrap text-center">
                                        <div class="w-16 mx-auto">
                                          <div [class]="getForecastHoursCellClasses(activity, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                            {{ getForecastHoursValue(activity, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
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
                                <table class="w-full border-collapse border border-gray-200 rounded-lg">
                                  <thead class="bg-gray-50">
                                    <tr>
                                      <th class="min-w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Link Code</th>
                                      <th class="min-w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Link Code Description</th>
                                      <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AFC Hr</th>
                                      <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Hrs</th>
                                      <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">To Go Hrs</th>
                                      <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Fcst Start</th>
                                      <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Fcst Finish</th>
                                      <th 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                        class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        {{ dateObj.display }}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="bg-white divide-y divide-gray-200">
                                    <tr 
                                      *ngFor="let l4 of getFilteredL4Activities(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackByL4JobNumber"
                                      class="hover:bg-gray-50">
                                      <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-700">{{ l4.jobNumber }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ l4.activityCode }} - Link Description</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getAfcHours(l4) }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getWpHours(l4) }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900">{{ getToGoHours(l4) }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900">{{ l4.start }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900">{{ l4.end }}</td>
                                      <td 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                        class="px-3 py-2 whitespace-nowrap text-center">
                                        <div class="w-16 mx-auto">
                                          <div [class]="getWorkforceCellClasses(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                            {{ getWorkforceValue(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
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
                                <table class="w-full border-collapse border border-gray-200 rounded-lg">
                                  <thead class="bg-gray-50">
                                    <tr>
                                      <th class="min-w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Link Code</th>
                                      <th class="min-w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Link Code Description</th>
                                      <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AFC Hr</th>
                                      <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Hrs</th>
                                      <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">To Go Hrs</th>
                                      <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Fcst Start</th>
                                      <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Fcst Finish</th>
                                      <th 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                        class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        {{ dateObj.display }}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="bg-white divide-y divide-gray-200">
                                    <tr 
                                      *ngFor="let l4 of getFilteredL4Activities(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackByL4JobNumber"
                                      class="hover:bg-gray-50">
                                      <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-700">{{ l4.jobNumber }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ l4.activityCode }} - Link Description</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getAfcHours(l4) }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getWpHours(l4) }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900">{{ getToGoHours(l4) }}</td>
                                      <td class="px-3 py-2 whitespace-nowrap text-center">
                                        <button 
                                          class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                                          [class]="getDateButtonClasses(l4, 'start')">
                                          <lucide-icon [name]="CalendarIconRef" [size]="12" class="mr-1"></lucide-icon>
                                          {{ l4.start }}
                                        </button>
                                      </td>
                                      <td class="px-3 py-2 whitespace-nowrap text-center">
                                        <button 
                                          class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                                          [class]="getDateButtonClasses(l4, 'end')">
                                          <lucide-icon [name]="CalendarIconRef" [size]="12" class="mr-1"></lucide-icon>
                                          {{ l4.end }}
                                        </button>
                                      </td>
                                      <td 
                                        *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                        class="px-3 py-2 whitespace-nowrap text-center">
                                        <div class="w-16 mx-auto">
                                          <div [class]="getDistributedHoursCellClasses(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                            {{ getDistributedHoursValue(l4, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <!-- Section 4: SPC Detailed Work Pack With Calculated Distributed Hours (Read Only) -->
                          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div class="flex items-center justify-between mb-3">
                              <h6 class="font-medium text-purple-900">
                                4. SPC Detailed Work Pack With Calculated Distributed Hours (Read Only)
                              </h6>
                              <div class="text-xs text-purple-700">
                                Work pack details with distributed hours. Auto-calculated from SPC workforce data.
                              </div>
                            </div>
                            <div class="overflow-x-auto">
                              <table class="w-full border-collapse border border-gray-200 rounded-lg">
                                <thead class="bg-gray-50">
                                  <tr>
                                    <th class="min-w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP No</th>
                                    <th class="min-w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Description</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AFC Hrs</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Hrs</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AFC Earned</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Earned</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Togo Hrs</th>
                                    <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Sch Fcst Start</th>
                                    <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Sch Fcst Finish</th>
                                    <th 
                                      *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                      class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                      {{ dateObj.display }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                  <tr 
                                    *ngFor="let spc of getFilteredSPCActivities(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackBySPCSubCode"
                                    class="hover:bg-gray-50">
                                    <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-purple-700">{{ spc.subCode }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ spc.activityCode }} - {{ getSPCDescription(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCAFCHours(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCWPHours(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCAFCEarned(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCWPEarned(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCTogoHours(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900">{{ spc.start }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900">{{ spc.end }}</td>
                                    <td 
                                      *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                      class="px-3 py-2 whitespace-nowrap text-center">
                                      <div class="w-16 mx-auto">
                                        <div [class]="getSPCDistributedHoursCellClasses(spc, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                          {{ getSPCDistributedHoursValue(spc, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <!-- Section 5: SPC Detailed Work Pack With Calculated Distributed Workforce - EDITABLE DATES -->
                          <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div class="flex items-center justify-between mb-3">
                              <h6 class="font-medium text-orange-900">
                                5. SPC Detailed Work Pack With Calculated Distributed Workforce (Editable Dates)
                              </h6>
                              <div class="text-xs text-orange-700">
                                Edit dates to auto-calculate distributed workforce. SPC data rolls up to L4 Hours. Freeze logic preserves past values.
                              </div>
                            </div>
                            <div class="overflow-x-auto">
                              <table class="w-full border-collapse border border-gray-200 rounded-lg">
                                <thead class="bg-gray-50">
                                  <tr>
                                    <th class="min-w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP No</th>
                                    <th class="min-w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Description</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AFC Hrs</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Hrs</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AFC Earned</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">WP Earned</th>
                                    <th class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Togo Hrs</th>
                                    <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Sch Fcst Start</th>
                                    <th class="min-w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Sch Fcst Finish</th>
                                    <th 
                                      *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); trackBy: trackByDateDisplay" 
                                      class="min-w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                      {{ dateObj.display }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                  <tr 
                                    *ngFor="let spc of getFilteredSPCActivities(getCraftKey(craftIndex)); let rowIndex = index; trackBy: trackBySPCSubCode"
                                    class="hover:bg-gray-50">
                                    <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-purple-700">{{ spc.subCode }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ spc.activityCode }} - {{ getSPCDescription(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCAFCHours(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCWPHours(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCAFCEarned(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCWPEarned(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900">{{ getSPCTogoHours(spc) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-center">
                                      <button 
                                        class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                                        [class]="getSPCDateButtonClasses(spc, 'start')">
                                        <lucide-icon [name]="CalendarIconRef" [size]="12" class="mr-1"></lucide-icon>
                                        {{ spc.start }}
                                      </button>
                                    </td>
                                    <td class="px-3 py-2 whitespace-nowrap text-center">
                                      <button 
                                        class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                                        [class]="getSPCDateButtonClasses(spc, 'end')">
                                        <lucide-icon [name]="CalendarIconRef" [size]="12" class="mr-1"></lucide-icon>
                                        {{ spc.end }}
                                      </button>
                                    </td>
                                    <td 
                                      *ngFor="let dateObj of getFilteredDatesForCraft(getCraftKey(craftIndex)); let displayIndex = index; trackBy: trackByDateDisplay" 
                                      class="px-3 py-2 whitespace-nowrap text-center">
                                      <div class="w-16 mx-auto">
                                        <div [class]="getSPCWorkforceCellClasses(spc, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex)))">
                                          {{ getSPCWorkforceValue(spc, displayIndex, getFilteredDatesForCraft(getCraftKey(craftIndex))) }}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
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
                    <table class="min-w-max w-full border-collapse">
                      <thead>
                        <tr class="bg-gray-50 border-b border-gray-200">
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                            Craft Name
                          </th>
                          <th 
                            *ngFor="let date of filteredWeeklyDates(); let i = index" 
                            class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24 border-r border-gray-200">
                            {{ date.display }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr 
                          *ngFor="let craft of filteredCraftData(); let craftIndex = index" 
                          class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                            {{ craft.craftName }}
                          </td>
                          <td 
                            *ngFor="let date of filteredWeeklyDates(); let weekIndex = index" 
                            class="px-4 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                            {{ getFilteredCraftValue(craft, weekIndex) !== 0 ? getFilteredCraftValue(craft, weekIndex) : '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
  AlertTriangleIcon = TriangleAlert;
  CheckIcon = Check;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;

  // State signals
  activeTab = signal<string>('l4-craft-edit');
  selectedLocation = signal<string>('');
  selectedProject = signal<string>('');
  selectedMLFFilter = signal<string>('');
  selectedCraftFilter = signal<string>('');
  selectedCrafts = signal<string[]>([]);
  showNegativeOnly = signal<boolean>(false);
  selectedDates = signal<Date[]>([]);
  openDatePicker = signal<boolean>(false);
  openCraftSelect = signal<boolean>(false);
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
  l4DatePickers = signal<{[key: string]: boolean}>({});
  spcDatePickers = signal<{[key: string]: boolean}>({});
  
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

  // Generate craft data - matching React implementation
  craftData = computed(() => {
    return this.craftNames.map((craftName, craftIndex) => {
      const weeklyData = this.weeklyDates().map((_, weekIndex) => {
        // Use a seed based on craft index and week index for consistent results
        const seed = craftIndex * 100 + weekIndex;
        const random = ((seed * 9301 + 49297) % 233280) / 233280;
        
        // Generate numbers between 0-500 for most crafts
        // Some crafts like "Rolling Ops (Max 8)" should have lower numbers
        let maxValue = 500;
        if (craftName.includes('(Max 8)')) {
          maxValue = 8;
        } else if (craftName.includes('Rev Orders') || craftName.includes('Rolling - Welders')) {
          maxValue = 50;
        }
        
        // Generate positive values only
        const baseValue = Math.floor(random * maxValue);
        return Math.max(baseValue, 1); // Ensure minimum value of 1
      });
      
      return {
        craftName,
        weeklyData
      };
    });
  });

  filteredCraftData = computed(() => {
    let filtered = this.craftData();
    
    // Filter by selected crafts (multiple selection)
    if (this.selectedCrafts().length > 0) {
      filtered = filtered.filter(craft => this.selectedCrafts().includes(craft.craftName));
    }
    
    // Filter by negative variance only
    if (this.showNegativeOnly()) {
      filtered = filtered.filter(craft => {
        return craft.weeklyData.slice(0, this.weeklyDates().length).some((originalValue, weekIndex) => {
          const seed = this.craftData().indexOf(craft) * 100 + weekIndex + 1000;
          const random = ((seed * 9301 + 49297) % 233280) / 233280;
          const variance = Math.floor((random - 0.5) * originalValue * 0.4);
          return variance < 0;
        });
      });
    }
    
    return filtered.map(craft => ({
      ...craft,
      weeklyData: craft.weeklyData.slice(0, this.weeklyDates().length)
    }));
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
    
    // Initialize visible columns to show all columns by default
    const allIndices = this.weeklyDates().map((_, index) => index);
    this.visibleColumns.set(new Set(allIndices));
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

  onCraftSelectOpenChange(isOpen: boolean) {
    this.openCraftSelect.set(isOpen);
  }

  // Craft selection functions
  toggleCraftSelection(craft: string) {
    const current = this.selectedCrafts();
    const exists = current.includes(craft);
    
    if (exists) {
      this.selectedCrafts.set(current.filter(c => c !== craft));
    } else {
      this.selectedCrafts.set([...current, craft]);
    }
  }

  removeCraft(craft: string) {
    const current = this.selectedCrafts();
    this.selectedCrafts.set(current.filter(c => c !== craft));
  }

  clearAllCrafts() {
    this.selectedCrafts.set([]);
    this.openCraftSelect.set(false);
  }

  selectAllCrafts() {
    this.selectedCrafts.set([...this.craftNames]);
    this.openCraftSelect.set(false);
  }

  isCraftSelected(craft: string): boolean {
    return this.selectedCrafts().includes(craft);
  }

  getCraftCheckboxClasses(craft: string): string {
    const baseClasses = 'w-4 h-4 border border-primary rounded-sm flex items-center justify-center';
    const selectedClasses = this.isCraftSelected(craft) ? 'bg-primary' : 'bg-white';
    return `${baseClasses} ${selectedClasses}`;
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

  // Command component integration for date selection
  getDateCommandItems(): CommandItem[] {
    const items: CommandItem[] = [
      {
        id: 'clear-all',
        label: 'Clear All',
        description: 'Clear all selected dates',
        data: { action: 'clear-all' }
      },
      {
        id: 'select-all',
        label: 'Select All',
        description: 'Select all available dates',
        data: { action: 'select-all' }
      }
    ];

    // Add individual date items
    this.availableDates().forEach(dateObj => {
      items.push({
        id: `date-${dateObj.full.getTime()}`,
        label: dateObj.display,
        description: this.isDateSelected(dateObj.full) ? 'Selected' : 'Click to select',
        icon: this.isDateSelected(dateObj.full) ? this.CheckIcon : undefined,
        data: { action: 'toggle-date', date: dateObj.full }
      });
    });

    return items;
  }

  onDateItemSelected(item: CommandItem) {
    if (!item.data) return;
    
    const { action, date } = item.data;
    
    switch (action) {
      case 'clear-all':
        this.clearAllDates();
        break;
      case 'select-all':
        this.selectAllDates();
        break;
      case 'toggle-date':
        if (date) {
          this.toggleDateSelection(date);
        }
        break;
    }
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
    const selections = this.selectedGridColumns()[craftKey];
    return selections ? selections.has(originalIndex) : false;
  }

  selectAllGridColumns(craftKey: string) {
    const allIndices = this.filteredWeeklyDates().map((_, index) => 
      this.weeklyDates().findIndex(d => d.display === this.filteredWeeklyDates()[index].display)
    );
    const current = { ...this.selectedGridColumns() };
    current[craftKey] = new Set(allIndices);
    this.selectedGridColumns.set(current);
  }

  clearAllGridColumns(craftKey: string) {
    const current = { ...this.selectedGridColumns() };
    current[craftKey] = new Set();
    this.selectedGridColumns.set(current);
  }

  // Helper methods for grid column selection
  getOriginalIndex(dateObj: { display: string; full?: string; fullDate?: Date }): number {
    return this.weeklyDates().findIndex(d => d.display === dateObj.display);
  }

  getCraftKey(craftIndex: number): string {
    return `craft-${craftIndex}`;
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

  getP6CraftValue(craft: CraftData, displayIndex: number): number {
    return craft.weeklyData[displayIndex] || 0;
  }

  getP6CraftValueByDate(craft: CraftData, date: WeeklyDate): number {
    const originalIndex = this.getOriginalIndex(date);
    return craft.weeklyData[originalIndex] || 0;
  }

  getFilteredCraftValue(craft: CraftData, filteredIndex: number): number {
    const filteredDate = this.filteredWeeklyDates()[filteredIndex];
    if (!filteredDate) return 0;
    const originalIndex = this.getOriginalIndex(filteredDate);
    return craft.weeklyData[originalIndex] || 0;
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
      ? 'bg-primary text-primary-foreground hover:bg-primary/80' 
      : 'bg-gray-200 text-gray-600 hover:bg-gray-300';
    return `${baseClasses} ${visibilityClasses}`;
  }

  getDateHeaderClasses(craftIndex: number, date: WeeklyDate): string {
    const baseClasses = 'w-full text-xs mb-1 text-center font-medium min-h-6 px-1 flex items-center justify-center rounded-md transition-colors whitespace-nowrap';
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

  trackByCraftName(index: number, craft: string): string {
    return craft;
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
    // Get activity codes from activitySpreadData to match React implementation
    return this.activitySpreadData().map(activity => activity.activityCode);
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
    const selectedIndices = this.selectedGridColumns()[craftKey];
    
    // If no grid columns are selected for this craft, show all filtered weekly dates
    if (!selectedIndices || selectedIndices.size === 0) {
      return this.filteredWeeklyDates().map(date => ({
        display: date.display,
        full: date.fullDate.toISOString()
      }));
    }
    
    // Filter to only show selected columns for this craft
    return this.filteredWeeklyDates()
      .filter((date) => {
        const originalIndex = this.weeklyDates().findIndex(d => d.display === date.display);
        return selectedIndices.has(originalIndex);
      })
      .map(date => ({
        display: date.display,
        full: date.fullDate.toISOString()
      }));
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
    const l4Index = this.l4Data().findIndex(item => item.jobNumber === l4.jobNumber);
    if (l4Index === -1) return false;
    return this.changedValues()[`l4-${l4Index}-${dateType}`] || false;
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

  // SPC Activities methods
  getFilteredSPCActivities(craftKey: string): SPCActivity[] {
    const selectedActivities = this.selectedActivities()[craftKey] || [];
    return this.spcData().filter(spc => 
      !selectedActivities.length || selectedActivities.includes(spc.activityCode)
    );
  }

  getSPCDescription(spc: SPCActivity): string {
    return `Work Pack Description for ${spc.subCode}`;
  }

  getSPCAFCHours(spc: SPCActivity): number {
    return 1200; // Fixed value as per React version
  }

  getSPCWPHours(spc: SPCActivity): number {
    return 900; // Fixed value as per React version
  }

  getSPCAFCEarned(spc: SPCActivity): number {
    return 300; // Fixed value as per React version
  }

  getSPCWPEarned(spc: SPCActivity): number {
    return 250; // Fixed value as per React version
  }

  getSPCTogoHours(spc: SPCActivity): number {
    return this.getSPCAFCHours(spc) - this.getSPCAFCEarned(spc); // 900
  }

  getSPCDateButtonClasses(spc: SPCActivity, dateType: 'start' | 'end'): string {
    const isChanged = this.isSPCDateChanged(spc, dateType);
    return isChanged 
      ? "w-full justify-start text-left font-normal text-xs px-2 py-1 h-8 bg-yellow-100 border-yellow-300 text-yellow-800"
      : "w-full justify-start text-left font-normal text-xs px-2 py-1 h-8";
  }

  isSPCDateChanged(spc: SPCActivity, dateType: 'start' | 'end'): boolean {
    const spcIndex = this.spcData().findIndex(item => item.jobNumber === spc.jobNumber && item.spcCode === spc.spcCode);
    if (spcIndex === -1) return false;
    return this.changedValues()[`spc-${spcIndex}-${dateType}`] || false;
  }

  updateSPCDate(spc: SPCActivity, dateType: 'start' | 'end', newDate: Date | Date[] | { start: Date; end: Date } | null): void {
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
      spc.start = dateString;
    } else {
      spc.end = dateString;
    }
    // Trigger recalculation if needed
    this.markAsChanged();
  }

  getSPCWorkforceValue(spc: SPCActivity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    return this.getSPCWorkforceForSPC(spc, displayIndex, filteredDates);
  }

  getSPCWorkforceCellClasses(spc: SPCActivity, displayIndex: number, filteredDates: { display: string; full: string }[]): string {
    const workforce = this.getSPCWorkforceValue(spc, displayIndex, filteredDates);
    const isChanged = this.isSPCWorkforceValueChanged(workforce, displayIndex, filteredDates, spc);
    const weekDate = parseProjectDate(filteredDates[displayIndex].display.replace('/', '-'));
    const currentWeekCutoff = getCurrentWeekCutoff();
    const isFrozen = weekDate < currentWeekCutoff;
    
    return isFrozen 
      ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-gray-100 border-gray-400 text-gray-700"
      : isChanged 
        ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-yellow-100 border-yellow-300 text-yellow-800"
        : workforce > 0 
          ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-orange-100 border-orange-300 text-orange-800"
          : "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-gray-50 border-gray-200 text-gray-500";
  }

  isSPCWorkforceValueChanged(workforce: number, displayIndex: number, filteredDates: { display: string; full: string }[], spc: SPCActivity): boolean {
    const spcIndex = this.spcData().findIndex(item => item.jobNumber === spc.jobNumber && item.spcCode === spc.spcCode);
    if (spcIndex === -1) return false;
    
    // Get the original SPC row data
    const originalRow = this.originalSPCData()[spcIndex];
    if (!originalRow) return false;

    const weeklyDatesWithFull = filteredDates.map(date => ({
      display: date.display,
      fullDate: parseProjectDate(date.display.replace('/', '-'))
    }));

    // Calculate what the original workforce would have been for this week
    const originalDistributedWorkforce = distributeHoursWithFreeze(
      100, // placeholder togo hours
      originalRow.start, 
      originalRow.end, 
      weeklyDatesWithFull,
      [],
      false
    );
    
    const originalWorkforce = originalDistributedWorkforce[displayIndex] || 0;
    return workforce !== originalWorkforce;
  }

  getSPCWorkforceForSPC(spc: SPCActivity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    const startDate = parseProjectDate(spc.start);
    const endDate = parseProjectDate(spc.end);
    const currentWeekCutoff = getCurrentWeekCutoff();
    const togoHrs = this.getSPCTogoHours(spc);
    
    // Get existing SPC workforce values to preserve past values
    const existingSPCWorkforce = filteredDates.map((_, idx) => {
      const originalIndex = this.weeklyDates().findIndex(d => d.display === filteredDates[idx].display);
      return typeof spc.weekly[originalIndex] === 'string' 
        ? parseFloat(spc.weekly[originalIndex] as string) || 0 
        : spc.weekly[originalIndex] as number;
    });
    
    // Calculate SPC workforce distribution with freeze logic
    const weeklyDatesWithFull = filteredDates.map(dateObj => ({
      display: dateObj.display,
      fullDate: parseProjectDate(dateObj.display.replace('/', '-'))
    }));
    
    const spcWorkforceDistribution = distributeHoursWithFreeze(
      togoHrs / 60, // Convert to workforce (divide by 60)
      spc.start,
      spc.end,
      weeklyDatesWithFull,
      existingSPCWorkforce,
      true // preservePastValues
    );
    
    return spcWorkforceDistribution[displayIndex] || 0;
  }

  // Section 4: SPC Distributed Hours methods
  getSPCDistributedHoursValue(spc: SPCActivity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    // SPC Distributed Hours = SPC Workforce × 60
    const workforce = this.getSPCWorkforceValue(spc, displayIndex, filteredDates);
    return workforce * 60;
  }

  getSPCDistributedHoursCellClasses(spc: SPCActivity, displayIndex: number, filteredDates: { display: string; full: string }[]): string {
    const distributedHours = this.getSPCDistributedHoursValue(spc, displayIndex, filteredDates);
    const isChanged = this.isSPCDistributedHoursValueChanged(distributedHours, displayIndex, filteredDates, spc);
    const weekDate = parseProjectDate(filteredDates[displayIndex].display.replace('/', '-'));
    const currentWeekCutoff = getCurrentWeekCutoff();
    const isFrozen = weekDate < currentWeekCutoff;
    
    return isFrozen 
      ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-gray-100 border-gray-400 text-gray-700"
      : isChanged 
        ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-yellow-100 border-yellow-300 text-yellow-800"
        : "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-purple-100 border-purple-300 text-purple-800";
  }

  isSPCDistributedHoursValueChanged(distributedHours: number, displayIndex: number, filteredDates: { display: string; full: string }[], spc: SPCActivity): boolean {
    const spcIndex = this.spcData().findIndex(item => item.jobNumber === spc.jobNumber && item.spcCode === spc.spcCode);
    if (spcIndex === -1) return false;
    
    // Get the original SPC row data
    const originalRow = this.originalSPCData()[spcIndex];
    if (!originalRow) return false;

    const weeklyDatesWithFull = filteredDates.map(date => ({
      display: date.display,
      fullDate: parseProjectDate(date.display.replace('/', '-'))
    }));

    // Calculate what the original hours would have been for this week
    const originalDistributedHours = distributeHoursWithFreeze(
      100, // placeholder togo hours
      originalRow.start, 
      originalRow.end, 
      weeklyDatesWithFull,
      [],
      false
    );
    
    const originalHours = originalDistributedHours[displayIndex] || 0;
    return distributedHours !== originalHours;
  }

  // Utility methods
  checkForUnsavedChanges(): boolean {
    // Check L4 data changes
    const l4Changed = this.l4Data().some((item, rowIndex) => {
      const original = this.originalL4Data()[rowIndex];
      return item.start !== original?.start ||
             item.end !== original?.end ||
             item.comment !== original?.comment ||
             item.weekly.some((val, weekIndex) => val !== original?.weekly[weekIndex]);
    });

    // Check SPC data changes
    const spcChanged = this.spcData().some((item, rowIndex) => {
      const original = this.originalSPCData()[rowIndex];
      return item.start !== original?.start ||
             item.end !== original?.end ||
             item.weekly.some((val, weekIndex) => val !== original?.weekly[weekIndex]);
    });

    // Check Activity Spread data changes
    const activityChanged = this.activitySpreadData().some((item, rowIndex) => {
      const original = this.originalActivitySpreadData()[rowIndex];
      return item.hours.some((val, weekIndex) => val !== original?.hours[weekIndex]);
    });

    return l4Changed || spcChanged || activityChanged;
  }

  saveAllChanges(): void {
    // Update original data with current data
    this.originalL4Data.set([...this.l4Data()]);
    this.originalSPCData.set([...this.spcData()]);
    this.originalActivitySpreadData.set([...this.activitySpreadData()]);
    
    // Clear change tracking
    this.changedValues.set({});
    this.l4AutoCalculated.set({});
    this.hasUnsavedChanges.set(false);
    
    // Show success message (you can implement toast notification)
    console.log('All changes saved successfully');
  }

  resetAllData(): void {
    // Reset all data to original values
    this.l4Data.set([...this.originalL4Data()]);
    this.spcData.set([...this.originalSPCData()]);
    this.activitySpreadData.set([...this.originalActivitySpreadData()]);
    
    // Clear change tracking
    this.changedValues.set({});
    this.l4AutoCalculated.set({});
    this.hasUnsavedChanges.set(false);
  }

  refreshAllData(): void {
    this.l4Data.set([...this.originalL4Data()]);
    this.spcData.set([...this.originalSPCData()]);
    this.activitySpreadData.set([...this.originalActivitySpreadData()]);
    this.l4AutoCalculated.set({});
    this.changedValues.set({});
    this.hasUnsavedChanges.set(false);
  }

  // Helper function to calculate L4 totals from SPC activities
  calculateL4TotalFromSPC(jobNumber: string, weekIndex: number): number {
    return this.spcData()
      .filter(spc => spc.jobNumber === jobNumber)
      .reduce((sum, spc) => {
        const value = typeof spc.weekly[weekIndex] === 'string' ? parseFloat(spc.weekly[weekIndex] as string) || 0 : spc.weekly[weekIndex] as number;
        return sum + value;
      }, 0);
  }

  // Function to update Activity Hours from L4 changes - DISABLED
  // Activity Hours section now remains static and doesn't auto-update from L4 changes
  updateActivitySpreadFromL4Changes(activityCode: string): void {
    // This function is disabled - Activity Hours remain static
    // The top totals will reflect L4 changes directly
  }

  // Function to update L4 totals when SPC data changes
  updateL4TotalsFromSPC(jobNumber: string): void {
    const newL4Data = [...this.l4Data()];
    const l4Index = newL4Data.findIndex(l4 => l4.jobNumber === jobNumber);
    
    if (l4Index !== -1) {
      // Mark this L4 entry as auto-calculated
      const newAutoCalculated = { ...this.l4AutoCalculated() };
      
      // Recalculate L4 weekly totals from SPC activities
      newL4Data[l4Index].weekly = newL4Data[l4Index].weekly.map((_, weekIndex) => {
        const calculatedTotal = this.calculateL4TotalFromSPC(jobNumber, weekIndex);
        // Mark this specific week as auto-calculated
        newAutoCalculated[`${l4Index}-${weekIndex}`] = true;
        return calculatedTotal;
      });
      
      this.l4Data.set(newL4Data);
      this.l4AutoCalculated.set(newAutoCalculated);
      
      // Also update Activity Hours from this L4 change
      this.updateActivitySpreadFromL4Changes(newL4Data[l4Index].activityCode);
      
      // Show success message
      console.log(`L4 totals updated from SPC activities for ${jobNumber}`);
    }
  }

  recalculateAllTotals(): void {
    const newL4Data = [...this.l4Data()];
    const newL4AutoCalculated = { ...this.l4AutoCalculated() };
    
    // First, recalculate all L4 totals from SPC
    newL4Data.forEach((l4, l4Index) => {
      l4.weekly = l4.weekly.map((_, weekIndex) => {
        const calculatedTotal = this.calculateL4TotalFromSPC(l4.jobNumber, weekIndex);
        newL4AutoCalculated[`${l4Index}-${weekIndex}`] = true;
        return calculatedTotal;
      });
    });
    
    this.l4Data.set(newL4Data);
    this.l4AutoCalculated.set(newL4AutoCalculated);
    
    console.log('All totals recalculated from SPC through L4 to Activity Hours');
    this.markAsChanged();
  }

  // Functions to handle data editing
  handleL4DateEdit(rowIndex: number, field: 'start' | 'end', value: string): void {
    const newData = [...this.l4Data()];
    newData[rowIndex][field] = value;
    this.l4Data.set(newData);
    this.editingL4.set(null);
    
    // Track changed values for highlighting
    const changeKey = `l4-${rowIndex}-${field}`;
    const newChangedValues = { ...this.changedValues() };
    if (value !== this.originalL4Data()[rowIndex]?.[field]) {
      newChangedValues[changeKey] = true;
    } else {
      delete newChangedValues[changeKey];
    }
    this.changedValues.set(newChangedValues);
    
    this.hasUnsavedChanges.set(this.checkForUnsavedChanges());
  }

  handleL4HourEdit(rowIndex: number, weekIndex: number, value: string): void {
    const newData = [...this.l4Data()];
    newData[rowIndex].weekly[weekIndex] = value;
    this.l4Data.set(newData);
    this.editingL4Hour.set(null);
    
    // Clear auto-calculated flag for this specific cell since it's manually edited
    const newAutoCalculated = { ...this.l4AutoCalculated() };
    delete newAutoCalculated[`${rowIndex}-${weekIndex}`];
    this.l4AutoCalculated.set(newAutoCalculated);
    
    // Track changed values for highlighting
    const changeKey = `l4-${rowIndex}-${weekIndex}`;
    const newChangedValues = { ...this.changedValues() };
    if (value !== this.originalL4Data()[rowIndex]?.weekly[weekIndex]) {
      newChangedValues[changeKey] = true;
    } else {
      delete newChangedValues[changeKey];
    }
    this.changedValues.set(newChangedValues);
    
    // Update Activity Hours from this L4 change
    this.updateActivitySpreadFromL4Changes(newData[rowIndex].activityCode);
    
    // Check for unsaved changes
    this.hasUnsavedChanges.set(true);
  }

  handleL4CommentEdit(rowIndex: number, value: string): void {
    const newData = [...this.l4Data()];
    newData[rowIndex].comment = value;
    this.l4Data.set(newData);
    
    // Track changed values for highlighting
    const changeKey = `l4-${rowIndex}-comment`;
    const newChangedValues = { ...this.changedValues() };
    if (value !== this.originalL4Data()[rowIndex]?.comment) {
      newChangedValues[changeKey] = true;
    } else {
      delete newChangedValues[changeKey];
    }
    this.changedValues.set(newChangedValues);
    
    this.hasUnsavedChanges.set(true);
  }

  handleSPCHourEdit(rowIndex: number, weekIndex: number, value: string): void {
    const newData = [...this.spcData()];
    newData[rowIndex].weekly[weekIndex] = value;
    this.spcData.set(newData);
    this.editingSPCHour.set(null);
    
    // Track changed values for highlighting
    const changeKey = `spc-${rowIndex}-${weekIndex}`;
    const newChangedValues = { ...this.changedValues() };
    if (value !== this.originalSPCData()[rowIndex]?.weekly[weekIndex]) {
      newChangedValues[changeKey] = true;
    } else {
      delete newChangedValues[changeKey];
    }
    this.changedValues.set(newChangedValues);
    
    // Update L4 totals from this SPC change
    this.updateL4TotalsFromSPC(newData[rowIndex].jobNumber);
    
    this.hasUnsavedChanges.set(true);
  }

  // Check if values were auto-calculated
  isL4AutoCalculated(rowIndex: number, weekIndex: number): boolean {
    return this.l4AutoCalculated()[`${rowIndex}-${weekIndex}`] || false;
  }

  isActivitySpreadAutoCalculated(rowIndex: number, weekIndex: number): boolean {
    // Placeholder for activity spread auto-calculation tracking
    return false;
  }

  // Check if values were changed
  isL4HourChanged(rowIndex: number, weekIndex: number): boolean {
    return this.changedValues()[`l4-${rowIndex}-${weekIndex}`] || false;
  }

  isSPCHourChanged(rowIndex: number, weekIndex: number): boolean {
    return this.changedValues()[`spc-${rowIndex}-${weekIndex}`] || false;
  }

  isL4CommentChanged(rowIndex: number): boolean {
    return this.changedValues()[`l4-${rowIndex}-comment`] || false;
  }

  // Check if L4 hours value has changed from original (for Level 4 Forecasted Hours section)
  isL4HoursValueChanged(
    currentHours: number,
    rowIndex: number, 
    displayIndex: number, 
    weeklyDatesWithFull: { display: string; fullDate: Date }[],
    row: L4Activity
  ): boolean {
    // Get the original L4 row data
    const originalRow = this.originalL4Data()[rowIndex];
    if (!originalRow) return false;

    // Calculate what the original hours would have been for this week
    const originalDistributedHours = distributeHoursWithFreeze(
      100, // placeholder togo hours
      originalRow.start, 
      originalRow.end, 
      weeklyDatesWithFull,
      [],
      false
    );
    
    const originalHours = originalDistributedHours[displayIndex] || 0;
    return currentHours !== originalHours;
  }

  // Check if SPC hours value has changed from original (for SPC hours sections)
  isSPCHoursValueChanged(
    currentHours: number,
    rowIndex: number, 
    displayIndex: number, 
    weeklyDatesWithFull: { display: string; fullDate: Date }[],
    row: SPCActivity
  ): boolean {
    // Get the original SPC row data
    const originalRow = this.originalSPCData()[rowIndex];
    if (!originalRow) return false;

    // Calculate what the original hours would have been for this week
    const originalDistributedHours = distributeHoursWithFreeze(
      100, // placeholder togo hours
      originalRow.start, 
      originalRow.end, 
      weeklyDatesWithFull,
      [],
      false
    );
    
    const originalHours = originalDistributedHours[displayIndex] || 0;
    return currentHours !== originalHours;
  }

  getSaveButtonClasses(): string {
    return this.hasUnsavedChanges() 
      ? "flex items-center gap-2 bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
      : "flex items-center gap-2";
  }

  // Section 2: L4 Craft Workforce methods
  getL4CraftWorkforceValue(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): number {
    // L4 Craft Workforce = Forecasted Hours ÷ 60
    const forecastedHours = this.getDistributedHoursValue(l4, displayIndex, filteredDates);
    return Math.round(forecastedHours / 60);
  }

  getL4CraftWorkforceCellClasses(l4: L4Activity, displayIndex: number, filteredDates: { display: string; full: string }[]): string {
    const workforce = this.getL4CraftWorkforceValue(l4, displayIndex, filteredDates);
    const isChanged = this.isL4CraftWorkforceValueChanged(workforce, displayIndex, filteredDates, l4);
    const weekDate = parseProjectDate(filteredDates[displayIndex].display.replace('/', '-'));
    const currentWeekCutoff = getCurrentWeekCutoff();
    const isFrozen = weekDate < currentWeekCutoff;
    
    return isFrozen 
      ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-gray-100 border-gray-400 text-gray-700"
      : isChanged 
        ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-yellow-100 border-yellow-300 text-yellow-800"
        : workforce > 0 
          ? "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-green-100 border-green-300 text-green-800"
          : "w-full h-8 text-center text-xs rounded px-1 flex items-center justify-center border bg-gray-50 border-gray-200 text-gray-500";
  }

  isL4CraftWorkforceValueChanged(workforce: number, displayIndex: number, filteredDates: { display: string; full: string }[], l4: L4Activity): boolean {
    const l4Index = this.l4Data().findIndex(item => item.jobNumber === l4.jobNumber);
    if (l4Index === -1) return false;
    
    // Get the original L4 row data
    const originalRow = this.originalL4Data()[l4Index];
    if (!originalRow) return false;

    const weeklyDatesWithFull = filteredDates.map(date => ({
      display: date.display,
      fullDate: parseProjectDate(date.display.replace('/', '-'))
    }));

    // Calculate what the original workforce would have been for this week
    const originalDistributedHours = distributeHoursWithFreeze(
      100, // placeholder togo hours
      originalRow.start, 
      originalRow.end, 
      weeklyDatesWithFull,
      [],
      false
    );
    
    const originalWorkforce = Math.round((originalDistributedHours[displayIndex] || 0) / 60);
    return workforce !== originalWorkforce;
  }

  // Date picker state management methods
  getL4DatePickerOpen(rowIndex: number, field: 'start' | 'end'): boolean {
    return this.l4DatePickers()[`${rowIndex}-${field}`] || false;
  }

  setL4DatePickerOpen(rowIndex: number, field: 'start' | 'end', open: boolean): void {
    const current = { ...this.l4DatePickers() };
    current[`${rowIndex}-${field}`] = open;
    this.l4DatePickers.set(current);
  }

  getSPCDatePickerOpen(rowIndex: number, field: 'start' | 'end'): boolean {
    return this.spcDatePickers()[`${rowIndex}-${field}`] || false;
  }

  setSPCDatePickerOpen(rowIndex: number, field: 'start' | 'end', open: boolean): void {
    const current = { ...this.spcDatePickers() };
    current[`${rowIndex}-${field}`] = open;
    this.spcDatePickers.set(current);
  }

  // Handle SPC date edits
  handleSPCDateEdit(rowIndex: number, field: 'start' | 'end', value: string): void {
    const newData = [...this.spcData()];
    newData[rowIndex][field] = value;
    this.spcData.set(newData);
    this.setSPCDatePickerOpen(rowIndex, field, false);
    
    // Track changed values for highlighting
    const changeKey = `spc-${rowIndex}-${field}`;
    const newChangedValues = { ...this.changedValues() };
    if (value !== this.originalSPCData()[rowIndex]?.[field]) {
      newChangedValues[changeKey] = true;
    } else {
      delete newChangedValues[changeKey];
    }
    this.changedValues.set(newChangedValues);
    
    this.hasUnsavedChanges.set(true);
  }

  // Additional utility methods for enhanced functionality
  private markAsChanged(): void {
    this.hasUnsavedChanges.set(this.checkForUnsavedChanges());
  }

  // Enhanced error handling for date operations
  private validateDateRange(startDate: string, endDate: string): boolean {
    try {
      const start = parseProjectDate(startDate);
      const end = parseProjectDate(endDate);
      return start <= end;
    } catch {
      return false;
    }
  }

  // Performance optimization for large datasets
  private shouldUpdateCalculations(): boolean {
    return !!(this.selectedLocation() && this.selectedProject() && this.selectedMLFFilter());
  }

  // Missing methods for activity functionality
  getActivityDescription(activityCode: string): string {
    // Get description from activitySpreadData to match React implementation
    const activity = this.activitySpreadData().find(a => a.activityCode === activityCode);
    return activity?.description || 'Activity Description';
  }

  trackByActivity(index: number, activity: string): string {
    return activity;
  }

  removeActivitySelection(craftKey: string, activity: string): void {
    const current = { ...this.selectedActivities() };
    if (current[craftKey]) {
      current[craftKey] = current[craftKey].filter(a => a !== activity);
    }
    this.selectedActivities.set(current);
  }

  // Missing methods for activity dropdown functionality
  activitySearchTerm = '';

  toggleActivityDropdown(craftKey: string): void {
    const current = { ...this.openActivitySelects() };
    current[craftKey] = !current[craftKey];
    this.openActivitySelects.set(current);
  }

  closeActivityDropdown(craftKey: string): void {
    const current = { ...this.openActivitySelects() };
    current[craftKey] = false;
    this.openActivitySelects.set(current);
  }

  getFilteredAvailableActivities(): string[] {
    const activities = this.getAvailableActivities();
    if (!this.activitySearchTerm) {
      return activities;
    }
    return activities.filter(activity => 
      activity.toLowerCase().includes(this.activitySearchTerm.toLowerCase())
    );
  }
}