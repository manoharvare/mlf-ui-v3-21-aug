import { Component, Input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  LucideAngularModule,
  ArrowLeft,
  Download,
  Upload,
  History,
  FileDown,
  Check,
  ChevronsUpDown,
  X,
  GitCompare,
  RefreshCw,
  Database,
  Calendar
} from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { DialogComponent } from '../ui/dialog.component';
import { LabelComponent } from '../ui/label.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { BadgeComponent } from '../ui/badge.component';
import { DataTableComponent, TableColumn } from '../ui/data-table.component';
import { DropdownComponent, DropdownItem } from '../ui/dropdown.component';
import { PopoverComponent } from '../ui/popover.component';
// import { CommandComponent, CommandItem } from '../ui/command.component';
// import { CheckboxComponent } from '../ui/checkbox.component';

interface TableData {
  [key: string]: string | number;
}

interface Revision {
  id: string;
  name: string;
  date: string;
  isLatest: boolean;
}

interface TabConfig {
  id: string;
  name: string;
  isP6?: boolean;
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    DialogComponent,
    LabelComponent,
    SelectComponent,
    BadgeComponent,
    DataTableComponent,
    DropdownComponent,
    PopoverComponent,
    // CommandComponent,
    // CheckboxComponent
  ],
  template: `
    <div class="p-8">
      <div class="max-w-full mx-auto">
        <!-- Header with Back Button and Week Cutoff -->
        <div class="flex justify-between items-center mb-6">
          <ui-button 
            variant="outline"
            (click)="handleBack()"
            [leftIcon]="ArrowLeft"
          >
            Back to Project List
          </ui-button>

          <!-- Week Cutoff Button -->
          <ui-button 
            variant="outline" 
            class="gap-2"
            (click)="isWeekCutoffDialogOpen.set(true)"
            [leftIcon]="Calendar"
          >
            Week Cutoff: {{ weekCutoff() }}
          </ui-button>
        </div>

      <!-- Left Menu Navigation Layout -->
      <div class="flex gap-6">
        <!-- Left Sidebar Menu -->
        <div class="w-80 flex-shrink-0">
          <div class="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Dataset Categories</h3>
              <p class="text-xs text-muted-foreground">Select a dataset to view and manage its data</p>
            </div>
            
            <nav class="space-y-1">
              <button
                *ngFor="let tab of tabs"
                (click)="activeTab.set(tab.id)"
                [class]="getSidebarTabClasses(tab.id)"
                type="button"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div [class]="getSidebarTabTextClasses(tab.id)">
                      {{ tab.name.length > 35 ? tab.name.substring(0, 32) + '...' : tab.name }}
                    </div>
                    <div *ngIf="tab.isP6" class="flex items-center gap-1 mt-1">
                      <lucide-angular 
                        [img]="Database" 
                        [size]="12" 
                        [class]="getSidebarTabIconClasses(tab.id)"
                      ></lucide-angular>
                      <span [class]="getSidebarTabSubtextClasses(tab.id)">
                        P6 Integration
                      </span>
                    </div>
                  </div>
                  <div 
                    *ngIf="activeTab() === tab.id" 
                    class="w-2 h-2 rounded-full bg-white/80 flex-shrink-0 ml-2"
                  ></div>
                </div>
              </button>
            </nav>
          </div>
        </div>
        
        <!-- Main Content Area -->
        <div class="flex-1 min-w-0">
          <div 
            *ngFor="let tab of tabs"
            class="bg-white rounded-lg border border-gray-200 p-8"
            [style.display]="activeTab() === tab.id ? 'block' : 'none'"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <h4 class="font-medium">{{ tab.name }}</h4>
                <ui-badge *ngIf="tab.isP6" variant="secondary" [leftIcon]="Database" class="gap-1">
                  P6 Data
                </ui-badge>
              </div>
              <div *ngIf="tab.isP6" class="text-xs text-muted-foreground">
                Last sync: Dec 15, 2024 at 3:45 PM
              </div>
            </div>

            <!-- Toolbar -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex flex-wrap items-center gap-4">
                <!-- Export -->
                <ui-button 
                  variant="outline" 
                  size="sm"
                  (click)="handleExport(activeTab())"
                  [leftIcon]="Download"
                  class="gap-2"
                >
                  Export
                </ui-button>

                <!-- Import -->
                <ui-popover 
                  [isOpen]="isImportPopoverOpen()"
                  (openChange)="isImportPopoverOpen.set($event)"
                  placement="bottom-start"
                  contentClass="w-56 p-0"
                >
                  <ui-button
                    slot="trigger"
                    variant="outline"
                    size="sm"
                    [leftIcon]="Upload"
                    [rightIcon]="ChevronsUpDown"
                    class="gap-2"
                  >
                    Import
                  </ui-button>
                  
                  <div slot="content" class="p-2 space-y-1">
                    <ui-button 
                      variant="ghost" 
                      size="sm" 
                      class="w-full justify-start gap-2 text-left"
                      (click)="onDownloadTemplateClick(tab.id)"
                      [leftIcon]="FileDown"
                    >
                      Download Template
                    </ui-button>
                    <ui-button 
                      variant="ghost" 
                      size="sm" 
                      class="w-full justify-start gap-2 text-left"
                      (click)="onImportDataClick()"
                      [leftIcon]="Upload"
                    >
                      Import Data
                    </ui-button>
                  </div>
                </ui-popover>

                <!-- Fetch Latest P6 Data - Only show for P6 tabs -->
                <ui-button 
                  *ngIf="tab.isP6"
                  variant="outline" 
                  size="sm"
                  [loading]="isFetchingP6Data()"
                  [showTextWhileLoading]="true"
                  (click)="handleFetchP6Data(activeTab())"
                  [leftIcon]="Database"
                  class="gap-2"
                >
                  {{ isFetchingP6Data() ? 'Fetching...' : 'Fetch Latest P6 Data' }}
                </ui-button>

                <!-- Revision Selector - Simplified -->
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 min-w-16">Revision:</span>
                  <ui-button
                    variant="outline"
                    size="sm"
                    [rightIcon]="ChevronsUpDown"
                    class="w-72 justify-between"
                  >
                    <span class="truncate">Latest Revision (2024-12-15)</span>
                  </ui-button>
                </div>
              </div>
            </div>

            <!-- Selected Revisions and Compare - Temporarily disabled -->
            <!-- Will be implemented later -->

            <!-- Data Table -->
            <ui-data-table
              [data]="tableData"
              [columns]="tableColumns"
              [loading]="false"
              [pagination]="{ page: 1, pageSize: 20, total: tableData.length, pageSizeOptions: [10, 20, 50, 100] }"
              class="w-full"
            ></ui-data-table>

            <!-- Empty State -->
            <div 
              *ngIf="tableData.length === 0"
              class="text-center py-12 text-muted-foreground"
            >
              <div class="mx-auto mb-4 opacity-50 w-12 h-12 flex items-center justify-center">
                <lucide-angular [img]="Database" size="48"></lucide-angular>
              </div>
              <p class="text-lg font-medium mb-2">No data available</p>
              <p class="text-sm">Import data or fetch from P6 to get started</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <!-- Week Cutoff Dialog -->
      <ui-dialog 
        [isOpen]="isWeekCutoffDialogOpen()"
        (openChange)="onWeekCutoffDialogChange($event)"
        title="Set Week Cutoff"
        description="Choose the day of the week when the weekly reporting period ends."
        maxWidth="max-w-sm"
      >
        <div class="space-y-4">
          <div class="grid w-full gap-2">
            <ui-label htmlFor="weekCutoff" class="text-sm font-medium">Week Cutoff Day</ui-label>
            <ui-select
              id="weekCutoff"
              [options]="weekCutoffOptions"
              (valueChange)="onWeekCutoffChange($event)"
              placeholder="Select day"
              class="w-full"
            ></ui-select>
          </div>
          
          <div class="flex gap-2 pt-4">
            <ui-button 
              (click)="handleSaveWeekCutoff()"
              class="flex-1"
            >
              Save Changes
            </ui-button>
            <ui-button 
              variant="outline"
              (click)="handleCancelWeekCutoff()"
              class="flex-1"
            >
              Cancel
            </ui-button>
          </div>
        </div>
      </ui-dialog>
    </div>
  `
})
export class ProjectDetailsComponent implements OnInit {
  @Input() projectId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Icons
  ArrowLeft = ArrowLeft;
  Download = Download;
  Upload = Upload;
  History = History;
  FileDown = FileDown;
  Check = Check;
  ChevronsUpDown = ChevronsUpDown;
  X = X;
  GitCompare = GitCompare;
  RefreshCw = RefreshCw;
  Database = Database;
  Calendar = Calendar;

