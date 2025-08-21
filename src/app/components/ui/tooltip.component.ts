import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeIn } from './animations';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'ui-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative inline-block"
      (mouseenter)="showTooltip()"
      (mouseleave)="hideTooltip()"
      (focusin)="showTooltip()"
      (focusout)="hideTooltip()"
    >
      <!-- Trigger content -->
      <ng-content></ng-content>
      
      <!-- Tooltip -->
      <div
        *ngIf="isVisible && (content || tooltipContent)"
        [class]="tooltipClasses"
        role="tooltip"
        [attr.aria-hidden]="!isVisible"
        [@fadeIn]
      >
        <div *ngIf="content" class="text-sm">{{ content }}</div>
        <ng-content *ngIf="!content" select="[slot=tooltip]"></ng-content>
        
        <!-- Arrow -->
        <div [class]="arrowClasses"></div>
      </div>
    </div>
  `,
  animations: [fadeIn]
})
export class TooltipComponent implements OnDestroy {
  @Input() content = '';
  @Input() position: TooltipPosition = 'top';
  @Input() disabled = false;
  @Input() delay = 500; // milliseconds
  @Input() maxWidth = '200px';
  
  @Output() visibilityChange = new EventEmitter<boolean>();

  @ViewChild('tooltip') tooltipElement?: ElementRef;

  isVisible = false;
  tooltipContent = '';
  private showTimer?: number;
  private hideTimer?: number;

  get tooltipClasses(): string {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm text-popover-foreground bg-popover border border-border rounded-md shadow-md pointer-events-none';
    const positionClasses = this.getPositionClasses();
    
    return `${baseClasses} ${positionClasses}`;
  }

  get arrowClasses(): string {
    const baseClasses = 'absolute w-2 h-2 bg-popover border-border transform rotate-45';
    const positionClasses = this.getArrowPositionClasses();
    
    return `${baseClasses} ${positionClasses}`;
  }

  private getPositionClasses(): string {
    const positionMap = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };
    
    return positionMap[this.position];
  }

  private getArrowPositionClasses(): string {
    const positionMap = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-t border-l',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b border-r',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-l border-b',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-r border-t'
    };
    
    return positionMap[this.position];
  }

  showTooltip(): void {
    if (this.disabled || (!this.content && !this.tooltipContent)) {
      return;
    }

    this.clearTimers();
    
    this.showTimer = window.setTimeout(() => {
      this.isVisible = true;
      this.visibilityChange.emit(true);
    }, this.delay);
  }

  hideTooltip(): void {
    this.clearTimers();
    
    this.hideTimer = window.setTimeout(() => {
      this.isVisible = false;
      this.visibilityChange.emit(false);
    }, 100); // Small delay to prevent flickering
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }
}