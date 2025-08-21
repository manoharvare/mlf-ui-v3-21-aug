import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Search,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Command as CommandIcon
} from 'lucide-angular';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: any;
  shortcut?: string[];
  group?: string;
  disabled?: boolean;
  data?: any;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

@Component({
  selector: 'ui-command',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="containerClasses">
      <!-- Search Input -->
      <div class="flex items-center border-b px-3" [class.border-border]="!noBorder">
        <lucide-icon [name]="Search" [size]="16" class="mr-2 h-4 w-4 shrink-0 opacity-50"></lucide-icon>
        <input
          #searchInput
          type="text"
          [value]="searchQuery"
          [placeholder]="placeholder"
          class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          (input)="onSearchInput($event)"
          (keydown)="onKeyDown($event)"
        />
        
        <!-- Keyboard Shortcut Hint -->
        <div *ngIf="showShortcutHint" class="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
          <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span class="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
      
      <!-- Command List -->
      <div class="max-h-[300px] overflow-y-auto overflow-x-hidden">
        <div *ngIf="filteredItems.length === 0 && searchQuery" class="py-6 text-center text-sm text-muted-foreground">
          {{ emptyMessage }}
        </div>
        
        <!-- Grouped Items -->
        <div *ngIf="groupedItems.length > 0">
          <div *ngFor="let group of groupedItems; trackBy: trackByGroupId" class="overflow-hidden p-1 text-foreground">
            <div *ngIf="group.label" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {{ group.label }}
            </div>
            <div
              *ngFor="let item of group.items; let i = index; trackBy: trackByItemId"
              [class]="getItemClasses(item, getGlobalIndex(group, i))"
              (click)="selectItem(item)"
              (mouseenter)="highlightedIndex = getGlobalIndex(group, i)"
            >
              <div class="flex items-center gap-2">
                <!-- Icon -->
                <lucide-icon 
                  *ngIf="item.icon" 
                  [name]="item.icon" 
                  [size]="16" 
                  class="h-4 w-4 shrink-0">
                </lucide-icon>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="font-medium">{{ item.label }}</div>
                  <div *ngIf="item.description" class="text-xs text-muted-foreground">
                    {{ item.description }}
                  </div>
                </div>
                
                <!-- Shortcut -->
                <div *ngIf="item.shortcut" class="flex items-center gap-1">
                  <kbd 
                    *ngFor="let key of item.shortcut"
                    class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Ungrouped Items -->
        <div *ngIf="ungroupedItems.length > 0" class="overflow-hidden p-1 text-foreground">
          <div
            *ngFor="let item of ungroupedItems; let i = index; trackBy: trackByItemId"
            [class]="getItemClasses(item, i)"
            (click)="selectItem(item)"
            (mouseenter)="highlightedIndex = i"
          >
            <div class="flex items-center gap-2">
              <!-- Icon -->
              <lucide-icon 
                *ngIf="item.icon" 
                [name]="item.icon" 
                [size]="16" 
                class="h-4 w-4 shrink-0">
              </lucide-icon>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="font-medium">{{ item.label }}</div>
                <div *ngIf="item.description" class="text-xs text-muted-foreground">
                  {{ item.description }}
                </div>
              </div>
              
              <!-- Shortcut -->
              <div *ngIf="item.shortcut" class="flex items-center gap-1">
                <kbd 
                  *ngFor="let key of item.shortcut"
                  class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div *ngIf="showFooter" class="border-t border-border p-2 text-xs text-muted-foreground">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <lucide-icon [name]="ArrowUp" [size]="10"></lucide-icon>
              <lucide-icon [name]="ArrowDown" [size]="10"></lucide-icon>
            </kbd>
            <span>to navigate</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <lucide-icon [name]="CornerDownLeft" [size]="10"></lucide-icon>
            </kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  
  @Input() items: CommandItem[] = [];
  @Input() groups: CommandGroup[] = [];
  @Input() placeholder = 'Type a command or search...';
  @Input() emptyMessage = 'No results found.';
  @Input() showShortcutHint = false;
  @Input() showFooter = true;
  @Input() noBorder = false;
  @Input() autoFocus = true;
  
  @Output() itemSelected = new EventEmitter<CommandItem>();
  @Output() searchChanged = new EventEmitter<string>();

  // Icons
  Search = Search;
  ArrowUp = ArrowUp;
  ArrowDown = ArrowDown;
  CornerDownLeft = CornerDownLeft;
  CommandIcon = CommandIcon;

  searchQuery = '';
  highlightedIndex = 0;
  filteredItems: CommandItem[] = [];
  groupedItems: CommandGroup[] = [];
  ungroupedItems: CommandItem[] = [];

  get containerClasses(): string {
    const baseClasses = 'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground';
    const borderClasses = this.noBorder ? '' : 'border border-border';
    
    return `${baseClasses} ${borderClasses}`;
  }

  ngAfterViewInit(): void {
    if (this.autoFocus) {
      this.focus();
    }
    this.updateFilteredItems();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.highlightedIndex = 0;
    this.updateFilteredItems();
    this.searchChanged.emit(this.searchQuery);
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveHighlight(1);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.moveHighlight(-1);
        break;
        
      case 'Enter':
        event.preventDefault();
        this.selectHighlightedItem();
        break;
        
      case 'Escape':
        event.preventDefault();
        this.searchQuery = '';
        this.updateFilteredItems();
        break;
    }
  }

  private updateFilteredItems(): void {
    const query = this.searchQuery.toLowerCase();
    
    // Filter items
    this.filteredItems = this.items.filter(item => 
      !item.disabled && (
        item.label.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      )
    );
    
    // Filter groups
    this.groupedItems = this.groups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        !item.disabled && (
          item.label.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        )
      )
    })).filter(group => group.items.length > 0);
    
    // Separate ungrouped items
    this.ungroupedItems = this.filteredItems.filter(item => !item.group);
    
    // Reset highlight
    this.highlightedIndex = 0;
  }

  private moveHighlight(direction: number): void {
    const totalItems = this.getTotalVisibleItems();
    if (totalItems === 0) return;
    
    this.highlightedIndex = Math.max(0, Math.min(totalItems - 1, this.highlightedIndex + direction));
  }

  private getTotalVisibleItems(): number {
    let total = this.ungroupedItems.length;
    this.groupedItems.forEach(group => {
      total += group.items.length;
    });
    return total;
  }

  private selectHighlightedItem(): void {
    const item = this.getItemAtIndex(this.highlightedIndex);
    if (item) {
      this.selectItem(item);
    }
  }

  private getItemAtIndex(index: number): CommandItem | null {
    let currentIndex = 0;
    
    // Check ungrouped items first
    if (index < this.ungroupedItems.length) {
      return this.ungroupedItems[index];
    }
    currentIndex += this.ungroupedItems.length;
    
    // Check grouped items
    for (const group of this.groupedItems) {
      if (index < currentIndex + group.items.length) {
        return group.items[index - currentIndex];
      }
      currentIndex += group.items.length;
    }
    
    return null;
  }

  getGlobalIndex(group: CommandGroup, itemIndex: number): number {
    let globalIndex = this.ungroupedItems.length;
    
    for (const g of this.groupedItems) {
      if (g.id === group.id) {
        return globalIndex + itemIndex;
      }
      globalIndex += g.items.length;
    }
    
    return globalIndex + itemIndex;
  }

  getItemClasses(item: CommandItem, index: number): string {
    const baseClasses = 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors';
    const stateClasses = item.disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:bg-accent hover:text-accent-foreground';
    const highlightClasses = index === this.highlightedIndex 
      ? 'bg-accent text-accent-foreground' 
      : '';
    
    return `${baseClasses} ${stateClasses} ${highlightClasses}`;
  }

  selectItem(item: CommandItem): void {
    if (item.disabled) return;
    
    this.itemSelected.emit(item);
  }

  trackByItemId(index: number, item: CommandItem): string {
    return item.id;
  }

  trackByGroupId(index: number, group: CommandGroup): string {
    return group.id;
  }

  focus(): void {
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.focus();
    }
  }

  clear(): void {
    this.searchQuery = '';
    this.updateFilteredItems();
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.value = '';
    }
  }
}