  // State
  activeTab = signal('roc-activity');
  isWeekCutoffDialogOpen = signal(false);
  weekCutoff = signal('Thursday');
  editedWeekCutoff = signal('Thursday');
  isFetchingP6Data = signal(false);
  isImportPopoverOpen = signal(false);
  // openRevisionDropdown = signal<{[key: string]: boolean}>({});
  // selectedRevisions = signal<{[key: string]: string[]}>({});

  // Data
  tabs: TabConfig[] = [
    { id: 'roc-activity', name: 'ROC (Rule of Credit) @ activity code level' },
    { id: 'resource-activity', name: 'Resource @ activity code level' },
    { id: 'p6-schedule', name: 'P6 Schedule Data + Attributes', isP6: true },
    { id: 'p6-resource', name: 'P6 Resource Spread', isP6: true },
    { id: 'craft-report', name: 'Craft report from P6', isP6: true },
    { id: 'level4-progress', name: 'Level 4 Progress Register' },
    { id: 'spc-workpack', name: 'SPC Work Pack Progress Detailed Report' }
  ];

  weekCutoffOptions: SelectOption[] = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  tableData: TableData[] = this.generateTableData(20, 10);
  columns = Array.from({ length: 10 }, (_, i) => ({
    id: `column${i + 1}`,
    name: `Column ${i + 1}`
  }));
  
