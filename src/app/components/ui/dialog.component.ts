import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  X,
  TriangleAlert,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-angular';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DialogType = 'default' | 'confirm' | 'alert' | 'success' | 'warning' | 'error';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/50 animate-in fade-in-0"
        (click)="onBackdropClick()"
      ></div>
      
      <!-- Dialog -->
      <div [class]="dialogClasses" role="dialog" [attr.aria-modal]="true" [attr.aria-labelledby]="titleId">
        <!-- Header -->
        <div *ngIf="title || showCloseButton || hasHeaderSlot" [class]="headerClasses">
          <div class="flex items-center gap-3">
            <!-- Type Icon -->
            <div *ngIf="showTypeIcon" [class]="typeIconClasses">
              <lucide-icon [name]="typeIcon" [size]="20"></lucide-icon>
            </div>
            
            <!-- Title -->
            <div class="flex-1">
              <h2 *ngIf="title" [id]="titleId" [class]="titleClasses">{{ title }}</h2>
              <ng-content select="[slot=header]"></ng-content>
            </div>
            
            <!-- Close Button -->
            <button 
              *ngIf="showCloseButton"
              type="button"
              class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              (click)="close()"
              [attr.aria-label]="'Close dialog'"
            >
              <lucide-icon [name]="X" [size]="16"></lucide-icon>
            </button>
          </div>
          
          <!-- Description -->
          <p *ngIf="description" class="text-sm text-muted-foreground mt-2">
            {{ description }}
          </p>
        </div>
        
        <!-- Content -->
        <div [class]="contentClasses">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        <div *ngIf="hasFooterSlot || showDefaultButtons" [class]="footerClasses">
          <!-- Custom Footer -->
          <ng-content select="[slot=footer]"></ng-content>
          
          <!-- Default Buttons -->
          <div *ngIf="showDefaultButtons" class="flex justify-end gap-3">
            <button
              *ngIf="showCancelButton"
              type="button"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              (click)="cancel()"
            >
              {{ cancelText }}
            </button>
            
            <button
              type="button"
              [class]="confirmButtonClasses"
              (click)="confirm()"
              [disabled]="confirmDisabled"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() size: DialogSize = 'md';
  @Input() type: DialogType = 'default';
  @Input() showCloseButton = true;
  @Input() showDefaultButtons = false;
  @Input() showCancelButton = true;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmDisabled = false;
  @Input() closeOnBackdropClick = true;
  @Input() closeOnEscape = true;
  @Input() hasHeaderSlot = false;
  @Input() hasFooterSlot = false;
  @Input() customContentClasses = '';
  
  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  // Icons
  X = X;
  TriangleAlert = TriangleAlert;
  CheckCircle = CheckCircle;
  Info = Info;
  AlertCircle = AlertCircle;

  titleId = `dialog-title-${Math.random().toString(36).substr(2, 9)}`;

  get dialogClasses(): string {
    const baseClasses = 'relative bg-background border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8';
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  }

  get headerClasses(): string {
    return 'px-6 py-4 border-b border-border';
  }

  get titleClasses(): string {
    return 'text-lg font-semibold leading-none tracking-tight';
  }

  get contentClasses(): string {
    const baseClasses = 'px-6 py-4';
    return this.customContentClasses ? `${baseClasses} ${this.customContentClasses}` : baseClasses;
  }

  get footerClasses(): string {
    return 'px-6 py-4 border-t border-border';
  }

  get showTypeIcon(): boolean {
    return this.type !== 'default';
  }

  get typeIcon(): any {
    switch (this.type) {
      case 'confirm':
      case 'alert':
        return TriangleAlert;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  }

  get typeIconClasses(): string {
    const baseClasses = 'flex items-center justify-center w-10 h-10 rounded-full';
    
    switch (this.type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-600`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-600`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-600`;
      case 'confirm':
      case 'alert':
        return `${baseClasses} bg-orange-100 text-orange-600`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-600`;
    }
  }

  get confirmButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2';
    
    switch (this.type) {
      case 'error':
        return `${baseClasses} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
      default:
        return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'w-full max-w-sm';
      case 'md':
        return 'w-full max-w-md';
      case 'lg':
        return 'w-full max-w-lg';
      case 'xl':
        return 'w-full max-w-xl';
      case 'full':
        return 'w-full max-w-4xl mx-4';
      default:
        return 'w-full max-w-md';
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen && this.closeOnEscape) {
      this.close();
    }
  }

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.openChange.emit(false);
    this.closed.emit();
  }

  open(): void {
    this.isOpen = true;
    this.openChange.emit(true);
  }
}

// Confirmation Dialog Service Helper
export interface ConfirmationConfig {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  size?: DialogSize;
}

@Component({
  selector: 'ui-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, DialogComponent],
  template: `
    <ui-dialog
      [isOpen]="isOpen"
      [title]="config.title"
      [description]="config.message"
      [type]="config.type || 'confirm'"
      [size]="config.size || 'md'"
      [confirmText]="config.confirmText || 'Confirm'"
      [cancelText]="config.cancelText || 'Cancel'"
      [showDefaultButtons]="true"
      (confirmed)="onConfirm()"
      (cancelled)="onCancel()"
      (closed)="onClose()"
    >
    </ui-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() config: ConfirmationConfig = { title: '', message: '' };
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onClose(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}