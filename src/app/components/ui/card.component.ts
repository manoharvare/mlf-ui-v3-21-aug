import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  BarChart3,
  Layout,
  Settings,
  Home,
  Database,
  FileText,
  CheckSquare,
  BookOpen,
  PieChart,
  Users,
  LucideIconData
} from 'lucide-angular';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [ngClass]="cardClasses">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() variant: 'default' | 'outline' | 'ghost' = 'default';
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'sm';
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hover = false;

  get cardClasses(): string {
    const baseClasses = 'transition-colors';
    const variantClasses = this.getVariantClasses();
    const paddingClasses = this.getPaddingClasses();
    const shadowClasses = this.getShadowClasses();
    const roundedClasses = this.getRoundedClasses();
    const hoverClasses = this.hover ? 'hover:bg-accent/50 cursor-pointer' : '';
    
    return `${baseClasses} ${variantClasses} ${paddingClasses} ${shadowClasses} ${roundedClasses} ${hoverClasses}`.trim();
  }

  private getVariantClasses(): string {
    switch (this.variant) {
      case 'default':
        return 'bg-card text-card-foreground border border-border';
      case 'outline':
        return 'border border-border bg-transparent';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-card text-card-foreground border border-border';
    }
  }

  private getPaddingClasses(): string {
    switch (this.padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  }

  private getShadowClasses(): string {
    switch (this.shadow) {
      case 'none':
        return '';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  }

  private getRoundedClasses(): string {
    switch (this.rounded) {
      case 'none':
        return '';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      default:
        return 'rounded-md';
    }
  }
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col space-y-1.5 p-6">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent {}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center gap-2">
      <lucide-icon *ngIf="icon" [name]="icon" [size]="iconSize" class="text-primary"></lucide-icon>
      <h3 class="font-semibold leading-none tracking-tight" [ngClass]="titleClasses">
        <ng-content></ng-content>
      </h3>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardTitleComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() icon?: LucideIconData;

  // Icon references for template
  BarChart3 = BarChart3;
  Layout = Layout;
  Settings = Settings;
  Home = Home;
  Database = Database;
  FileText = FileText;
  CheckSquare = CheckSquare;
  BookOpen = BookOpen;
  PieChart = PieChart;
  Users = Users;

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 16;
      case 'md': return 18;
      case 'lg': return 20;
      case 'xl': return 24;
      default: return 18;
    }
  }

  get titleClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  }
}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="text-sm text-muted-foreground">
      <ng-content></ng-content>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardDescriptionComponent {}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardContentComponent {}

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardFooterComponent {}