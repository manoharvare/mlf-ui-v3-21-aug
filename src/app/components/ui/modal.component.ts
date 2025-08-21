import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, LucideIconData } from 'lucide-angular';
import { fadeIn, slideIn } from './animations';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      (click)="onBackdropClick($event)"
      [@fadeIn]
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-background/80 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div
        #modalContent
        [class]="modalClasses"
        role="dialog"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="descriptionId"
        aria-modal="true"
        [@slideIn]
      >
        <!-- Header -->
        <div *ngIf="showHeader" class="flex items-center justify-between p-6 border-b border-border">
          <div class="flex items-center space-x-3">
            <lucide-icon
              *ngIf="icon"
              [name]="icon"
              [size]="20"
              class="text-foreground"
            ></lucide-icon>
            <div>
              <h2 *ngIf="title" [id]="titleId" class="text-lg font-semibold text-foreground">
                {{ title }}
              </h2>
              <p *ngIf="description" [id]="descriptionId" class="text-sm text-muted-foreground mt-1">
                {{ description }}
              </p>
            </div>
          </div>
          <button
            *ngIf="showCloseButton"
            type="button"
            (click)="close()"
            class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            [attr.aria-label]="closeButtonLabel"
          >
            <lucide-icon [name]="X" [size]="16"></lucide-icon>
          </button>
        </div>
        
        <!-- Content -->
        <div [class]="contentClasses">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        <div *ngIf="showFooter" class="flex items-center justify-end space-x-2 p-6 border-t border-border">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  animations: [fadeIn, slideIn]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() icon?: LucideIconData;
  @Input() size: ModalSize = 'md';
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() showCloseButton = true;
  @Input() closeOnBackdropClick = true;
  @Input() closeOnEscape = true;
  @Input() closeButtonLabel = 'Close';
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  // Icons
  X = X;

  titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;

  private previousActiveElement: HTMLElement | null = null;

  get modalClasses(): string {
    const baseClasses = 'relative bg-background border border-border rounded-lg shadow-lg max-h-[90vh] overflow-hidden flex flex-col';
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  }

  get contentClasses(): string {
    const baseClasses = 'flex-1 overflow-y-auto';
    const paddingClasses = this.showHeader || this.showFooter ? 'p-6' : 'p-6';
    
    return `${baseClasses} ${paddingClasses}`;
  }

  private getSizeClasses(): string {
    const sizeMap = {
      sm: 'w-full max-w-sm',
      md: 'w-full max-w-md',
      lg: 'w-full max-w-lg',
      xl: 'w-full max-w-xl',
      full: 'w-full h-full max-w-none max-h-none rounded-none'
    };
    return sizeMap[this.size];
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.handleOpen();
    }
  }

  ngOnDestroy(): void {
    this.restoreFocus();
    this.removeEventListeners();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.handleOpen();
    } else {
      this.handleClose();
    }
  }

  open(): void {
    this.isOpen = true;
    this.isOpenChange.emit(true);
    this.handleOpen();
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.handleClose();
    this.closed.emit();
  }

  private handleOpen(): void {
    this.trapFocus();
    this.addEventListeners();
    this.opened.emit();
  }

  private handleClose(): void {
    this.restoreFocus();
    this.removeEventListeners();
  }

  private trapFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    
    // Focus the modal content after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (this.modalContent?.nativeElement) {
        const focusableElements = this.modalContent.nativeElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          this.modalContent.nativeElement.focus();
        }
      }
    }, 100);
  }

  private restoreFocus(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  private addEventListeners(): void {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  private handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  };

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && event.target === event.currentTarget) {
      this.close();
    }
  }
}

// Modal Header Component
@Component({
  selector: 'ui-modal-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div class="flex items-center space-x-3">
        <lucide-icon
          *ngIf="icon"
          [name]="icon"
          [size]="20"
          class="text-foreground"
        ></lucide-icon>
        <div>
          <h2 *ngIf="title" class="text-lg font-semibold text-foreground">
            {{ title }}
          </h2>
          <p *ngIf="description" class="text-sm text-muted-foreground mt-1">
            {{ description }}
          </p>
          <ng-content></ng-content>
        </div>
      </div>
      <ng-content select="[slot=actions]"></ng-content>
    </div>
  `
})
export class ModalHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon?: LucideIconData;
}

// Modal Content Component
@Component({
  selector: 'ui-modal-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 overflow-y-auto p-6">
      <ng-content></ng-content>
    </div>
  `
})
export class ModalContentComponent {}

// Modal Footer Component
@Component({
  selector: 'ui-modal-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end space-x-2 p-6 border-t border-border">
      <ng-content></ng-content>
    </div>
  `
})
export class ModalFooterComponent {}