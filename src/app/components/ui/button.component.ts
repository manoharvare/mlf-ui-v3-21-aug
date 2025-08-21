import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Download,
  MoreHorizontal,
  Settings2,
  MapPin,
  Building2,
  Flag,
  Briefcase,
  Save,
  RotateCcw,
  Loader2,
  LogOut
} from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="buttonClasses"
      (click)="handleClick($event)"
    >
      <!-- Loading spinner -->
      <lucide-icon 
        *ngIf="loading" 
        [name]="Loader2" 
        [size]="iconSize"
        class="animate-spin">
      </lucide-icon>
      
      <!-- Left icon -->
      <lucide-icon 
        *ngIf="leftIcon && !loading" 
        [name]="leftIcon" 
        [size]="iconSize"
        class="shrink-0">
      </lucide-icon>
      
      <!-- Content -->
      <span *ngIf="!loading || showTextWhileLoading">
        <ng-content></ng-content>
      </span>
      
      <!-- Right icon -->
      <lucide-icon 
        *ngIf="rightIcon && !loading" 
        [name]="rightIcon" 
        [size]="iconSize"
        class="shrink-0 opacity-50">
      </lucide-icon>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() showTextWhileLoading = false;
  @Input() leftIcon?: any;
  @Input() rightIcon?: any;
  @Input() fullWidth = false;
  
  @Output() clicked = new EventEmitter<Event>();

  // Icon references for template
  Plus = Plus;
  Trash2 = Trash2;
  Pencil = Pencil;
  Upload = Upload;
  Download = Download;
  MoreHorizontal = MoreHorizontal;
  Settings2 = Settings2;
  MapPin = MapPin;
  Building2 = Building2;
  Flag = Flag;
  Briefcase = Briefcase;
  Save = Save;
  RotateCcw = RotateCcw;
  Loader2 = Loader2;
  LogOut = LogOut;

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    const widthClasses = this.fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses}`.trim();
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      default: return 16;
    }
  }

  private getVariantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground shadow hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80';
      case 'outline':
        return 'border bg-background text-foreground hover:bg-accent hover:text-accent-foreground';
      case 'ghost':
        return 'hover:bg-accent hover:text-accent-foreground';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90';
      default:
        return 'bg-primary text-primary-foreground shadow hover:bg-primary/90';
    }
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'h-8 px-3 text-xs';
      case 'md':
        return 'h-9 px-4 py-2';
      case 'lg':
        return 'h-10 px-8';
      default:
        return 'h-9 px-4 py-2';
    }
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}