import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  LucideAngularModule,
  CheckCircle2,
  Settings,
  BarChart3,
  ArrowRight,
  Activity,
  Target,
  Zap,
  Database,
  Clock,
  TrendingUp,
  LucideIconData
} from 'lucide-angular';
import { CardComponent } from '../../ui/card.component';
import { ButtonComponent } from '../../ui/button.component';
import { BadgeComponent } from '../../ui/badge.component';
import { ProgressComponent } from '../../ui/progress.component';

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  time: string;
  status: string;
  icon: LucideIconData;
}

interface ApprovalSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalThisMonth: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ProgressComponent
  ],
  template: `
    <div class="h-full overflow-auto bg-background">
      <div class="p-6 space-y-6">
        <!-- Welcome Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold mb-2">Welcome back, {{ currentUser }}!</h1>
              <p class="text-blue-100 mb-4">{{ currentDate }}</p>
              <div class="flex items-center gap-6 text-sm">
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="Activity" [size]="16"></lucide-icon>
                  <span>5 active projects</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="Target" [size]="16"></lucide-icon>
                  <span>34 forecasts this month</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="Zap" [size]="16"></lucide-icon>
                  <span>+5.2% of manhours in total planning</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold">1345</div>
              <div class="text-blue-200">MLF Updates</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Recent Activities -->
          <div class="lg:col-span-2">
            <ui-card>
              <div class="p-6">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold flex items-center gap-2">
                    <lucide-icon [name]="Activity" [size]="20"></lucide-icon>
                    Your Recent Activities
                  </h3>
                  <p class="text-sm text-muted-foreground">Latest actions and updates in the MLF system</p>
                </div>
                
                <div class="space-y-4">
                  <div 
                    *ngFor="let activity of recentActivities" 
                    class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div [class]="'p-2 rounded-full ' + getActivityColor(activity.type)">
                      <lucide-icon [name]="activity.icon" [size]="16"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-sm">{{ activity.title }}</p>
                      <p class="text-muted-foreground text-xs">{{ activity.time }}</p>
                    </div>
                    <ui-badge variant="outline" class="text-xs">
                      {{ activity.status }}
                    </ui-badge>
                  </div>
                </div>
                
                <div class="mt-4 pt-4 border-t">
                  <ui-button 
                    variant="outline" 
                    class="w-full"
                    [leftIcon]="ArrowRight"
                    (clicked)="onViewAllActivities()"
                  >
                    View All Activities
                  </ui-button>
                </div>
              </div>
            </ui-card>
          </div>

          <!-- Approval Summary -->
          <div>
            <ui-card class="h-full flex flex-col">
              <div class="p-6 flex-1 flex flex-col">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold flex items-center gap-2">
                    <lucide-icon [name]="CheckCircle2" [size]="20"></lucide-icon>
                    Approval Summary
                  </h3>
                  <p class="text-sm text-muted-foreground">Current month overview</p>
                </div>
                
                <div class="space-y-4 flex-1 flex flex-col justify-between">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="text-center p-3 bg-orange-50 rounded-lg">
                      <div class="text-2xl font-bold text-orange-600">{{ approvalSummary.pending }}</div>
                      <div class="text-sm text-orange-600">Pending</div>
                    </div>
                    <div class="text-center p-3 bg-green-50 rounded-lg">
                      <div class="text-2xl font-bold text-green-600">{{ approvalSummary.approved }}</div>
                      <div class="text-sm text-green-600">Approved</div>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span>Approval Rate</span>
                      <span>{{ getApprovalRate() }}%</span>
                    </div>
                    <ui-progress [value]="getApprovalRate()" class="h-2"></ui-progress>
                  </div>

                  <div class="pt-2 border-t">
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-muted-foreground">Total this month</span>
                      <span class="font-medium">{{ approvalSummary.totalThisMonth }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Rejected</span>
                      <span class="text-red-600">{{ approvalSummary.rejected }}</span>
                    </div>
                  </div>

                  <ui-button 
                    (clicked)="onNavigateToApprovals()"
                    class="w-full mt-4"
                    size="sm"
                    [leftIcon]="Clock"
                  >
                    Review Pending ({{ approvalSummary.pending }})
                  </ui-button>
                </div>
              </div>
            </ui-card>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  @Input() currentUser = 'Current User';

  constructor(private router: Router) {}

  // Icons
  CheckCircle2 = CheckCircle2;
  Settings = Settings;
  BarChart3 = BarChart3;
  ArrowRight = ArrowRight;
  Activity = Activity;
  Target = Target;
  Zap = Zap;
  Database = Database;
  Clock = Clock;
  TrendingUp = TrendingUp;

  currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'forecast',
      title: 'Updated Monthly Forecast for Project Alpha',
      time: '2 hours ago',
      status: 'completed',
      icon: TrendingUp
    },
    {
      id: 2,
      type: 'approval',
      title: 'Approved variance report for Q4 2024',
      time: '4 hours ago',
      status: 'completed',
      icon: CheckCircle2
    },
    {
      id: 3,
      type: 'rule',
      title: 'Modified L4 to SPC task mapping rule',
      time: '1 day ago',
      status: 'completed',
      icon: Settings
    },
    {
      id: 4,
      type: 'data',
      title: 'Imported master data for craft categories',
      time: '2 days ago',
      status: 'completed',
      icon: Database
    },
    {
      id: 5,
      type: 'report',
      title: 'Generated Power BI variance analysis report',
      time: '3 days ago',
      status: 'completed',
      icon: BarChart3
    }
  ];

  approvalSummary: ApprovalSummary = {
    pending: 8,
    approved: 24,
    rejected: 2,
    totalThisMonth: 34
  };

  getActivityColor(type: string): string {
    switch (type) {
      case 'forecast': return 'text-blue-600 bg-blue-100';
      case 'approval': return 'text-green-600 bg-green-100';
      case 'rule': return 'text-purple-600 bg-purple-100';
      case 'data': return 'text-teal-600 bg-teal-100';
      case 'report': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getApprovalRate(): number {
    return Math.round((this.approvalSummary.approved / this.approvalSummary.totalThisMonth) * 100);
  }

  onNavigateToApprovals(): void {
    this.router.navigate(['/app/forecast-approvals']);
  }

  onViewAllActivities(): void {
    this.router.navigate(['/app/all-activities']);
  }
}