import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Calendar,
  Filter,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Edit2,
  Check,
  X,
  ChevronsUpDown,
  CalendarIcon,
  RotateCcw
} from 'lucide-angular';
import { CardComponent } from '../ui/card.component';
import { ButtonComponent } from '../ui/button.component';
import { InputComponent } from '../ui/input.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { BadgeComponent, BadgeVariant } from '../ui/badge.component';
import { LabelComponent } from '../ui/label.component';
import { SwitchComponent } from '../ui/switch.component';
import { CheckboxComponent } from '../ui/checkbox.component';
import { PopoverComponent } from '../ui/popover.component';
import { CommandComponent } from '../ui/command.component';

// Interfaces matching React version
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

interface WeeklyDate {
  display: string;
  fullDate: Date;
}

interface CraftData {
  craftName: string;
  weeklyData: number[];
}

@Component({
  selector: 'app-monthly-forecast',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    BadgeComponent,
    LabelComponent,
    SwitchComponent,
    CheckboxComponent,
    PopoverComponent,
    CommandComponent
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
                [options]="locationOptions"
                [(ngModel)]="selectedLocation"
                placeholder="Choose location..."
              ></ui-select>
            </div>

            <!-- Project Selection with Search -->
            <div class="space-y-2 flex-1 min-w-80">
              <label class="text-sm font-medium text-gray-700">Select Project</label>
              <div class="relative">
                <ui-button 
                  variant="outline" 
                  class="w-full justify-between"
                  [rightIcon]="ChevronsUpDown"
                  (click)="toggleProjectSelect()"
                >
                  {{ selectedProject ? getProjectLabel(selectedProject) : 'Search and select project...' }}
                </ui-button>
                
                <!-- Project Dropdown -->
                <div *ngIf="openProjectSelect" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div class="p-2">
                    <input
                      type="text"
                      [(ngModel)]="projectSearchTerm"
                      placeholder="Search projects..."
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div class="max-h-60 overflow-auto">
                    <div *ngIf="filteredProjects.length === 0" class="px-3 py-2 text-sm text-gray-500">
                      No project found.
                    </div>
                    <div *ngFor="let project of filteredProjects" 
                         class="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                         (click)="selectProject(project.value)">
                      <lucide-icon 
                        [name]="Check" 
                        size="16" 
                        class="mr-2"
                        [class.opacity-100]="selectedProject === project.value"
                        [class.opacity-0]="selectedProject !== project.value"
                      ></lucide-icon>
                      {{ project.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- MLF Filter Selection -->
            <div class="space-y-2 max-w-48 ml-auto">
              <label class="text-sm font-medium text-gray-700">Select MLF Filter</label>
              <ui-select 
                [options]="mlfFilterOptions"
                [(ngModel)]="selectedMLFFilter"
                placeholder="Choose MLF filter..."
              ></ui-select>
            </div>
          </div>

          <!-- Additional Filters - Only show when MLF Filter is selected -->
          <div *ngIf="selectedMLFFilter" class="border-t border-gray-200 pt-3">
            <div class="flex flex-wrap gap-3 items-end">
              <!-- Craft Multi-select -->
              <div class="space-y-2 flex-1 min-w-64">
                <label class="text-sm font-medium text-gray-700">Filter by Craft</label>
                <div class="relative">
                  <ui-button 
                    variant="outline" 
                    class="w-full justify-between"
                    [rightIcon]="ChevronDown"
                    (click)="toggleCraftSelect()"
                  >
                    {{ selectedCrafts.length > 0 ? selectedCrafts.length + ' crafts selected' : 'Select crafts...' }}
                  </ui-button>
                  
                  <!-- Craft Dropdown -->
                  <div *ngIf="openCraftSelect" class="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div class="p-2">
                      <input
                        type="text"
                        [(ngModel)]="craftSearchTerm"
                        placeholder="Search crafts..."
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div class="max-h-60 overflow-auto">
                      <div *ngIf="filteredCrafts.length === 0" class="px-3 py-2 text-sm text-gray-500">
                        No craft found.
                      </div>
                      <div class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                           (click)="clearAllCrafts()">
                        Clear All
                      </div>
                      <div *ngFor="let craft of filteredCrafts" 
                           class="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                           (click)="toggleCraftSelection(craft)">
                        <div class="w-4 h-4 border border-blue-600 rounded-sm flex items-center justify-center mr-2"
                             [class.bg-blue-600]="selectedCrafts.includes(craft)"
                             [class.bg-white]="!selectedCrafts.includes(craft)">
                          <lucide-icon 
                            *ngIf="selectedCrafts.includes(craft)"
                            [name]="Check" 
                            size="12" 
                            class="text-white"
                          ></lucide-icon>
                        </div>
                        {{ craft }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Show Negative Variance Only Toggle -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Show Negative Variance Only</label>
                <div class="flex items-center space-x-2">
                  <ui-switch 
                    [(ngModel)]="showNegativeOnly"
                    id="negative-only"
                  ></ui-switch>
                  <label for="negative-only" class="text-sm text-gray-600">
                    Negative variance only
                  </label>
                </div>
              </div>
            </div>

            <!-- Selected Crafts Display -->
            <div *ngIf="selectedCrafts.length > 0" class="flex items-center gap-2 flex-wrap mt-3">
              <span class="text-sm text-gray-900">Selected Crafts:</span>
              <ui-badge 
                *ngFor="let craft of selectedCrafts" 
                variant="secondary" 
                [rightIcon]="X"
                class="cursor-pointer"
                (clicked)="removeCraft(craft)"
              >
                {{ craft }}
              </ui-badge>
            </div>

            <!-- Active Filters Summary -->
            <div *ngIf="selectedCrafts.length > 0 || showNegativeOnly" 
                 class="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-3">
              <div class="flex items-center gap-2 text-sm text-blue-800">
                <span class="font-medium">Active Filters:</span>
                <ui-badge *ngIf="selectedCrafts.length > 0" variant="outline">
                  {{ selectedCrafts.length }} Crafts Selected
                </ui-badge>
                <ui-badge *ngIf="showNegativeOnly" variant="outline">
                  Negative Variance Only
                </ui-badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div *ngIf="selectedLocation && selectedProject && selectedMLFFilter; else noSelection">
          <!-- Custom Material Design Tabs -->
          <div class="border-b border-gray-200 mb-4">
            <div class="flex space-x-6">
              <button
                *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [class]="'pb-3 px-1 text-sm font-medium transition-colors relative ' + 
                  (activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700')"
              >
                {{ tab.name }}
                <div *ngIf="activeTab === tab.id" 
                     class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full">
                </div>
              </button>
            </div>
          </div>
          
          <!-- Tab Content -->
          <div class="space-y-4">
            <!-- P6 Craft Report Tab -->
            <div *ngIf="activeTab === 'original-craft-report'" class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900">P6 Craft Report</h3>
                  <div class="text-sm text-gray-500">
                    {{ filteredCraftData.length > 0 ? 'Showing ' + filteredCraftData.length + ' craft' + (filteredCraftData.length === 1 ? '' : 's') : 'No crafts match current filters' }}
                  </div>
                </div>
                
                <div *ngIf="filteredCraftData.length > 0; else noCraftsFound">
                  <!-- P6 Craft Data Table (Read-only) -->
                  <div class="overflow-x-auto">
                    <table class="min-w-max w-full border-collapse">
                      <thead>
                        <tr class="bg-gray-50 border-b border-gray-200">
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                            Craft Name
                          </th>
                          <th *ngFor="let date of weeklyDates; let index = index" 
                              class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24 border-r border-gray-200">
                            {{ date.display }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let craft of filteredCraftData; let craftIndex = index" class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                            {{ craft.craftName }}
                          </td>
                          <td *ngFor="let value of craft.weeklyData; let weekIndex = index" 
                              class="px-4 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                            {{ value !== 0 ? value : '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <ng-template #noCraftsFound>
                  <div class="bg-gray-50 rounded-lg p-6 text-center">
                    <p class="text-gray-500">
                      No crafts match the current filter criteria. Try adjusting your filters.
                    </p>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- L4 Craft Report Edit Tab -->
            <div *ngIf="activeTab === 'l4-craft-edit'" class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900">L4 (Craft Report Edit)</h3>
                  <div class="flex items-center gap-4">
                    <!-- Date Selection Interface -->
                    <div class="flex items-center gap-2">
                      <label class="text-sm text-gray-600">Select dates:</label>
                      <div class="relative">
                        <ui-button 
                          variant="outline" 
                          class="w-48 justify-between"
                          (click)="toggleDatePicker()"
                        >
                          {{ selectedDates.length > 0 ? selectedDates.length + ' dates selected' : 'Select dates...' }}
                          <lucide-icon [name]="CalendarIcon" size="16" class="ml-2 opacity-50"></lucide-icon>
                        </ui-button>
                        
                        <!-- Date Dropdown -->
                        <div *ngIf="openDatePicker" class="absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                          <div class="p-2">
                            <input
                              type="text"
                              [(ngModel)]="dateSearchTerm"
                              placeholder="Search dates..."
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div class="max-h-60 overflow-auto">
                            <div *ngIf="filteredDates.length === 0" class="px-3 py-2 text-sm text-gray-500">
                              No dates found.
                            </div>
                            <div class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                 (click)="clearAllDates()">
                              Clear All
                            </div>
                            <div class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                 (click)="selectAllDates()">
                              Select All
                            </div>
                            <div *ngFor="let dateObj of filteredDates" 
                                 class="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                 (click)="toggleDateSelection(dateObj.fullDate)">
                              <div class="w-4 h-4 border border-blue-600 rounded-sm flex items-center justify-center mr-2"
                                   [class.bg-blue-600]="isDateSelected(dateObj.fullDate)"
                                   [class.bg-white]="!isDateSelected(dateObj.fullDate)">
                                <lucide-icon 
                                  *ngIf="isDateSelected(dateObj.fullDate)"
                                  [name]="Check" 
                                  size="12" 
                                  class="text-white"
                                ></lucide-icon>
                              </div>
                              {{ dateObj.display }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Dates Display -->
                <div *ngIf="selectedDates.length > 0" class="space-y-2 mb-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm text-gray-900">Selected Dates:</span>
                    <ui-badge 
                      *ngFor="let date of selectedDates" 
                      variant="secondary" 
                      [rightIcon]="X"
                      class="cursor-pointer"
                      (clicked)="removeSelectedDate(date)"
                    >
                      {{ formatDate(date) }}
                    </ui-badge>
                  </div>
                </div>

                <!-- Activity Spread Data -->
                <div *ngFor="let activity of activitySpreadData; let activityIndex = index" 
                     class="border border-gray-200 rounded-lg">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <button 
                          (click)="toggleActivityExpansion(activity.activityCode)"
                          class="p-1 hover:bg-gray-200 rounded"
                        >
                          <lucide-icon 
                            [name]="isActivityExpanded(activity.activityCode) ? ChevronDown : ChevronRight" 
                            size="16"
                          ></lucide-icon>
                        </button>
                        <div>
                          <h3 class="font-medium text-gray-900">{{ activity.activityCode }}</h3>
                          <p class="text-sm text-gray-600">{{ activity.description }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <ui-badge [variant]="getBadgeVariant(activity.attributes)">
                          {{ activity.attributes }}
                        </ui-badge>
                        <span class="text-sm font-medium text-gray-700">
                          Total: {{ getTotalHours(activity.hours) }}h
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Weekly Hours Grid -->
                  <div class="p-4">
                    <div class="overflow-x-auto">
                      <table class="min-w-full">
                        <thead>
                          <tr class="border-b border-gray-200">
                            <th class="text-left py-2 px-3 text-sm font-medium text-gray-700">Week</th>
                            <th *ngFor="let week of weeklyDates; let i = index" 
                                class="text-center py-2 px-3 text-sm font-medium text-gray-700">
                              {{ week.display }}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="py-2 px-3 text-sm font-medium text-gray-900">Hours</td>
                            <td *ngFor="let hour of activity.hours; let i = index" 
                                class="text-center py-2 px-3">
                              <div class="w-16 mx-auto">
                                <input
                                  type="number"
                                  [value]="hour"
                                  (input)="updateActivityHour(activityIndex, i, $event)"
                                  class="w-full h-8 text-center text-xs rounded px-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Expanded L4 Activities -->
                  <div *ngIf="isActivityExpanded(activity.activityCode)" class="border-t border-gray-200">
                    <div class="bg-blue-50 px-4 py-2">
                      <h4 class="text-sm font-medium text-blue-900">L4 Activities</h4>
                    </div>
                    <div class="p-4">
                      <div *ngFor="let l4Activity of getL4ActivitiesForCode(activity.activityCode)" 
                           class="mb-4 border border-gray-200 rounded-lg">
                        <div class="bg-gray-50 px-3 py-2 border-b border-gray-200">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                              <span class="text-sm font-medium">{{ l4Activity.jobNumber }}</span>
                              <span class="text-sm text-gray-600">{{ l4Activity.spcCode }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                              <span>{{ l4Activity.start }} - {{ l4Activity.end }}</span>
                              <span class="font-medium">{{ l4Activity.hours }}h</span>
                            </div>
                          </div>
                        </div>
                        <div class="p-3">
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <tbody>
                                <tr>
                                  <td class="py-1 px-2 text-sm font-medium text-gray-700 w-20">Hours</td>
                                  <td *ngFor="let hour of l4Activity.weekly; let i = index" 
                                      class="text-center py-1 px-2">
                                    <div class="w-12 mx-auto">
                                      <input
                                        type="number"
                                        [value]="hour"
                                        (input)="updateL4Hour(l4Activity, i, $event)"
                                        class="w-full h-6 text-center text-xs rounded px-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div class="mt-2">
                            <label class="text-xs text-gray-600">Comment:</label>
                            <input
                              type="text"
                              [value]="l4Activity.comment"
                              (input)="updateL4Comment(l4Activity, $event)"
                              class="w-full mt-1 text-xs rounded px-2 py-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              placeholder="Add comment..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Selection State -->
        <ng-template #noSelection>
          <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <lucide-icon [name]="AlertTriangle" size="48" class="mx-auto text-gray-400 mb-4"></lucide-icon>
            <p class="text-gray-500">
              Please select all required filters (Location, Project, and MLF Filter) to view the forecast data.
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class MonthlyForecastComponent implements OnInit {
  // Icons
  Calendar = Calendar;
  Filter = Filter;
  Calculator = Calculator;
  TrendingUp = TrendingUp;
  AlertTriangle = AlertTriangle;
  Save = Save;
  RefreshCw = RefreshCw;
  Download = Download;
  Upload = Upload;
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;
  Edit2 = Edit2;
  Check = Check;
  X = X;
  ChevronsUpDown = ChevronsUpDown;
  CalendarIcon = CalendarIcon;
  RotateCcw = RotateCcw;

  // State - NO AUTO SELECTION like React
  selectedLocation = '';
  selectedProject = '';
  selectedMLFFilter = '';
  selectedCrafts: string[] = [];
  showNegativeOnly = false;
  activeTab = 'original-craft-report'; // Start with P6 tab like React
  expandedActivities = new Set<string>();
  selectedDates: Date[] = [];

  // Dropdown states
  openProjectSelect = false;
  openCraftSelect = false;
  openDatePicker = false;

  // Search terms
  projectSearchTerm = '';
  craftSearchTerm = '';
  dateSearchTerm = '';

  // Data matching React exactly
  activitySpreadData: ActivitySpread[] = [
    { activityCode: 'STR-001', description: 'Structural Steel Installation', attributes: 'Critical Path', hours: [40, 45, 38, 42, 48, 35, 40, 44, 39, 41] },
    { activityCode: 'PIP-001', description: 'Piping System Assembly', attributes: 'High Priority', hours: [32, 28, 35, 40, 33, 38, 42, 30, 36, 34] },
    { activityCode: 'ELE-001', description: 'Electrical Installation', attributes: 'Standard', hours: [24, 26, 22, 28, 25, 30, 27, 24, 29, 23] },
    { activityCode: 'EQP-001', description: 'Equipment Positioning', attributes: 'Resource Heavy', hours: [16, 18, 20, 15, 22, 19, 17, 21, 18, 16] },
    { activityCode: 'INS-001', description: 'Instrumentation Work', attributes: 'Precision Required', hours: [12, 14, 13, 16, 15, 11, 14, 13, 15, 12] },
    { activityCode: 'PAI-001', description: 'Painting & Coating', attributes: 'Weather Dependent', hours: [8, 10, 9, 12, 11, 7, 10, 9, 11, 8] },
    { activityCode: 'TES-001', description: 'Testing & Commissioning', attributes: 'Final Phase', hours: [6, 8, 7, 10, 9, 5, 8, 7, 9, 6] },
    { activityCode: 'COM-001', description: 'Commissioning Activities', attributes: 'Quality Critical', hours: [4, 5, 4, 6, 5, 3, 5, 4, 6, 4] }
  ];

  l4Data: L4Activity[] = [
    { jobNumber: 'JOB-001', activityCode: 'STR-001', hours: 160, spcCode: 'SPC-A01', start: '01-Jul-25', end: '15-Aug-25', comment: 'Weather dependent', weekly: [20, 22, 18, 24, 21, 19, 23, 20, 22, 18] },
    { jobNumber: 'JOB-002', activityCode: 'PIP-001', hours: 120, spcCode: 'SPC-B02', start: '08-Jul-25', end: '30-Jul-25', comment: 'Material delay risk', weekly: [15, 18, 16, 20, 17, 14, 19, 16, 18, 15] },
    { jobNumber: 'JOB-003', activityCode: 'ELE-001', hours: 96, spcCode: 'SPC-C03', start: '15-Jul-25', end: '12-Aug-25', comment: 'Standard schedule', weekly: [12, 14, 13, 16, 15, 11, 14, 13, 15, 12] },
    { jobNumber: 'JOB-004', activityCode: 'EQP-001', hours: 80, spcCode: 'SPC-D04', start: '22-Jul-25', end: '19-Aug-25', comment: 'Resource constraint', weekly: [10, 12, 11, 14, 13, 9, 12, 11, 13, 10] },
    { jobNumber: 'JOB-005', activityCode: 'INS-001', hours: 64, spcCode: 'SPC-E05', start: '29-Jul-25', end: '26-Aug-25', comment: 'Quality checkpoints', weekly: [8, 10, 9, 12, 11, 7, 10, 9, 11, 8] },
    { jobNumber: 'JOB-006', activityCode: 'PAI-001', hours: 48, spcCode: 'SPC-F06', start: '05-Aug-25', end: '02-Sep-25', comment: 'Weather dependent', weekly: [6, 8, 7, 10, 9, 5, 8, 7, 9, 6] },
    { jobNumber: 'JOB-007', activityCode: 'TES-001', hours: 40, spcCode: 'SPC-G07', start: '12-Aug-25', end: '09-Sep-25', comment: 'Final testing phase', weekly: [5, 6, 5, 8, 7, 4, 6, 5, 7, 5] },
    { jobNumber: 'JOB-008', activityCode: 'COM-001', hours: 32, spcCode: 'SPC-H08', start: '19-Aug-25', end: '16-Sep-25', comment: 'Commissioning', weekly: [4, 5, 4, 6, 5, 3, 5, 4, 6, 4] }
  ];

  craftData: CraftData[] = [
    { craftName: 'Welder', weeklyData: [45, 52, 38, 42, 48, 35, 40, 44, 39, 41] },
    { craftName: 'Pipefitter', weeklyData: [32, 28, 35, 40, 33, 38, 42, 30, 36, 34] },
    { craftName: 'Electrician', weeklyData: [24, 26, 22, 28, 25, 30, 27, 24, 29, 23] },
    { craftName: 'Millwright', weeklyData: [16, 18, 20, 15, 22, 19, 17, 21, 18, 16] },
    { craftName: 'Instrumentation Tech', weeklyData: [12, 14, 13, 16, 15, 11, 14, 13, 15, 12] },
    { craftName: 'Painter', weeklyData: [8, 10, 9, 12, 11, 7, 10, 9, 11, 8] },
    { craftName: 'Laborer', weeklyData: [6, 8, 7, 10, 9, 5, 8, 7, 9, 6] }
  ];

  // Options matching React exactly
  locationOptions: SelectOption[] = [
    { value: 'bfa', label: 'Brownsville Fabrication' },
    { value: 'jay', label: 'Jacksonville Yard' },
    { value: 'safira', label: 'Safira Facility' },
    { value: 'qfab', label: 'Qatar Fabrication' },
    { value: 'qmw', label: 'Qatar Marine Works' }
  ];

  projectOptions: SelectOption[] = [
    { value: 'project-1', label: 'Project 1' },
    { value: 'project-2', label: 'Project 2' },
    { value: 'project-3', label: 'Project 3' },
    { value: 'project-4', label: 'Project 4' },
    { value: 'project-5', label: 'Project 5' },
    { value: 'project-6', label: 'Project 6' },
    { value: 'project-7', label: 'Project 7' },
    { value: 'project-8', label: 'Project 8' },
    { value: 'project-9', label: 'Project 9' },
    { value: 'project-10', label: 'Project 10' },
    { value: 'project-11', label: 'Project 11' },
    { value: 'project-12', label: 'Project 12' },
    { value: 'project-13', label: 'Project 13' },
    { value: 'project-14', label: 'Project 14' },
    { value: 'project-15', label: 'Project 15' },
    { value: 'project-16', label: 'Project 16' },
    { value: 'project-17', label: 'Project 17' },
    { value: 'project-18', label: 'Project 18' },
    { value: 'project-19', label: 'Project 19' },
    { value: 'project-20', label: 'Project 20' }
  ];

  mlfFilterOptions: SelectOption[] = [
    { value: 'prefab', label: 'Prefab' },
    { value: 'erection', label: 'Erection' },
    { value: 'precom', label: 'Precom' },
    { value: 'huc', label: 'HUC' },
    { value: 'yard', label: 'Yard' },
    { value: 'yard-huc', label: 'Yard + HUC' }
  ];

  craftNames = ['Welder', 'Pipefitter', 'Electrician', 'Millwright', 'Instrumentation Tech', 'Painter', 'Laborer'];

  tabs = [
    { id: 'original-craft-report', name: 'P6 Craft Report' },
    { id: 'l4-craft-edit', name: 'L4 (Craft Report Edit)' }
  ];

  weeklyDates: WeeklyDate[] = [
    { display: '01/Jul', fullDate: new Date('2025-07-01') },
    { display: '08/Jul', fullDate: new Date('2025-07-08') },
    { display: '15/Jul', fullDate: new Date('2025-07-15') },
    { display: '22/Jul', fullDate: new Date('2025-07-22') },
    { display: '29/Jul', fullDate: new Date('2025-07-29') },
    { display: '05/Aug', fullDate: new Date('2025-08-05') },
    { display: '12/Aug', fullDate: new Date('2025-08-12') },
    { display: '19/Aug', fullDate: new Date('2025-08-19') },
    { display: '26/Aug', fullDate: new Date('2025-08-26') },
    { display: '02/Sep', fullDate: new Date('2025-09-02') }
  ];

  ngOnInit() {
    // No auto-selection - start with empty values like React version
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.openProjectSelect = false;
      this.openCraftSelect = false;
      this.openDatePicker = false;
    }
  }

  // Computed properties
  get filteredProjects() {
    return this.projectOptions.filter(project => 
      project.label.toLowerCase().includes(this.projectSearchTerm.toLowerCase())
    );
  }

  get filteredCrafts() {
    return this.craftNames.filter(craft => 
      craft.toLowerCase().includes(this.craftSearchTerm.toLowerCase())
    );
  }

  get filteredDates() {
    return this.weeklyDates.filter(date => 
      date.display.toLowerCase().includes(this.dateSearchTerm.toLowerCase())
    );
  }

  get filteredCraftData() {
    let filtered = this.craftData;
    
    if (this.selectedCrafts.length > 0) {
      filtered = filtered.filter(craft => this.selectedCrafts.includes(craft.craftName));
    }
    
    if (this.showNegativeOnly) {
      filtered = filtered.filter(craft => 
        craft.weeklyData.some(value => value < 0)
      );
    }
    
    return filtered;
  }

  // Project methods
  toggleProjectSelect() {
    this.openProjectSelect = !this.openProjectSelect;
    this.openCraftSelect = false;
    this.openDatePicker = false;
  }

  selectProject(value: string) {
    this.selectedProject = this.selectedProject === value ? '' : value;
    this.openProjectSelect = false;
    this.projectSearchTerm = '';
  }

  getProjectLabel(value: string): string {
    return this.projectOptions.find(p => p.value === value)?.label || '';
  }

  // Craft methods
  toggleCraftSelect() {
    this.openCraftSelect = !this.openCraftSelect;
    this.openProjectSelect = false;
    this.openDatePicker = false;
  }

  toggleCraftSelection(craft: string) {
    const index = this.selectedCrafts.indexOf(craft);
    if (index > -1) {
      this.selectedCrafts.splice(index, 1);
    } else {
      this.selectedCrafts.push(craft);
    }
  }

  clearAllCrafts() {
    this.selectedCrafts = [];
  }

  removeCraft(craft: string) {
    const index = this.selectedCrafts.indexOf(craft);
    if (index > -1) {
      this.selectedCrafts.splice(index, 1);
    }
  }

  // Date methods
  toggleDatePicker() {
    this.openDatePicker = !this.openDatePicker;
    this.openProjectSelect = false;
    this.openCraftSelect = false;
  }

  toggleDateSelection(date: Date) {
    const index = this.selectedDates.findIndex(d => d.getTime() === date.getTime());
    if (index > -1) {
      this.selectedDates.splice(index, 1);
    } else {
      this.selectedDates.push(date);
    }
  }

  isDateSelected(date: Date): boolean {
    return this.selectedDates.some(d => d.getTime() === date.getTime());
  }

  clearAllDates() {
    this.selectedDates = [];
  }

  selectAllDates() {
    this.selectedDates = [...this.weeklyDates.map(d => d.fullDate)];
  }

  removeSelectedDate(date: Date) {
    const index = this.selectedDates.findIndex(d => d.getTime() === date.getTime());
    if (index > -1) {
      this.selectedDates.splice(index, 1);
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  }

  // Activity methods
  toggleActivityExpansion(activityCode: string) {
    if (this.expandedActivities.has(activityCode)) {
      this.expandedActivities.delete(activityCode);
    } else {
      this.expandedActivities.add(activityCode);
    }
  }

  isActivityExpanded(activityCode: string): boolean {
    return this.expandedActivities.has(activityCode);
  }

  getBadgeVariant(attributes: string): BadgeVariant {
    switch (attributes) {
      case 'Critical Path': return 'destructive';
      case 'High Priority': return 'default';
      case 'Resource Heavy': return 'secondary';
      case 'Weather Dependent': return 'outline';
      default: return 'outline';
    }
  }

  getTotalHours(hours: (string | number)[]): number {
    return hours.reduce((sum: number, hour) => {
      const numericValue = typeof hour === 'string' ? parseFloat(hour) || 0 : hour;
      return sum + numericValue;
    }, 0);
  }

  getL4ActivitiesForCode(activityCode: string): L4Activity[] {
    return this.l4Data.filter(activity => activity.activityCode === activityCode);
  }

  updateActivityHour(activityIndex: number, weekIndex: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    this.activitySpreadData[activityIndex].hours[weekIndex] = value;
  }

  updateL4Hour(l4Activity: L4Activity, weekIndex: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    const activityIndex = this.l4Data.findIndex(a => a.jobNumber === l4Activity.jobNumber);
    if (activityIndex !== -1) {
      this.l4Data[activityIndex].weekly[weekIndex] = value;
    }
  }

  updateL4Comment(l4Activity: L4Activity, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const activityIndex = this.l4Data.findIndex(a => a.jobNumber === l4Activity.jobNumber);
    if (activityIndex !== -1) {
      this.l4Data[activityIndex].comment = value;
    }
  }
}