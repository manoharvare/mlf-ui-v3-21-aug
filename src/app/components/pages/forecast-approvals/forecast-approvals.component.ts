import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  User,
  Building2
} from 'lucide-angular';

// UI Components
import { CardComponent } from '../../ui/card.component';
import { ButtonComponent } from '../../ui/button.component';
import { BadgeComponent, BadgeVariant } from '../../ui/badge.component';
import { TableComponent } from '../../ui/table.component';
import { TabsComponent, TabPanelComponent, TabItem } from '../../ui/tabs.component';
import { SelectComponent, SelectOption } from '../../ui/select.component';
import { InputComponent } from '../../ui/input.component';

// Import the variance report component
import { MLFVarianceReportComponent } from '../mlf-variance-report/mlf-variance-report.component';

interface ApprovalData {
  id: string;
  projectName: string;
  projectManager: string;
  submittedBy: string;
  submittedDate: string;
  month: string;
  status: 'pending' | 'approved' | 'rejected';
  totalHours: number;
  variance: number;
  variancePercent: number;
  priority: 'high' | 'medium' | 'low';
  comments: number;
  lastReview: string;
}

@Component({
  selector: 'app-forecast-approvals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    TabsComponent,
    TabPanelComponent,
    SelectComponent,
    InputComponent,
    MLFVarianceReportComponent
  ],
  template: `
    <!-- Show variance report if project is selected -->
    <app-mlf-variance-report 
      *ngIf="selectedProjectId"
      [projectId]="selectedProjectId"
      (backClicked)="onBackFromVarianceReport()"
    ></app-mlf-variance-report>

    <!-- Main forecast approvals view -->
    <div *ngIf="!selectedProjectId" class="space-y-6 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Forecast Approvals</h1>
          <p class="text-muted-foreground">Review and approve submitted monthly labor forecasts</p>
        </div>
        <ui-button variant="outline" [leftIcon]="Download">
          Export All
        </ui-button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ui-card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Pending Approvals</p>
                <p class="text-2xl font-semibold">{{ pendingCount }}</p>
              </div>
              <lucide-icon [name]="Clock" [size]="32" class="text-yellow-500"></lucide-icon>
            </div>
          </div>
        </ui-card>
        <ui-card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Approved</p>
                <p class="text-2xl font-semibold">{{ approvedCount }}</p>
              </div>
              <lucide-icon [name]="CheckCircle" [size]="32" class="text-green-500"></lucide-icon>
            </div>
          </div>
        </ui-card>
        <ui-card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Rejected</p>
                <p class="text-2xl font-semibold">{{ rejectedCount }}</p>
              </div>
              <lucide-icon [name]="XCircle" [size]="32" class="text-red-500"></lucide-icon>
            </div>
          </div>
        </ui-card>
        <ui-card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">This Month</p>
                <p class="text-2xl font-semibold">{{ approvalData.length }}</p>
              </div>
              <lucide-icon [name]="Calendar" [size]="32" class="text-blue-500"></lucide-icon>
            </div>
          </div>
        </ui-card>
      </div>

      <!-- Filters -->
      <ui-card>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Filter & Search</h3>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <ui-input
                placeholder="Search projects, managers, or submitters..."
                [(ngModel)]="searchQuery"
                [leftIcon]="Search"
              ></ui-input>
            </div>
            <ui-select 
              [options]="statusFilterOptions"
              [(ngModel)]="statusFilter"
              placeholder="Filter by status"
              class="w-full md:w-[200px]"
            ></ui-select>
          </div>
        </div>
      </ui-card>

      <!-- Approvals Table -->
      <ui-tabs 
        [tabs]="tabItems" 
        [activeTab]="activeTab"
        (activeTabChange)="onTabChange($event)"
        class="space-y-4"
      >
        <!-- All Forecasts Tab -->
        <ui-tab-panel id="all" [active]="activeTab === 'all'">
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">All Forecast Submissions</h3>
              <p class="text-muted-foreground mb-4">Complete list of monthly labor forecast submissions</p>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-3 px-4">Project</th>
                      <th class="text-left py-3 px-4">Manager</th>
                      <th class="text-left py-3 px-4">Submitted By</th>
                      <th class="text-left py-3 px-4">Date</th>
                      <th class="text-left py-3 px-4">Month</th>
                      <th class="text-left py-3 px-4">Status</th>
                      <th class="text-left py-3 px-4">Priority</th>
                      <th class="text-right py-3 px-4">Total Hours</th>
                      <th class="text-right py-3 px-4">Variance</th>
                      <th class="text-left py-3 px-4">Comments</th>
                      <th class="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of filteredData" class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="Building2" [size]="16" class="text-muted-foreground"></lucide-icon>
                          <div>
                            <p class="font-medium">{{ item.projectName }}</p>
                            <p class="text-sm text-muted-foreground">{{ item.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="User" [size]="16" class="text-muted-foreground"></lucide-icon>
                          {{ item.projectManager }}
                        </div>
                      </td>
                      <td class="py-3 px-4">{{ item.submittedBy }}</td>
                      <td class="py-3 px-4">{{ item.submittedDate }}</td>
                      <td class="py-3 px-4">{{ item.month }}</td>
                      <td class="py-3 px-4">
                        <ui-badge 
                          [variant]="getStatusBadgeVariant(item.status)"
                          [class]="getStatusBadgeClass(item.status)"
                          [leftIcon]="getStatusIcon(item.status)"
                        >
                          {{ getStatusText(item.status) }}
                        </ui-badge>
                      </td>
                      <td class="py-3 px-4">
                        <ui-badge [variant]="getPriorityBadgeVariant(item.priority)">
                          {{ getPriorityText(item.priority) }}
                        </ui-badge>
                      </td>
                      <td class="py-3 px-4 text-right font-mono">{{ item.totalHours.toLocaleString() }}</td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <lucide-icon 
                            [name]="getTrendIcon(item.variance)" 
                            [size]="16" 
                            [class]="getTrendIconClass(item.variance)">
                          </lucide-icon>
                          <span [class]="'font-mono ' + getVarianceColor(item.variance)">
                            {{ item.variance > 0 ? '+' : '' }}{{ item.variance }} ({{ item.variancePercent > 0 ? '+' : '' }}{{ item.variancePercent }}%)
                          </span>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div *ngIf="item.comments > 0" class="flex items-center gap-1">
                          <lucide-icon [name]="MessageSquare" [size]="14" class="text-muted-foreground"></lucide-icon>
                          <span class="text-sm">{{ item.comments }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <ui-button 
                          size="sm" 
                          variant="ghost"
                          [leftIcon]="Eye"
                          (clicked)="viewProject(item.id)"
                        ></ui-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ui-card>
        </ui-tab-panel>

        <!-- Pending Tab -->
        <ui-tab-panel id="pending" [active]="activeTab === 'pending'">
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">Pending Approvals</h3>
              <p class="text-muted-foreground mb-4">Forecasts awaiting your review and approval</p>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-3 px-4">Project</th>
                      <th class="text-left py-3 px-4">Manager</th>
                      <th class="text-left py-3 px-4">Submitted By</th>
                      <th class="text-left py-3 px-4">Date</th>
                      <th class="text-left py-3 px-4">Month</th>
                      <th class="text-left py-3 px-4">Priority</th>
                      <th class="text-right py-3 px-4">Total Hours</th>
                      <th class="text-right py-3 px-4">Variance</th>
                      <th class="text-left py-3 px-4">Comments</th>
                      <th class="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of getPendingData()" class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="Building2" [size]="16" class="text-muted-foreground"></lucide-icon>
                          <div>
                            <p class="font-medium">{{ item.projectName }}</p>
                            <p class="text-sm text-muted-foreground">{{ item.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="User" [size]="16" class="text-muted-foreground"></lucide-icon>
                          {{ item.projectManager }}
                        </div>
                      </td>
                      <td class="py-3 px-4">{{ item.submittedBy }}</td>
                      <td class="py-3 px-4">{{ item.submittedDate }}</td>
                      <td class="py-3 px-4">{{ item.month }}</td>
                      <td class="py-3 px-4">
                        <ui-badge [variant]="getPriorityBadgeVariant(item.priority)">
                          {{ getPriorityText(item.priority) }}
                        </ui-badge>
                      </td>
                      <td class="py-3 px-4 text-right font-mono">{{ item.totalHours.toLocaleString() }}</td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <lucide-icon 
                            [name]="getTrendIcon(item.variance)" 
                            [size]="16" 
                            [class]="getTrendIconClass(item.variance)">
                          </lucide-icon>
                          <span [class]="'font-mono ' + getVarianceColor(item.variance)">
                            {{ item.variance > 0 ? '+' : '' }}{{ item.variance }} ({{ item.variancePercent > 0 ? '+' : '' }}{{ item.variancePercent }}%)
                          </span>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div *ngIf="item.comments > 0" class="flex items-center gap-1">
                          <lucide-icon [name]="MessageSquare" [size]="14" class="text-muted-foreground"></lucide-icon>
                          <span class="text-sm">{{ item.comments }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <ui-button 
                          size="sm" 
                          variant="ghost"
                          [leftIcon]="Eye"
                          (clicked)="viewProject(item.id)"
                        ></ui-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ui-card>
        </ui-tab-panel>

        <!-- Approved Tab -->
        <ui-tab-panel id="approved" [active]="activeTab === 'approved'">
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">Approved Forecasts</h3>
              <p class="text-muted-foreground mb-4">Previously approved monthly labor forecasts</p>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-3 px-4">Project</th>
                      <th class="text-left py-3 px-4">Manager</th>
                      <th class="text-left py-3 px-4">Approved Date</th>
                      <th class="text-left py-3 px-4">Month</th>
                      <th class="text-right py-3 px-4">Total Hours</th>
                      <th class="text-right py-3 px-4">Variance</th>
                      <th class="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of getApprovedData()" class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="Building2" [size]="16" class="text-muted-foreground"></lucide-icon>
                          <div>
                            <p class="font-medium">{{ item.projectName }}</p>
                            <p class="text-sm text-muted-foreground">{{ item.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="User" [size]="16" class="text-muted-foreground"></lucide-icon>
                          {{ item.projectManager }}
                        </div>
                      </td>
                      <td class="py-3 px-4">{{ item.lastReview }}</td>
                      <td class="py-3 px-4">{{ item.month }}</td>
                      <td class="py-3 px-4 text-right font-mono">{{ item.totalHours.toLocaleString() }}</td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <lucide-icon 
                            [name]="getTrendIcon(item.variance)" 
                            [size]="16" 
                            [class]="getTrendIconClass(item.variance)">
                          </lucide-icon>
                          <span [class]="'font-mono ' + getVarianceColor(item.variance)">
                            {{ item.variance > 0 ? '+' : '' }}{{ item.variance }} ({{ item.variancePercent > 0 ? '+' : '' }}{{ item.variancePercent }}%)
                          </span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <ui-button 
                          size="sm" 
                          variant="ghost"
                          [leftIcon]="Eye"
                          (clicked)="viewProject(item.id)"
                        ></ui-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ui-card>
        </ui-tab-panel>

        <!-- Rejected Tab -->
        <ui-tab-panel id="rejected" [active]="activeTab === 'rejected'">
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">Rejected Forecasts</h3>
              <p class="text-muted-foreground mb-4">Monthly labor forecasts that were rejected and require revision</p>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-3 px-4">Project</th>
                      <th class="text-left py-3 px-4">Manager</th>
                      <th class="text-left py-3 px-4">Rejected Date</th>
                      <th class="text-left py-3 px-4">Month</th>
                      <th class="text-right py-3 px-4">Total Hours</th>
                      <th class="text-right py-3 px-4">Variance</th>
                      <th class="text-left py-3 px-4">Comments</th>
                      <th class="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of getRejectedData()" class="border-b hover:bg-gray-50">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="Building2" [size]="16" class="text-muted-foreground"></lucide-icon>
                          <div>
                            <p class="font-medium">{{ item.projectName }}</p>
                            <p class="text-sm text-muted-foreground">{{ item.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <lucide-icon [name]="User" [size]="16" class="text-muted-foreground"></lucide-icon>
                          {{ item.projectManager }}
                        </div>
                      </td>
                      <td class="py-3 px-4">{{ item.lastReview }}</td>
                      <td class="py-3 px-4">{{ item.month }}</td>
                      <td class="py-3 px-4 text-right font-mono">{{ item.totalHours.toLocaleString() }}</td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <lucide-icon 
                            [name]="getTrendIcon(item.variance)" 
                            [size]="16" 
                            [class]="getTrendIconClass(item.variance)">
                          </lucide-icon>
                          <span [class]="'font-mono ' + getVarianceColor(item.variance)">
                            {{ item.variance > 0 ? '+' : '' }}{{ item.variance }} ({{ item.variancePercent > 0 ? '+' : '' }}{{ item.variancePercent }}%)
                          </span>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div *ngIf="item.comments > 0" class="flex items-center gap-1">
                          <lucide-icon [name]="MessageSquare" [size]="14" class="text-muted-foreground"></lucide-icon>
                          <span class="text-sm">{{ item.comments }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <ui-button 
                          size="sm" 
                          variant="ghost"
                          [leftIcon]="Eye"
                          (clicked)="viewProject(item.id)"
                        ></ui-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ui-card>
        </ui-tab-panel>
      </ui-tabs>
    </div>
  `
})
export class ForecastApprovalsComponent implements OnInit, DoCheck {
  // Icons
  CheckCircle = CheckCircle;
  Clock = Clock;
  AlertTriangle = AlertTriangle;
  XCircle = XCircle;
  Search = Search;
  Filter = Filter;
  Download = Download;
  Eye = Eye;
  MessageSquare = MessageSquare;
  TrendingUp = TrendingUp;
  TrendingDown = TrendingDown;
  Minus = Minus;
  Calendar = Calendar;
  User = User;
  Building2 = Building2;

