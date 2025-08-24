import { Component, signal, OnInit, inject } from '@angular/core';
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
  Pencil,
  Trash2,
  X,
  MoreHorizontal,
  Loader2
} from 'lucide-angular';
import { ButtonComponent } from '../../ui/button.component';
import { InputComponent } from '../../ui/input.component';
import { DialogComponent } from '../../ui/dialog.component';
import { LabelComponent } from '../../ui/label.component';
import { SelectComponent, SelectOption } from '../../ui/select.component';
import { DropdownComponent, DropdownItem } from '../../ui/dropdown.component';
import { MasterDataService } from '../../../services/master-data.service';
import { 
  MasterDataTab, 
  ColumnDefinition, 
  DataRow,
  transformGlobalActivityCode,
  transformStandardCraft,
  transformYardLocation,
  transformProjectType,
  transformStatus,
  transformWorkType,
  transformToGlobalActivityCodeEntity,
  transformToStandardCraftEntity,
  transformToYardLocationEntity,
  transformToProjectTypeEntity,
  transformToStatusEntity,
  transformToWorkTypeEntity
} from '../../../interfaces/master-data.interfaces';

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
                <ui-button 
                  (clicked)="handleImport()" 
                  variant="outline" 
                  size="sm" 
                  [leftIcon]="isImporting() ? Loader2 : Upload"
                  [disabled]="isLoading() || isImporting()"
                >
                  {{ isImporting() ? 'Importing...' : 'Import' }}
                </ui-button>
                <ui-button 
                  (clicked)="handleExport()" 
                  variant="outline" 
                  size="sm" 
                  [leftIcon]="Download"
                  [disabled]="isLoading() || isImporting()"
                >
                  Export
                </ui-button>
                <ui-button 
                  size="sm" 
                  (clicked)="openAddColumnDialog()"
                  [leftIcon]="Plus"
                  [disabled]="isLoading() || isImporting()"
                >
                  Add Column
                </ui-button>
                <ui-button 
                  (clicked)="setIsAddingRow(true)" 
                  size="sm" 
                  [leftIcon]="Plus"
                  [disabled]="isLoading() || isImporting()"
                >
                  Add Row
                </ui-button>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
              <div class="flex items-center gap-2">
                <lucide-icon [name]="X" [size]="16"></lucide-icon>
                <span class="text-sm font-medium">{{ errorMessage() }}</span>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoading() || isImporting()" class="flex items-center justify-center py-8">
              <div class="flex items-center gap-2 text-muted-foreground">
                <lucide-icon [name]="Loader2" [size]="16" class="animate-spin"></lucide-icon>
                <span class="text-sm">{{ isImporting() ? 'Importing data...' : 'Loading data...' }}</span>
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
export class MasterDataConfigurationsComponent implements OnInit {
  private masterDataService = inject(MasterDataService);
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
  Pencil = Pencil;
  Trash2 = Trash2;
  X = X;
  MoreHorizontal = MoreHorizontal;
  Loader2 = Loader2;

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
  
  // Loading states
  isLoading = signal<boolean>(false);
  isImporting = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Data for each tab - now loaded from API
  private globalActivityData = signal<DataRow[]>([]);
  private standardCraftData = signal<DataRow[]>([]);
  private yardLocationData = signal<DataRow[]>([]);
  private projectTypeData = signal<DataRow[]>([]);
  private statusData = signal<DataRow[]>([]);
  private workTypeData = signal<DataRow[]>([]);
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

  // Lifecycle methods
  ngOnInit(): void {
    this.loadCurrentTabData();
  }

