import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Database,
  Plus,
  Search,
  Upload,
  Download,
  Pencil,
  Trash2,
  Eye,
  Settings,
  TriangleAlert,
  MapPin,
  Building2,
  MoreHorizontal,
  X,
  Check,
  ChevronsUpDown,
  Save
} from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { InputComponent } from '../ui/input.component';
import { DialogComponent } from '../ui/dialog.component';
import { LabelComponent } from '../ui/label.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { DropdownComponent, DropdownItem } from '../ui/dropdown.component';
import { BadgeComponent, BadgeVariant } from '../ui/badge.component';
import { CheckboxComponent } from '../ui/checkbox.component';
import { SwitchComponent } from '../ui/switch.component';

interface ProjectRow {
  id: string;
  projectName: string;
  projectSource: 'p6' | 'custom';
  canLinkToP6: boolean;
  description: string;
  yardLocation: string;
  projectType: 'prospect' | 'booked';
  status: 'active' | 'inactive' | 'hold' | 'canceled';
  workType: 'complete' | 'yard-only';
  calculations: string[];
  hasMLFData: boolean;
}

interface ColumnDefinition {
  id: keyof ProjectRow;
  name: string;
  type: 'text' | 'number';
}

@Component({
  selector: 'app-project-configurations',
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
    DropdownComponent,
    BadgeComponent,
    CheckboxComponent,
    SwitchComponent
  ],
  template: `
    <div class="h-full overflow-auto bg-background">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Database" [size]="24" class="text-blue-500"></lucide-icon>
            <div>
              <h2 class="text-xl font-semibold">Project Setup & Configuration</h2>
              <p class="text-sm text-muted-foreground">Manage project datasets and configurations</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <ui-button variant="outline" size="sm" (clicked)="handleImport()" [leftIcon]="Upload">
              Import P6
            </ui-button>
            <ui-button size="sm" (clicked)="openAddProjectDialog()" [leftIcon]="Plus">
              New Project
            </ui-button>
          </div>
        </div>

        <!-- Search and Actions -->
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1 max-w-md">
            <ui-input
              placeholder="Search projects..."
              [(ngModel)]="searchTerm"
              [leftIcon]="Search"
            ></ui-input>
          </div>
          
          <div class="flex gap-2">
            <ui-button variant="outline" size="sm" (clicked)="handleExport()" [leftIcon]="Download">
              Export
            </ui-button>
          </div>
        </div>

        <!-- Projects Table -->
        <div class="border rounded-lg overflow-hidden">
          <div class="overflow-x-auto max-w-full">
            <table class="w-full">
              <thead class="bg-muted/50">
                <tr>
                  <th *ngFor="let column of columns" class="text-left px-3 py-2 font-medium">
                    {{ column.name }}
                  </th>
                  <th class="text-left px-3 py-2 font-medium w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let project of getFilteredData()" class="border-t hover:bg-muted/30">
                  <td *ngFor="let column of columns" class="px-3 py-2">
                    <div [class]="getColumnClasses(column.id)">
                      {{ getColumnValue(project, column.id) }}
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <ui-button 
                        (clicked)="handleView(project)" 
                        size="sm" 
                        variant="outline"
                        class="text-primary hover:text-primary text-xs px-2 py-1"
                        [leftIcon]="Eye"
                      >
                        Config
                      </ui-button>
                      <ng-container [ngTemplateOutlet]="actionButtons" [ngTemplateOutletContext]="{ project: project }"></ng-container>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add Project Button -->
        <div class="flex justify-center">
          <ui-button 
            (clicked)="openAddProjectDialog()"
            variant="outline" 
            class="border-dashed"
            [leftIcon]="Plus"
          >
            Add New Project
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Project Dialog -->
    <ui-dialog 
      [isOpen]="isAddProjectOpen()" 
      (openChange)="setIsAddProjectOpen($event)"
      [title]="isEditMode() ? 'Edit Project' : 'Add New Project'"
      [description]="isEditMode() ? 'Update project configuration including P6 integration, yard locations, and calculation settings.' : 'Create a new project with comprehensive configuration options including P6 integration, yard locations, and calculation settings.'"
      [showCloseButton]="true"
      [closeOnBackdropClick]="false"
      [hasFooterSlot]="true"
      [customContentClasses]="'max-h-[60vh] overflow-y-auto'"
      class="max-w-2xl"
    >
      <div class="space-y-6">
        <!-- Project Information Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
            <lucide-icon [name]="Building2" [size]="16" class="text-gray-600"></lucide-icon>
            <h4 class="font-medium text-gray-900">Project Information</h4>
          </div>
          
          <!-- Project Source Selection -->
          <div class="space-y-3">
            <ui-label>Project Source</ui-label>
            <div class="flex gap-4">
              <div class="flex items-center space-x-2">
                <input
                  type="radio"
                  id="p6-source"
                  name="projectSource"
                  [checked]="newProjectData().projectSource === 'p6'"
                  (change)="updateProjectSource('p6')"
                  class="w-4 h-4"
                />
                <ui-label for="p6-source">Pick from P6 Master</ui-label>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-source"
                  name="projectSource"
                  [checked]="newProjectData().projectSource === 'custom'"
                  (change)="updateProjectSource('custom')"
                  class="w-4 h-4"
                />
                <ui-label for="custom-source">Custom Project</ui-label>
              </div>
            </div>
          </div>

          <!-- Project Name Input -->
          <div *ngIf="newProjectData().projectSource === 'p6'; else customProjectName" class="space-y-2">
            <ui-label>Select P6 Project *</ui-label>
            <ui-select 
              [ngModel]="newProjectData().selectedP6Project"
              (valueChange)="updateNewProjectData('selectedP6Project', $event)"
              placeholder="Choose a P6 project..."
              [options]="p6ProjectOptions"
            ></ui-select>
          </div>
          <ng-template #customProjectName>
            <div class="space-y-2">
              <ui-label for="projectName">Project Name *</ui-label>
              <ui-input
                id="projectName"
                placeholder="Enter project name"
                [ngModel]="newProjectData().projectName"
                (ngModelChange)="updateNewProjectData('projectName', $event)"
              ></ui-input>
            </div>
            
            <!-- Option to link to P6 later -->
            <div class="flex items-center space-x-2">
              <ui-switch
                id="linkToP6"
                [checked]="newProjectData().canLinkToP6"
                (checkedChange)="updateNewProjectData('canLinkToP6', $event)"
              ></ui-switch>
              <ui-label htmlFor="linkToP6" class="text-sm text-gray-600">
                Option to link to P6 later
              </ui-label>
            </div>
          </ng-template>

          <!-- Description -->
          <div class="space-y-2">
            <ui-label for="description">Description *</ui-label>
            <textarea
              id="description"
              placeholder="Enter project description, scope, and objectives..."
              [ngModel]="newProjectData().description"
              (ngModelChange)="updateNewProjectData('description', $event)"
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>
        </div>

        <!-- Location & Classification Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
            <lucide-icon [name]="MapPin" [size]="16" class="text-gray-600"></lucide-icon>
            <h4 class="font-medium text-gray-900">Location & Classification</h4>
          </div>

          <!-- Yard Location -->
          <div class="space-y-3">
            <ui-label>Yard Location *</ui-label>
            <ui-select 
              [ngModel]="newProjectData().yardLocation"
              (valueChange)="updateNewProjectData('yardLocation', $event)"
              placeholder="Select yard location..."
              [options]="yardLocationOptions"
            ></ui-select>
          </div>

          <!-- Project Type and Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <ui-label>Project Type *</ui-label>
              <ui-select 
                [ngModel]="newProjectData().projectType"
                (valueChange)="updateNewProjectData('projectType', $event)"
                [options]="projectTypeOptions"
                placeholder="Select project type"
              ></ui-select>
            </div>

            <div class="space-y-2">
              <ui-label>Status *</ui-label>
              <ui-select 
                [ngModel]="newProjectData().status"
                (valueChange)="updateNewProjectData('status', $event)"
                [options]="statusOptions"
                placeholder="Select status"
              ></ui-select>
            </div>
          </div>

          <!-- Work Type -->
          <div class="space-y-2">
            <ui-label>Work Type</ui-label>
            <ui-select 
              [ngModel]="newProjectData().workType"
              (valueChange)="updateNewProjectData('workType', $event)"
              [options]="workTypeOptions"
            ></ui-select>
          </div>
        </div>

        <!-- Calculation Settings Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
            <lucide-icon [name]="Settings" [size]="16" class="text-gray-600"></lucide-icon>
            <h4 class="font-medium text-gray-900">Calculation Settings</h4>
          </div>

          <div class="space-y-3">
            <ui-label>Calculation Types *</ui-label>
            <p class="text-sm text-gray-600">
              Select which calculation types apply to this project.
            </p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div *ngFor="let calculation of calculationOptions" class="flex items-center space-x-2">
                <ui-checkbox
                  [id]="calculation"
                  [ngModel]="newProjectData().calculations.includes(calculation)"
                  (checkedChange)="toggleCalculation(calculation)"
                ></ui-checkbox>
                <ui-label [htmlFor]="calculation" class="text-sm font-medium">
                  {{ calculation }}
                </ui-label>
              </div>
            </div>
            
            <!-- Selected Calculations Display -->
            <div *ngIf="newProjectData().calculations.length > 0" class="space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm text-foreground">Selected:</span>
                <ui-badge 
                  *ngFor="let calculation of newProjectData().calculations" 
                  variant="secondary" 
                  class="gap-1 cursor-pointer"
                  (click)="removeCalculation(calculation)"
                >
                  {{ calculation }}
                  <lucide-icon [name]="X" [size]="12" class="hover:text-destructive"></lucide-icon>
                </ui-badge>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <ui-button variant="outline" (clicked)="setIsAddProjectOpen(false)">
          Cancel
        </ui-button>
        <ui-button (clicked)="handleSaveProject()" [leftIcon]="Save">
          {{ isEditMode() ? 'Update Project' : 'Create Project' }}
        </ui-button>
      </div>
    </ui-dialog>

    <!-- Delete Confirmation Dialog -->
    <ui-dialog 
      [isOpen]="isDeleteDialogOpen()" 
      (openChange)="setIsDeleteDialogOpen($event)"
      title="Delete Project"
      [showCloseButton]="true"
      [hasFooterSlot]="true"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <lucide-icon [name]="TriangleAlert" [size]="20" class="text-red-600"></lucide-icon>
            </div>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Are you sure you want to delete "{{ projectToDelete()?.projectName }}"?
            </p>
          </div>
        </div>
        
        <div *ngIf="projectToDelete()?.hasMLFData" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <lucide-icon [name]="TriangleAlert" [size]="20" class="text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
            <div>
              <h4 class="font-medium text-amber-800 mb-1">MLF Data Will Be Lost</h4>
              <p class="text-sm text-amber-700">
                This project contains MLF (Monthly Labor Forecasting) data that will be permanently deleted and cannot be recovered. 
                All historical forecasts, analyses, and related configurations will be lost for future use.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <ui-button variant="outline" (clicked)="cancelDelete()">
          Cancel
        </ui-button>
        <ui-button 
          variant="destructive"
          (clicked)="handleConfirmDelete()"
          [leftIcon]="Trash2"
        >
          Delete Project
        </ui-button>
      </div>
    </ui-dialog>

    <!-- Action Buttons Template -->
    <ng-template #actionButtons let-project="project">
      <ui-dropdown 
        [items]="getProjectDropdownItems()"
        (itemSelected)="onProjectDropdownAction($event, project)"
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
  `
})
export class ProjectConfigurationsComponent {
  @Output() navigateToDetails = new EventEmitter<string>();
  @Output() navigateToConfig = new EventEmitter<string>();