  tableColumns: TableColumn[] = Array.from({ length: 10 }, (_, i) => ({
    key: `column${i + 1}`,
    label: `Column ${i + 1}`,
    sortable: true,
    type: 'text'
  }));

  ngOnInit(): void {
    // Get project ID from route parameters
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = params['id'];
      }
    });
  }

  handleBack(): void {
    this.router.navigate(['/app/project-configurations']);
  }

  private generateTableData(rows: number = 20, columns: number = 10): TableData[] {
    const data: TableData[] = [];
    for (let i = 1; i <= rows; i++) {
      const row: TableData = { id: `row-${i}` };
      for (let j = 1; j <= columns; j++) {
        row[`column${j}`] = `Data ${j}-${i}`;
      }
      data.push(row);
    }
    return data;
  }

  private generateRevisions(projectId: string, tabName: string): Revision[] {
    const dates = [
      '2024-12-15',
      '2024-12-10', 
      '2024-12-05',
      '2024-11-28',
      '2024-11-20'
    ];
    
    return dates.map((date, index) => ({
      id: `${projectId}_${tabName}_revision_${date}`,
      name: `${projectId}_${tabName}_revision_${date}`,
      date,
      isLatest: index === 0
    }));
  }

  getTabClasses(tabId: string): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center';
    const activeClasses = 'border-primary text-primary';
    const inactiveClasses = 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300';
    
    return `${baseClasses} ${this.activeTab() === tabId ? activeClasses : inactiveClasses}`;
  }

  getSidebarTabClasses(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return `w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  }

  getSidebarTabTextClasses(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return `font-medium ${isActive ? 'text-white' : 'text-gray-900'}`;
  }

  getSidebarTabIconClasses(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return isActive ? 'text-white/80' : 'text-blue-600';
  }

  getSidebarTabSubtextClasses(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return `text-xs ${isActive ? 'text-white/80' : 'text-blue-600'}`;
  }

  getActiveTab(): TabConfig | undefined {
    return this.tabs.find(tab => tab.id === this.activeTab());
  }

  getActiveTabName(): string {
    return this.getActiveTab()?.name || '';
  }

  getRevisionDropdownItems(): DropdownItem[] {
    const revisions = this.generateRevisions(this.projectId, this.activeTab());
    return [
      {
        id: 'view-history',
        label: 'View History',
        icon: History
      },
      {
        id: 'compare',
        label: 'Compare Revisions',
        icon: GitCompare
      },
      {
        id: 'separator',
        label: '',
        separator: true
      },
      ...revisions.slice(0, 3).map(revision => ({
        id: revision.id,
        label: `${revision.date}${revision.isLatest ? ' (Latest)' : ''}`,
        icon: revision.isLatest ? Check : undefined
      }))
    ];
  }

  getImportDropdownItems(): DropdownItem[] {
    return [
      {
        id: 'download-template',
        label: 'Download Template',
        icon: FileDown
      },
      {
        id: 'import-data',
        label: 'Import Data',
        icon: Upload
      }
    ];
  }

  onRevisionAction(item: DropdownItem): void {
    if (item.separator) return;
    
    switch (item.id) {
      case 'view-history':
        console.log('View history for', this.activeTab());
        break;
      case 'compare':
        console.log('Compare revisions for', this.activeTab());
        break;
      default:
        console.log('Load revision', item.id);
        break;
    }
  }

  onImportAction(item: DropdownItem): void {
    if (item.separator) return;
    
    switch (item.id) {
      case 'download-template':
        this.handleDownloadTemplate(this.activeTab());
        break;
      case 'import-data':
        this.handleImportData();
        break;
    }
  }

  handleExport(tabId: string): void {
    const csv = [
      this.columns.map(col => col.name).join(','),
      ...this.tableData.map(row => 
        this.columns.map(col => row[col.id]).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.projectId}_${tabId}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  handleDownloadTemplate(tabId: string): void {
    const csv = this.columns.map(col => col.name).join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.projectId}_${tabId}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  handleImportData(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Importing file:', file.name);
        // Import logic would be implemented here
        // For now, just log the file name
      }
    };
    input.click();
  }

  onDownloadTemplateClick(tabId: string): void {
    this.handleDownloadTemplate(tabId);
    // Close popover after a small delay to ensure download starts
    setTimeout(() => {
      this.isImportPopoverOpen.set(false);
    }, 100);
  }

  onImportDataClick(): void {
    this.handleImportData();
    // Close popover after a small delay
    setTimeout(() => {
      this.isImportPopoverOpen.set(false);
    }, 100);
  }



  async handleFetchP6Data(tabId: string): Promise<void> {
    this.isFetchingP6Data.set(true);
    try {
      // Simulate API call to fetch P6 data
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Fetched P6 data for', tabId);
    } catch (error) {
      console.error('Error fetching P6 data:', error);
    } finally {
      this.isFetchingP6Data.set(false);
    }
  }

  handleSaveWeekCutoff(): void {
    this.weekCutoff.set(this.editedWeekCutoff());
    this.isWeekCutoffDialogOpen.set(false);
    console.log('Week cutoff updated to:', this.weekCutoff());
  }

  handleCancelWeekCutoff(): void {
    this.editedWeekCutoff.set(this.weekCutoff());
    this.isWeekCutoffDialogOpen.set(false);
  }

  onWeekCutoffDialogChange(isOpen: boolean): void {
    this.isWeekCutoffDialogOpen.set(isOpen);
    if (isOpen) {
      // Reset edited value to current value when opening dialog
      this.editedWeekCutoff.set(this.weekCutoff());
    }
  }

  onWeekCutoffChange(value: string): void {
    this.editedWeekCutoff.set(value);
  }

  trackByRowId(index: number, item: TableData): string | number {
    return item['id'];
  }

  // Revision selection methods - Simplified for now to avoid hanging issues
  // TODO: Implement proper revision selection functionality later
}