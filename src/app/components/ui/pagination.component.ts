import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-angular';

import { SelectComponent, SelectOption } from './select.component';


export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, SelectComponent],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <!-- Info Text -->
      @if (showInfo) {
        <div class="text-xs text-gray-600">
          Showing {{ info.startItem }} to {{ info.endItem }} of {{ info.totalItems }} results
        </div>
      }
      
      <!-- Pagination Controls -->
      <div class="flex items-center gap-2">
        <!-- Rows per page selector -->
        <div class="flex items-center gap-2 mr-4" [formGroup]="paginationForm">
          <span class="text-xs text-gray-600">Rows per page:</span>
          <ui-select
            [options]="pageSizeSelectOptions"
            formControlName="pageSize"
            class="w-20"
          ></ui-select>
        </div>
        
        <!-- Flowbite-style Pagination -->
        <nav aria-label="Page navigation">
          <ul class="flex items-center -space-x-px h-8 text-xs">
            <!-- First Page (if enabled) -->
            @if (showFirstLast) {
              <li>
                <button
                  type="button"
                  [disabled]="currentPage === 1"
                  (click)="goToPage(1)"
                  class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <lucide-icon [name]="ChevronsLeft" class="h-3 w-3"></lucide-icon>
                </button>
              </li>
            }
            
            <!-- Previous Button -->
            <li>
              <button
                type="button"
                [disabled]="currentPage === 1"
                (click)="goToPage(currentPage - 1)"
                [class]="showFirstLast 
                  ? 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'"
                title="Previous page"
              >
                <span class="sr-only">Previous</span>
                <lucide-icon [name]="ChevronLeft" class="h-3 w-3"></lucide-icon>
              </button>
            </li>
            
            <!-- Page Numbers -->
            @for (page of visiblePages; track page) {
              <li>
                @if (page !== '...') {
                  <button
                    type="button"
                    (click)="onPageClick(page)"
                    [attr.aria-current]="page === currentPage ? 'page' : null"
                    [class]="page === currentPage 
                      ? 'z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' 
                      : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'"
                  >
                    {{ page }}
                  </button>
                } @else {
                  <span class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">
                    ...
                  </span>
                }
              </li>
            }
            
            <!-- Next Button -->
            <li>
              <button
                type="button"
                [disabled]="currentPage === totalPages"
                (click)="goToPage(currentPage + 1)"
                [class]="showFirstLast 
                  ? 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'"
                title="Next page"
              >
                <span class="sr-only">Next</span>
                <lucide-icon [name]="ChevronRight" class="h-3 w-3"></lucide-icon>
              </button>
            </li>
            
            <!-- Last Page (if enabled) -->
            @if (showFirstLast) {
              <li>
                <button
                  type="button"
                  [disabled]="currentPage === totalPages"
                  (click)="goToPage(totalPages)"
                  class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <lucide-icon [name]="ChevronsRight" class="h-3 w-3"></lucide-icon>
                </button>
              </li>
            }
          </ul>
        </nav>
      </div>
    </div>
  `
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 25;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showInfo = true;
  @Input() showFirstLast = true;
  @Input() maxVisiblePages = 7;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  // Form
  paginationForm: FormGroup;

  // Icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  ChevronsLeft = ChevronsLeft;
  ChevronsRight = ChevronsRight;

  constructor(private fb: FormBuilder) {
    this.paginationForm = this.fb.group({
      pageSize: [this.itemsPerPage]
    });
  }

  ngOnInit(): void {
    // Subscribe to form changes
    this.paginationForm.get('pageSize')?.valueChanges.subscribe(value => {
      if (value !== this.itemsPerPage) {
        this.onItemsPerPageChange(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update form when itemsPerPage input changes
    if (changes['itemsPerPage'] && this.paginationForm) {
      this.paginationForm.patchValue({
        pageSize: this.itemsPerPage
      }, { emitEvent: false });
    }
  }

  get info(): PaginationInfo {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage,
      startItem,
      endItem
    };
  }

  get pageSizeSelectOptions(): SelectOption[] {
    return this.pageSizeOptions.map(size => ({
      value: size,
      label: size.toString()
    }));
  }

  get visiblePages(): (number | string)[] {
    const delta = Math.floor(this.maxVisiblePages / 2);
    const range = [];
    const rangeWithDots = [];

    // Calculate the range of pages to show
    let start = Math.max(2, this.currentPage - delta);
    let end = Math.min(this.totalPages - 1, this.currentPage + delta);

    // Adjust if we're near the beginning or end
    if (this.currentPage - delta <= 2) {
      end = Math.min(this.totalPages - 1, this.maxVisiblePages - 1);
    }
    if (this.currentPage + delta >= this.totalPages - 1) {
      start = Math.max(2, this.totalPages - this.maxVisiblePages + 2);
    }

    // Build the range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add first page
    if (start > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add middle pages
    rangeWithDots.push(...range);

    // Add last page
    if (end < this.totalPages - 1) {
      rangeWithDots.push('...', this.totalPages);
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages);
    }

    // Remove duplicates and handle edge cases
    const result = rangeWithDots.filter((page, index, array) => {
      if (page === 1 && array[index + 1] === 1) return false;
      if (page === this.totalPages && array[index - 1] === this.totalPages) return false;
      return true;
    });

    return result;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.goToPage(page);
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPageChange.emit(value);
  }

  // This method is kept for backward compatibility but is no longer used in the template
  getPageButtonClasses(page: number | string): string {
    const baseClasses = 'inline-flex items-center justify-center w-8 h-8 text-sm rounded transition-colors';
    
    if (page === '...') {
      return `${baseClasses} cursor-default text-gray-400`;
    }
    
    if (page === this.currentPage) {
      return `${baseClasses} bg-blue-600 text-white border border-blue-600`;
    }
    
    return `${baseClasses} border border-gray-300 hover:bg-gray-50 cursor-pointer`;
  }
}