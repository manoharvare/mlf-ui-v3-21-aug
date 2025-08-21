import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronUp, ChevronDown, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, LucideIconData } from 'lucide-angular';
import { InputComponent } from './input.component';
import { ButtonComponent } from './button.component';
import { SelectComponent, SelectOption } from './select.component';
import { CheckboxComponent } from './checkbox.component';
import { DropdownComponent, DropdownItem } from './dropdown.component';
import { BadgeComponent } from './badge.component';
import { SpinnerComponent } from './spinner.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'actions';
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
  badge?: {
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
    getValue: (value: any) => string;
  };
}

export interface TableAction {
  id: string;
  label: string;
  icon?: LucideIconData;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  disabled?: (row: any) => boolean;
  visible?: (row: any) => boolean;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: number[];
}

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    InputComponent, 
    ButtonComponent, 
    SelectComponent, 
    CheckboxComponent, 
    DropdownComponent, 
    BadgeComponent,
    SpinnerComponent
  ],
  template: `
    <div class="w-full space-y-4">
      <!-- Table Header with Search and Filters -->
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <!-- Global Search -->
          <div *ngIf="searchable" class="relative">
            <ui-input
              [(ngModel)]="searchTerm"
              placeholder="Search..."
              [leftIcon]="Search"
              (ngModelChange)="onSearch($event)"
              class="w-64"
            ></ui-input>
          </div>
          
          <!-- Column Filters -->
          <div *ngIf="showFilters" class="flex gap-2">
            <ui-button
              variant="outline"
              size="sm"
              [leftIcon]="Filter"
              (clicked)="toggleFilters()"
            >
              Filters
            </ui-button>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-2">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      
      <!-- Filter Row -->
      <div *ngIf="showFilters && filtersVisible" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div *ngFor="let column of filterableColumns">
          <label class="text-sm font-medium text-foreground mb-1 block">{{ column.label }}</label>
          <ui-input
            [(ngModel)]="filters[column.key]"
            [placeholder]="'Filter by ' + column.label.toLowerCase()"
            (ngModelChange)="onFilterChange()"
            size="sm"
          ></ui-input>
        </div>
        <div class="flex items-end">
          <ui-button variant="outline" size="sm" (clicked)="clearFilters()">
            Clear Filters
          </ui-button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-8">
        <ui-spinner size="lg" label="Loading data..."></ui-spinner>
      </div>
      
      <!-- Table -->
      <div *ngIf="!loading" class="border border-border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <!-- Table Header -->
            <thead class="bg-muted/50">
              <tr>
                <!-- Selection Column -->
                <th *ngIf="selectable" class="w-12 px-4 py-3 text-left">
                  <ui-checkbox
                    [ngModel]="isAllSelected"
                    [indeterminate]="isPartiallySelected"
                    (ngModelChange)="toggleSelectAll($event)"
                  ></ui-checkbox>
                </th>
                
                <!-- Data Columns -->
                <th
                  *ngFor="let column of columns"
                  [class]="getHeaderClasses(column)"
                  [style.width]="column.width"
                  [style.min-width]="column.minWidth"
                >
                  <div class="flex items-center gap-2">
                    <span>{{ column.label }}</span>
                    <button
                      *ngIf="column.sortable"
                      type="button"
                      (click)="onSort(column.key)"
                      class="p-1 hover:bg-accent rounded"
                    >
                      <lucide-icon
                        *ngIf="!isSorted(column.key)"
                        [name]="ChevronUp"
                        [size]="14"
                        class="opacity-50"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="isSorted(column.key) && sortConfig.direction === 'asc'"
                        [name]="ChevronUp"
                        [size]="14"
                        class="text-primary"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="isSorted(column.key) && sortConfig.direction === 'desc'"
                        [name]="ChevronDown"
                        [size]="14"
                        class="text-primary"
                      ></lucide-icon>
                    </button>
                  </div>
                </th>
                
                <!-- Actions Column -->
                <th *ngIf="actions.length > 0" class="w-20 px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            
            <!-- Table Body -->
            <tbody>
              <tr
                *ngFor="let row of paginatedData; let i = index; trackBy: trackByFn"
                [class]="getRowClasses(row, i)"
                (click)="onRowClick(row)"
              >
                <!-- Selection Column -->
                <td *ngIf="selectable" class="px-4 py-3">
                  <ui-checkbox
                    [ngModel]="isRowSelected(row)"
                    (ngModelChange)="toggleRowSelection(row, $event)"
                  ></ui-checkbox>
                </td>
                
                <!-- Data Columns -->
                <td
                  *ngFor="let column of columns"
                  [class]="getCellClasses(column)"
                >
                  <div [ngSwitch]="column.type">
                    <!-- Badge Type -->
                    <ui-badge
                      *ngSwitchCase="'badge'"
                      [variant]="column.badge?.variant || 'default'"
                    >
                      {{ column.badge?.getValue ? column.badge?.getValue(getCellValue(row, column)) : getCellValue(row, column) }}
                    </ui-badge>
                    
                    <!-- Boolean Type -->
                    <span *ngSwitchCase="'boolean'" [class]="getBooleanClasses(getCellValue(row, column))">
                      {{ getCellValue(row, column) ? 'Yes' : 'No' }}
                    </span>
                    
                    <!-- Default Text -->
                    <span *ngSwitchDefault 
                          [class]="column.key === 'description' ? 'truncate block' : ''"
                          [title]="column.key === 'description' ? getCellValue(row, column) : ''">
                      {{ getDisplayValue(row, column) }}
                    </span>
                  </div>
                </td>
                
                <!-- Actions Column -->
                <td *ngIf="actions.length > 0" class="px-4 py-3 text-right">
                  <ui-dropdown
                    [items]="getRowActions(row)"
                    [triggerIcon]="MoreHorizontal"
                    [showChevron]="false"
                    position="bottom-end"
                    (itemSelected)="onActionClick($event, row)"
                  ></ui-dropdown>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr *ngIf="paginatedData.length === 0">
                <td [attr.colspan]="getTotalColumns()" class="px-4 py-8 text-center text-muted-foreground">
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-lg">No data found</span>
                    <span class="text-sm">{{ searchTerm ? 'Try adjusting your search or filters' : 'No records to display' }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div *ngIf="!loading && pagination && paginatedData.length > 0" class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {{ getStartRecord() }} to {{ getEndRecord() }} of {{ pagination.total }} results
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Page Size Selector -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Rows per page:</span>
            <ui-select
              [(ngModel)]="pagination.pageSize"
              [options]="pageSizeOptions"
              (ngModelChange)="onPageSizeChange($event)"
              class="w-20"
            ></ui-select>
          </div>
          
          <!-- Pagination Controls -->
          <div class="flex items-center gap-1">
            <ui-button
              variant="outline"
              size="sm"
              [disabled]="pagination.page === 1"
              (clicked)="goToPage(1)"
            >
              First
            </ui-button>
            <ui-button
              variant="outline"
              size="sm"
              [disabled]="pagination.page === 1"
              (clicked)="goToPage(pagination.page - 1)"
            >
              Previous
            </ui-button>
            
            <!-- Page Numbers -->
            <div class="flex items-center gap-1">
              <span
                *ngFor="let page of getVisiblePages()"
                class="px-3 py-1 text-sm rounded cursor-pointer"
                [class]="page === pagination.page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                (click)="goToPage(page)"
              >
                {{ page }}
              </span>
            </div>
            
            <ui-button
              variant="outline"
              size="sm"
              [disabled]="pagination.page === getTotalPages()"
              (clicked)="goToPage(pagination.page + 1)"
            >
              Next
            </ui-button>
            <ui-button
              variant="outline"
              size="sm"
              [disabled]="pagination.page === getTotalPages()"
              (clicked)="goToPage(getTotalPages())"
            >
              Last
            </ui-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading = false;
  @Input() searchable = true;
  @Input() selectable = false;
  @Input() showFilters = true;
  @Input() pagination?: PaginationConfig;
  @Input() rowClickable = false;
  @Input() trackBy?: (index: number, item: any) => any;
  
  @Output() sortChange = new EventEmitter<SortConfig>();
  @Output() filterChange = new EventEmitter<FilterConfig>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{action: TableAction, row: any}>();

  // Icons
  ChevronUp = ChevronUp;
  ChevronDown = ChevronDown;
  Search = Search;
  Filter = Filter;
  MoreHorizontal = MoreHorizontal;
  Eye = Eye;
  Edit = Edit;
  Trash2 = Trash2;

  // Internal state
  searchTerm = '';
  filters: FilterConfig = {};
  sortConfig: SortConfig = { column: '', direction: 'asc' };
  selectedRows: any[] = [];
  filtersVisible = false;
  filteredData: any[] = [];
  paginatedData: any[] = [];

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.initializeData();
    }
  }

  private initializeData(): void {
    this.filteredData = [...this.data];
    this.applyFiltersAndSort();
    this.updatePagination();
  }

  // Search functionality
  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFiltersAndSort();
    this.resetPagination();
  }

  // Filter functionality
  get filterableColumns(): TableColumn[] {
    return this.columns.filter(col => col.filterable);
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
    this.resetPagination();
    this.filterChange.emit(this.filters);
  }

  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    this.applyFiltersAndSort();
    this.resetPagination();
    this.filterChange.emit(this.filters);
  }

  private applyFiltersAndSort(): void {
    let result = [...this.data];

    // Apply search
    if (this.searchTerm) {
      result = result.filter(row =>
        this.columns.some(col =>
          String(this.getCellValue(row, col))
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.keys(this.filters).forEach(key => {
      const filterValue = this.filters[key];
      if (filterValue) {
        result = result.filter(row =>
          String(row[key])
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())
        );
      }
    });

    // Apply sorting
    if (this.sortConfig.column) {
      result.sort((a, b) => {
        const aVal = a[this.sortConfig.column];
        const bVal = b[this.sortConfig.column];
        
        if (aVal < bVal) return this.sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = result;
    this.updatePagination();
  }

  // Sorting functionality
  onSort(column: string): void {
    if (this.sortConfig.column === column) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig = { column, direction: 'asc' };
    }
    
    this.applyFiltersAndSort();
    this.sortChange.emit(this.sortConfig);
  }

  isSorted(column: string): boolean {
    return this.sortConfig.column === column;
  }

  // Selection functionality
  get isAllSelected(): boolean {
    return this.selectedRows.length === this.paginatedData.length && this.paginatedData.length > 0;
  }

  get isPartiallySelected(): boolean {
    return this.selectedRows.length > 0 && this.selectedRows.length < this.paginatedData.length;
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedRows = [...this.paginatedData];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit(this.selectedRows);
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  toggleRowSelection(row: any, checked: boolean): void {
    if (checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r !== row);
    }
    this.selectionChange.emit(this.selectedRows);
  }

  // Pagination functionality
  get pageSizeOptions(): SelectOption[] {
    return (this.pagination?.pageSizeOptions || [10, 25, 50, 100]).map(size => ({
      value: size.toString(),
      label: size.toString()
    }));
  }

  private updatePagination(): void {
    if (!this.pagination) {
      this.paginatedData = this.filteredData;
      return;
    }

    const startIndex = (this.pagination.page - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
    
    // Update total count
    this.pagination.total = this.filteredData.length;
  }

  private resetPagination(): void {
    if (this.pagination) {
      this.pagination.page = 1;
    }
    this.updatePagination();
  }

  onPageSizeChange(pageSize: string): void {
    if (this.pagination) {
      this.pagination.pageSize = parseInt(pageSize);
      this.resetPagination();
      this.pageSizeChange.emit(this.pagination.pageSize);
    }
  }

  goToPage(page: number): void {
    if (this.pagination && page >= 1 && page <= this.getTotalPages()) {
      this.pagination.page = page;
      this.updatePagination();
      this.pageChange.emit(page);
    }
  }

  getTotalPages(): number {
    if (!this.pagination) return 1;
    return Math.ceil(this.pagination.total / this.pagination.pageSize);
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.pagination?.page || 1;
    const delta = 2;
    
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...' as any);
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...' as any, totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots.filter(page => typeof page === 'number') as number[];
  }

  getStartRecord(): number {
    if (!this.pagination) return 1;
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  getEndRecord(): number {
    if (!this.pagination) return this.filteredData.length;
    return Math.min(this.pagination.page * this.pagination.pageSize, this.pagination.total);
  }

  // Row and cell functionality
  onRowClick(row: any): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }

  getCellValue(row: any, column: TableColumn): any {
    return row[column.key];
  }

  getDisplayValue(row: any, column: TableColumn): string {
    const value = this.getCellValue(row, column);
    if (column.render) {
      return column.render(value, row);
    }
    return String(value || '');
  }

  // Actions functionality
  getRowActions(row: any): DropdownItem[] {
    return this.actions
      .filter(action => !action.visible || action.visible(row))
      .map(action => ({
        id: action.id,
        label: action.label,
        icon: action.icon,
        disabled: action.disabled ? action.disabled(row) : false,
        destructive: action.variant === 'destructive'
      }));
  }

  onActionClick(dropdownItem: DropdownItem, row: any): void {
    const action = this.actions.find(a => a.id === dropdownItem.id);
    if (action) {
      this.actionClick.emit({ action, row });
    }
  }

  // Styling functions
  getHeaderClasses(column: TableColumn): string {
    const baseClasses = 'px-4 py-3 text-sm font-medium text-muted-foreground';
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    return `${baseClasses} ${alignClasses[column.align || 'left']}`;
  }

  getRowClasses(row: any, index: number): string {
    const baseClasses = 'border-b border-border hover:bg-muted/50 transition-colors';
    const clickableClasses = this.rowClickable ? 'cursor-pointer' : '';
    const selectedClasses = this.isRowSelected(row) ? 'bg-muted' : '';
    return `${baseClasses} ${clickableClasses} ${selectedClasses}`;
  }

  getCellClasses(column: TableColumn): string {
    const baseClasses = 'px-4 py-3 text-sm';
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    const widthClasses = column.width || '';
    const truncateClasses = column.key === 'description' ? 'max-w-xs' : '';
    return `${baseClasses} ${alignClasses[column.align || 'left']} ${widthClasses} ${truncateClasses}`.trim();
  }

  getBooleanClasses(value: boolean): string {
    return value ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
  }

  getTotalColumns(): number {
    let count = this.columns.length;
    if (this.selectable) count++;
    if (this.actions.length > 0) count++;
    return count;
  }

  trackByFn = (index: number, item: any): any => {
    return this.trackBy ? this.trackBy(index, item) : index;
  };
}