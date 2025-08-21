import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Search,
  Plus,
  Edit,
  Trash2,
  Settings2,
  Code,
  Calculator,
  TrendingUp,
  AlertTriangle
} from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { InputComponent } from '../ui/input.component';
import { LabelComponent } from '../ui/label.component';
import { SelectComponent, SelectOption } from '../ui/select.component';
import { BadgeComponent } from '../ui/badge.component';
import { DialogComponent } from '../ui/dialog.component';
import { DataTableComponent, TableColumn } from '../ui/data-table.component';
import { TextareaComponent } from '../ui/textarea.component';
import { RuleBuilderComponent } from '../rule-builder.component';

interface MLFRule {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  lastModified: string;
  modifiedBy: string;
  priority: 'High' | 'Medium' | 'Low';
  ruleLogic: string;
}

interface NewRuleData {
  name: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  priority: 'High' | 'Medium' | 'Low';
  ruleLogic: string;
}

@Component({
  selector: 'app-manage-mlf-rules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    LabelComponent,
    SelectComponent,
    BadgeComponent,
    DialogComponent,
    DataTableComponent,
    TextareaComponent,
    RuleBuilderComponent
  ],
  template: `
    <!-- Rule Builder -->
    <div *ngIf="showRuleBuilder()" class="h-full">
      <app-rule-builder
        [rule]="selectedRuleForBuilder() ? convertToRuleBuilderFormat(selectedRuleForBuilder()!) : undefined"
        (onSave)="handleRuleBuilderSave($event)"
        (onCancel)="handleRuleBuilderCancel()"
      ></app-rule-builder>
    </div>

    <!-- Main Rules Management View -->
    <div *ngIf="!showRuleBuilder()" class="h-full flex flex-col bg-background">
      <!-- Header Section -->
      <div class="p-6 border-b border-border bg-card">
        <!-- Search Bar and Add Button -->
        <div class="flex flex-row gap-4 mb-4">
          <div class="flex-1">
            <ui-input
              placeholder="Search rules by name or description..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              [leftIcon]="Search"
            ></ui-input>
          </div>
          
          <div class="flex gap-2">
            <ui-button 
              (clicked)="openRuleBuilder()"
              [leftIcon]="Settings2"
            >
              New Rule Builder
            </ui-button>
            
            <ui-button 
              variant="outline" 
              (clicked)="isAddDialogOpen.set(true)"
              [leftIcon]="Plus"
            >
              Quick Add Rule
            </ui-button>
          </div>
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex flex-row gap-4">
          <ui-select
            [options]="categoryOptions"
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onCategoryChange()"
            placeholder="All Categories"
            class="w-48"
          ></ui-select>

          <ui-select
            [options]="statusOptions"
            [(ngModel)]="selectedStatus"
            (ngModelChange)="onStatusChange()"
            placeholder="All Status"
            class="w-48"
          ></ui-select>
        </div>
      </div>

      <!-- Rules Table -->
      <div class="flex-1 overflow-auto p-6">
        <div class="bg-card border border-border rounded-lg overflow-hidden">
          <ui-data-table
            [data]="filteredRules()"
            [columns]="tableColumns"
            [actions]="tableActions"
            [loading]="false"
            [searchable]="false"
            [showFilters]="false"
            [pagination]="{ page: 1, pageSize: 20, total: filteredRules().length, pageSizeOptions: [10, 20, 50] }"
            (actionClick)="onTableAction($event)"
            class="w-full"
          ></ui-data-table>
        </div>
      </div>
    </div>

    <!-- Add Rule Dialog -->
    <ui-dialog 
      [isOpen]="isAddDialogOpen()"
      (openChange)="onAddDialogChange($event)"
      title="Add New MLF Rule"
      description="Create a new rule for MLF calculations and variance analysis"
      maxWidth="max-w-2xl"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid w-full gap-2">
            <ui-label htmlFor="rule-name" class="text-sm font-medium">Rule Name *</ui-label>
            <ui-input
              id="rule-name"
              [(ngModel)]="newRule.name"
              placeholder="Enter rule name"
            ></ui-input>
          </div>
          <div class="grid w-full gap-2">
            <ui-label htmlFor="rule-category" class="text-sm font-medium">Category *</ui-label>
            <ui-select
              id="rule-category"
              [options]="newRuleCategoryOptions"
              [(ngModel)]="newRule.category"
              placeholder="Select category"
            ></ui-select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid w-full gap-2">
            <ui-label htmlFor="rule-status" class="text-sm font-medium">Status</ui-label>
            <ui-select
              id="rule-status"
              [options]="newRuleStatusOptions"
              [(ngModel)]="newRule.status"
              placeholder="Select status"
            ></ui-select>
          </div>
          <div class="grid w-full gap-2">
            <ui-label htmlFor="rule-priority" class="text-sm font-medium">Priority</ui-label>
            <ui-select
              id="rule-priority"
              [options]="priorityOptions"
              [(ngModel)]="newRule.priority"
              placeholder="Select priority"
            ></ui-select>
          </div>
        </div>

        <div class="grid w-full gap-2">
          <ui-label htmlFor="rule-description" class="text-sm font-medium">Description *</ui-label>
          <ui-textarea
            id="rule-description"
            [(ngModel)]="newRule.description"
            placeholder="Enter rule description"
            [rows]="3"
          ></ui-textarea>
        </div>

        <div class="grid w-full gap-2">
          <ui-label htmlFor="rule-logic" class="text-sm font-medium">Rule Logic *</ui-label>
          <ui-textarea
            id="rule-logic"
            [(ngModel)]="newRule.ruleLogic"
            placeholder="Enter rule logic (e.g., IF condition THEN action)"
            [rows]="4"
          ></ui-textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <ui-button 
          variant="outline"
          (clicked)="handleCancelAdd()"
        >
          Cancel
        </ui-button>
        <ui-button 
          (clicked)="handleAddRule()"
        >
          Add Rule
        </ui-button>
      </div>
    </ui-dialog>

    <!-- Edit Rule Dialog -->
    <ui-dialog 
      [isOpen]="isEditDialogOpen()"
      (openChange)="onEditDialogChange($event)"
      title="Edit MLF Rule"
      description="Update the rule configuration"
      maxWidth="max-w-2xl"
    >
      <div class="space-y-4" *ngIf="editingRule()">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid w-full gap-2">
            <ui-label htmlFor="edit-rule-name" class="text-sm font-medium">Rule Name *</ui-label>
            <ui-input
              id="edit-rule-name"
              [(ngModel)]="editingRule()!.name"
              placeholder="Enter rule name"
            ></ui-input>
          </div>
          <div class="grid w-full gap-2">
            <ui-label htmlFor="edit-rule-category" class="text-sm font-medium">Category *</ui-label>
            <ui-select
              id="edit-rule-category"
              [options]="newRuleCategoryOptions"
              [(ngModel)]="editingRule()!.category"
              placeholder="Select category"
            ></ui-select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid w-full gap-2">
            <ui-label htmlFor="edit-rule-status" class="text-sm font-medium">Status</ui-label>
            <ui-select
              id="edit-rule-status"
              [options]="newRuleStatusOptions"
              [(ngModel)]="editingRule()!.status"
              placeholder="Select status"
            ></ui-select>
          </div>
          <div class="grid w-full gap-2">
            <ui-label htmlFor="edit-rule-priority" class="text-sm font-medium">Priority</ui-label>
            <ui-select
              id="edit-rule-priority"
              [options]="priorityOptions"
              [(ngModel)]="editingRule()!.priority"
              placeholder="Select priority"
            ></ui-select>
          </div>
        </div>

        <div class="grid w-full gap-2">
          <ui-label htmlFor="edit-rule-description" class="text-sm font-medium">Description *</ui-label>
          <ui-textarea
            id="edit-rule-description"
            [(ngModel)]="editingRule()!.description"
            placeholder="Enter rule description"
            [rows]="3"
          ></ui-textarea>
        </div>

        <div class="grid w-full gap-2">
          <ui-label htmlFor="edit-rule-logic" class="text-sm font-medium">Rule Logic *</ui-label>
          <ui-textarea
            id="edit-rule-logic"
            [(ngModel)]="editingRule()!.ruleLogic"
            placeholder="Enter rule logic (e.g., IF condition THEN action)"
            [rows]="4"
          ></ui-textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <ui-button 
          variant="outline"
          (clicked)="handleCancelEdit()"
        >
          Cancel
        </ui-button>
        <ui-button 
          (clicked)="handleEditRule()"
        >
          Save Changes
        </ui-button>
      </div>
    </ui-dialog>
  `
})
export class ManageMLFRulesComponent implements OnInit {
  // Icons
  Search = Search;
  Plus = Plus;
  Edit = Edit;
  Trash2 = Trash2;
  Settings2 = Settings2;
  Code = Code;
  Calculator = Calculator;
  TrendingUp = TrendingUp;
  AlertTriangle = AlertTriangle;

