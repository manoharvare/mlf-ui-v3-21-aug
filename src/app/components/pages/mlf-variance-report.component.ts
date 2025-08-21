import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  ArrowLeft,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Building2,
  User,
  Download,
  MessageSquare,
  AlertTriangle
} from 'lucide-angular';
import { CardComponent } from '../ui/card.component';
import { ButtonComponent } from '../ui/button.component';
import { BadgeComponent } from '../ui/badge.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { InputComponent } from '../ui/input.component';
import { TextareaComponent } from '../ui/textarea.component';

interface VarianceData {
  id: number;
  activityCode: string;
  activityName: string;
  l4Activity: string;
  spcActivity: string;
  craftType: string;
  budgetedHours: number;
  forecastedHours: number;
  actualHours: number;
  variance: number;
  variancePercent: number;
  trend: 'up' | 'down' | 'neutral';
  status: 'manual' | 'auto';
  lastUpdated: string;
  comments: string;
}

interface ProjectData {
  id: string;
  name: string;
  manager: string;
  location: string;
  status: string;
  totalBudget: number;
  spent: number;
  remaining: number;
}

@Component({
  selector: 'app-mlf-variance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SelectComponent,
    InputComponent,
    TextareaComponent
  ],
  template: `
    <div class="space-y-6 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <ui-button variant="ghost" size="sm" [leftIcon]="ArrowLeft" (clicked)="onBack.emit()">
            Back to Approvals
          </ui-button>
          <div>
            <h1 class="text-2xl font-semibold">{{ projectData.name }} - Variance Report</h1>
            <p class="text-muted-foreground">Detailed variance analysis and approval workflow</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <ui-badge [variant]="getBadgeVariant()">
            <lucide-icon 
              *ngIf="approvalStatus === 'pending'" 
              [name]="AlertTriangle" 
              [size]="14" 
              class="mr-1">
            </lucide-icon>
            <lucide-icon 
              *ngIf="approvalStatus === 'approved'" 
              [name]="CheckCircle" 
              [size]="14" 
              class="mr-1">
            </lucide-icon>
            <lucide-icon 
              *ngIf="approvalStatus === 'rejected'" 
              [name]="XCircle" 
              [size]="14" 
              class="mr-1">
            </lucide-icon>
            {{ approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1) }}
          </ui-badge>
          <ui-button variant="outline" size="sm" [leftIcon]="Download">
            Export Report
          </ui-button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Project Information -->
        <div class="lg:col-span-1">
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide-icon [name]="Building2" [size]="18"></lucide-icon>
                Project Details
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-muted-foreground">Project Manager</label>
                  <div class="flex items-center gap-2 mt-1">
                    <lucide-icon [name]="User" [size]="16"></lucide-icon>
                    <span>{{ projectData.manager }}</span>
                  </div>
                </div>
                <div>
                  <label class="text-sm text-muted-foreground">Location</label>
                  <p class="mt-1">{{ projectData.location }}</p>
                </div>
                <div>
                  <label class="text-sm text-muted-foreground">Status</label>
                  <p class="mt-1">
                    <ui-badge variant="outline">{{ projectData.status }}</ui-badge>
                  </p>
                </div>
                <div>
                  <label class="text-sm text-muted-foreground">Month</label>
                  <ui-select 
                    [options]="monthOptions"
                    [(ngModel)]="selectedMonth"
                    class="mt-1"
                  ></ui-select>
                </div>
              </div>
            </div>
          </ui-card>

          <!-- Approval Section -->
          <ui-card *ngIf="approvalStatus === 'pending'" class="mt-6">
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide-icon [name]="MessageSquare" [size]="18"></lucide-icon>
                Approval Actions
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-muted-foreground">Comments</label>
                  <ui-textarea
                    placeholder="Add your approval comments..."
                    [(ngModel)]="comments"
                    class="mt-1"
                    [rows]="3"
                  ></ui-textarea>
                </div>
                <div class="flex flex-col gap-2">
                  <ui-button 
                    (clicked)="handleApproval('approve')"
                    class="w-full bg-green-600 hover:bg-green-700"
                    [leftIcon]="CheckCircle"
                  >
                    Approve Forecast
                  </ui-button>
                  <ui-button 
                    variant="destructive"
                    (clicked)="handleApproval('reject')"
                    class="w-full"
                    [leftIcon]="XCircle"
                  >
                    Reject Forecast
                  </ui-button>
                </div>
              </div>
            </div>
          </ui-card>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <ui-card>
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Budgeted Hours</p>
                    <p class="text-2xl font-semibold">{{ totalBudgetedHours.toLocaleString() }}</p>
                  </div>
                  <lucide-icon [name]="Calendar" [size]="32" class="text-muted-foreground"></lucide-icon>
                </div>
              </div>
            </ui-card>
            <ui-card>
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Forecasted Hours</p>
                    <p class="text-2xl font-semibold">{{ totalForecastedHours.toLocaleString() }}</p>
                  </div>
                  <lucide-icon [name]="TrendingUp" [size]="32" class="text-blue-500"></lucide-icon>
                </div>
              </div>
            </ui-card>
            <ui-card>
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Actual Hours</p>
                    <p class="text-2xl font-semibold">{{ totalActualHours.toLocaleString() }}</p>
                  </div>
                  <lucide-icon [name]="CheckCircle" [size]="32" class="text-green-500"></lucide-icon>
                </div>
              </div>
            </ui-card>
            <ui-card>
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Total Variance</p>
                    <p [class]="'text-2xl font-semibold ' + getVarianceTextColor(totalVariance)">
                      {{ totalVariance > 0 ? '+' : '' }}{{ totalVariance }}
                    </p>
                    <p [class]="'text-sm ' + getVarianceTextColor(totalVariancePercent)">
                      {{ totalVariancePercent > 0 ? '+' : '' }}{{ totalVariancePercent.toFixed(1) }}%
                    </p>
                  </div>
                  <lucide-icon 
                    [name]="getTrendIcon(totalVariance > 0 ? 'up' : totalVariance < 0 ? 'down' : 'neutral')" 
                    [size]="32">
                  </lucide-icon>
                </div>
              </div>
            </ui-card>
          </div>

          <!-- Variance Analysis Table -->
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">Detailed Variance Analysis</h3>
              <p class="text-muted-foreground mb-4">
                Activity-level variance breakdown for {{ projectData.name }} - {{ selectedMonth }}
              </p>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left p-2">Activity Code</th>
                      <th class="text-left p-2">Activity Name</th>
                      <th class="text-left p-2">L4 Activity</th>
                      <th class="text-left p-2">SPC Activity</th>
                      <th class="text-left p-2">Craft Type</th>
                      <th class="text-right p-2">Budgeted</th>
                      <th class="text-right p-2">Forecasted</th>
                      <th class="text-right p-2">Actual</th>
                      <th class="text-right p-2">Variance</th>
                      <th class="text-center p-2">Trend</th>
                      <th class="text-center p-2">Type</th>
                      <th class="text-left p-2">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of varianceData" class="border-b hover:bg-gray-50">
                      <td class="p-2 font-mono text-sm">{{ item.activityCode }}</td>
                      <td class="p-2">{{ item.activityName }}</td>
                      <td class="p-2 text-sm text-muted-foreground">{{ item.l4Activity }}</td>
                      <td class="p-2 text-sm text-muted-foreground">{{ item.spcActivity }}</td>
                      <td class="p-2">{{ item.craftType }}</td>
                      <td class="p-2 text-right">{{ item.budgetedHours.toLocaleString() }}</td>
                      <td class="p-2 text-right">{{ item.forecastedHours.toLocaleString() }}</td>
                      <td class="p-2 text-right">{{ item.actualHours.toLocaleString() }}</td>
                      <td class="p-2 text-right">
                        <span [class]="'px-2 py-1 rounded text-sm ' + getVarianceColor(item.variance)">
                          {{ item.variance > 0 ? '+' : '' }}{{ item.variance }} ({{ item.variancePercent > 0 ? '+' : '' }}{{ item.variancePercent.toFixed(1) }}%)
                        </span>
                      </td>
                      <td class="p-2 text-center">
                        <lucide-icon 
                          [name]="getTrendIcon(item.trend)" 
                          [size]="16"
                          [class]="getTrendIconColor(item.trend)">
                        </lucide-icon>
                      </td>
                      <td class="p-2 text-center">
                        <ui-badge [variant]="item.status === 'manual' ? 'outline' : 'secondary'">
                          {{ item.status }}
                        </ui-badge>
                      </td>
                      <td class="p-2 text-sm text-muted-foreground">{{ item.comments }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ui-card>
        </div>
      </div>
    </div>
  `
})
export class MLFVarianceReportComponent implements OnInit {
  @Input() projectId: string = '';
  @Output() onBack = new EventEmitter<void>();