  // Icons
  Database = Database;
  Plus = Plus;
  Search = Search;
  Upload = Upload;
  Download = Download;
  Pencil = Pencil;
  Trash2 = Trash2;
  Eye = Eye;
  Settings = Settings;
  TriangleAlert = TriangleAlert;
  MapPin = MapPin;
  Building2 = Building2;
  MoreHorizontal = MoreHorizontal;
  X = X;
  Check = Check;
  ChevronsUpDown = ChevronsUpDown;
  Save = Save;

  // State signals
  searchTerm = signal<string>('');
  isAddProjectOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingProject = signal<ProjectRow | null>(null);
  isDeleteDialogOpen = signal<boolean>(false);
  projectToDelete = signal<ProjectRow | null>(null);

  // Project data
  projects = signal<ProjectRow[]>(this.generateProjectData());

  // Form data
  newProjectData = signal({
    projectName: '',
    projectSource: 'custom' as 'p6' | 'custom',
    selectedP6Project: '',
    canLinkToP6: false,
    description: '',
    yardLocation: '',
    projectType: 'prospect' as 'prospect' | 'booked',
    status: 'active' as 'active' | 'inactive' | 'hold' | 'canceled',
    workType: 'complete' as 'complete' | 'yard-only',
    calculations: [] as string[]
  });