  // Component state
  searchQuery = '';
  statusFilter = 'all';
  selectedProjectId: string | null = null;
  activeTab = 'all';

  // Mock approval data
  approvalData: ApprovalData[] = [
    {
      id: 'proj-001',
      projectName: 'Offshore Platform Alpha',
      projectManager: 'John Smith',
      submittedBy: 'Sarah Johnson',
      submittedDate: '2024-03-15',
      month: 'March 2024',
      status: 'pending',
      totalHours: 2580,
      variance: 120,
      variancePercent: 4.9,
      priority: 'high',
      comments: 3,
      lastReview: '2024-03-14'
    },
    {
      id: 'proj-002',
      projectName: 'Refinery Expansion Beta',
      projectManager: 'Mike Chen',
      submittedBy: 'David Wilson',
      submittedDate: '2024-03-14',
      month: 'March 2024',
      status: 'approved',
      totalHours: 1890,
      variance: -45,
      variancePercent: -2.3,
      priority: 'medium',
      comments: 1,
      lastReview: '2024-03-15'
    },
    {
      id: 'proj-003',
      projectName: 'Pipeline Installation Gamma',
      projectManager: 'Lisa Garcia',
      submittedBy: 'Robert Taylor',
      submittedDate: '2024-03-13',
      month: 'March 2024',
      status: 'rejected',
      totalHours: 3420,
      variance: 280,
      variancePercent: 8.9,
      priority: 'high',
      comments: 5,
      lastReview: '2024-03-15'
    },
    {
      id: 'proj-004',
      projectName: 'Maintenance Facility Delta',
      projectManager: 'Tom Anderson',
      submittedBy: 'Jennifer Lee',
      submittedDate: '2024-03-12',
      month: 'February 2024',
      status: 'pending',
      totalHours: 1650,
      variance: 75,
      variancePercent: 4.8,
      priority: 'low',
      comments: 2,
      lastReview: '2024-03-13'
    },
    {
      id: 'proj-005',
      projectName: 'Storage Tank Epsilon',
      projectManager: 'Amanda White',
      submittedBy: 'Chris Brown',
      submittedDate: '2024-03-11',
      month: 'February 2024',
      status: 'approved',
      totalHours: 2240,
      variance: 15,
      variancePercent: 0.7,
      priority: 'medium',
      comments: 1,
      lastReview: '2024-03-14'
    }
  ];

