import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, LucideIconData } from 'lucide-angular';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'square' | 'rounded';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="avatarClasses" [style.background-color]="bgColor" [style.color]="textColor" (click)="onClick()">
      <!-- Image -->
      <img
        *ngIf="src && !imageLoadError"
        [src]="src"
        [alt]="alt"
        [class]="imageClasses"
        (error)="onImageError()"
        (load)="onImageLoad()"
      />
      
      <!-- Initials -->
      <span
        *ngIf="!src || imageLoadError"
        [class]="initialsClasses"
      >
        {{ displayInitials }}
      </span>
      
      <!-- Fallback Icon -->
      <lucide-icon
        *ngIf="(!src || imageLoadError) && !displayInitials"
        [name]="fallbackIcon"
        [class]="iconClasses"
      ></lucide-icon>
      
      <!-- Status Indicator -->
      <div
        *ngIf="status"
        [class]="statusClasses"
        [title]="statusTitle"
      ></div>
      
      <!-- Badge/Notification -->
      <div
        *ngIf="badge !== undefined"
        [class]="badgeClasses"
      >
        <span *ngIf="badge > 0" class="text-xs font-medium">
          {{ badge > 99 ? '99+' : badge }}
        </span>
      </div>
    </div>
  `
})
export class AvatarComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() name = '';
  @Input() size: AvatarSize = 'md';
  @Input() shape: AvatarShape = 'circle';
  @Input() fallbackIcon = User;
  @Input() status?: 'online' | 'offline' | 'away' | 'busy';
  @Input() badge?: number;
  @Input() clickable = false;
  @Input() loading = false;
  @Input() bgColor = '';
  @Input() textColor = '';
  
  @Output() clicked = new EventEmitter<void>();
  @Output() imageLoad = new EventEmitter<void>();
  @Output() imageError = new EventEmitter<void>();

  // Icons
  User = User;

  imageLoadError = false;

  get displayInitials(): string {
    if (!this.name) return '';
    
    const names = this.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  get statusTitle(): string {
    const statusMap = {
      online: 'Online',
      offline: 'Offline',
      away: 'Away',
      busy: 'Busy'
    };
    return statusMap[this.status!] || '';
  }

  get avatarClasses(): string {
    const baseClasses = 'relative inline-flex items-center justify-center font-medium select-none';
    const sizeClasses = this.getSizeClasses();
    const shapeClasses = this.getShapeClasses();
    const clickableClasses = this.clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
    const loadingClasses = this.loading ? 'animate-pulse' : '';
    const bgClasses = this.bgColor ? '' : 'bg-muted';
    const textClasses = this.textColor ? '' : 'text-foreground';
    
    return `${baseClasses} ${sizeClasses} ${shapeClasses} ${clickableClasses} ${loadingClasses} ${bgClasses} ${textClasses}`;
  }

  get imageClasses(): string {
    const baseClasses = 'w-full h-full object-cover';
    const shapeClasses = this.getShapeClasses();
    
    return `${baseClasses} ${shapeClasses}`;
  }

  get initialsClasses(): string {
    const sizeClasses = this.getInitialsSizeClasses();
    const textClasses = this.textColor ? '' : 'text-muted-foreground';
    return `font-medium ${textClasses} ${sizeClasses}`;
  }

  get iconClasses(): string {
    const sizeClasses = this.getIconSizeClasses();
    return `text-muted-foreground ${sizeClasses}`;
  }

  get statusClasses(): string {
    const baseClasses = 'absolute border-2 border-background rounded-full';
    const sizeClasses = this.getStatusSizeClasses();
    const positionClasses = this.getStatusPositionClasses();
    const colorClasses = this.getStatusColorClasses();
    
    return `${baseClasses} ${sizeClasses} ${positionClasses} ${colorClasses}`;
  }

  get badgeClasses(): string {
    const baseClasses = 'absolute flex items-center justify-center bg-destructive text-destructive-foreground rounded-full border-2 border-background';
    const sizeClasses = this.getBadgeSizeClasses();
    const positionClasses = this.getBadgePositionClasses();
    
    return `${baseClasses} ${sizeClasses} ${positionClasses}`;
  }

  private getSizeClasses(): string {
    const sizeMap = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
      '2xl': 'w-20 h-20'
    };
    return sizeMap[this.size];
  }

  private getShapeClasses(): string {
    const shapeMap = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg'
    };
    return shapeMap[this.shape];
  }

  private getInitialsSizeClasses(): string {
    const sizeMap = {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
      '2xl': 'text-xl'
    };
    return sizeMap[this.size];
  }

  private getIconSizeClasses(): string {
    const sizeMap = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10'
    };
    return sizeMap[this.size];
  }

  private getStatusSizeClasses(): string {
    const sizeMap = {
      xs: 'w-2 h-2',
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5'
    };
    return sizeMap[this.size];
  }

  private getStatusPositionClasses(): string {
    const positionMap = {
      xs: 'bottom-0 right-0',
      sm: 'bottom-0 right-0',
      md: 'bottom-0 right-0',
      lg: 'bottom-0.5 right-0.5',
      xl: 'bottom-1 right-1',
      '2xl': 'bottom-1 right-1'
    };
    return positionMap[this.size];
  }

  private getStatusColorClasses(): string {
    const colorMap = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };
    return colorMap[this.status!] || '';
  }

  private getBadgeSizeClasses(): string {
    const sizeMap = {
      xs: 'w-4 h-4 min-w-4',
      sm: 'w-5 h-5 min-w-5',
      md: 'w-6 h-6 min-w-6',
      lg: 'w-6 h-6 min-w-6',
      xl: 'w-7 h-7 min-w-7',
      '2xl': 'w-8 h-8 min-w-8'
    };
    return sizeMap[this.size];
  }

  private getBadgePositionClasses(): string {
    const positionMap = {
      xs: '-top-1 -right-1',
      sm: '-top-1 -right-1',
      md: '-top-2 -right-2',
      lg: '-top-2 -right-2',
      xl: '-top-2 -right-2',
      '2xl': '-top-3 -right-3'
    };
    return positionMap[this.size];
  }

  onClick(): void {
    if (this.clickable) {
      this.clicked.emit();
    }
  }

  onImageError(): void {
    this.imageLoadError = true;
    this.imageError.emit();
  }

  onImageLoad(): void {
    this.imageLoadError = false;
    this.imageLoad.emit();
  }
}

// Avatar Group Component for displaying multiple avatars
@Component({
  selector: 'ui-avatar-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="groupClasses">
      <ng-content></ng-content>
      
      <!-- More indicator -->
      <div
        *ngIf="max && totalCount > max"
        [class]="moreClasses"
        [title]="'+' + (totalCount - max) + ' more'"
      >
        <span class="text-xs font-medium">+{{ totalCount - max }}</span>
      </div>
    </div>
  `
})
export class AvatarGroupComponent {
  @Input() max?: number;
  @Input() size: AvatarSize = 'md';
  @Input() totalCount = 0;
  @Input() spacing: 'tight' | 'normal' | 'loose' = 'normal';

  get groupClasses(): string {
    const baseClasses = 'flex items-center';
    const spacingClasses = this.getSpacingClasses();
    
    return `${baseClasses} ${spacingClasses}`;
  }

  get moreClasses(): string {
    const baseClasses = 'relative inline-flex items-center justify-center font-medium text-muted-foreground bg-muted border-2 border-background rounded-full';
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  }

  private getSpacingClasses(): string {
    const spacingMap = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: 'space-x-1'
    };
    return spacingMap[this.spacing];
  }

  private getSizeClasses(): string {
    const sizeMap = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
      '2xl': 'w-20 h-20'
    };
    return sizeMap[this.size];
  }
}