  // Table columns
  columns: ColumnDefinition[] = [
    { id: 'projectName', name: 'Project Name', type: 'text' },
    { id: 'description', name: 'Description', type: 'text' },
    { id: 'yardLocation', name: 'Yard Location', type: 'text' },
    { id: 'projectType', name: 'Project Type', type: 'text' },
    { id: 'status', name: 'Status', type: 'text' },
    { id: 'workType', name: 'Work Type', type: 'text' },
    { id: 'calculations', name: 'Calculations', type: 'text' }
  ];

  // Options for dropdowns
  p6ProjectOptions: SelectOption[] = [
    { value: 'P6-Project-Alpha-2024', label: 'P6-Project-Alpha-2024' },
    { value: 'P6-Project-Beta-2024', label: 'P6-Project-Beta-2024' },
    { value: 'P6-Project-Gamma-2024', label: 'P6-Project-Gamma-2024' },
    { value: 'P6-Project-Delta-2024', label: 'P6-Project-Delta-2024' },
    { value: 'P6-Project-Epsilon-2024', label: 'P6-Project-Epsilon-2024' },
    { value: 'P6-Project-Zeta-2024', label: 'P6-Project-Zeta-2024' },
    { value: 'P6-Project-Eta-2024', label: 'P6-Project-Eta-2024' },
    { value: 'P6-Project-Theta-2024', label: 'P6-Project-Theta-2024' }
  ];

