import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Settings2,
  MapPin,
  Building2,
  Flag,
  Briefcase,
  Plus,
  Search,
  Upload,
  Download,
  Edit,
  Trash2,
  X,
  MoreHorizontal
} from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { InputComponent } from '../ui/input.component';
import { DialogComponent } from '../ui/dialog.component';
import { LabelComponent } from '../ui/label.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { DropdownComponent, DropdownItem } from '../ui/dropdown.component';

@Component({
  selector: 'app-master-data-configurations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    DialogComponent,
    LabelComponent,
    SelectComponent,
    DropdownComponent
  ],
  template: `
    <div class="p-6">
      <div class="w-full">
        <div class="space-y-6">
          <!-- Tab Header with Add Tab Option -->
          <div class="flex items-center justify-between">
            <div class="border-b border-border flex-1">
              <div class="flex items-center space-x-6 overflow-x-auto">
                <div *ngFor="let tab of masterDataTabs()" class="flex items-center">
                  <button
                    (click)="setActiveTab(tab.id)"
                    [class]="getTabClasses(tab.id)"
                  >
                    <lucide-icon [name]="getTabIcon(tab)" [size]="16"></lucide-icon>
                    {{ tab.name }}
                    <div *ngIf="activeTab() === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                  </button>
                  
                  <!-- Delete button for custom tabs -->
                  <ui-dropdown 
                    *ngIf="!tab.isSystem"
                    [items]="getTabDropdownItems(tab.id)"
                    (itemSelected)="onTabDropdownAction($event, tab.id)"
                    position="bottom-end"
                    [showChevron]="false"
                    class="relative"
                  >
                    <button 
                      slot="trigger" 
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0 ml-1"
                    >
                      <lucide-icon [name]="MoreHorizontal" [size]="12"></lucide-icon>
                    </button>
                  </ui-dropdown>
                </div>
                
                <!-- Add Tab Button -->
                <ui-button 
                  variant="ghost" 
                  size="sm" 
                  class="text-muted-foreground hover:text-foreground pb-3"
                  (clicked)="openAddTabDialog()"
                  [leftIcon]="Plus"
                >
                  Add Tab
                </ui-button>
              </div>
            </div>
          </div>
          
          <!-- Tab Content -->
          <div class="space-y-6">
            <!-- Search and Actions -->
            <div class="flex justify-between items-center gap-4">
              <div class="relative flex-1 max-w-md">
                <ui-input
                  placeholder="Search data..."
                  [(ngModel)]="searchTerm"
                  [leftIcon]="Search"
                ></ui-input>
              </div>
              
              <div class="flex gap-2">
                <ui-button (clicked)="handleImport()" variant="outline" size="sm" [leftIcon]="Upload">
                  Import
                </ui-button>
                <ui-button (clicked)="handleExport()" variant="outline" size="sm" [leftIcon]="Download">
                  Export
                </ui-button>
                <ui-button 
                  size="sm" 
                  (clicked)="openAddColumnDialog()"
                  [leftIcon]="Plus"
                >
                  Add Column
                </ui-button>
                <ui-button (clicked)="setIsAddingRow(true)" size="sm" [leftIcon]="Plus">
                  Add Row
                </ui-button>
              </div>
            </div>

            <!-- Table -->
            <div class="border rounded-lg overflow-hidden">
              <div class="overflow-x-auto max-w-full">
                <table class="w-full">
                  <thead class="bg-muted/50">
                    <tr>
                      <th *ngFor="let column of getCurrentColumns()" class="text-left px-3 py-2 font-medium">
                        {{ column.name }}
                      </th>
                      <th class="w-20 px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Add Row -->
                    <tr *ngIf="isAddingRow()" class="bg-muted/50">
                      <td *ngFor="let column of getCurrentColumns()" class="px-3 py-2">
                        <ui-input
                          [type]="column.type === 'number' ? 'number' : 'text'"
                          [placeholder]="'Enter ' + column.name.toLowerCase()"
                          class="h-8 text-sm"
                          [(ngModel)]="newRowData[column.id]"
                          [id]="'new-row-' + column.id"
                        ></ui-input>
                      </td>
                      <td class="px-3 py-2">
                        <div class="flex gap-1">
                          <ui-button (clicked)="handleAddRow()" size="sm" variant="outline" class="text-xs px-2 py-1">
                            Save
                          </ui-button>
                          <ui-button (clicked)="setIsAddingRow(false)" size="sm" variant="ghost" class="h-8 w-8 p-0">
                            <lucide-icon [name]="X" [size]="12"></lucide-icon>
                          </ui-button>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Data Rows -->
                    <tr *ngFor="let row of getFilteredData()" class="hover:bg-muted/50">
                      <td *ngFor="let column of getCurrentColumns()" class="px-3 py-2">
                        <ui-input
                          *ngIf="editingRow()?.id === row.id; else displayCell"
                          [type]="column.type === 'number' ? 'number' : 'text'"
                          [ngModel]="editingRow()?.[column.id] || ''"
                          (ngModelChange)="updateEditingRow(column.id, $event, column.type)"
                          class="h-8 text-sm"
                          [id]="'edit-' + row.id + '-' + column.id"
                        ></ui-input>
                        <ng-template #displayCell>
                          <span class="text-sm">{{ row[column.id] }}</span>
                        </ng-template>
                      </td>
                      <td class="px-3 py-2">
                        <div class="flex items-center gap-1">
                          <div *ngIf="editingRow()?.id === row.id; else actionButtons" class="flex gap-1">
                            <ui-button (clicked)="handleSaveEdit()" size="sm" variant="outline" class="text-xs px-2 py-1">
                              Save
                            </ui-button>
                            <ui-button (clicked)="setEditingRow(null)" size="sm" variant="ghost" class="h-8 w-8 p-0">
                              <lucide-icon [name]="X" [size]="12"></lucide-icon>
                            </ui-button>
                          </div>
                          <ng-template #actionButtons>
                            <ui-dropdown 
                              [items]="getRowDropdownItems()"
                              (itemSelected)="onRowDropdownAction($event, row)"
                              position="bottom-end"
                              [showChevron]="false"
                              class="relative"
                            >
                              <button 
                                slot="trigger" 
                                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                              >
                                <lucide-icon [name]="MoreHorizontal" [size]="14"></lucide-icon>
                              </button>
                            </ui-dropdown>
                          </ng-template>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Add Row Button -->
            <div class="flex justify-center">
              <ui-button 
                (clicked)="setIsAddingRow(true)" 
                variant="outline" 
                class="border-dashed"
                [leftIcon]="Plus"
              >
                Add New Row
              </ui-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Tab Dialog -->
    <ui-dialog 
      [isOpen]="isAddingTab()" 
      (openChange)="setIsAddingTab($event)"
      title="Create New Master Data Tab"
      description="Create a custom master data table for your specific requirements."
      [showCloseButton]="true"
      [hasFooterSlot]="true"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <ui-label for="add-tab-name">Tab Name</ui-label>
          <ui-input
            id="add-tab-name"
            [(ngModel)]="newTabName"
            placeholder="Enter tab name"
          ></ui-input>
        </div>
        <div class="flex gap-2">
          <ui-button (clicked)="handleAddTab()" class="flex-1">
            Create Tab
          </ui-button>
          <ui-button variant="outline" (clicked)="cancelAddTab()" class="flex-1">
            Cancel
          </ui-button>
        </div>
      </div>
    </ui-dialog>

    <!-- Add Column Dialog -->
    <ui-dialog 
      [isOpen]="isAddColumnDialogOpen()" 
      (openChange)="setIsAddColumnDialogOpen($event)"
      title="Add New Column"
      description="Add a new column to the current master data table."
      [showCloseButton]="true"
      [hasFooterSlot]="true"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <ui-label for="add-column-name">Column Name</ui-label>
          <ui-input
            id="add-column-name"
            [(ngModel)]="newColumnName"
            placeholder="Enter column name"
          ></ui-input>
        </div>
        <div class="space-y-2">
          <ui-label for="add-column-type">Column Type</ui-label>
          <ui-select 
            id="add-column-type"
            [(ngModel)]="newColumnType"
            [options]="columnTypeOptions"
          ></ui-select>
        </div>
        <div class="flex gap-2">
          <ui-button (clicked)="handleAddColumn()" class="flex-1">
            Add Column
          </ui-button>
          <ui-button variant="outline" (clicked)="cancelAddColumn()" class="flex-1">
            Cancel
          </ui-button>
        </div>
      </div>
    </ui-dialog>
  `
})
export class MasterDataConfigurationsComponent {
  // Icons
  Settings2 = Settings2;
  MapPin = MapPin;
  Building2 = Building2;
  Flag = Flag;
  Briefcase = Briefcase;
  Plus = Plus;
  Search = Search;
  Upload = Upload;
  Download = Download;
  Edit = Edit;
  Trash2 = Trash2;
  X = X;
  MoreHorizontal = MoreHorizontal;