// Command Dialog Component - Modal wrapper for Command
@Component({
  selector: 'ui-command-dialog',
  standalone: true,
  imports: [CommonModule, CommandComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/50 animate-in fade-in-0"
        (click)="close()"
      ></div>
      
      <!-- Dialog -->
      <div class="relative w-full max-w-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8">
        <ui-command
          [items]="items"
          [groups]="groups"
          [placeholder]="placeholder"
          [emptyMessage]="emptyMessage"
          [showShortcutHint]="showShortcutHint"
          [showFooter]="showFooter"
          (itemSelected)="onItemSelected($event)"
          (searchChanged)="searchChanged.emit($event)"
        ></ui-command>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandDialogComponent {
  @Input() isOpen = false;
  @Input() items: CommandItem[] = [];
  @Input() groups: CommandGroup[] = [];
  @Input() placeholder = 'Type a command or search...';
  @Input() emptyMessage = 'No results found.';
  @Input() showShortcutHint = true;
  @Input() showFooter = true;
  
  @Output() openChange = new EventEmitter<boolean>();
  @Output() itemSelected = new EventEmitter<CommandItem>();
  @Output() searchChanged = new EventEmitter<string>();

  onItemSelected(item: CommandItem): void {
    this.itemSelected.emit(item);
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.openChange.emit(false);
  }
}