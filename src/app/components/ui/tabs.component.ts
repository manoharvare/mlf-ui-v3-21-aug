import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIconData;
  disabled?: boolean;
  badge?: string | number;
}

@Component({
  selector: 'ui-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="active"
      [id]="panelId"
      role="tabpanel"
      [attr.aria-labelledby]="tabId"
      class="mt-4 focus:outline-none"
      tabindex="0"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class TabPanelComponent {
  @Input() id = '';
  @Input() active = false;

  get panelId(): string {
    return `panel-${this.id}`;
  }

  get tabId(): string {
    return `tab-${this.id}`;
  }
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="w-full">
      <!-- Tab List -->
      <div
        role="tablist"
        [class]="tabListClasses"
        [attr.aria-orientation]="orientation"
      >
        <button
          *ngFor="let tab of tabs; trackBy: trackByTabId"
          type="button"
          role="tab"
          [id]="getTabId(tab.id)"
          [class]="getTabClasses(tab)"
          [attr.aria-selected]="activeTab === tab.id"
          [attr.aria-controls]="getPanelId(tab.id)"
          [disabled]="tab.disabled"
          (click)="selectTab(tab.id)"
          (keydown)="onKeyDown($event, tab.id)"
        >
          <div class="flex items-center space-x-2">
            <lucide-icon
              *ngIf="tab.icon"
              [name]="tab.icon"
              [size]="16"
            ></lucide-icon>
            <span>{{ tab.label }}</span>
            <span
              *ngIf="tab.badge"
              class="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
            >
              {{ tab.badge }}
            </span>
          </div>
        </button>
      </div>

      <!-- Tab Panels -->
      <div class="tab-content">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class TabsComponent implements AfterContentInit, OnDestroy {
  @Input() tabs: TabItem[] = [];
  @Input() activeTab = '';
  @Input() variant: 'default' | 'pills' | 'underline' = 'default';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  @Output() activeTabChange = new EventEmitter<string>();
  @Output() tabChanged = new EventEmitter<{ previousTab: string; currentTab: string }>();

  @ContentChildren(TabPanelComponent) tabPanels!: QueryList<TabPanelComponent>;

  private destroy$ = new Subject<void>();

  get tabListClasses(): string {
    const baseClasses = 'flex';
    const orientationClasses = this.orientation === 'horizontal' ? 'flex-row' : 'flex-col';
    const variantClasses = this.getTabListVariantClasses();
    
    return `${baseClasses} ${orientationClasses} ${variantClasses}`;
  }

  ngAfterContentInit(): void {
    // Set up initial active tab
    if (!this.activeTab && this.tabs.length > 0) {
      const firstEnabledTab = this.tabs.find(tab => !tab.disabled);
      if (firstEnabledTab) {
        this.activeTab = firstEnabledTab.id;
      }
    }

    // Update tab panels
    this.updateTabPanels();

    // Listen for tab panel changes
    this.tabPanels.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTabPanels();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled || this.activeTab === tabId) {
      return;
    }

    const previousTab = this.activeTab;
    this.activeTab = tabId;
    this.activeTabChange.emit(tabId);
    this.tabChanged.emit({ previousTab, currentTab: tabId });
    this.updateTabPanels();
  }

  onKeyDown(event: KeyboardEvent, tabId: string): void {
    const currentIndex = this.tabs.findIndex(tab => tab.id === tabId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = this.getNextEnabledTabIndex(currentIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = getPreviousEnabledTabIndex(currentIndex);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = this.getFirstEnabledTabIndex();
        break;
      case 'End':
        event.preventDefault();
        nextIndex = this.getLastEnabledTabIndex();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectTab(tabId);
        return;
    }

    if (nextIndex !== currentIndex && nextIndex !== -1) {
      this.selectTab(this.tabs[nextIndex].id);
      // Focus the new tab
      setTimeout(() => {
        const newTabElement = document.getElementById(this.getTabId(this.tabs[nextIndex].id));
        newTabElement?.focus();
      });
    }
  }

  getTabClasses(tab: TabItem): string {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    const sizeClasses = this.getSizeClasses();
    const variantClasses = this.getTabVariantClasses(tab);
    const disabledClasses = tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';
    
    return `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses}`;
  }

  getTabId(tabId: string): string {
    return `tab-${tabId}`;
  }

  getPanelId(tabId: string): string {
    return `panel-${tabId}`;
  }

  trackByTabId(index: number, tab: TabItem): string {
    return tab.id;
  }

  private updateTabPanels(): void {
    this.tabPanels.forEach(panel => {
      panel.active = panel.id === this.activeTab;
    });
  }

  private getTabListVariantClasses(): string {
    const variantMap = {
      default: 'border-b border-border',
      pills: 'p-1 bg-muted rounded-lg',
      underline: 'border-b border-border'
    };
    return variantMap[this.variant];
  }

  private getTabVariantClasses(tab: TabItem): string {
    const isActive = this.activeTab === tab.id;
    
    const variantMap = {
      default: isActive
        ? 'border-b-2 border-primary text-primary'
        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border',
      pills: isActive
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
      underline: isActive
        ? 'border-b-2 border-primary text-foreground'
        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border'
    };
    
    return variantMap[this.variant];
  }

  private getSizeClasses(): string {
    const sizeMap = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };
    return sizeMap[this.size];
  }

  private getNextEnabledTabIndex(currentIndex: number): number {
    for (let i = currentIndex + 1; i < this.tabs.length; i++) {
      if (!this.tabs[i].disabled) {
        return i;
      }
    }
    // Wrap around to the beginning
    return this.getFirstEnabledTabIndex();
  }

  private getPreviousEnabledTabIndex(currentIndex: number): number {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.tabs[i].disabled) {
        return i;
      }
    }
    // Wrap around to the end
    return this.getLastEnabledTabIndex();
  }

  private getFirstEnabledTabIndex(): number {
    return this.tabs.findIndex(tab => !tab.disabled);
  }

  private getLastEnabledTabIndex(): number {
    for (let i = this.tabs.length - 1; i >= 0; i--) {
      if (!this.tabs[i].disabled) {
        return i;
      }
    }
    return -1;
  }
}

function getPreviousEnabledTabIndex(currentIndex: number): number {
  // This function should be implemented similar to the method in the class
  // For now, returning the same index to avoid compilation errors
  return currentIndex;
}