import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, LucideIconData } from 'lucide-angular';
import { expandCollapse } from './animations';

export interface AccordionItem {
  id: string;
  title: string;
  content?: string;
  disabled?: boolean;
  icon?: LucideIconData;
}

@Component({
  selector: 'ui-accordion-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      [id]="contentId"
      role="region"
      [attr.aria-labelledby]="headerId"
      class="overflow-hidden transition-all duration-200 ease-in-out"
    >
      <div class="pb-4 pt-0">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AccordionItemComponent {
  @Input() id = '';
  @Input() isOpen = false;

  get contentId(): string {
    return `accordion-content-${this.id}`;
  }

  get headerId(): string {
    return `accordion-header-${this.id}`;
  }
}

@Component({
  selector: 'ui-accordion',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  animations: [expandCollapse],
  template: `
    <div class="w-full">
      <div
        *ngFor="let item of items; trackBy: trackByItemId"
        class="border-b border-border"
      >
        <h3>
          <button
            type="button"
            [id]="getHeaderId(item.id)"
            [class]="getHeaderClasses(item)"
            [attr.aria-expanded]="isItemOpen(item.id)"
            [attr.aria-controls]="getContentId(item.id)"
            [disabled]="item.disabled"
            (click)="toggleItem(item.id)"
          >
            <div class="flex items-center space-x-3">
              <lucide-icon
                *ngIf="item.icon"
                [name]="item.icon"
                [size]="16"
                class="text-muted-foreground"
              ></lucide-icon>
              <span class="flex-1 text-left">{{ item.title }}</span>
              <lucide-icon
                [name]="ChevronDown"
                [size]="16"
                [class]="getChevronClasses(item.id)"
              ></lucide-icon>
            </div>
          </button>
        </h3>
        
        <div
          [id]="getContentId(item.id)"
          role="region"
          [attr.aria-labelledby]="getHeaderId(item.id)"
          class="overflow-hidden"
          [@expandCollapse]="isItemOpen(item.id) ? 'expanded' : 'collapsed'"
        >
          <div class="pb-4 pt-0 px-0">
            <div *ngIf="item.content" class="text-sm text-muted-foreground">
              {{ item.content }}
            </div>
            <ng-content [select]="'[slot=' + item.id + ']'"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccordionComponent implements AfterContentInit {
  @Input() items: AccordionItem[] = [];
  @Input() type: 'single' | 'multiple' = 'single';
  @Input() collapsible = true;
  @Input() defaultValue: string | string[] = '';
  
  @Output() valueChange = new EventEmitter<string | string[]>();

  @ContentChildren(AccordionItemComponent) accordionItems!: QueryList<AccordionItemComponent>;

  // Icons
  ChevronDown = ChevronDown;

  private openItems = new Set<string>();

  ngAfterContentInit(): void {
    this.initializeOpenItems();
  }

  private initializeOpenItems(): void {
    if (this.type === 'single') {
      if (typeof this.defaultValue === 'string' && this.defaultValue) {
        this.openItems.add(this.defaultValue);
      }
    } else {
      if (Array.isArray(this.defaultValue)) {
        this.defaultValue.forEach(value => this.openItems.add(value));
      }
    }
    this.updateAccordionItems();
  }

  toggleItem(itemId: string): void {
    const item = this.items.find(i => i.id === itemId);
    if (!item || item.disabled) {
      return;
    }

    if (this.type === 'single') {
      if (this.openItems.has(itemId)) {
        if (this.collapsible) {
          this.openItems.clear();
        }
      } else {
        this.openItems.clear();
        this.openItems.add(itemId);
      }
    } else {
      if (this.openItems.has(itemId)) {
        this.openItems.delete(itemId);
      } else {
        this.openItems.add(itemId);
      }
    }

    this.updateAccordionItems();
    this.emitValueChange();
  }

  isItemOpen(itemId: string): boolean {
    return this.openItems.has(itemId);
  }

  getHeaderId(itemId: string): string {
    return `accordion-header-${itemId}`;
  }

  getContentId(itemId: string): string {
    return `accordion-content-${itemId}`;
  }

  getHeaderClasses(item: AccordionItem): string {
    const baseClasses = 'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline';
    const disabledClasses = item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';
    
    return `${baseClasses} ${disabledClasses}`;
  }

  getChevronClasses(itemId: string): string {
    const baseClasses = 'h-4 w-4 shrink-0 transition-transform duration-200';
    const rotateClasses = this.isItemOpen(itemId) ? 'rotate-180' : '';
    
    return `${baseClasses} ${rotateClasses}`;
  }

  trackByItemId(index: number, item: AccordionItem): string {
    return item.id;
  }

  private updateAccordionItems(): void {
    if (this.accordionItems) {
      this.accordionItems.forEach(accordionItem => {
        accordionItem.isOpen = this.openItems.has(accordionItem.id);
      });
    }
  }

  private emitValueChange(): void {
    if (this.type === 'single') {
      const openItem = Array.from(this.openItems)[0] || '';
      this.valueChange.emit(openItem);
    } else {
      this.valueChange.emit(Array.from(this.openItems));
    }
  }
}