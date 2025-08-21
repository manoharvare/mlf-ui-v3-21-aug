import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  BarChart3,
  FileText,
  Database
} from 'lucide-angular';
import { CardComponent } from '../ui/card.component';
import { ButtonComponent } from '../ui/button.component';
import { BadgeComponent } from '../ui/badge.component';
import { InputComponent } from '../ui/input.component';
import { TextareaComponent } from '../ui/textarea.component';
import { ModalComponent } from '../ui/modal.component';
import { DropdownComponent } from '../ui/dropdown.component';

interface Report {
  id: string;
  name: string;
  description: string;
  powerbiLink: string;
  category: 'finance' | 'operations' | 'analytics' | 'custom';
  createdAt: string;
  lastModified: string;
}

@Component({
  selector: 'app-power-bi-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    InputComponent,
    TextareaComponent,
    ModalComponent,
    DropdownComponent
  ],
  template: `
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Add Report Button -->
        <div class="flex justify-end mb-6">
          <ui-button [leftIcon]="Plus" (clicked)="openDialog()">
            Add Report
          </ui-button>
        </div>

        <!-- Reports Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          <ui-card 
            *ngFor="let report of reports" 
            class="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
            [padding]="'none'"
          >
            <div class="p-6 flex flex-col flex-1">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div [class]="'p-2 rounded-lg ' + getCategoryColor(report.category)">
                    <lucide-icon [name]="getCategoryIcon(report.category)" [size]="16"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">{{ report.name }}</h3>
                    <ui-badge variant="secondary" class="mt-1 text-xs">
                      {{ report.category }}
                    </ui-badge>
                  </div>
                </div>
                
                <div class="relative">
                  <ui-button 
                    variant="ghost" 
                    size="sm"
                    (clicked)="toggleDropdown(report.id)"
                  >
                    <lucide-icon [name]="MoreVertical" [size]="16"></lucide-icon>
                  </ui-button>
                    
                  <!-- Dropdown Menu -->
                  <div 
                    *ngIf="openDropdownId === report.id"
                    class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                  >
                    <div class="py-1">
                      <button
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        (click)="editReport(report)"
                      >
                        <lucide-icon [name]="Edit" [size]="16" class="mr-2"></lucide-icon>
                        Edit
                      </button>
                      <button
                        class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        (click)="deleteReport(report.id)"
                      >
                        <lucide-icon [name]="Trash2" [size]="16" class="mr-2"></lucide-icon>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Description -->
              <p class="text-muted-foreground mb-4 line-clamp-3 flex-1">
                {{ report.description }}
              </p>
              
              <!-- Footer -->
              <div class="space-y-3 mt-auto">
                <div class="text-xs text-gray-500">
                  <div>Created: {{ formatDate(report.createdAt) }}</div>
                  <div>Modified: {{ formatDate(report.lastModified) }}</div>
                </div>
                
                <ui-button 
                  class="w-full" 
                  [leftIcon]="ExternalLink"
                  (clicked)="openReport(report.powerbiLink)"
                >
                  Open Report
                </ui-button>
              </div>
            </div>
          </ui-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="reports.length === 0" class="text-center py-12">
          <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <lucide-icon [name]="BarChart3" [size]="48" class="text-gray-400 mx-auto mb-4"></lucide-icon>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
            <p class="text-gray-600 mb-4">
              Get started by creating your first PowerBI report dashboard.
            </p>
            <ui-button [leftIcon]="Plus" (clicked)="openDialog()">
              Add Your First Report
            </ui-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Report Modal -->
    <ui-modal 
      [isOpen]="isDialogOpen" 
      [title]="editingReport ? 'Edit Report' : 'Add New Report'"
      (onClose)="closeDialog()"
    >
      <div class="space-y-4">
        <p class="text-muted-foreground">
          {{ editingReport 
            ? 'Update the report information and PowerBI link below.' 
            : 'Create a new PowerBI report by filling in the details below.'
          }}
        </p>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Report Name *</label>
          <ui-input
            placeholder="Enter report name"
            [(ngModel)]="formData.name"
          ></ui-input>
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <ui-textarea
            placeholder="Enter report description"
            [(ngModel)]="formData.description"
            [rows]="3"
          ></ui-textarea>
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">PowerBI Link *</label>
          <ui-input
            placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
            [(ngModel)]="formData.powerbiLink"
          ></ui-input>
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Category</label>
          <select
            class="w-full px-3 py-2 border border-input rounded-md bg-input-background"
            [(ngModel)]="formData.category"
          >
            <option value="finance">Finance</option>
            <option value="operations">Operations</option>
            <option value="analytics">Analytics</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div class="flex justify-end gap-2 pt-4">
          <ui-button variant="outline" (clicked)="closeDialog()">
            Cancel
          </ui-button>
          <ui-button (clicked)="saveReport()">
            {{ editingReport ? 'Update Report' : 'Create Report' }}
          </ui-button>
        </div>
      </div>
    </ui-modal>
  `
})
export class PowerBIReportsComponent implements OnInit {
  // Icon references
  Plus = Plus;
  MoreVertical = MoreVertical;
  Edit = Edit;
  Trash2 = Trash2;
  ExternalLink = ExternalLink;
  BarChart3 = BarChart3;
  FileText = FileText;
  Database = Database;

