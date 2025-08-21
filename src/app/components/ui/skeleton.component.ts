import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="skeletonClasses"
      [style.width]="width"
      [style.height]="height"
      [attr.aria-label]="ariaLabel"
      role="status"
    ></div>
  `
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'rectangular';
  @Input() animation: SkeletonAnimation = 'pulse';
  @Input() width?: string;
  @Input() height?: string;
  @Input() ariaLabel = 'Loading...';

  get skeletonClasses(): string {
    const baseClasses = 'bg-muted';
    const variantClasses = this.getVariantClasses();
    const animationClasses = this.getAnimationClasses();
    
    return `${baseClasses} ${variantClasses} ${animationClasses}`;
  }

  private getVariantClasses(): string {
    const variantMap = {
      text: 'h-4 w-full rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg'
    };
    return variantMap[this.variant];
  }

  private getAnimationClasses(): string {
    const animationMap = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse', // Could be enhanced with custom wave animation
      none: ''
    };
    return animationMap[this.animation];
  }
}

// Skeleton Text Component for text placeholders
@Component({
  selector: 'ui-skeleton-text',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="space-y-2">
      <ui-skeleton
        *ngFor="let line of linesArray; let i = index"
        variant="text"
        [animation]="animation"
        [width]="getLineWidth(i)"
        [height]="lineHeight"
      ></ui-skeleton>
    </div>
  `
})
export class SkeletonTextComponent {
  @Input() lines = 3;
  @Input() animation: SkeletonAnimation = 'pulse';
  @Input() lineHeight = '1rem';
  @Input() lastLineWidth = '60%';

  get linesArray(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }

  getLineWidth(index: number): string {
    // Make the last line shorter for more realistic text appearance
    if (index === this.lines - 1) {
      return this.lastLineWidth;
    }
    return '100%';
  }
}

// Skeleton Card Component for card placeholders
@Component({
  selector: 'ui-skeleton-card',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, SkeletonTextComponent],
  template: `
    <div class="border border-border rounded-lg p-6 space-y-4">
      <!-- Header -->
      <div *ngIf="showHeader" class="flex items-center space-x-4">
        <ui-skeleton
          *ngIf="showAvatar"
          variant="circular"
          width="40px"
          height="40px"
          [animation]="animation"
        ></ui-skeleton>
        <div class="flex-1 space-y-2">
          <ui-skeleton
            variant="text"
            width="150px"
            height="16px"
            [animation]="animation"
          ></ui-skeleton>
          <ui-skeleton
            variant="text"
            width="100px"
            height="14px"
            [animation]="animation"
          ></ui-skeleton>
        </div>
      </div>
      
      <!-- Image -->
      <ui-skeleton
        *ngIf="showImage"
        variant="rounded"
        width="100%"
        [height]="imageHeight"
        [animation]="animation"
      ></ui-skeleton>
      
      <!-- Content -->
      <div *ngIf="showContent">
        <ui-skeleton-text
          [lines]="contentLines"
          [animation]="animation"
        ></ui-skeleton-text>
      </div>
      
      <!-- Actions -->
      <div *ngIf="showActions" class="flex space-x-2">
        <ui-skeleton
          variant="rounded"
          width="80px"
          height="32px"
          [animation]="animation"
        ></ui-skeleton>
        <ui-skeleton
          variant="rounded"
          width="80px"
          height="32px"
          [animation]="animation"
        ></ui-skeleton>
      </div>
    </div>
  `
})
export class SkeletonCardComponent {
  @Input() showHeader = true;
  @Input() showAvatar = true;
  @Input() showImage = false;
  @Input() showContent = true;
  @Input() showActions = false;
  @Input() contentLines = 3;
  @Input() imageHeight = '200px';
  @Input() animation: SkeletonAnimation = 'pulse';
}