  // Icon mapping for tabs
  private iconMap: { [key: string]: any } = {
    'settings2': Settings2,
    'map-pin': MapPin,
    'building2': Building2,
    'flag': Flag,
    'briefcase': Briefcase
  };

  // State signals
  masterDataTabs = signal<MasterDataTab[]>(this.getDefaultMasterDataTabs());
  activeTab = signal<string>('global-activity');
  searchTerm = signal<string>('');
  editingRow = signal<DataRow | null>(null);
  isAddingRow = signal<boolean>(false);
  isAddingTab = signal<boolean>(false);
  isAddColumnDialogOpen = signal<boolean>(false);
  newTabName = signal<string>('');
  newColumnName = signal<string>('');
  newColumnType = signal<'text' | 'number'>('text');
  newRowData: { [key: string]: any } = {};

  // Data for each tab
  private globalActivityData = signal<DataRow[]>(this.generateGlobalActivityData());
  private standardCraftData = signal<DataRow[]>(this.generateStandardCraftData());
  private yardLocationData = signal<DataRow[]>(this.generateYardLocationData());
  private projectTypeData = signal<DataRow[]>(this.generateProjectTypeData());
  private statusData = signal<DataRow[]>(this.generateStatusData());
  private workTypeData = signal<DataRow[]>(this.generateWorkTypeData());
  private customTabsData = signal<{[key: string]: DataRow[]}>({});