  // State
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  isAddDialogOpen = signal(false);
  isEditDialogOpen = signal(false);
  editingRule = signal<MLFRule | null>(null);
  showRuleBuilder = signal(false);
  selectedRuleForBuilder = signal<MLFRule | null>(null);

  // Sample data
  rules = signal<MLFRule[]>([
    {
      id: 'rule-001',
      name: 'P6 to L4 breakup rules',
      category: 'Forecast Mapping',
      description: 'Rules for breaking down P6 forecast data into Level 4 activity components',
      status: 'Active',
      lastModified: '2024-01-15',
      modifiedBy: 'John Smith',
      priority: 'High',
      ruleLogic: 'IF P6_CRAFT_HOURS > 0 THEN DISTRIBUTE_TO_L4_ACTIVITIES BASED_ON ACTIVITY_WEIGHTS'
    },
    {
      id: 'rule-002',
      name: 'L4 to SPC task mapping',
      category: 'Task Mapping',
      description: 'Mapping rules for converting Level 4 activities to SPC (Specialty Craft) tasks',
      status: 'Active',
      lastModified: '2024-01-12',
      modifiedBy: 'Sarah Johnson',
      priority: 'High',
      ruleLogic: 'MAP L4_ACTIVITY_CODE TO SPC_TASKS WHERE CRAFT_TYPE = MATCHING_SPECIALTY'
    },
    {
      id: 'rule-003',
      name: 'Craft variance calculations',
      category: 'Variance Analysis',
      description: 'Calculation rules for determining variances between craft forecasts and actuals',
      status: 'Active',
      lastModified: '2024-01-10',
      modifiedBy: 'Mike Wilson',
      priority: 'Medium',
      ruleLogic: 'VARIANCE = (ACTUAL_HOURS - FORECAST_HOURS) / FORECAST_HOURS * 100'
    },
    {
      id: 'rule-004',
      name: 'Craft calculation rules',
      category: 'Calculation Logic',
      description: 'Core calculation rules for craft hour computations and distributions',
      status: 'Draft',
      lastModified: '2024-01-08',
      modifiedBy: 'Lisa Davis',
      priority: 'Medium',
      ruleLogic: 'CRAFT_HOURS = SUM(TASK_HOURS) WHERE TASK_CRAFT = TARGET_CRAFT AND DATE_RANGE = ACTIVE_PERIOD'
    }
  ]);