  // Filter options
  statusFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Tab configuration
  tabItems: TabItem[] = [];

  ngOnInit() {
    this.updateTabItems();
  }

  ngDoCheck() {
    // Update tab counts when filtered data changes
    this.updateTabItems();
  }

  // Computed properties
  get filteredData(): ApprovalData[] {
    return this.approvalData.filter(item => {
      const matchesSearch = item.projectName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.projectManager.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.submittedBy.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || item.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get pendingCount(): number {
    return this.approvalData.filter(item => item.status === 'pending').length;
  }

  get approvedCount(): number {
    return this.approvalData.filter(item => item.status === 'approved').length;
  }

  get rejectedCount(): number {
    return this.approvalData.filter(item => item.status === 'rejected').length;
  }

  // Tab data methods
  getPendingData(): ApprovalData[] {
    return this.filteredData.filter(item => item.status === 'pending');
  }

  getApprovedData(): ApprovalData[] {
    return this.filteredData.filter(item => item.status === 'approved');
  }

  getRejectedData(): ApprovalData[] {
    return this.filteredData.filter(item => item.status === 'rejected');
  }

  // Update tab items with counts
  updateTabItems() {
    this.tabItems = [
      { id: 'all', label: `All Forecasts (${this.filteredData.length})` },
      { id: 'pending', label: `Pending (${this.getPendingData().length})` },
      { id: 'approved', label: `Approved (${this.getApprovedData().length})` },
      { id: 'rejected', label: `Rejected (${this.getRejectedData().length})` }
    ];
  }

  // Event handlers
  onTabChange(tabId: string) {
    this.activeTab = tabId;
  }

  viewProject(projectId: string) {
    this.selectedProjectId = projectId;
  }

  onBackFromVarianceReport() {
    this.selectedProjectId = null;
  }

  // Badge and styling methods
  getStatusBadgeVariant(status: string): BadgeVariant {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return Clock;
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  getPriorityBadgeVariant(priority: string): BadgeVariant {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  getPriorityText(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  getVarianceColor(variance: number): string {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  }

  getTrendIcon(variance: number) {
    if (variance > 0) return TrendingUp;
    if (variance < 0) return TrendingDown;
    return Minus;
  }

  getTrendIconClass(variance: number): string {
    if (variance > 0) return 'text-red-500';
    if (variance < 0) return 'text-green-500';
    return 'text-gray-400';
  }
}