  // Column definitions for each tab
  private globalActivityColumns = signal(this.getGlobalActivityColumns());
  private standardCraftColumns = signal(this.getStandardCraftColumns());
  private customTabsColumns = signal<{[key: string]: ColumnDefinition[]}>({});

  // Select options
  columnTypeOptions: SelectOption[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' }
  ];

  // Tab management methods
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
    this.resetNewRowData();
  }

  getTabClasses(tabId: string): string {
    const baseClasses = 'pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap';
    const activeClasses = this.activeTab() === tabId 
      ? 'text-primary' 
      : 'text-muted-foreground hover:text-foreground';
    return `${baseClasses} ${activeClasses}`;
  }

  getTabIcon(tab: MasterDataTab): any {
    return this.iconMap[tab.icon] || Settings2;
  }

  // Data management methods
  getCurrentData(): DataRow[] {
    switch (this.activeTab()) {
      case 'global-activity': return this.globalActivityData();
      case 'standard-craft': return this.standardCraftData();
      case 'yard-location': return this.yardLocationData();
      case 'project-type': return this.projectTypeData();
      case 'status': return this.statusData();
      case 'work-type': return this.workTypeData();
      default: return this.customTabsData()[this.activeTab()] || [];
    }
  }

  getCurrentColumns(): ColumnDefinition[] {
    switch (this.activeTab()) {
      case 'global-activity': return this.globalActivityColumns();
      case 'standard-craft': return this.standardCraftColumns();
      case 'yard-location': return this.getYardLocationColumns();
      case 'project-type': return this.getProjectTypeColumns();
      case 'status': return this.getStatusColumns();
      case 'work-type': return this.getWorkTypeColumns();
      default: return this.customTabsColumns()[this.activeTab()] || this.getInitialColumns();
    }
  }

  getFilteredData(): DataRow[] {
    const data = this.getCurrentData();
    const searchTerm = this.searchTerm().toLowerCase();
    
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(searchTerm)
      )
    );
  }

  // Row management
  setIsAddingRow(value: boolean): void {
    this.isAddingRow.set(value);
    if (value) {
      this.resetNewRowData();
    }
  }

  setEditingRow(row: DataRow | null): void {
    this.editingRow.set(row ? { ...row } : null);
  }

  resetNewRowData(): void {
    this.newRowData = {};
    const columns = this.getCurrentColumns();
    columns.forEach(col => {
      this.newRowData[col.id] = col.type === 'number' ? 0 : '';
    });
  }

  updateEditingRow(columnId: string, value: any, type: string): void {
    const current = this.editingRow();
    if (current) {
      this.editingRow.set({
        ...current,
        [columnId]: type === 'number' ? Number(value) : value
      });
    }
  }

  handleAddRow(): void {
    const currentData = this.getCurrentData();
    const activeTabId = this.activeTab();
    
    // Create prefix based on active tab
    let prefix = 'CUSTOM';
    switch (activeTabId) {
      case 'global-activity': prefix = 'GAC'; break;
      case 'standard-craft': prefix = 'SC'; break;
      case 'yard-location': prefix = 'YL'; break;
      case 'project-type': prefix = 'PT'; break;
      case 'status': prefix = 'ST'; break;
      case 'work-type': prefix = 'WT'; break;
    }
    
    const newRow: DataRow = {
      id: `${prefix}-${Date.now()}`,
      ...this.newRowData
    };
    
    this.setCurrentData([...currentData, newRow]);
    this.setIsAddingRow(false);
    console.log('Row added successfully');
  }

  handleSaveEdit(): void {
    const editingRow = this.editingRow();
    if (editingRow) {
      const currentData = this.getCurrentData();
      const updatedData = currentData.map(row =>
        row.id === editingRow.id ? editingRow : row
      );
      this.setCurrentData(updatedData);
      this.setEditingRow(null);
    }
  }

  handleEdit(row: DataRow): void {
    this.setEditingRow(row);
  }

  handleDelete(id: string): void {
    const currentData = this.getCurrentData();
    this.setCurrentData(currentData.filter(row => row.id !== id));
  }

  private setCurrentData(data: DataRow[]): void {
    switch (this.activeTab()) {
      case 'global-activity': this.globalActivityData.set(data); break;
      case 'standard-craft': this.standardCraftData.set(data); break;
      case 'yard-location': this.yardLocationData.set(data); break;
      case 'project-type': this.projectTypeData.set(data); break;
      case 'status': this.statusData.set(data); break;
      case 'work-type': this.workTypeData.set(data); break;
      default:
        this.customTabsData.update(prev => ({ ...prev, [this.activeTab()]: data }));
        break;
    }
  }

  // Tab management
  setIsAddingTab(value: boolean): void {
    this.isAddingTab.set(value);
  }

  openAddTabDialog(): void {
    this.setIsAddingTab(true);
  }

  handleAddTab(): void {
    const tabName = this.newTabName().trim();
    if (tabName) {
      const newTab: MasterDataTab = {
        id: `custom-${Date.now()}`,
        name: tabName,
        icon: 'settings2',
        isSystem: false,
        isRelational: false
      };
      
      this.masterDataTabs.update(tabs => [...tabs, newTab]);
      this.customTabsData.update(prev => ({ ...prev, [newTab.id]: [] }));
      this.customTabsColumns.update(prev => ({ ...prev, [newTab.id]: this.getInitialColumns() }));
      
      this.newTabName.set('');
      this.setIsAddingTab(false);
      this.setActiveTab(newTab.id);
      console.log('Master data tab created successfully');
    }
  }

  cancelAddTab(): void {
    this.setIsAddingTab(false);
    this.newTabName.set('');
  }

  // Column management
  setIsAddColumnDialogOpen(value: boolean): void {
    this.isAddColumnDialogOpen.set(value);
  }

  openAddColumnDialog(): void {
    this.setIsAddColumnDialogOpen(true);
  }

  handleAddColumn(): void {
    const columnName = this.newColumnName().trim();
    if (columnName) {
      // Check if we're on a system relational tab that shouldn't allow new columns
      const currentTab = this.masterDataTabs().find(tab => tab.id === this.activeTab());
      if (currentTab?.isRelational && currentTab.isSystem) {
        console.error('Cannot add columns to system relational tables');
        return;
      }

      const currentColumns = this.getCurrentColumns();
      const newColumn: ColumnDefinition = {
        id: `column${Date.now()}`,
        name: columnName,
        type: this.newColumnType()
      };
      
      this.setCurrentColumns([...currentColumns, newColumn]);
      
      // Add empty values for new column in all rows
      const currentData = this.getCurrentData();
      const updatedData = currentData.map(row => ({
        ...row,
        [newColumn.id]: newColumn.type === 'number' ? 0 : ''
      }));
      this.setCurrentData(updatedData);
      
      this.cancelAddColumn();
      console.log('Column added successfully');
    }
  }

  cancelAddColumn(): void {
    this.setIsAddColumnDialogOpen(false);
    this.newColumnName.set('');
    this.newColumnType.set('text');
  }

  private setCurrentColumns(columns: ColumnDefinition[]): void {
    switch (this.activeTab()) {
      case 'global-activity': this.globalActivityColumns.set(columns); break;
      case 'standard-craft': this.standardCraftColumns.set(columns); break;
      default:
        if (!['yard-location', 'project-type', 'status', 'work-type'].includes(this.activeTab())) {
          this.customTabsColumns.update(prev => ({ ...prev, [this.activeTab()]: columns }));
        }
        break;
    }
  }

  // Import/Export
  handleImport(): void {
    console.log('Import functionality would be implemented here');
  }

  handleExport(): void {
    const data = this.getCurrentData();
    const columns = this.getCurrentColumns();
    const csv = [
      columns.map(col => col.name).join(','),
      ...data.map(row => 
        columns.map(col => row[col.id]).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.activeTab()}-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Dropdown items
  getTabDropdownItems(tabId: string): DropdownItem[] {
    return [
      {
        id: 'delete',
        label: 'Delete Tab',
        icon: Trash2,
        destructive: true
      }
    ];
  }

  getRowDropdownItems(): DropdownItem[] {
    return [
      {
        id: 'edit',
        label: 'Edit Row',
        icon: Edit
      },
      {
        id: 'separator',
        label: '',
        separator: true
      },
      {
        id: 'delete',
        label: 'Delete Row',
        icon: Trash2,
        destructive: true
      }
    ];
  }

  onTabDropdownAction(item: DropdownItem, tabId: string): void {
    if (item.id === 'delete') {
      this.handleDeleteTab(tabId);
    }
  }

  onRowDropdownAction(item: DropdownItem, row: DataRow): void {
    if (item.separator) return; // Ignore separator clicks
    
    if (item.id === 'edit') {
      this.handleEdit(row);
    } else if (item.id === 'delete') {
      this.handleDelete(row.id);
    }
  }

  handleDeleteTab(tabId: string): void {
    const tab = this.masterDataTabs().find(t => t.id === tabId);
    if (tab?.isSystem) {
      console.error('Cannot delete system tabs');
      return;
    }

    this.masterDataTabs.update(tabs => tabs.filter(t => t.id !== tabId));
    
    // Clean up data and columns
    this.customTabsData.update(prev => {
      const { [tabId]: removed, ...rest } = prev;
      return rest;
    });
    this.customTabsColumns.update(prev => {
      const { [tabId]: removed, ...rest } = prev;
      return rest;
    });
    
    // Switch to first available tab if current tab was deleted
    if (this.activeTab() === tabId) {
      this.setActiveTab('global-activity');
    }
    
    console.log('Tab deleted successfully');
  }

  // Data generation methods (same as React)
  private getDefaultMasterDataTabs(): MasterDataTab[] {
    return [
      {
        id: 'global-activity',
        name: 'Global Activity Code',
        icon: 'settings2',
        isSystem: true,
        isRelational: false
      },
      {
        id: 'standard-craft',
        name: 'Standard Craft',
        icon: 'settings2',
        isSystem: true,
        isRelational: false
      },
      {
        id: 'yard-location',
        name: 'Yard Location',
        icon: 'map-pin',
        isSystem: true,
        isRelational: true,
        relatedFields: ['yardLocation']
      },
      {
        id: 'project-type',
        name: 'Project Type',
        icon: 'building2',
        isSystem: true,
        isRelational: true,
        relatedFields: ['projectType']
      },
      {
        id: 'status',
        name: 'Status',
        icon: 'flag',
        isSystem: true,
        isRelational: true,
        relatedFields: ['status']
      },
      {
        id: 'work-type',
        name: 'Work Type',
        icon: 'briefcase',
        isSystem: true,
        isRelational: true,
        relatedFields: ['workType']
      }
    ];
  }

  private generateGlobalActivityData(): DataRow[] {
    return [
      { 
        id: 'gac-1', 
        activityCode: 'FAB001', 
        description: 'Steel Structure Fabrication', 
        area: 'Yard Work', 
        discipline: 'Structural', 
        faceGrouping: 'Fabrication', 
        progressGrouping: 'Engineering & Fabrication', 
        structure: 'Primary Structure' 
      },
      { 
        id: 'gac-2', 
        activityCode: 'WELD002', 
        description: 'Pipe Welding Operations', 
        area: 'Yard Work', 
        discipline: 'Mechanical', 
        faceGrouping: 'Welding', 
        progressGrouping: 'Engineering & Fabrication', 
        structure: 'Piping System' 
      },
      { 
        id: 'gac-3', 
        activityCode: 'ERECT003', 
        description: 'Module Erection Activities', 
        area: 'Field Work', 
        discipline: 'Structural', 
        faceGrouping: 'Installation', 
        progressGrouping: 'Construction & Installation', 
        structure: 'Module Assembly' 
      }
    ];
  }

  private generateStandardCraftData(): DataRow[] {
    return [
      { 
        id: 'sc-1', 
        jobDisciplineName: 'Structural Steel', 
        standardCraft: 'Structural Ironworker', 
        craftGrouping: 'Structural Trades' 
      },
      { 
        id: 'sc-2', 
        jobDisciplineName: 'Welding', 
        standardCraft: 'Certified Welder', 
        craftGrouping: 'Welding Trades' 
      },
      { 
        id: 'sc-3', 
        jobDisciplineName: 'Electrical', 
        standardCraft: 'Electrician', 
        craftGrouping: 'Electrical Trades' 
      }
    ];
  }

  private generateYardLocationData(): DataRow[] {
    return [
      { id: 'yl-1', code: 'BFA', name: 'Brownsville Fabrication', region: 'South Texas', capacity: 250, status: 'Active' },
      { id: 'yl-2', code: 'JAY', name: 'Jacksonville Yard', region: 'Florida', capacity: 180, status: 'Active' },
      { id: 'yl-3', code: 'SAFIRA', name: 'Safira Facility', region: 'Brazil', capacity: 320, status: 'Active' }
    ];
  }

  private generateProjectTypeData(): DataRow[] {
    return [
      { id: 'pt-1', code: 'PROSPECT', name: 'Prospect', description: 'Potential projects in bidding phase', defaultStatus: 'Under Review' },
      { id: 'pt-2', code: 'BOOKED', name: 'Booked (Awarded)', description: 'Awarded projects ready for execution', defaultStatus: 'Active' }
    ];
  }

  private generateStatusData(): DataRow[] {
    return [
      { id: 's-1', code: 'ACTIVE', name: 'Active', description: 'Currently active projects', color: 'green' },
      { id: 's-2', code: 'INACTIVE', name: 'Inactive', description: 'Temporarily inactive projects', color: 'gray' },
      { id: 's-3', code: 'HOLD', name: 'Hold', description: 'Projects on hold', color: 'yellow' },
      { id: 's-4', code: 'CANCELED', name: 'Canceled', description: 'Canceled projects', color: 'red' }
    ];
  }

  private generateWorkTypeData(): DataRow[] {
    return [
      { id: 'wt-1', code: '1', name: 'Complete', description: 'Full project scope including all phases', defaultCalculations: 'Prefab,Erection,Precom' },
      { id: 'wt-2', code: '2', name: 'Only Yard Work', description: 'Yard fabrication work only', defaultCalculations: 'Yard,HUC' }
    ];
  }

  // Column definitions
  private getGlobalActivityColumns(): ColumnDefinition[] {
    return [
      { id: 'activityCode', name: 'Activity Code', type: 'text' },
      { id: 'description', name: 'Description', type: 'text' },
      { id: 'area', name: 'Area', type: 'text' },
      { id: 'discipline', name: 'Discipline', type: 'text' },
      { id: 'faceGrouping', name: 'Face Grouping', type: 'text' },
      { id: 'progressGrouping', name: 'Progress Grouping', type: 'text' },
      { id: 'structure', name: 'Structure', type: 'text' }
    ];
  }

  private getStandardCraftColumns(): ColumnDefinition[] {
    return [
      { id: 'jobDisciplineName', name: 'Job Discipline Name', type: 'text' },
      { id: 'standardCraft', name: 'Standard Craft', type: 'text' },
      { id: 'craftGrouping', name: 'Craft Grouping', type: 'text' }
    ];
  }

  private getYardLocationColumns(): ColumnDefinition[] {
    return [
      { id: 'code', name: 'Code', type: 'text' },
      { id: 'name', name: 'Name', type: 'text' },
      { id: 'region', name: 'Region', type: 'text' },
      { id: 'capacity', name: 'Capacity', type: 'number' },
      { id: 'status', name: 'Status', type: 'text' }
    ];
  }

  private getProjectTypeColumns(): ColumnDefinition[] {
    return [
      { id: 'code', name: 'Code', type: 'text' },
      { id: 'name', name: 'Name', type: 'text' },
      { id: 'description', name: 'Description', type: 'text' },
      { id: 'defaultStatus', name: 'Default Status', type: 'text' }
    ];
  }

  private getStatusColumns(): ColumnDefinition[] {
    return [
      { id: 'code', name: 'Code', type: 'text' },
      { id: 'name', name: 'Name', type: 'text' },
      { id: 'description', name: 'Description', type: 'text' },
      { id: 'color', name: 'Color', type: 'text' }
    ];
  }

  private getWorkTypeColumns(): ColumnDefinition[] {
    return [
      { id: 'code', name: 'Code', type: 'text' },
      { id: 'name', name: 'Name', type: 'text' },
      { id: 'description', name: 'Description', type: 'text' },
      { id: 'defaultCalculations', name: 'Default Calculations', type: 'text' }
    ];
  }

  private getInitialColumns(): ColumnDefinition[] {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `column${i + 1}`,
      name: `Column ${i + 1}`,
      type: i < 2 ? 'text' : i < 4 ? 'number' : 'text'
    }));
  }
}

// Interfaces
interface DataRow {
  id: string;
  [key: string]: string | number;
}

interface MasterDataTab {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  isRelational: boolean;
  relatedFields?: string[];
}

interface ColumnDefinition {
  id: string;
  name: string;
  type: 'text' | 'number';
}