  // API Integration methods
  private async loadCurrentTabData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      switch (this.activeTab()) {
        case 'global-activity':
          await this.loadGlobalActivityCodes();
          break;
        case 'standard-craft':
          await this.loadStandardCrafts();
          break;
        case 'yard-location':
          await this.loadYardLocations();
          break;
        case 'project-type':
          await this.loadProjectTypes();
          break;
        case 'status':
          await this.loadStatuses();
          break;
        case 'work-type':
          await this.loadWorkTypes();
          break;
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadGlobalActivityCodes(): Promise<void> {
    this.masterDataService.getGlobalActivityCodes().subscribe({
      next: (paginatedData) => {
        const transformedData = paginatedData.items.map(transformGlobalActivityCode);
        this.globalActivityData.set(transformedData);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load Global Activity Codes');
        console.error('Error loading Global Activity Codes:', error);
      }
    });
  }

  private async loadStandardCrafts(): Promise<void> {
    this.masterDataService.getStandardCrafts().subscribe({
      next: (paginatedData) => {
        const transformedData = paginatedData.items.map(transformStandardCraft);
        this.standardCraftData.set(transformedData);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load Standard Crafts');
        console.error('Error loading Standard Crafts:', error);
      }
    });
  }

  private async loadYardLocations(): Promise<void> {
    this.masterDataService.getYardLocations().subscribe({
      next: (paginatedData) => {
        const transformedData = paginatedData.items.map(transformYardLocation);
        this.yardLocationData.set(transformedData);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load Yard Locations');
        console.error('Error loading Yard Locations:', error);
      }
    });
  }

  private async loadProjectTypes(): Promise<void> {
    this.masterDataService.getProjectTypes().subscribe({
      next: (paginatedData) => {
        const transformedData = paginatedData.items.map(transformProjectType);
        this.projectTypeData.set(transformedData);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load Project Types');
        console.error('Error loading Project Types:', error);
      }
    });
  }

  private async loadStatuses(): Promise<void> {
    this.masterDataService.getStatuses().subscribe({
      next: (paginatedData) => {
        const transformedData = paginatedData.items.map(transformStatus);
        this.statusData.set(transformedData);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load Statuses');
        console.error('Error loading Statuses:', error);
      }
    });
  }

  private async loadWorkTypes(): Promise<void> {
    this.masterDataService.getWorkTypes().subscribe({
      next: (paginatedData) => {
        const transformedData = paginatedData.items.map(transformWorkType);
        this.workTypeData.set(transformedData);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load Work Types');
        console.error('Error loading Work Types:', error);
      }
    });
  }

  // Tab management methods
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
    this.resetNewRowData();
    this.loadCurrentTabData();
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

  async handleAddRow(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const activeTabId = this.activeTab();
      
      switch (activeTabId) {
        case 'global-activity':
          await this.createGlobalActivityCode();
          break;
        case 'standard-craft':
          await this.createStandardCraft();
          break;
        case 'yard-location':
          await this.createYardLocation();
          break;
        case 'project-type':
          await this.createProjectType();
          break;
        case 'status':
          await this.createStatus();
          break;
        case 'work-type':
          await this.createWorkType();
          break;
        default:
          // Handle custom tabs with local data
          const currentData = this.getCurrentData();
          const newRow: DataRow = {
            id: `CUSTOM-${Date.now()}`,
            ...this.newRowData
          };
          this.setCurrentData([...currentData, newRow]);
          break;
      }
      
      this.setIsAddingRow(false);
      this.resetNewRowData();
      console.log('Row added successfully');
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to add row');
      console.error('Error adding row:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleSaveEdit(): Promise<void> {
    const editingRow = this.editingRow();
    if (!editingRow) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const activeTabId = this.activeTab();
      const id = typeof editingRow.id === 'number' ? editingRow.id : parseInt(editingRow.id.toString());
      
      switch (activeTabId) {
        case 'global-activity':
          await this.updateGlobalActivityCode(id, editingRow);
          break;
        case 'standard-craft':
          await this.updateStandardCraft(id, editingRow);
          break;
        case 'yard-location':
          await this.updateYardLocation(id, editingRow);
          break;
        case 'project-type':
          await this.updateProjectType(id, editingRow);
          break;
        case 'status':
          await this.updateStatus(id, editingRow);
          break;
        case 'work-type':
          await this.updateWorkType(id, editingRow);
          break;
        default:
          // Handle custom tabs with local data
          const currentData = this.getCurrentData();
          const updatedData = currentData.map(row =>
            row.id === editingRow.id ? editingRow : row
          );
          this.setCurrentData(updatedData);
          break;
      }
      
      this.setEditingRow(null);
      console.log('Row updated successfully');
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to update row');
      console.error('Error updating row:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  handleEdit(row: DataRow): void {
    this.setEditingRow({ ...row });
  }

  async handleDelete(id: string | number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const activeTabId = this.activeTab();
      const numericId = typeof id === 'number' ? id : parseInt(id.toString());
      
      switch (activeTabId) {
        case 'global-activity':
          await this.deleteGlobalActivityCode(numericId);
          break;
        case 'standard-craft':
          await this.deleteStandardCraft(numericId);
          break;
        case 'yard-location':
          await this.deleteYardLocation(numericId);
          break;
        case 'project-type':
          await this.deleteProjectType(numericId);
          break;
        case 'status':
          await this.deleteStatus(numericId);
          break;
        case 'work-type':
          await this.deleteWorkType(numericId);
          break;
        default:
          // Handle custom tabs with local data
          const currentData = this.getCurrentData();
          this.setCurrentData(currentData.filter(row => row.id !== id));
          break;
      }
      
      console.log('Row deleted successfully');
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to delete row');
      console.error('Error deleting row:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Individual CRUD methods for each entity type
  private async createGlobalActivityCode(): Promise<void> {
    const entityData = transformToGlobalActivityCodeEntity(this.newRowData);
    this.masterDataService.createGlobalActivityCode(entityData).subscribe({
      next: (result) => {
        const transformedData = transformGlobalActivityCode(result);
        const currentData = this.globalActivityData();
        this.globalActivityData.set([...currentData, transformedData]);
      },
      error: (error) => {
        throw new Error('Failed to create Global Activity Code');
      }
    });
  }

  private async updateGlobalActivityCode(id: number, row: DataRow): Promise<void> {
    const entityData = transformToGlobalActivityCodeEntity(row);
    this.masterDataService.updateGlobalActivityCode(id, entityData).subscribe({
      next: (result) => {
        const transformedData = transformGlobalActivityCode(result);
        const currentData = this.globalActivityData();
        const updatedData = currentData.map(item => item.id === id ? transformedData : item);
        this.globalActivityData.set(updatedData);
      },
      error: (error) => {
        throw new Error('Failed to update Global Activity Code');
      }
    });
  }

  private async deleteGlobalActivityCode(id: number): Promise<void> {
    this.masterDataService.deleteGlobalActivityCode(id).subscribe({
      next: (success) => {
        if (success) {
          const currentData = this.globalActivityData();
          this.globalActivityData.set(currentData.filter(item => item.id !== id));
        }
      },
      error: (error) => {
        throw new Error('Failed to delete Global Activity Code');
      }
    });
  }

  private async createStandardCraft(): Promise<void> {
    const entityData = transformToStandardCraftEntity(this.newRowData);
    this.masterDataService.createStandardCraft(entityData).subscribe({
      next: (result) => {
        const transformedData = transformStandardCraft(result);
        const currentData = this.standardCraftData();
        this.standardCraftData.set([...currentData, transformedData]);
      },
      error: (error) => {
        throw new Error('Failed to create Standard Craft');
      }
    });
  }

  private async updateStandardCraft(id: number, row: DataRow): Promise<void> {
    const entityData = transformToStandardCraftEntity(row);
    this.masterDataService.updateStandardCraft(id, entityData).subscribe({
      next: (result) => {
        const transformedData = transformStandardCraft(result);
        const currentData = this.standardCraftData();
        const updatedData = currentData.map(item => item.id === id ? transformedData : item);
        this.standardCraftData.set(updatedData);
      },
      error: (error) => {
        throw new Error('Failed to update Standard Craft');
      }
    });
  }

  private async deleteStandardCraft(id: number): Promise<void> {
    this.masterDataService.deleteStandardCraft(id).subscribe({
      next: (success) => {
        if (success) {
          const currentData = this.standardCraftData();
          this.standardCraftData.set(currentData.filter(item => item.id !== id));
        }
      },
      error: (error) => {
        throw new Error('Failed to delete Standard Craft');
      }
    });
  }

  private async createYardLocation(): Promise<void> {
    const entityData = transformToYardLocationEntity(this.newRowData);
    this.masterDataService.createYardLocation(entityData).subscribe({
      next: (result) => {
        const transformedData = transformYardLocation(result);
        const currentData = this.yardLocationData();
        this.yardLocationData.set([...currentData, transformedData]);
      },
      error: (error) => {
        throw new Error('Failed to create Yard Location');
      }
    });
  }

  private async updateYardLocation(id: number, row: DataRow): Promise<void> {
    const entityData = transformToYardLocationEntity(row);
    this.masterDataService.updateYardLocation(id, entityData).subscribe({
      next: (result) => {
        const transformedData = transformYardLocation(result);
        const currentData = this.yardLocationData();
        const updatedData = currentData.map(item => item.id === id ? transformedData : item);
        this.yardLocationData.set(updatedData);
      },
      error: (error) => {
        throw new Error('Failed to update Yard Location');
      }
    });
  }

  private async deleteYardLocation(id: number): Promise<void> {
    this.masterDataService.deleteYardLocation(id).subscribe({
      next: (success) => {
        if (success) {
          const currentData = this.yardLocationData();
          this.yardLocationData.set(currentData.filter(item => item.id !== id));
        }
      },
      error: (error) => {
        throw new Error('Failed to delete Yard Location');
      }
    });
  }

  private async createProjectType(): Promise<void> {
    const entityData = transformToProjectTypeEntity(this.newRowData);
    this.masterDataService.createProjectType(entityData).subscribe({
      next: (result) => {
        const transformedData = transformProjectType(result);
        const currentData = this.projectTypeData();
        this.projectTypeData.set([...currentData, transformedData]);
      },
      error: (error) => {
        throw new Error('Failed to create Project Type');
      }
    });
  }

  private async updateProjectType(id: number, row: DataRow): Promise<void> {
    const entityData = transformToProjectTypeEntity(row);
    this.masterDataService.updateProjectType(id, entityData).subscribe({
      next: (result) => {
        const transformedData = transformProjectType(result);
        const currentData = this.projectTypeData();
        const updatedData = currentData.map(item => item.id === id ? transformedData : item);
        this.projectTypeData.set(updatedData);
      },
      error: (error) => {
        throw new Error('Failed to update Project Type');
      }
    });
  }

  private async deleteProjectType(id: number): Promise<void> {
    this.masterDataService.deleteProjectType(id).subscribe({
      next: (success) => {
        if (success) {
          const currentData = this.projectTypeData();
          this.projectTypeData.set(currentData.filter(item => item.id !== id));
        }
      },
      error: (error) => {
        throw new Error('Failed to delete Project Type');
      }
    });
  }

  private async createStatus(): Promise<void> {
    const entityData = transformToStatusEntity(this.newRowData);
    this.masterDataService.createStatus(entityData).subscribe({
      next: (result) => {
        const transformedData = transformStatus(result);
        const currentData = this.statusData();
        this.statusData.set([...currentData, transformedData]);
      },
      error: (error) => {
        throw new Error('Failed to create Status');
      }
    });
  }

  private async updateStatus(id: number, row: DataRow): Promise<void> {
    const entityData = transformToStatusEntity(row);
    this.masterDataService.updateStatus(id, entityData).subscribe({
      next: (result) => {
        const transformedData = transformStatus(result);
        const currentData = this.statusData();
        const updatedData = currentData.map(item => item.id === id ? transformedData : item);
        this.statusData.set(updatedData);
      },
      error: (error) => {
        throw new Error('Failed to update Status');
      }
    });
  }

  private async deleteStatus(id: number): Promise<void> {
    this.masterDataService.deleteStatus(id).subscribe({
      next: (success) => {
        if (success) {
          const currentData = this.statusData();
          this.statusData.set(currentData.filter(item => item.id !== id));
        }
      },
      error: (error) => {
        throw new Error('Failed to delete Status');
      }
    });
  }

  private async createWorkType(): Promise<void> {
    const entityData = transformToWorkTypeEntity(this.newRowData);
    this.masterDataService.createWorkType(entityData).subscribe({
      next: (result) => {
        const transformedData = transformWorkType(result);
        const currentData = this.workTypeData();
        this.workTypeData.set([...currentData, transformedData]);
      },
      error: (error) => {
        throw new Error('Failed to create Work Type');
      }
    });
  }

  private async updateWorkType(id: number, row: DataRow): Promise<void> {
    const entityData = transformToWorkTypeEntity(row);
    this.masterDataService.updateWorkType(id, entityData).subscribe({
      next: (result) => {
        const transformedData = transformWorkType(result);
        const currentData = this.workTypeData();
        const updatedData = currentData.map(item => item.id === id ? transformedData : item);
        this.workTypeData.set(updatedData);
      },
      error: (error) => {
        throw new Error('Failed to update Work Type');
      }
    });
  }

  private async deleteWorkType(id: number): Promise<void> {
    this.masterDataService.deleteWorkType(id).subscribe({
      next: (success) => {
        if (success) {
          const currentData = this.workTypeData();
          this.workTypeData.set(currentData.filter(item => item.id !== id));
        }
      },
      error: (error) => {
        throw new Error('Failed to delete Work Type');
      }
    });
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.importFile(file);
      }
    };
    input.click();
  }

  private async importFile(file: File): Promise<void> {
    this.isImporting.set(true);
    this.errorMessage.set('');
    
    try {
      const activeTabId = this.activeTab();
      const overwriteExisting = true; // You can add a checkbox for this option
      
      switch (activeTabId) {
        case 'global-activity':
          this.masterDataService.importGlobalActivityCodes(file, overwriteExisting).subscribe({
            next: (result) => {
              if (result.success) {
                console.log(`Successfully imported ${result.importedCount} Global Activity Codes`);
                this.loadGlobalActivityCodes(); // Reload data
              } else {
                this.errorMessage.set(result.message || 'Import failed');
              }
            },
            error: (error) => {
              this.errorMessage.set('Failed to import Global Activity Codes');
              console.error('Import error:', error);
            }
          });
          break;
        case 'standard-craft':
          this.masterDataService.importStandardCrafts(file, overwriteExisting).subscribe({
            next: (result) => {
              if (result.success) {
                console.log(`Successfully imported ${result.importedCount} Standard Crafts`);
                this.loadStandardCrafts(); // Reload data
              } else {
                this.errorMessage.set(result.message || 'Import failed');
              }
            },
            error: (error) => {
              this.errorMessage.set('Failed to import Standard Crafts');
              console.error('Import error:', error);
            }
          });
          break;
        case 'yard-location':
          this.masterDataService.importYardLocations(file, overwriteExisting).subscribe({
            next: (result) => {
              if (result.success) {
                console.log(`Successfully imported ${result.importedCount} Yard Locations`);
                this.loadYardLocations(); // Reload data
              } else {
                this.errorMessage.set(result.message || 'Import failed');
              }
            },
            error: (error) => {
              this.errorMessage.set('Failed to import Yard Locations');
              console.error('Import error:', error);
            }
          });
          break;
        case 'project-type':
          this.masterDataService.importProjectTypes(file, overwriteExisting).subscribe({
            next: (result) => {
              if (result.success) {
                console.log(`Successfully imported ${result.importedCount} Project Types`);
                this.loadProjectTypes(); // Reload data
              } else {
                this.errorMessage.set(result.message || 'Import failed');
              }
            },
            error: (error) => {
              this.errorMessage.set('Failed to import Project Types');
              console.error('Import error:', error);
            }
          });
          break;
        case 'status':
          this.masterDataService.importStatus(file, overwriteExisting).subscribe({
            next: (result) => {
              if (result.success) {
                console.log(`Successfully imported ${result.importedCount} Status entries`);
                this.loadStatuses(); // Reload data
              } else {
                this.errorMessage.set(result.message || 'Import failed');
              }
            },
            error: (error) => {
              this.errorMessage.set('Failed to import Status');
              console.error('Import error:', error);
            }
          });
          break;
        case 'work-type':
          this.masterDataService.importWorkTypes(file, overwriteExisting).subscribe({
            next: (result) => {
              if (result.success) {
                console.log(`Successfully imported ${result.importedCount} Work Types`);
                this.loadWorkTypes(); // Reload data
              } else {
                this.errorMessage.set(result.message || 'Import failed');
              }
            },
            error: (error) => {
              this.errorMessage.set('Failed to import Work Types');
              console.error('Import error:', error);
            }
          });
          break;
        default:
          this.errorMessage.set('Import not supported for this tab');
          break;
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to import file');
      console.error('Import error:', error);
    } finally {
      this.isImporting.set(false);
    }
  }

  handleExport(): void {
    const activeTabId = this.activeTab();
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (activeTabId) {
      case 'global-activity':
        this.masterDataService.exportGlobalActivityCodes().subscribe({
          next: (blob) => {
            this.masterDataService.downloadFile(blob, `global-activity-codes-${timestamp}.csv`);
            console.log('Global Activity Codes exported successfully');
          },
          error: (error) => {
            this.errorMessage.set('Failed to export Global Activity Codes');
            console.error('Export error:', error);
          }
        });
        break;
      case 'standard-craft':
        this.masterDataService.exportStandardCrafts().subscribe({
          next: (blob) => {
            this.masterDataService.downloadFile(blob, `standard-crafts-${timestamp}.csv`);
            console.log('Standard Crafts exported successfully');
          },
          error: (error) => {
            this.errorMessage.set('Failed to export Standard Crafts');
            console.error('Export error:', error);
          }
        });
        break;
      case 'yard-location':
        this.masterDataService.exportYardLocations().subscribe({
          next: (blob) => {
            this.masterDataService.downloadFile(blob, `yard-locations-${timestamp}.csv`);
            console.log('Yard Locations exported successfully');
          },
          error: (error) => {
            this.errorMessage.set('Failed to export Yard Locations');
            console.error('Export error:', error);
          }
        });
        break;
      case 'project-type':
        this.masterDataService.exportProjectTypes().subscribe({
          next: (blob) => {
            this.masterDataService.downloadFile(blob, `project-types-${timestamp}.csv`);
            console.log('Project Types exported successfully');
          },
          error: (error) => {
            this.errorMessage.set('Failed to export Project Types');
            console.error('Export error:', error);
          }
        });
        break;
      case 'status':
        this.masterDataService.exportStatus().subscribe({
          next: (blob) => {
            this.masterDataService.downloadFile(blob, `status-${timestamp}.csv`);
            console.log('Status exported successfully');
          },
          error: (error) => {
            this.errorMessage.set('Failed to export Status');
            console.error('Export error:', error);
          }
        });
        break;
      case 'work-type':
        this.masterDataService.exportWorkTypes().subscribe({
          next: (blob) => {
            this.masterDataService.downloadFile(blob, `work-types-${timestamp}.csv`);
            console.log('Work Types exported successfully');
          },
          error: (error) => {
            this.errorMessage.set('Failed to export Work Types');
            console.error('Export error:', error);
          }
        });
        break;
      default:
        // Fallback to client-side export for custom tabs
        const data = this.getCurrentData();
        const columns = this.getCurrentColumns();
        
        if (data.length === 0) {
          this.errorMessage.set('No data to export');
          return;
        }
        
        const csv = [
          columns.map(col => col.name).join(','),
          ...data.map(row => 
            columns.map(col => {
              const value = row[col.id];
              // Handle values that might contain commas
              return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value || '';
            }).join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        this.masterDataService.downloadFile(blob, `${activeTabId}-data-${timestamp}.csv`);
        console.log('Data exported successfully');
        break;
    }
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
        icon: Pencil
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