  // Icon references
  ArrowLeft = ArrowLeft;
  CheckCircle = CheckCircle;
  XCircle = XCircle;
  TrendingUp = TrendingUp;
  TrendingDown = TrendingDown;
  Minus = Minus;
  Calendar = Calendar;
  Building2 = Building2;
  User = User;
  Download = Download;
  MessageSquare = MessageSquare;
  AlertTriangle = AlertTriangle;

  selectedMonth = '2024-03';
  comments = '';
  approvalStatus: 'pending' | 'approved' | 'rejected' = 'pending';

  monthOptions: SelectOption[] = [
    { value: '2024-01', label: 'January 2024' },
    { value: '2024-02', label: 'February 2024' },
    { value: '2024-03', label: 'March 2024' },
    { value: '2024-04', label: 'April 2024' }
  ];

  projectData: ProjectData = {
    id: '',
    name: '',
    manager: 'John Smith',
    location: 'Houston, TX',
    status: 'Active',
    totalBudget: 2450000,
    spent: 1470000,
    remaining: 980000
  };

  varianceData: VarianceData[] = [
    {
      id: 1,
      activityCode: 'ACT001',
      activityName: 'Site Preparation',
      l4Activity: 'Excavation',
      spcActivity: 'Bulk Excavation',
      craftType: 'Heavy Equipment Operator',
      budgetedHours: 480,
      forecastedHours: 520,
      actualHours: 495,
      variance: 15,
      variancePercent: 3.1,
      trend: 'up',
      status: 'manual',
      lastUpdated: '2024-03-15',
      comments: 'Additional work required due to soil conditions'
    },
    {
      id: 2,
      activityCode: 'ACT002',
      activityName: 'Foundation Work',
      l4Activity: 'Concrete Pour',
      spcActivity: 'Foundation Concrete',
      craftType: 'Concrete Finisher',
      budgetedHours: 720,
      forecastedHours: 680,
      actualHours: 710,
      variance: -10,
      variancePercent: -1.4,
      trend: 'down',
      status: 'auto',
      lastUpdated: '2024-03-15',
      comments: 'Efficiency improvements in concrete operations'
    },
    {
      id: 3,
      activityCode: 'ACT003',
      activityName: 'Structural Steel',
      l4Activity: 'Steel Erection',
      spcActivity: 'Column Installation',
      craftType: 'Ironworker',
      budgetedHours: 960,
      forecastedHours: 1020,
      actualHours: 980,
      variance: 20,
      variancePercent: 2.1,
      trend: 'up',
      status: 'manual',
      lastUpdated: '2024-03-14',
      comments: 'Weather delays impacted productivity'
    },
    {
      id: 4,
      activityCode: 'ACT004',
      activityName: 'Electrical Systems',
      l4Activity: 'Rough-in',
      spcActivity: 'Conduit Installation',
      craftType: 'Electrician',
      budgetedHours: 640,
      forecastedHours: 640,
      actualHours: 635,
      variance: -5,
      variancePercent: -0.8,
      trend: 'neutral',
      status: 'auto',
      lastUpdated: '2024-03-15',
      comments: 'On track with original estimates'
    }
  ];

