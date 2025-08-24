import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  ChevronDown,
  ChevronRight,
  Search,

  X
} from 'lucide-angular';
import { SelectComponent, SelectOption } from '../../ui/select.component';
import { PopoverComponent } from '../../ui/popover.component';
import { ButtonComponent } from '../../ui/button.component';
import { InputComponent } from '../../ui/input.component';
import { BadgeComponent } from '../../ui/badge.component';
import { DateRangeButtonComponent, DateRange } from '../../ui/date-range-button.component';

interface WeeklyDate {
  full: Date;
  display: string;
}

interface WeeklyData {
  current: number;
  previous: number;
  variance: number;
}

interface ProjectData {
  id: number;
  projectName: string;
  weeklyData: WeeklyData[];
}

interface CraftData {
  name: string;
  current: number;
  previous: number;
  variance: number;
}

interface CraftBreakdown {
  date: string;
  mainCrafts: CraftData[];
  serviceCrafts: CraftData[];
}

interface Totals {
  main: { current: number; previous: number; variance: number };
  service: { current: number; previous: number; variance: number };
  grand: { current: number; previous: number; variance: number };
}

@Component({
  selector: 'app-mlf-variance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectComponent,
    PopoverComponent,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    DateRangeButtonComponent
  ],
  template: `
    <div class="p-8">
      <div class="max-w-full mx-auto space-y-6">
        <!-- Back Button (when used from ForecastApprovals) -->
        <div *ngIf="projectId" class="mb-4">
          <ui-button 
            variant="outline" 
            (clicked)="onBackClick()"
            class="mb-4"
          >
            ← Back to Forecast Approvals
          </ui-button>
          <h2 class="text-xl font-semibold">Project Variance Report - {{ projectId }}</h2>
        </div>

        <!-- Filter Controls -->
        <div class="flex items-center gap-6 flex-wrap">
          <!-- Location Selection -->
          <div class="flex items-center gap-2">
            <label class="text-foreground whitespace-nowrap">Select Location:</label>
            <ui-select 
              [options]="locationOptions"
              [(ngModel)]="selectedLocation"
              placeholder="Choose location"
              class="w-48"
            ></ui-select>
          </div>

          <!-- Search Project -->
          <div class="flex items-center gap-2">
            <label class="text-foreground whitespace-nowrap">Search Project:</label>
            <ui-popover [isOpen]="openProjectSearch" (openChange)="openProjectSearch = $event" contentClass="w-64 p-0">
              <ui-button
                slot="trigger"
                variant="outline"
                role="combobox"
                [attr.aria-expanded]="openProjectSearch"
                class="w-64 justify-start"
                [leftIcon]="Search"
                (clicked)="openProjectSearch = !openProjectSearch"
              >
                {{ searchProject || "Search projects..." }}
              </ui-button>
              <div class="p-2">
                <ui-input placeholder="Search projects..." [(ngModel)]="projectSearchTerm"></ui-input>
              </div>
              <div class="max-h-60 overflow-auto">
                <div 
                  class="px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                  (click)="selectProject('')"
                >
                  Show All Projects
                </div>
                <div 
                  *ngFor="let project of filteredProjects"
                  class="px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                  (click)="selectProject(project)"
                >
                  {{ project }}
                </div>
              </div>
            </ui-popover>
          </div>

          <!-- Craft Breakdown Multi-selection -->
          <div class="flex items-center gap-2">
            <label class="text-foreground whitespace-nowrap">Craft Breakdown:</label>
            <ui-popover [isOpen]="openCraftSelect" (openChange)="openCraftSelect = $event" contentClass="w-64 p-0">
              <ui-button
                slot="trigger"
                variant="outline"
                role="combobox"
                [attr.aria-expanded]="openCraftSelect"
                class="w-64 justify-between"
                [rightIcon]="ChevronDown"
                (clicked)="openCraftSelect = !openCraftSelect"
              >
                {{ selectedCrafts.length > 0 ? selectedCrafts.length + ' crafts selected' : 'Select crafts...' }}
              </ui-button>
              <div class="p-2">
                <ui-input placeholder="Search crafts..." [(ngModel)]="craftSearchTerm"></ui-input>
              </div>
              <div class="max-h-60 overflow-auto">
                <div 
                  class="px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                  (click)="clearAllCrafts()"
                >
                  Clear All
                </div>
                <div 
                  *ngFor="let craft of filteredCraftOptions"
                  class="px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                  (click)="toggleCraftSelection(craft)"
                >
                  <div class="flex items-center space-x-2">
                    <div [class]="'w-4 h-4 border border-primary rounded-sm flex items-center justify-center ' + (selectedCrafts.includes(craft) ? 'bg-primary' : 'bg-white')">
                      <lucide-icon 
                        *ngIf="selectedCrafts.includes(craft)" 
                        [name]="ChevronDown" 
                        class="h-3 w-3 text-primary-foreground">
                      </lucide-icon>
                    </div>
                    <span>{{ craft }}</span>
                  </div>
                </div>
              </div>
            </ui-popover>
          </div>

          <!-- Date Range -->
          <div class="flex items-center gap-2">
            <label class="text-foreground whitespace-nowrap">Date Range:</label>
            <ui-date-range-button
              [dateRange]="dateRange"
              (dateRangeChange)="onDateRangeChange($event)"
            ></ui-date-range-button>
          </div>
        </div>

        <!-- Selected Crafts Display -->
        <div *ngIf="selectedCrafts.length > 0" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-foreground">Selected Crafts:</span>
          <ui-badge 
            *ngFor="let craft of selectedCrafts" 
            variant="secondary" 
            [rightIcon]="X"
            class="gap-1 cursor-pointer hover:opacity-80"
            (clicked)="removeCraft(craft)"
          >
            {{ craft }}
          </ui-badge>
        </div>

        <!-- Active Filters Summary -->
        <div *ngIf="searchProject || selectedCrafts.length > 0 || (dateRange.from && dateRange.to)" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center gap-2 text-sm text-blue-800">
            <span class="font-medium">Active Filters:</span>
            <ui-badge *ngIf="searchProject" variant="outline">Project: {{ searchProject }}</ui-badge>
            <ui-badge *ngIf="selectedCrafts.length > 0" variant="outline">{{ selectedCrafts.length }} Crafts Selected</ui-badge>
            <ui-badge *ngIf="dateRange.from && dateRange.to" variant="outline">
              Date: {{ formatDateShort(dateRange.from) }} - {{ formatDateShort(dateRange.to) }}
            </ui-badge>
          </div>
        </div>

        <!-- Expandable Table -->
        <div *ngIf="selectedLocation; else noLocationSelected" class="space-y-4">
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <!-- Table Header -->
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 class="font-medium text-gray-900">
                Labor Forecast Data for {{ selectedLocation }}
                <span *ngIf="searchProject"> - {{ searchProject }}</span>
                <span *ngIf="filteredWeeklyDates.length < allWeeklyDates.length"> ({{ filteredWeeklyDates.length }} weeks shown)</span>
              </h3>
            </div>

            <!-- Table Content -->
            <div class="overflow-x-auto">
              <div *ngIf="projectDataWithFilteredDates.length > 0; else noProjects">
                <table class="min-w-max w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 sticky left-0 bg-gray-50 z-10">
                        <!-- Expand/Collapse column -->
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48 sticky left-12 bg-gray-50 z-10">
                        Project Name
                      </th>
                      <th 
                        *ngFor="let date of filteredWeeklyDates; let index = index" 
                        class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32"
                      >
                        {{ date.display }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <ng-container *ngFor="let project of projectDataWithFilteredDates">
                      <!-- Main Project Row -->
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                          <button 
                            (click)="toggleRowExpansion(project.id)"
                            class="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <lucide-icon 
                              [name]="expandedRows.has(project.id) ? ChevronDown : ChevronRight" 
                              [size]="16">
                            </lucide-icon>
                          </button>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap sticky left-12 bg-white z-10">
                          <div class="font-medium text-gray-900">{{ project.projectName }}</div>
                        </td>
                        <td 
                          *ngFor="let data of project.weeklyData; let weekIndex = index" 
                          [class]="'px-4 py-4 text-center ' + (data.variance < 0 ? 'bg-red-50' : '')"
                        >
                          <div class="space-y-1">
                            <div class="text-green-600 text-sm">{{ data.current.toLocaleString() }}</div>
                            <div class="text-gray-500 font-medium">{{ data.previous.toLocaleString() }}</div>
                            <div [class]="'text-sm font-medium ' + (data.variance < 0 ? 'text-red-600' : 'text-green-600')">
                              {{ data.variance > 0 ? '+' : '' }}{{ data.variance.toLocaleString() }}
                            </div>
                          </div>
                        </td>
                      </tr>

                      <!-- Expanded Craft Breakdown -->
                      <tr *ngIf="expandedRows.has(project.id)">
                        <td [attr.colspan]="filteredWeeklyDates.length + 2" class="px-0 py-0">
                          <div class="bg-gray-50 border-t border-gray-200">
                            <div class="overflow-x-auto">
                              <table class="min-w-max w-full">
                                <thead>
                                  <tr class="bg-gray-100">
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-48 sticky left-0 bg-gray-100 z-10">
                                      Craft Breakdown
                                      <span *ngIf="selectedCrafts.length > 0" class="text-xs text-blue-600 block">({{ selectedCrafts.length }} selected)</span>
                                    </th>
                                    <th 
                                      *ngFor="let date of filteredWeeklyDates; let index = index" 
                                      class="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-32"
                                    >
                                      {{ date.display }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="bg-gray-50 divide-y divide-gray-200">
                                  <!-- Main Crafts -->
                                  <ng-container *ngFor="let date of filteredWeeklyDates; let weekIndex = index">
                                    <ng-container *ngIf="weekIndex === 0"> <!-- Only show breakdown for first week as example -->
                                      <tr *ngFor="let craft of getFilteredCraftBreakdown(weekIndex).mainCrafts; let craftIndex = index" class="text-sm">
                                        <td class="px-6 py-2 whitespace-nowrap text-gray-900 sticky left-0 bg-gray-50 z-10">
                                          {{ craft.name }}
                                        </td>
                                        <td [class]="'px-4 py-2 text-center ' + (craft.variance < 0 ? 'bg-red-50' : '')">
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ craft.current }}</div>
                                            <div class="text-gray-500 font-medium">{{ craft.previous }}</div>
                                            <div [class]="'text-xs ' + (craft.variance < 0 ? 'text-red-600' : craft.variance === 0 ? 'text-gray-500' : 'text-green-600')">
                                              {{ craft.variance > 0 ? '+' : '' }}{{ craft.variance }}
                                            </div>
                                          </div>
                                        </td>
                                        <td 
                                          *ngFor="let otherDate of filteredWeeklyDates.slice(1); let otherWeekIndex = index" 
                                          [class]="'px-4 py-2 text-center ' + (craft.variance < 0 ? 'bg-red-50' : '')"
                                        >
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ craft.current + (otherWeekIndex + 1) * 2 }}</div>
                                            <div class="text-gray-500 font-medium">{{ craft.previous + (otherWeekIndex + 1) * 2 }}</div>
                                            <div [class]="'text-xs ' + (craft.variance < 0 ? 'text-red-600' : craft.variance === 0 ? 'text-gray-500' : 'text-green-600')">
                                              {{ craft.variance > 0 ? '+' : '' }}{{ craft.variance }}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                      
                                      <!-- Total - Main -->
                                      <tr *ngIf="getFilteredCraftBreakdown(weekIndex).mainCrafts.length > 0" class="font-bold text-sm bg-gray-100">
                                        <td class="px-6 py-2 whitespace-nowrap text-gray-900 sticky left-0 bg-gray-100 z-10">
                                          Total - Main
                                        </td>
                                        <td [class]="'px-4 py-2 text-center ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance < 0 ? 'bg-red-100' : 'bg-gray-100')">
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.current }}</div>
                                            <div class="text-gray-500 font-medium">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.previous }}</div>
                                            <div [class]="'text-xs ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance < 0 ? 'text-red-600' : 'text-green-600')">
                                              {{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance > 0 ? '+' : '' }}{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance }}
                                            </div>
                                          </div>
                                        </td>
                                        <td 
                                          *ngFor="let otherDate of filteredWeeklyDates.slice(1); let otherWeekIndex = index" 
                                          [class]="'px-4 py-2 text-center ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance < 0 ? 'bg-red-100' : 'bg-gray-100')"
                                        >
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.current + (otherWeekIndex + 1) * 50 }}</div>
                                            <div class="text-gray-500 font-medium">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.previous + (otherWeekIndex + 1) * 50 }}</div>
                                            <div [class]="'text-xs ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance < 0 ? 'text-red-600' : 'text-green-600')">
                                              {{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance > 0 ? '+' : '' }}{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).main.variance }}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>

                                      <!-- Service Crafts -->
                                      <tr *ngFor="let craft of getFilteredCraftBreakdown(weekIndex).serviceCrafts; let craftIndex = index" class="text-sm">
                                        <td class="px-6 py-2 whitespace-nowrap text-gray-900 sticky left-0 bg-gray-50 z-10">
                                          {{ craft.name }}
                                        </td>
                                        <td [class]="'px-4 py-2 text-center ' + (craft.variance < 0 ? 'bg-red-50' : '')">
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ craft.current }}</div>
                                            <div class="text-gray-500 font-medium">{{ craft.previous }}</div>
                                            <div [class]="'text-xs ' + (craft.variance < 0 ? 'text-red-600' : craft.variance === 0 ? 'text-gray-500' : 'text-green-600')">
                                              {{ craft.variance > 0 ? '+' : '' }}{{ craft.variance }}
                                            </div>
                                          </div>
                                        </td>
                                        <td 
                                          *ngFor="let otherDate of filteredWeeklyDates.slice(1); let otherWeekIndex = index" 
                                          [class]="'px-4 py-2 text-center ' + (getWeekVariance(craft.variance, otherWeekIndex) < 0 ? 'bg-red-50' : '')"
                                        >
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ craft.current + (otherWeekIndex + 1) * 3 }}</div>
                                            <div class="text-gray-500 font-medium">{{ craft.previous + (otherWeekIndex + 1) * 3 }}</div>
                                            <div [class]="'text-xs ' + (getWeekVariance(craft.variance, otherWeekIndex) < 0 ? 'text-red-600' : getWeekVariance(craft.variance, otherWeekIndex) === 0 ? 'text-gray-500' : 'text-green-600')">
                                              {{ getWeekVariance(craft.variance, otherWeekIndex) > 0 ? '+' : '' }}{{ getWeekVariance(craft.variance, otherWeekIndex) }}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>

                                      <!-- Total - Services -->
                                      <tr *ngIf="getFilteredCraftBreakdown(weekIndex).serviceCrafts.length > 0" class="font-bold text-sm bg-gray-100">
                                        <td class="px-6 py-2 whitespace-nowrap text-gray-900 sticky left-0 bg-gray-100 z-10">
                                          Total - Services
                                        </td>
                                        <td [class]="'px-4 py-2 text-center ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance < 0 ? 'bg-red-100' : 'bg-gray-100')">
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.current }}</div>
                                            <div class="text-gray-500 font-medium">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.previous }}</div>
                                            <div [class]="'text-xs ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance < 0 ? 'text-red-600' : 'text-green-600')">
                                              {{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance > 0 ? '+' : '' }}{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance }}
                                            </div>
                                          </div>
                                        </td>
                                        <td 
                                          *ngFor="let otherDate of filteredWeeklyDates.slice(1); let otherWeekIndex = index" 
                                          [class]="'px-4 py-2 text-center ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance < 0 ? 'bg-red-100' : 'bg-gray-100')"
                                        >
                                          <div class="space-y-1">
                                            <div class="text-green-600 text-xs">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.current + (otherWeekIndex + 1) * 20 }}</div>
                                            <div class="text-gray-500 font-medium">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.previous + (otherWeekIndex + 1) * 20 }}</div>
                                            <div [class]="'text-xs ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance < 0 ? 'text-red-600' : 'text-green-600')">
                                              {{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance > 0 ? '+' : '' }}{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).service.variance }}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>

                                      <!-- GRAND TOTAL -->
                                      <tr *ngIf="getFilteredCraftBreakdown(weekIndex).mainCrafts.length > 0 || getFilteredCraftBreakdown(weekIndex).serviceCrafts.length > 0" class="font-bold text-base bg-blue-50 border-t-2 border-blue-200">
                                        <td class="px-6 py-3 whitespace-nowrap text-blue-900 sticky left-0 bg-blue-50 z-10">
                                          GRAND TOTAL
                                        </td>
                                        <td [class]="'px-4 py-3 text-center ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance < 0 ? 'bg-red-100' : 'bg-blue-50')">
                                          <div class="space-y-1">
                                            <div class="text-blue-600 text-xs">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.current }}</div>
                                            <div class="text-gray-600 font-medium">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.previous }}</div>
                                            <div [class]="'text-sm ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance < 0 ? 'text-red-600' : 'text-blue-600')">
                                              {{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance > 0 ? '+' : '' }}{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance }}
                                            </div>
                                          </div>
                                        </td>
                                        <td 
                                          *ngFor="let otherDate of filteredWeeklyDates.slice(1); let otherWeekIndex = index" 
                                          [class]="'px-4 py-3 text-center ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance < 0 ? 'bg-red-100' : 'bg-blue-50')"
                                        >
                                          <div class="space-y-1">
                                            <div class="text-blue-600 text-xs">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.current + (otherWeekIndex + 1) * 70 }}</div>
                                            <div class="text-gray-600 font-medium">{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.previous + (otherWeekIndex + 1) * 70 }}</div>
                                            <div [class]="'text-sm ' + (calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance < 0 ? 'text-red-600' : 'text-blue-600')">
                                              {{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance > 0 ? '+' : '' }}{{ calculateTotals(getFilteredCraftBreakdown(weekIndex).mainCrafts, getFilteredCraftBreakdown(weekIndex).serviceCrafts).grand.variance }}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </ng-container>
                                  </ng-container>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </ng-container>
                  </tbody>
                </table>
              </div>
              <ng-template #noProjects>
                <div class="p-8 text-center text-gray-500">
                  <p>No projects match the current filter criteria.</p>
                  <p class="text-sm mt-2">Try adjusting your search filters.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
        <ng-template #noLocationSelected>
          <div class="bg-gray-50 rounded-lg p-8 text-center">
            <p class="text-gray-500">Please select a location to view the labor forecast data.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class MLFVarianceReportComponent implements OnInit {
  // Inputs and Outputs for integration with ForecastApprovals
  @Input() projectId?: string;
  @Output() backClicked = new EventEmitter<void>();

  // Icon references for template
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;
  Search = Search;
  X = X;

  // State variables - exactly matching React
  selectedLocation: string = '';
  searchProject: string = '';
  selectedCrafts: string[] = [];
  dateRange: DateRange = {
    from: undefined,
    to: undefined
  };
  expandedRows: Set<number> = new Set();
  openProjectSearch: boolean = false;
  openCraftSelect: boolean = false;

  // Search terms for filtering
  projectSearchTerm: string = '';
  craftSearchTerm: string = '';

  // Data arrays - exactly matching React
  locations: string[] = [
    'Location A',
    'Location B', 
    'Location C',
    'Location D'
  ];

  projects: string[] = [
    'Project Alpha',
    'Project Beta',
    'Project Gamma',
    'Project Delta',
    'Project Epsilon',
    'Project Zeta',
    'Project Theta'
  ];

  craftOptions: string[] = [
    'Str. Fitters',
    'Str. Welders',
    'Mech Fitters',
    'Pipe Fitters',
    'Pipe Welders',
    'Electrical Fitters',
    'Electrical Tech.',
    'Instrument Fitters',
    'Instrument Tech.',
    'Painters',
    'Riggers',
    'QA/QC',
    'Scaffolding'
  ];

  // All craft data - exactly matching React
  allCraftData: CraftData[] = [
    { name: 'Str. Fitters', current: 300, previous: 315, variance: -15 },
    { name: 'Str. Welders', current: 399, previous: 380, variance: 19 },
    { name: 'Mech Fitters', current: 39, previous: 44, variance: -5 },
    { name: 'Pipe Fitters', current: 223, previous: 210, variance: 13 },
    { name: 'Pipe Welders', current: 85, previous: 92, variance: -7 },
    { name: 'Electrical Fitters', current: 238, previous: 225, variance: 13 },
    { name: 'Electrical Tech.', current: 86, previous: 82, variance: 4 },
    { name: 'Instrument Fitters', current: 27, previous: 31, variance: -4 },
    { name: 'Instrument Tech.', current: 43, previous: 40, variance: 3 },
    { name: 'Painters', current: 377, previous: 395, variance: -18 },
    { name: 'Rolling Ops (Max 8)', current: 8, previous: 8, variance: 0 },
    { name: 'Rolling - Welders', current: 0, previous: 3, variance: -3 },
    { name: 'Rev Orders', current: 0, previous: 0, variance: 0 },
    { name: 'Spare - Main', current: 145, previous: 140, variance: 5 }
  ];

  serviceCraftData: CraftData[] = [
    { name: 'Riggers (Incl. Operators)', current: 150, previous: 162, variance: -12 },
    { name: 'QA/QC', current: 62, previous: 60, variance: 2 },
    { name: "Mat'l. Handl'g.", current: 68, previous: 75, variance: -7 },
    { name: 'Scaffolding', current: 364, previous: 350, variance: 14 },
    { name: 'Facility Craft - Services', current: 0, previous: 5, variance: -5 }
  ];

  // Generated data
  allWeeklyDates: WeeklyDate[] = [];
  allProjectData: ProjectData[] = [];



  ngOnInit(): void {
    this.allWeeklyDates = this.generateWeeklyDates();
    this.allProjectData = this.generateProjectData();
  }

  // Generate 15 weeks of Thursday dates starting from July 3, 2025 - exactly matching React
  generateWeeklyDates(): WeeklyDate[] {
    const dates: WeeklyDate[] = [];
    const startDate = new Date('2025-07-03'); // Thursday, July 3, 2025
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (i * 7));
      dates.push({
        full: date,
        display: `${date.getDate()}-${date.toLocaleDateString('en-US', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`
      });
    }
    return dates;
  }

  // Generate project data - exactly matching React
  generateProjectData(): ProjectData[] {
    return [
      {
        id: 1,
        projectName: 'Project Alpha',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 3 === 0 ? -(50 + (index * 10)) : 100 + (index * 5);
          const current = 1000 + (index * 50);
          const previous = current - variance;
          return { current, previous, variance };
        })
      },
      {
        id: 2,
        projectName: 'Project Beta',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 4 === 1 ? -(75 + (index * 8)) : 120 + (index * 6);
          const current = 1200 + (index * 60);
          const previous = current - variance;
          return { current, previous, variance };
        })
      },
      {
        id: 3,
        projectName: 'Project Gamma',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 5 === 2 ? -(45 + (index * 12)) : 85 + (index * 4);
          const current = 950 + (index * 40);
          const previous = current - variance;
          return { current, previous, variance };
        })
      },
      {
        id: 4,
        projectName: 'Project Delta',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 3 === 1 ? -(90 + (index * 15)) : 110 + (index * 7);
          const current = 1350 + (index * 70);
          const previous = current - variance;
          return { current, previous, variance };
        })
      },
      {
        id: 5,
        projectName: 'Project Epsilon',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 4 === 2 ? -(65 + (index * 9)) : 95 + (index * 3);
          const current = 1100 + (index * 45);
          const previous = current - variance;
          return { current, previous, variance };
        })
      },
      {
        id: 6,
        projectName: 'Project Zeta',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 6 === 1 ? -(55 + (index * 11)) : 105 + (index * 8);
          const current = 1250 + (index * 55);
          const previous = current - variance;
          return { current, previous, variance };
        })
      },
      {
        id: 7,
        projectName: 'Project Theta',
        weeklyData: this.allWeeklyDates.map((_, index) => {
          const variance = index % 5 === 3 ? -(40 + (index * 7)) : 80 + (index * 6);
          const current = 900 + (index * 35);
          const previous = current - variance;
          return { current, previous, variance };
        })
      }
    ];
  }

  // Computed properties - exactly matching React useMemo
  get locationOptions(): SelectOption[] {
    return this.locations.map(location => ({ value: location, label: location }));
  }

  get filteredProjects(): string[] {
    if (!this.projectSearchTerm) return this.projects;
    return this.projects.filter(project => 
      project.toLowerCase().includes(this.projectSearchTerm.toLowerCase())
    );
  }

  get filteredCraftOptions(): string[] {
    if (!this.craftSearchTerm) return this.craftOptions;
    return this.craftOptions.filter(craft => 
      craft.toLowerCase().includes(this.craftSearchTerm.toLowerCase())
    );
  }

  get filteredWeeklyDates(): WeeklyDate[] {
    if (!this.dateRange.from || !this.dateRange.to) {
      return this.allWeeklyDates;
    }
    
    return this.allWeeklyDates.filter(date => {
      return date.full >= this.dateRange.from! && date.full <= this.dateRange.to!;
    });
  }

  get filteredProjectData(): ProjectData[] {
    if (!this.searchProject) {
      return this.allProjectData;
    }
    return this.allProjectData.filter(project => project.projectName === this.searchProject);
  }

  get projectDataWithFilteredDates(): ProjectData[] {
    return this.filteredProjectData.map(project => ({
      ...project,
      weeklyData: project.weeklyData.filter((_, index) => {
        const dateAtIndex = this.allWeeklyDates[index];
        if (!this.dateRange.from || !this.dateRange.to) {
          return true;
        }
        return dateAtIndex.full >= this.dateRange.from && dateAtIndex.full <= this.dateRange.to;
      })
    }));
  }

  // Methods - exactly matching React functions
  selectProject(project: string): void {
    this.searchProject = project === this.searchProject ? '' : project;
    this.openProjectSearch = false;
  }

  toggleCraftSelection(craft: string): void {
    if (this.selectedCrafts.includes(craft)) {
      this.selectedCrafts = this.selectedCrafts.filter(c => c !== craft);
    } else {
      this.selectedCrafts = [...this.selectedCrafts, craft];
    }
  }

  clearAllCrafts(): void {
    this.selectedCrafts = [];
  }

  removeCraft(craft: string): void {
    this.selectedCrafts = this.selectedCrafts.filter(c => c !== craft);
  }

  toggleRowExpansion(rowId: number): void {
    const newExpanded = new Set(this.expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    this.expandedRows = newExpanded;
  }

  // Filter crafts based on selection - exactly matching React
  getFilteredCraftBreakdown(weekIndex: number): CraftBreakdown {
    const baseDate = this.filteredWeeklyDates[weekIndex];
    let mainCrafts = this.allCraftData;
    let serviceCrafts = this.serviceCraftData;
    
    // Filter main crafts if specific crafts are selected
    if (this.selectedCrafts.length > 0) {
      mainCrafts = this.allCraftData.filter(craft => this.selectedCrafts.includes(craft.name));
      serviceCrafts = this.serviceCraftData.filter(craft => this.selectedCrafts.includes(craft.name));
    }
    
    return {
      date: baseDate?.display || '',
      mainCrafts,
      serviceCrafts
    };
  }

  // Calculate totals - exactly matching React
  calculateTotals(mainCrafts: CraftData[], serviceCrafts: CraftData[]): Totals {
    const mainTotal = mainCrafts.reduce((sum, craft) => sum + craft.current, 0);
    const mainTotalPrev = mainCrafts.reduce((sum, craft) => sum + craft.previous, 0);
    const mainTotalVar = mainCrafts.reduce((sum, craft) => sum + craft.variance, 0);

    const serviceTotal = serviceCrafts.reduce((sum, craft) => sum + craft.current, 0);
    const serviceTotalPrev = serviceCrafts.reduce((sum, craft) => sum + craft.previous, 0);
    const serviceTotalVar = serviceCrafts.reduce((sum, craft) => sum + craft.variance, 0);

    const grandTotal = mainTotal + serviceTotal;
    const grandTotalPrev = mainTotalPrev + serviceTotalPrev;
    const grandTotalVar = mainTotalVar + serviceTotalVar;

    return {
      main: { current: mainTotal, previous: mainTotalPrev, variance: mainTotalVar },
      service: { current: serviceTotal, previous: serviceTotalPrev, variance: serviceTotalVar },
      grand: { current: grandTotal, previous: grandTotalPrev, variance: grandTotalVar }
    };
  }

  // Get week variance for service crafts - exactly matching React
  getWeekVariance(baseVariance: number, weekIndex: number): number {
    return baseVariance + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
  }

  // Date handling methods
  onDateRangeChange(range: DateRange): void {
    this.dateRange = range;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatDateShort(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Back button handler
  onBackClick(): void {
    this.backClicked.emit();
  }
}