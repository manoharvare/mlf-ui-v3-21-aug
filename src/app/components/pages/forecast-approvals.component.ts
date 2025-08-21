import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Check,
  X,
  MessageSquare
} from 'lucide-angular';
import { CardComponent } from '../ui/card.component';
import { ButtonComponent } from '../ui/button.component';
import { BadgeComponent } from '../ui/badge.component';

@Component({
  selector: 'app-forecast-approvals',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent
  ],
  template: `
    <div class="h-full overflow-auto bg-background">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <lucide-icon [name]="CheckCircle2" [size]="24" class="text-green-500"></lucide-icon>
          <div>
            <h2 class="text-xl font-semibold">Forecast Approvals</h2>
            <p class="text-sm text-muted-foreground">Review and approve submitted forecasts</p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ui-card>
            <div class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p class="text-2xl font-bold text-orange-600">8</p>
                </div>
                <lucide-icon [name]="Clock" [size]="24" class="text-orange-500"></lucide-icon>
              </div>
            </div>
          </ui-card>
          
          <ui-card>
            <div class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Approved This Month</p>
                  <p class="text-2xl font-bold text-green-600">24</p>
                </div>
                <lucide-icon [name]="CheckCircle2" [size]="24" class="text-green-500"></lucide-icon>
              </div>
            </div>
          </ui-card>
          
          <ui-card>
            <div class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Requires Review</p>
                  <p class="text-2xl font-bold text-red-600">3</p>
                </div>
                <lucide-icon [name]="AlertTriangle" [size]="24" class="text-red-500"></lucide-icon>
              </div>
            </div>
          </ui-card>
        </div>

        <!-- Pending Approvals -->
        <ui-card>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">Pending Approvals</h3>
            
            <div class="space-y-4">
              <div *ngFor="let approval of pendingApprovals" class="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h4 class="font-medium">{{ approval.projectName }}</h4>
                      <ui-badge [variant]="approval.priority === 'high' ? 'destructive' : approval.priority === 'medium' ? 'warning' : 'secondary'">
                        {{ approval.priority | titlecase }} Priority
                      </ui-badge>
                    </div>
                    <p class="text-sm text-muted-foreground mb-2">{{ approval.description }}</p>
                    <div class="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Submitted: {{ approval.submittedDate }}</span>
                      <span>By: {{ approval.submittedBy }}</span>
                      <span>Forecast Period: {{ approval.forecastPeriod }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 ml-4">
                    <ui-button variant="outline" size="sm">
                      <lucide-icon [name]="Eye" [size]="14" class="mr-2"></lucide-icon>
                      Review
                    </ui-button>
                    <ui-button variant="outline" size="sm">
                      <lucide-icon [name]="MessageSquare" [size]="14" class="mr-2"></lucide-icon>
                      Comment
                    </ui-button>
                    <ui-button variant="destructive" size="sm">
                      <lucide-icon [name]="X" [size]="14" class="mr-2"></lucide-icon>
                      Reject
                    </ui-button>
                    <ui-button size="sm">
                      <lucide-icon [name]="Check" [size]="14" class="mr-2"></lucide-icon>
                      Approve
                    </ui-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ui-card>
      </div>
    </div>
  `
})
export class ForecastApprovalsComponent {
  // Icons
  CheckCircle2 = CheckCircle2;
  Clock = Clock;
  AlertTriangle = AlertTriangle;
  Eye = Eye;
  Check = Check;
  X = X;
  MessageSquare = MessageSquare;

  pendingApprovals = [
    {
      id: 1,
      projectName: 'Project Alpha - Monthly Forecast',
      description: 'February 2024 labor forecast with updated activity spreads and craft allocations',
      submittedDate: '2024-01-28',
      submittedBy: 'John Smith',
      forecastPeriod: 'Feb 2024',
      priority: 'high'
    },
    {
      id: 2,
      projectName: 'Project Beta - Variance Report',
      description: 'Q4 2023 variance analysis showing 5.2% increase in manhours',
      submittedDate: '2024-01-27',
      submittedBy: 'Sarah Johnson',
      forecastPeriod: 'Q4 2023',
      priority: 'medium'
    },
    {
      id: 3,
      projectName: 'Project Gamma - Forecast Update',
      description: 'Revised forecast incorporating new P6 schedule updates',
      submittedDate: '2024-01-26',
      submittedBy: 'Mike Davis',
      forecastPeriod: 'Mar 2024',
      priority: 'low'
    }
  ];
}