  get totalBudgetedHours(): number {
    return this.varianceData.reduce((sum, item) => sum + item.budgetedHours, 0);
  }

  get totalForecastedHours(): number {
    return this.varianceData.reduce((sum, item) => sum + item.forecastedHours, 0);
  }

  get totalActualHours(): number {
    return this.varianceData.reduce((sum, item) => sum + item.actualHours, 0);
  }

  get totalVariance(): number {
    return this.totalForecastedHours - this.totalBudgetedHours;
  }

  get totalVariancePercent(): number {
    return (this.totalVariance / this.totalBudgetedHours) * 100;
  }

  ngOnInit(): void {
    this.projectData.id = this.projectId;
    this.projectData.name = `Project ${this.projectId.split('-')[1] || 'Alpha'}`;
  }

  handleApproval(action: 'approve' | 'reject'): void {
    this.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    console.log(`${action === 'approve' ? 'Approved' : 'Rejected'} project ${this.projectId} with comments: ${this.comments}`);
  }

  getBadgeVariant(): 'outline' | 'default' | 'destructive' {
    switch (this.approvalStatus) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  }

  getTrendIcon(trend: string): any {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  }

  getTrendIconColor(trend: string): string {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-gray-400';
    }
  }

  getVarianceColor(variance: number): string {
    if (variance > 0) return 'text-red-600 bg-red-50';
    if (variance < 0) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  }

  getVarianceTextColor(variance: number): string {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  }
}