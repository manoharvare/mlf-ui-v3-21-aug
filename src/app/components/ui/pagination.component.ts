import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-angular';
import { ButtonComponent } from './button.component';

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
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Info Text -->
      <div *ngIf="showInfo" class="text-sm text-muted-foreground">
        Showing {{ info.startItem }} to {{ info.endItem }} of {{ info.totalItems }} results
      </div>
      
      <!-- Pagination Controls -->
      <div class="flex items-center gap-1">
        <!-- First Page -->
        <ui-button
          *ngIf="showFirstLast"
          variant="outline"
          size="sm"
          [disabled]="currentPage === 1"
          (clicked)="goToPage(1)"
          [leftIcon]="ChevronsLeft"
        ></ui-button>
        
        <!-- Previous Page -->
        <ui-button
          variant="outline"
          size="sm"
          [disabled]="currentPage === 1"
          (clicked)="goToPage(currentPage - 1)"
          [leftIcon]="ChevronLeft"
        ></ui-button>
        
        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
          <button
            *ngFor="let page of visiblePages"
            type="button"
            [class]="getPageButtonClasses(page)"
            [disabled]="page === '...'"
            (click)="onPageClick(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <!-- Next Page -->
        <ui-button
          variant="outline"
          size="sm"
          [disabled]="currentPage === totalPages"
          (clicked)="goToPage(currentPage + 1)"
          [rightIcon]="ChevronRight"
        ></ui-button>
        
        <!-- Last Page -->
        <ui-button
          *ngIf="showFirstLast"
          variant="outline"
          size="sm"
          [disabled]="currentPage === totalPages"
          (clicked)="goToPage(totalPages)"
          [rightIcon]="ChevronsRight"
        ></ui-button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() showInfo = true;
  @Input() showFirstLast = true;
  @Input() maxVisiblePages = 7;
  
  @Output() pageChange = new EventEmitter<number>();

  // Icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  ChevronsLeft = ChevronsLeft;
  ChevronsRight = ChevronsRight;

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

  getPageButtonClasses(page: number | string): string {
    const baseClasses = 'px-3 py-1 text-sm rounded-md transition-colors';
    
    if (page === '...') {
      return `${baseClasses} cursor-default text-muted-foreground`;
    }
    
    if (page === this.currentPage) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    
    return `${baseClasses} hover:bg-accent hover:text-accent-foreground cursor-pointer`;
  }
}