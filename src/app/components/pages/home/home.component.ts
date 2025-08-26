import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
import { AuthUserRoleService, AuthUserState } from '../../../core/services/auth-user-role.service';
import { UserRole } from '../../../models/user-role.model';
import { User } from '../../../core/services/user.service';

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
        <!-- Auth Debug Info (Development Only) -->
        <!-- <div *ngIf="authDebugInfo" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-yellow-800 mb-3">🔐 Authentication Debug Info</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 class="font-medium text-yellow-800">Backend User:</h4>
              <p><strong>Name:</strong> {{ authDebugInfo.backendUser?.userName || 'Not loaded' }}</p>
              <p><strong>Email:</strong> {{ authDebugInfo.backendUser?.emailId || 'Not loaded' }}</p>
              <p><strong>Role Code:</strong> {{ authDebugInfo.backendUser?.role || 'Not loaded' }}</p>
            </div>
            <div>
              <h4 class="font-medium text-yellow-800">Current Role:</h4>
              <p><strong>Name:</strong> {{ authDebugInfo.currentRole?.name || 'Not loaded' }}</p>
              <p><strong>Code:</strong> {{ authDebugInfo.currentRole?.id || 'Not loaded' }}</p>
              <p><strong>Read-Only:</strong> {{ authDebugInfo.currentRole?.isReadOnly ? 'Yes' : 'No' }}</p>
            </div>
            <div class="md:col-span-2">
              <h4 class="font-medium text-yellow-800">Permissions from Database:</h4>
              <div class="flex flex-wrap gap-1 mt-1">
                <span *ngFor="let permission of authDebugInfo.permissions" 
                      class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  {{ permission }}
                </span>
                <span *ngIf="!authDebugInfo.permissions?.length" class="text-yellow-600 italic">No permissions loaded</span>
              </div>
            </div>
            <div class="md:col-span-2">
              <p><strong>Is Loaded:</strong> {{ authDebugInfo.isLoaded ? 'Yes' : 'No' }}</p>
              <p><strong>Is Authenticated:</strong> {{ authDebugInfo.isAuthenticated ? 'Yes' : 'No' }}</p>
            </div>
          </div>
        </div> -->

        <!-- Welcome Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold mb-2">Welcome back, {{ displayUserName }}!</h1>
              <p class="text-blue-100 mb-4">{{ currentDate }}</p>
              <div class="flex items-center gap-6 text-sm">
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="Activity" class="h-4 w-4"></lucide-icon>
                  <span>5 active projects</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="Target" class="h-4 w-4"></lucide-icon>
                  <span>34 forecasts this month</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="Zap" class="h-4 w-4"></lucide-icon>
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
                    <lucide-icon [name]="Activity" class="h-5 w-5"></lucide-icon>
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
                      <lucide-icon [name]="activity.icon" class="h-4 w-4"></lucide-icon>
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
                    <lucide-icon [name]="CheckCircle2" class="h-5 w-5"></lucide-icon>
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
export class HomeComponent implements OnInit, OnDestroy {
  @Input() currentUser = 'Current User';

  // Auth debug info
  authDebugInfo: any = null;
  displayUserName = 'Current User';
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authUserRoleService: AuthUserRoleService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth user state changes for debugging
    this.authSubscription = this.authUserRoleService.authUserState$.subscribe((authUserState: AuthUserState) => {
      console.log('🏠 HomeComponent - Auth user state changed:', authUserState);
      
      // Update debug info
      this.authDebugInfo = {
        isLoaded: authUserState.isLoaded,
        isAuthenticated: authUserState.isAuthenticated,
        backendUser: authUserState.user,
        currentRole: authUserState.userRole,
        permissions: authUserState.permissions,
        backendRole: authUserState.backendRole
      };

      // Update display name
      this.displayUserName = authUserState.user?.userName || 
                            authUserState.userRole?.name || 
                            'Current User';
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

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