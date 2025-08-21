import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoreHorizontal, ChevronDown, LucideIconData } from 'lucide-angular';
import { slideDown } from './animations';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIconData;
  disabled?: boolean;
  separator?: boolean;
  destructive?: boolean;
  shortcut?: string;
}

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger -->
      <button
        #trigger
        type="button"
        [class]="triggerClasses"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="true"
        (click)="toggle()"
        (keydown)="onTriggerKeyDown($event)"
      >
        <ng-content select="[slot=trigger]"></ng-content>
        <span *ngIf="!hasCustomTrigger" class="flex items-center space-x-2">
          <lucide-icon
            *ngIf="triggerIcon"
            [name]="triggerIcon"
            [size]="16"
          ></lucide-icon>
          <span *ngIf="triggerText">{{ triggerText }}</span>
          <lucide-icon
            *ngIf="showChevron"
            [name]="ChevronDown"
            [size]="16"
            [class]="chevronClasses"
          ></lucide-icon>
        </span>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isOpen"
        [class]="menuClasses"
        role="menu"
        [attr.aria-orientation]="'vertical'"
        [attr.aria-labelledby]="triggerId"
        (keydown)="onMenuKeyDown($event)"
        [@slideDown]
      >
        <div
          *ngFor="let item of items; let i = index; trackBy: trackByItemId"
          [class]="getItemClasses(item, i)"
          role="menuitem"
          [attr.tabindex]="item.disabled ? -1 : 0"
          [attr.aria-disabled]="item.disabled"
          (click)="onItemClick(item)"
          (keydown)="onItemKeyDown($event, item)"
        >
          <div *ngIf="item.separator" class="h-px bg-border my-1"></div>
          <div *ngIf="!item.separator" class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-2">
              <lucide-icon
                *ngIf="item.icon"
                [name]="item.icon"
                [size]="16"
                class="text-muted-foreground"
              ></lucide-icon>
              <span>{{ item.label }}</span>
            </div>
            <span *ngIf="item.shortcut" class="text-xs text-muted-foreground">
              {{ item.shortcut }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-40"
      (click)="close()"
    ></div>
  `,
  animations: [slideDown]
})
export class DropdownComponent implements OnDestroy {
  @Input() items: DropdownItem[] = [];
  @Input() triggerText = '';
  @Input() triggerIcon?: LucideIconData;
  @Input() showChevron = true;
  @Input() position: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' = 'bottom-start';
  @Input() disabled = false;
  
  @Output() itemSelected = new EventEmitter<DropdownItem>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('trigger') triggerElement!: ElementRef;

  // Icons
  MoreHorizontal = MoreHorizontal;
  ChevronDown = ChevronDown;

  isOpen = false;
  triggerId = `dropdown-trigger-${Math.random().toString(36).substr(2, 9)}`;
  focusedIndex = -1;
  hasCustomTrigger = false;

  get triggerClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    const stateClasses = this.disabled 
      ? 'cursor-not-allowed opacity-50' 
      : 'cursor-pointer hover:bg-accent hover:text-accent-foreground';
    const paddingClasses = this.triggerText ? 'px-4 py-2' : 'p-2';
    
    return `${baseClasses} ${stateClasses} ${paddingClasses}`;
  }

  get menuClasses(): string {
    const baseClasses = 'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md';
    const positionClasses = this.getPositionClasses();
    
    return `${baseClasses} ${positionClasses}`;
  }

  get chevronClasses(): string {
    const baseClasses = 'transition-transform duration-200';
    const rotateClasses = this.isOpen ? 'rotate-180' : '';
    
    return `${baseClasses} ${rotateClasses}`;
  }

  private getPositionClasses(): string {
    const positionMap = {
      'bottom-start': 'top-full left-0 mt-1',
      'bottom-end': 'top-full right-0 mt-1',
      'top-start': 'bottom-full left-0 mb-1',
      'top-end': 'bottom-full right-0 mb-1'
    };
    
    return positionMap[this.position];
  }

  getItemClasses(item: DropdownItem, index: number): string {
    if (item.separator) {
      return 'px-2 py-1.5';
    }
    
    const baseClasses = 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors';
    const stateClasses = item.disabled 
      ? 'pointer-events-none opacity-50'
      : 'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground';
    const destructiveClasses = item.destructive ? 'text-destructive focus:text-destructive' : '';
    const focusClasses = this.focusedIndex === index ? 'bg-accent text-accent-foreground' : '';
    
    return `${baseClasses} ${stateClasses} ${destructiveClasses} ${focusClasses}`;
  }

  toggle(): void {
    if (this.disabled) return;
    
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen = true;
    this.focusedIndex = -1;
    this.openChange.emit(true);
  }

  close(): void {
    this.isOpen = false;
    this.focusedIndex = -1;
    this.openChange.emit(false);
    this.triggerElement?.nativeElement?.focus();
  }

  onItemClick(item: DropdownItem): void {
    if (item.disabled || item.separator) return;
    
    this.itemSelected.emit(item);
    this.close();
  }

  onTriggerKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        this.focusFirstItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.open();
        this.focusLastItem();
        break;
    }
  }

  onMenuKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  onItemKeyDown(event: KeyboardEvent, item: DropdownItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
    }
  }

  private focusFirstItem(): void {
    const firstEnabledIndex = this.items.findIndex(item => !item.disabled && !item.separator);
    if (firstEnabledIndex !== -1) {
      this.focusedIndex = firstEnabledIndex;
    }
  }

  private focusLastItem(): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].disabled && !this.items[i].separator) {
        this.focusedIndex = i;
        break;
      }
    }
  }

  private focusNextItem(): void {
    for (let i = this.focusedIndex + 1; i < this.items.length; i++) {
      if (!this.items[i].disabled && !this.items[i].separator) {
        this.focusedIndex = i;
        return;
      }
    }
    this.focusFirstItem();
  }

  private focusPreviousItem(): void {
    for (let i = this.focusedIndex - 1; i >= 0; i--) {
      if (!this.items[i].disabled && !this.items[i].separator) {
        this.focusedIndex = i;
        return;
      }
    }
    this.focusLastItem();
  }

  trackByItemId(index: number, item: DropdownItem): string {
    return item.id;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}