  yardLocationOptions: SelectOption[] = [
    { value: 'BFA', label: 'BFA - Brownsville' },
    { value: 'JAY', label: 'JAY - Jacksonville' },
    { value: 'SAFIRA', label: 'SAFIRA - Brazil' },
    { value: 'QFAB', label: 'QFAB - Qatar' },
    { value: 'QMW', label: 'QMW - Qatar Marine Works' }
  ];

  projectTypeOptions: SelectOption[] = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'booked', label: 'Booked (Awarded)' }
  ];

  statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'hold', label: 'Hold' },
    { value: 'canceled', label: 'Canceled' }
  ];

  workTypeOptions: SelectOption[] = [
    { value: 'complete', label: 'Full Project Scope' },
    { value: 'yard-only', label: 'Only Yard Work' }
  ];

  calculationOptions: string[] = ['Prefab', 'Erection', 'Precom', 'HUC', 'Yard', 'Yard + HUC'];

  // Methods
  generateProjectData(): ProjectRow[] {
    const data: ProjectRow[] = [];
    const yardLocations = ['BFA', 'JAY', 'SAFIRA', 'QFAB', 'QMW'];
    const projectTypes: ('prospect' | 'booked')[] = ['prospect', 'booked'];
    const statuses: ('active' | 'inactive' | 'hold' | 'canceled')[] = ['active', 'inactive', 'hold', 'canceled'];
    const workTypes: ('complete' | 'yard-only')[] = ['complete', 'yard-only'];
    const calculationOptions = ['Prefab', 'Erection', 'Precom', 'HUC', 'Yard', 'Yard + HUC'];

    for (let i = 1; i <= 20; i++) {
      const row: ProjectRow = { 
        id: `project-${i}`,
        projectName: `Project ${i}`,
        projectSource: Math.random() > 0.5 ? 'p6' : 'custom',
        canLinkToP6: Math.random() > 0.7,
        description: `Comprehensive project description for Project ${i} including scope, objectives, and deliverables.`,
        yardLocation: yardLocations[Math.floor(Math.random() * yardLocations.length)],
        projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        workType: workTypes[Math.floor(Math.random() * workTypes.length)],
        calculations: calculationOptions.slice(0, Math.floor(Math.random() * 4) + 2),
        hasMLFData: Math.random() > 0.6
      };
      data.push(row);
    }
    return data;
  }

  getFilteredData(): ProjectRow[] {
    const searchTerm = this.searchTerm().toLowerCase();
    if (!searchTerm) return this.projects();
    
    return this.projects().filter(project =>
      Object.values(project).some(value => {
        if (Array.isArray(value)) {
          return value.some(v => v.toString().toLowerCase().includes(searchTerm));
        }
        return value.toString().toLowerCase().includes(searchTerm);
      })
    );
  }

  getColumnClasses(columnId: keyof ProjectRow): string {
    const baseClasses = 'text-sm';
    if (columnId === 'projectName') {
      return `${baseClasses} font-medium`;
    }
    if (columnId === 'description') {
      return `${baseClasses} max-w-xs truncate`;
    }
    return baseClasses;
  }

  getColumnValue(project: ProjectRow, columnId: keyof ProjectRow): string {
    const value = project[columnId];
    
    switch (columnId) {
      case 'projectType':
        return value === 'prospect' ? 'Prospect' : 'Booked (Awarded)';
      case 'status':
        return (value as string).charAt(0).toUpperCase() + (value as string).slice(1);
      case 'workType':
        return value === 'complete' ? '1 - Complete' : '2 - Only Yard Work';
      case 'calculations':
        return Array.isArray(value) ? value.join(', ') : '';
      case 'description':
        return (value as string).length > 50 ? (value as string).substring(0, 50) + '...' : value as string;
      default:
        return value as string;
    }
  }

  getProjectDropdownItems(): DropdownItem[] {
    return [
      // {
      //   id: 'config',
      //   label: 'Config',
      //   icon: Settings
      // },
      {
        id: 'edit',
        label: 'Edit Project',
        icon: Pencil
      },
      // {
      //   id: 'separator',
      //   label: '',
      //   separator: true
      // },
      {
        id: 'delete',
        label: 'Delete Project',
        icon: Trash2,
        destructive: true
      }
    ];
  }

  onProjectDropdownAction(item: DropdownItem, project: ProjectRow): void {
    if (item.separator) return;
    
    if (item.id === 'config') {
      this.handleConfig(project);
    } else if (item.id === 'edit') {
      this.handleEdit(project);
    } else if (item.id === 'delete') {
      this.handleDeleteClick(project);
    }
  }

  handleView(project: ProjectRow): void {
    this.navigateToConfig.emit(project.id);
  }

  handleConfig(project: ProjectRow): void {
    this.navigateToConfig.emit(project.id);
  }

  handleEdit(project: ProjectRow): void {
    this.editingProject.set(project);
    this.isEditMode.set(true);
    
    // Populate form with existing project data
    this.newProjectData.set({
      projectName: project.projectSource === 'custom' ? project.projectName : '',
      projectSource: project.projectSource,
      selectedP6Project: project.projectSource === 'p6' ? project.projectName : '',
      canLinkToP6: project.canLinkToP6,
      description: project.description,
      yardLocation: project.yardLocation,
      projectType: project.projectType,
      status: project.status,
      workType: project.workType,
      calculations: [...project.calculations]
    });
    
    this.isAddProjectOpen.set(true);
  }

  handleDeleteClick(project: ProjectRow): void {
    this.projectToDelete.set(project);
    this.isDeleteDialogOpen.set(true);
  }

  handleConfirmDelete(): void {
    const projectToDelete = this.projectToDelete();
    if (projectToDelete) {
      this.projects.update(projects => 
        projects.filter(project => project.id !== projectToDelete.id)
      );
      this.isDeleteDialogOpen.set(false);
      this.projectToDelete.set(null);
      console.log('Project deleted successfully');
    }
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen.set(false);
    this.projectToDelete.set(null);
  }

  openAddProjectDialog(): void {
    this.resetNewProjectForm();
    this.isAddProjectOpen.set(true);
  }

  setIsAddProjectOpen(open: boolean): void {
    this.isAddProjectOpen.set(open);
    if (!open) {
      this.resetNewProjectForm();
    }
  }

  setIsDeleteDialogOpen(open: boolean): void {
    this.isDeleteDialogOpen.set(open);
  }

  resetNewProjectForm(): void {
    this.newProjectData.set({
      projectName: '',
      projectSource: 'custom',
      selectedP6Project: '',
      canLinkToP6: false,
      description: '',
      yardLocation: '',
      projectType: 'prospect',
      status: 'active',
      workType: 'complete',
      calculations: []
    });
    this.isEditMode.set(false);
    this.editingProject.set(null);
  }

  updateProjectSource(source: 'p6' | 'custom'): void {
    this.newProjectData.update(data => ({
      ...data,
      projectSource: source,
      projectName: source === 'p6' ? '' : data.projectName,
      selectedP6Project: source === 'custom' ? '' : data.selectedP6Project
    }));
  }

  updateNewProjectData(field: string, value: any): void {
    this.newProjectData.update(data => ({
      ...data,
      [field]: value
    }));
  }

  toggleCalculation(calculation: string): void {
    this.newProjectData.update(data => ({
      ...data,
      calculations: data.calculations.includes(calculation)
        ? data.calculations.filter(c => c !== calculation)
        : [...data.calculations, calculation]
    }));
  }

  removeCalculation(calculationToRemove: string): void {
    this.newProjectData.update(data => ({
      ...data,
      calculations: data.calculations.filter(calc => calc !== calculationToRemove)
    }));
  }

  handleSaveProject(): void {
    const data = this.newProjectData();
    
    // Validation
    if (!data.projectName.trim() && data.projectSource === 'custom') {
      console.error('Please enter a project name');
      return;
    }

    if (!data.selectedP6Project && data.projectSource === 'p6') {
      console.error('Please select a P6 project');
      return;
    }

    if (!data.description.trim()) {
      console.error('Please enter a project description');
      return;
    }

    if (!data.yardLocation) {
      console.error('Please select a yard location');
      return;
    }

    if (data.calculations.length === 0) {
      console.error('Please select at least one calculation type');
      return;
    }

    if (this.isEditMode() && this.editingProject()) {
      // Update existing project
      const editingProject = this.editingProject()!;
      const updatedProject: ProjectRow = {
        ...editingProject,
        projectName: data.projectSource === 'p6' ? data.selectedP6Project : data.projectName,
        projectSource: data.projectSource,
        canLinkToP6: data.canLinkToP6,
        description: data.description,
        yardLocation: data.yardLocation,
        projectType: data.projectType,
        status: data.status,
        workType: data.workType,
        calculations: data.calculations
      };

      this.projects.update(projects => 
        projects.map(project => 
          project.id === editingProject.id ? updatedProject : project
        )
      );
      console.log('Project updated successfully');
    } else {
      // Create new project
      const newProject: ProjectRow = {
        id: `project-${Date.now()}`,
        projectName: data.projectSource === 'p6' ? data.selectedP6Project : data.projectName,
        projectSource: data.projectSource,
        canLinkToP6: data.canLinkToP6,
        description: data.description,
        yardLocation: data.yardLocation,
        projectType: data.projectType,
        status: data.status,
        workType: data.workType,
        calculations: data.calculations,
        hasMLFData: false
      };

      this.projects.update(projects => [...projects, newProject]);
      console.log('Project created successfully');
    }

    this.setIsAddProjectOpen(false);
  }

  handleImport(): void {
    console.log('Import functionality would be implemented here');
  }

  handleExport(): void {
    const csv = [
      this.columns.map(col => col.name).join(','),
      ...this.projects().map(project => 
        this.columns.map(col => {
          const value = project[col.id];
          if (Array.isArray(value)) {
            return value.join('; ');
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}