// Skeleton Table Component for table placeholders
@Component({
  selector: 'ui-skeleton-table',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="border border-border rounded-lg overflow-hidden">
      <!-- Table Header -->
      <div class="bg-muted/50 px-6 py-3 border-b border-border">
        <div class="flex space-x-4">
          <ui-skeleton
            *ngFor="let col of columns"
            variant="text"
            [width]="col.width"
            height="16px"
            [animation]="animation"
          ></ui-skeleton>
        </div>
      </div>
      
      <!-- Table Rows -->
      <div *ngFor="let row of rowsArray" class="px-6 py-4 border-b border-border last:border-b-0">
        <div class="flex space-x-4">
          <ui-skeleton
            *ngFor="let col of columns"
            variant="text"
            [width]="col.width"
            height="14px"
            [animation]="animation"
          ></ui-skeleton>
        </div>
      </div>
    </div>
  `
})
export class SkeletonTableComponent {
  @Input() rows = 5;
  @Input() columns = [
    { width: '200px' },
    { width: '150px' },
    { width: '100px' },
    { width: '120px' }
  ];
  @Input() animation: SkeletonAnimation = 'pulse';

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}

// Skeleton List Component for list placeholders
@Component({
  selector: 'ui-skeleton-list',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="space-y-4">
      <div
        *ngFor="let item of itemsArray; let i = index"
        class="flex items-center space-x-4"
      >
        <ui-skeleton
          *ngIf="showAvatar"
          variant="circular"
          [width]="avatarSize"
          [height]="avatarSize"
          [animation]="animation"
        ></ui-skeleton>
        
        <div class="flex-1 space-y-2">
          <ui-skeleton
            variant="text"
            [width]="getTitleWidth(i)"
            height="16px"
            [animation]="animation"
          ></ui-skeleton>
          <ui-skeleton
            *ngIf="showSubtitle"
            variant="text"
            [width]="getSubtitleWidth(i)"
            height="14px"
            [animation]="animation"
          ></ui-skeleton>
        </div>
        
        <ui-skeleton
          *ngIf="showAction"
          variant="rounded"
          width="60px"
          height="32px"
          [animation]="animation"
        ></ui-skeleton>
      </div>
    </div>
  `
})
export class SkeletonListComponent {
  @Input() items = 5;
  @Input() showAvatar = true;
  @Input() showSubtitle = true;
  @Input() showAction = false;
  @Input() avatarSize = '40px';
  @Input() animation: SkeletonAnimation = 'pulse';

  private titleWidths: string[] = [];
  private subtitleWidths: string[] = [];

  get itemsArray(): number[] {
    const array = Array.from({ length: this.items }, (_, i) => i);
    // Initialize widths arrays if needed
    if (this.titleWidths.length !== this.items) {
      this.initializeWidths();
    }
    return array;
  }

  private initializeWidths(): void {
    const titleOptions = ['200px', '250px', '180px', '220px', '160px'];
    const subtitleOptions = ['150px', '180px', '120px', '160px', '140px'];
    
    this.titleWidths = Array.from({ length: this.items }, () => 
      titleOptions[Math.floor(Math.random() * titleOptions.length)]
    );
    
    this.subtitleWidths = Array.from({ length: this.items }, () => 
      subtitleOptions[Math.floor(Math.random() * subtitleOptions.length)]
    );
  }

  getTitleWidth(index: number): string {
    return this.titleWidths[index] || '200px';
  }

  getSubtitleWidth(index: number): string {
    return this.subtitleWidths[index] || '150px';
  }
}

// Skeleton Form Component for form placeholders
@Component({
  selector: 'ui-skeleton-form',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div *ngFor="let field of fields" class="space-y-2">
        <!-- Label -->
        <ui-skeleton
          variant="text"
          [width]="field.labelWidth"
          height="14px"
          [animation]="animation"
        ></ui-skeleton>
        
        <!-- Input -->
        <ui-skeleton
          variant="rounded"
          width="100%"
          [height]="field.inputHeight"
          [animation]="animation"
        ></ui-skeleton>
      </div>
      
      <!-- Submit Button -->
      <ui-skeleton
        variant="rounded"
        width="120px"
        height="40px"
        [animation]="animation"
      ></ui-skeleton>
    </div>
  `
})
export class SkeletonFormComponent {
  @Input() fields = [
    { labelWidth: '80px', inputHeight: '40px' },
    { labelWidth: '100px', inputHeight: '40px' },
    { labelWidth: '120px', inputHeight: '80px' }, // textarea
    { labelWidth: '90px', inputHeight: '40px' }
  ];
  @Input() animation: SkeletonAnimation = 'pulse';
}