  reports: Report[] = [
    {
      id: '1',
      name: 'MLF Financial Dashboard',
      description: 'Comprehensive financial analytics and budget tracking for Monthly Labor Forecasting',
      powerbiLink: 'https://app.powerbi.com/reportEmbed?reportId=sample-finance-report',
      category: 'finance',
      createdAt: '2024-01-15',
      lastModified: '2024-01-20'
    },
    {
      id: '2', 
      name: 'Project Performance Analytics',
      description: 'Real-time project progress, resource utilization and performance metrics',
      powerbiLink: 'https://app.powerbi.com/reportEmbed?reportId=sample-operations-report',
      category: 'operations',
      createdAt: '2024-01-10',
      lastModified: '2024-01-18'
    },
    {
      id: '3',
      name: 'Craft Resource Analysis',
      description: 'Detailed breakdown of craft allocation, productivity and forecasting trends',
      powerbiLink: 'https://app.powerbi.com/reportEmbed?reportId=sample-analytics-report',
      category: 'analytics',
      createdAt: '2024-01-05',
      lastModified: '2024-01-16'
    }
  ];

  isDialogOpen = false;
  editingReport: Report | null = null;
  openDropdownId: string | null = null;
  
  formData = {
    name: '',
    description: '',
    powerbiLink: '',
    category: 'custom' as Report['category']
  };

  categoryIcons = {
    finance: BarChart3,
    operations: Database,
    analytics: FileText,
    custom: ExternalLink
  };

  categoryColors = {
    finance: 'bg-green-100 text-green-800',
    operations: 'bg-blue-100 text-blue-800',
    analytics: 'bg-purple-100 text-purple-800',
    custom: 'bg-gray-100 text-gray-800'
  };

  ngOnInit(): void {
    // Component initialization
  }

  openDialog(report?: Report): void {
    if (report) {
      this.editingReport = report;
      this.formData = {
        name: report.name,
        description: report.description,
        powerbiLink: report.powerbiLink,
        category: report.category
      };
    } else {
      this.editingReport = null;
      this.formData = {
        name: '',
        description: '',
        powerbiLink: '',
        category: 'custom'
      };
    }
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.editingReport = null;
  }

  saveReport(): void {
    if (!this.formData.name.trim() || !this.formData.powerbiLink.trim()) {
      alert('Please fill in required fields');
      return;
    }

    if (this.editingReport) {
      // Update existing report
      const index = this.reports.findIndex(r => r.id === this.editingReport!.id);
      if (index !== -1) {
        this.reports[index] = {
          ...this.reports[index],
          ...this.formData,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      console.log('Report updated successfully');
    } else {
      // Create new report
      const newReport: Report = {
        id: Date.now().toString(),
        ...this.formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      this.reports.push(newReport);
      console.log('Report created successfully');
    }

    this.closeDialog();
  }

  editReport(report: Report): void {
    this.openDropdownId = null;
    this.openDialog(report);
  }

  deleteReport(reportId: string): void {
    this.reports = this.reports.filter(report => report.id !== reportId);
    this.openDropdownId = null;
    console.log('Report deleted successfully');
  }

  openReport(powerbiLink: string): void {
    if (powerbiLink.startsWith('http')) {
      window.open(powerbiLink, '_blank');
    } else {
      alert('Invalid PowerBI link');
    }
  }

  toggleDropdown(reportId: string): void {
    this.openDropdownId = this.openDropdownId === reportId ? null : reportId;
  }

  getCategoryIcon(category: Report['category']): any {
    return this.categoryIcons[category];
  }

  getCategoryColor(category: Report['category']): string {
    return this.categoryColors[category];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}