  newRule: NewRuleData = {
    name: '',
    category: '',
    description: '',
    status: 'Draft',
    priority: 'Medium',
    ruleLogic: ''
  };

  // Computed filtered rules
  filteredRules = signal<MLFRule[]>([]);

  // Options for dropdowns
  categoryOptions: SelectOption[] = [
    { value: '', label: 'All Categories' },
    { value: 'Forecast Mapping', label: 'Forecast Mapping' },
    { value: 'Task Mapping', label: 'Task Mapping' },
    { value: 'Variance Analysis', label: 'Variance Analysis' },
    { value: 'Calculation Logic', label: 'Calculation Logic' }
  ];

  statusOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Draft', label: 'Draft' }
  ];

  newRuleCategoryOptions: SelectOption[] = [
    { value: 'Forecast Mapping', label: 'Forecast Mapping' },
    { value: 'Task Mapping', label: 'Task Mapping' },
    { value: 'Variance Analysis', label: 'Variance Analysis' },
    { value: 'Calculation Logic', label: 'Calculation Logic' }
  ];

  newRuleStatusOptions: SelectOption[] = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Draft', label: 'Draft' }
  ];

  priorityOptions: SelectOption[] = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  // Table columns
  tableColumns: TableColumn[] = [
    {
      key: 'name',
      label: 'Rule Name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      type: 'badge',
      badge: {
        variant: 'outline',
        getValue: (value: string) => value
      }
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      type: 'text'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      type: 'badge',
      badge: {
        variant: 'default',
        getValue: (value: string) => value
      }
    },
    {
      key: 'lastModified',
      label: 'Last Modified',
      sortable: true,
      type: 'text'
    },
    {
      key: 'modifiedBy',
      label: 'Modified By',
      sortable: true,
      type: 'text'
    },

  ];

  // Table actions
  tableActions = [
    {
      id: 'rule-builder',
      label: 'Rule Builder',
      icon: Settings2,
      variant: 'default' as const
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      variant: 'default' as const
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive' as const
    }
  ];

  constructor() {
    // Initialize filtered rules
    this.updateFilteredRules();
  }

  ngOnInit() {
    // Watch for changes in search and filters
    this.updateFilteredRules();
  }

  // Watch for search term changes
  onSearchChange(): void {
    this.updateFilteredRules();
  }

  // Watch for filter changes
  onCategoryChange(): void {
    this.updateFilteredRules();
  }

  onStatusChange(): void {
    this.updateFilteredRules();
  }

  updateFilteredRules(): void {
    const filtered = this.rules().filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           rule.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || rule.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || rule.status === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    this.filteredRules.set(filtered);
  }

  onTableAction(event: { action: any, row: any }): void {
    const { action, row } = event;
    
    switch (action.id) {
      case 'rule-builder':
        this.openRuleBuilder(row.id);
        break;
      case 'edit':
        this.handleEdit(row.id);
        break;
      case 'delete':
        this.handleDelete(row.id);
        break;
    }
  }

  getStatusBadgeVariant(status: string): string {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  }

  openRuleBuilder(ruleId?: string): void {
    if (ruleId) {
      const rule = this.rules().find(r => r.id === ruleId);
      this.selectedRuleForBuilder.set(rule || null);
    } else {
      this.selectedRuleForBuilder.set(null);
    }
    this.showRuleBuilder.set(true);
  }

  convertToRuleBuilderFormat(rule: MLFRule): any {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      conditions: [], // Mock conditions - in real app would parse from ruleLogic
      actions: [], // Mock actions - in real app would parse from ruleLogic
      priority: rule.priority === 'High' ? 1 : rule.priority === 'Medium' ? 2 : 3,
      enabled: rule.status === 'Active'
    };
  }

  handleRuleBuilderSave(savedRule: any): void {
    // Convert from RuleBuilder format to MLFRule format
    const updatedRule: MLFRule = {
      id: this.selectedRuleForBuilder()?.id || `rule-${Date.now()}`,
      name: savedRule.name,
      category: this.selectedRuleForBuilder()?.category || 'Calculation Logic',
      description: savedRule.description,
      status: savedRule.enabled ? 'Active' : 'Inactive',
      lastModified: new Date().toISOString().split('T')[0],
      modifiedBy: 'Current User',
      priority: savedRule.priority === 1 ? 'High' : savedRule.priority === 2 ? 'Medium' : 'Low',
      ruleLogic: `Generated from rule builder: ${savedRule.conditions.length} conditions, ${savedRule.actions.length} actions`
    };

    if (this.selectedRuleForBuilder()) {
      // Update existing rule
      this.rules.update(rules => rules.map(rule => rule.id === this.selectedRuleForBuilder()!.id ? updatedRule : rule));
    } else {
      // Add new rule
      this.rules.update(rules => [...rules, updatedRule]);
    }

    this.showRuleBuilder.set(false);
    this.selectedRuleForBuilder.set(null);
    this.updateFilteredRules();
  }

  handleRuleBuilderCancel(): void {
    this.showRuleBuilder.set(false);
    this.selectedRuleForBuilder.set(null);
  }

  handleAddRule(): void {
    if (!this.newRule.name || !this.newRule.category || !this.newRule.description || !this.newRule.ruleLogic) {
      console.error('Please fill in all required fields');
      return;
    }

    const rule: MLFRule = {
      id: `rule-${Date.now()}`,
      name: this.newRule.name,
      category: this.newRule.category,
      description: this.newRule.description,
      status: this.newRule.status,
      lastModified: new Date().toISOString().split('T')[0],
      modifiedBy: 'Current User',
      priority: this.newRule.priority,
      ruleLogic: this.newRule.ruleLogic
    };

    this.rules.update(rules => [...rules, rule]);
    this.resetNewRule();
    this.isAddDialogOpen.set(false);
    this.updateFilteredRules();
    console.log('Rule added successfully');
  }

  handleEdit(ruleId: string): void {
    const rule = this.rules().find(r => r.id === ruleId);
    if (rule) {
      this.editingRule.set({ ...rule });
      this.isEditDialogOpen.set(true);
    }
  }

  handleEditRule(): void {
    const rule = this.editingRule();
    if (!rule) return;

    if (!rule.name || !rule.category || !rule.description || !rule.ruleLogic) {
      console.error('Please fill in all required fields');
      return;
    }

    const updatedRule = {
      ...rule,
      lastModified: new Date().toISOString().split('T')[0],
      modifiedBy: 'Current User'
    };

    this.rules.update(rules => 
      rules.map(r => r.id === rule.id ? updatedRule : r)
    );
    
    this.isEditDialogOpen.set(false);
    this.editingRule.set(null);
    this.updateFilteredRules();
    console.log('Rule updated successfully');
  }

  handleDelete(ruleId: string): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.rules.update(rules => rules.filter(r => r.id !== ruleId));
      this.updateFilteredRules();
      console.log('Rule deleted successfully');
    }
  }

  onAddDialogChange(isOpen: boolean): void {
    this.isAddDialogOpen.set(isOpen);
    if (!isOpen) {
      this.resetNewRule();
    }
  }

  onEditDialogChange(isOpen: boolean): void {
    this.isEditDialogOpen.set(isOpen);
    if (!isOpen) {
      this.editingRule.set(null);
    }
  }

  handleCancelAdd(): void {
    this.isAddDialogOpen.set(false);
    this.resetNewRule();
  }

  handleCancelEdit(): void {
    this.isEditDialogOpen.set(false);
    this.editingRule.set(null);
  }

  private resetNewRule(): void {
    this.newRule = {
      name: '',
      category: '',
      description: '',
      status: 'Draft',
      priority: 'Medium',
      ruleLogic: ''
    };
  }
}