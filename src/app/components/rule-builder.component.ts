import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Plus,
  Trash2,
  Play,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Database,
  FolderOpen,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Code
} from 'lucide-angular';
import { ButtonComponent } from './ui/button.component';
import { InputComponent } from './ui/input.component';
import { LabelComponent } from './ui/label.component';
import { SelectComponent, SelectOption } from './ui/select.component';
import { CardComponent } from './ui/card.component';
import { BadgeComponent } from './ui/badge.component';
import { TextareaComponent } from './ui/textarea.component';

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  dataSource: 'master' | 'project';
  logicalOperator?: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: string;
  target: string;
  value: string;
  dataSource: 'master' | 'project';
}

interface Rule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
}

interface TestResults {
  passed: boolean;
  executionTime: number;
  conditionsEvaluated: number;
  actionsExecuted: number;
  output: {
    triggered: boolean;
    matchedConditions: RuleCondition[];
    executedActions: RuleAction[];
  };
}

@Component({
  selector: 'app-rule-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    LabelComponent,
    SelectComponent,
    CardComponent,
    BadgeComponent,
    TextareaComponent
  ],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 class="text-xl font-semibold">{{ rule ? 'Edit Rule' : 'Create New Rule' }}</h2>
          <p class="text-sm text-muted-foreground">Define business logic for MLF calculations</p>
        </div>
        <div class="flex gap-2">
          <ui-button variant="outline" (clicked)="onCancel.emit()" [leftIcon]="X">
            Cancel
          </ui-button>
          <ui-button (clicked)="handleSave()" [leftIcon]="Save">
            Save Rule
          </ui-button>
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
                <lucide-icon [name]="Settings" size="20"></lucide-icon>
                Rule Information
              </h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <ui-label htmlFor="ruleName">Rule Name</ui-label>
                    <ui-input
                      id="ruleName"
                      [(ngModel)]="ruleName"
                      placeholder="Enter rule name"
                    ></ui-input>
                  </div>
                  <div>
                    <ui-label htmlFor="priority">Priority</ui-label>
                    <ui-select
                      id="priority"
                      [options]="priorityOptions"
                      [(ngModel)]="priority"
                      placeholder="Select priority"
                    ></ui-select>
                  </div>
                </div>
                <div>
                  <ui-label htmlFor="description">Description</ui-label>
                  <ui-textarea
                    id="description"
                    [(ngModel)]="ruleDescription"
                    placeholder="Describe what this rule does"
                    [rows]="3"
                  ></ui-textarea>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    [(ngModel)]="enabled"
                    class="rounded"
                  />
                  <ui-label htmlFor="enabled">Enable this rule</ui-label>
                </div>
              </div>
            </div>
          </ui-card>

          <!-- Conditions -->
          <ui-card>
            <div class="p-6">
              <h3 
                class="text-lg font-medium mb-4 flex items-center gap-2 cursor-pointer"
                (click)="toggleSection('conditions')"
              >
                <lucide-icon 
                  [name]="expandedSections.has('conditions') ? ChevronDown : ChevronRight" 
                  size="20"
                ></lucide-icon>
                <lucide-icon [name]="AlertTriangle" size="20"></lucide-icon>
                Conditions ({{ conditions().length }})
              </h3>
              <div *ngIf="expandedSections.has('conditions')" class="space-y-4">
                <div *ngFor="let condition of conditions(); let i = index" class="p-4 border border-border rounded-lg space-y-3">
                  <div *ngIf="i > 0" class="flex justify-center">
                    <ui-select
                      [options]="logicalOperatorOptions"
                      [ngModel]="condition.logicalOperator"
                      (ngModelChange)="updateCondition(condition.id, { logicalOperator: $event })"
                      class="w-20"
                    ></ui-select>
                  </div>
                  <div class="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <ui-label>Data Source</ui-label>
                      <ui-select
                        [options]="dataSourceOptions"
                        [ngModel]="condition.dataSource"
                        (ngModelChange)="updateCondition(condition.id, { dataSource: $event })"
                      ></ui-select>
                    </div>
                    <div>
                      <ui-label>Field</ui-label>
                      <ui-select
                        [options]="getFieldOptions(condition.dataSource)"
                        [ngModel]="condition.field"
                        (ngModelChange)="updateCondition(condition.id, { field: $event })"
                        placeholder="Select field"
                      ></ui-select>
                    </div>
                    <div>
                      <ui-label>Operator</ui-label>
                      <ui-select
                        [options]="operatorOptions"
                        [ngModel]="condition.operator"
                        (ngModelChange)="updateCondition(condition.id, { operator: $event })"
                      ></ui-select>
                    </div>
                    <div>
                      <ui-label>Value</ui-label>
                      <ui-input
                        [ngModel]="condition.value"
                        (ngModelChange)="updateCondition(condition.id, { value: $event })"
                        placeholder="Enter value"
                      ></ui-input>
                    </div>
                    <ui-button 
                      variant="outline" 
                      size="sm"
                      (clicked)="removeCondition(condition.id)"
                      class="text-destructive hover:text-destructive"
                      [leftIcon]="Trash2"
                    ></ui-button>
                  </div>
                </div>
                <ui-button (clicked)="addCondition()" variant="outline" class="w-full" [leftIcon]="Plus">
                  Add Condition
                </ui-button>
              </div>
            </div>
          </ui-card>

          <!-- Actions -->
          <ui-card>
            <div class="p-6">
              <h3 
                class="text-lg font-medium mb-4 flex items-center gap-2 cursor-pointer"
                (click)="toggleSection('actions')"
              >
                <lucide-icon 
                  [name]="expandedSections.has('actions') ? ChevronDown : ChevronRight" 
                  size="20"
                ></lucide-icon>
                <lucide-icon [name]="Calculator" size="20"></lucide-icon>
                Actions ({{ actions().length }})
              </h3>
              <div *ngIf="expandedSections.has('actions')" class="space-y-4">
                <div *ngFor="let action of actions()" class="p-4 border border-border rounded-lg">
                  <div class="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <ui-label>Action Type</ui-label>
                      <ui-select
                        [options]="actionTypeOptions"
                        [ngModel]="action.type"
                        (ngModelChange)="updateAction(action.id, { type: $event })"
                      ></ui-select>
                    </div>
                    <div>
                      <ui-label>Data Source</ui-label>
                      <ui-select
                        [options]="dataSourceOptions"
                        [ngModel]="action.dataSource"
                        (ngModelChange)="updateAction(action.id, { dataSource: $event })"
                      ></ui-select>
                    </div>
                    <div>
                      <ui-label>Target Field</ui-label>
                      <ui-select
                        [options]="getFieldOptions(action.dataSource)"
                        [ngModel]="action.target"
                        (ngModelChange)="updateAction(action.id, { target: $event })"
                        placeholder="Select target"
                      ></ui-select>
                    </div>
                    <div>
                      <ui-label>Value/Formula</ui-label>
                      <ui-input
                        [ngModel]="action.value"
                        (ngModelChange)="updateAction(action.id, { value: $event })"
                        placeholder="Enter value or formula"
                      ></ui-input>
                    </div>
                    <ui-button 
                      variant="outline" 
                      size="sm"
                      (clicked)="removeAction(action.id)"
                      class="text-destructive hover:text-destructive"
                      [leftIcon]="Trash2"
                    ></ui-button>
                  </div>
                </div>
                <ui-button (clicked)="addAction()" variant="outline" class="w-full" [leftIcon]="Plus">
                  Add Action
                </ui-button>
              </div>
            </div>
          </ui-card>

          <!-- Rule Testing -->
          <ui-card>
            <div class="p-6">
              <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
                <lucide-icon [name]="Code" size="20"></lucide-icon>
                Rule Testing
              </h3>
              <div class="space-y-4">
                <div>
                  <ui-label htmlFor="testData">Test Data (JSON)</ui-label>
                  <ui-textarea
                    id="testData"
                    [(ngModel)]="testData"
                    placeholder='{"projectId": "P001", "activityHours": 120, "craftType": "Welder"}'
                    [rows]="4"
                    class="font-mono text-sm"
                  ></ui-textarea>
                </div>
                <div class="flex gap-2">
                  <ui-button (clicked)="handleTest()" class="flex-1" [leftIcon]="Play">
                    Test Rule
                  </ui-button>
                </div>
                
                <div *ngIf="testResults()" class="mt-4 p-4 border border-border rounded-lg bg-muted/50">
                  <div class="flex items-center gap-2 mb-3">
                    <lucide-icon 
                      [name]="testResults()!.passed ? CheckCircle2 : AlertTriangle" 
                      size="20"
                      [class]="testResults()!.passed ? 'text-green-600' : 'text-red-600'"
                    ></lucide-icon>
                    <span class="font-medium">
                      {{ testResults()!.passed ? 'Test Passed' : 'Test Failed' }}
                    </span>
                    <ui-badge variant="outline">
                      {{ testResults()!.executionTime }}ms
                    </ui-badge>
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Conditions Evaluated:</strong> {{ testResults()!.conditionsEvaluated }}</p>
                      <p><strong>Actions Executed:</strong> {{ testResults()!.actionsExecuted }}</p>
                    </div>
                    <div>
                      <p><strong>Rule Triggered:</strong> {{ testResults()!.output.triggered ? 'Yes' : 'No' }}</p>
                      <p><strong>Matched Conditions:</strong> {{ testResults()!.output.matchedConditions.length }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ui-card>
        </div>
      </div>
    </div>
  `
})
export class RuleBuilderComponent implements OnInit {
  @Input() rule?: Rule;
  @Output() onSave = new EventEmitter<Rule>();
  @Output() onCancel = new EventEmitter<void>();

  // Icons
  X = X;
  Save = Save;
  Settings = Settings;
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;
  AlertTriangle = AlertTriangle;
  Calculator = Calculator;
  Code = Code;
  Plus = Plus;
  Trash2 = Trash2;
  Play = Play;
  CheckCircle2 = CheckCircle2;
  Database = Database;
  FolderOpen = FolderOpen;

  // State
  ruleName = '';
  ruleDescription = '';
  priority = 1;
  enabled = true;
  testData = '';
  conditions = signal<RuleCondition[]>([]);
  actions = signal<RuleAction[]>([]);
  testResults = signal<TestResults | null>(null);
  expandedSections = new Set(['conditions', 'actions']);

  // Options
  priorityOptions: SelectOption[] = [
    { value: '1', label: 'Priority 1 (Highest)' },
    { value: '2', label: 'Priority 2' },
    { value: '3', label: 'Priority 3' },
    { value: '4', label: 'Priority 4' },
    { value: '5', label: 'Priority 5 (Lowest)' }
  ];

  dataSourceOptions: SelectOption[] = [
    { value: 'master', label: 'Master Data' },
    { value: 'project', label: 'Project Data' }
  ];

  logicalOperatorOptions: SelectOption[] = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
  ];

  operatorOptions: SelectOption[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater Than or Equal' },
    { value: 'less_equal', label: 'Less Than or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'in_list', label: 'In List' }
  ];

  actionTypeOptions: SelectOption[] = [
    { value: 'set_value', label: 'Set Value' },
    { value: 'calculate', label: 'Calculate' },
    { value: 'validate', label: 'Validate' },
    { value: 'flag', label: 'Flag for Review' },
    { value: 'auto_approve', label: 'Auto Approve' },
    { value: 'require_approval', label: 'Require Approval' },
    { value: 'send_notification', label: 'Send Notification' }
  ];

  masterDataFields = [
    'Global Activity Code',
    'Standard Craft',
    'Labor Category',
    'Skill Level',
    'Base Rate',
    'Overtime Multiplier',
    'Location Code',
    'Department'
  ];

  projectDataFields = [
    'Project ID',
    'Project Name',
    'Activity Hours',
    'L4 Activities',
    'SPC Activities',
    'Planned Hours',
    'Actual Hours',
    'Variance',
    'Progress %',
    'Budget'
  ];

  ngOnInit() {
    if (this.rule) {
      this.ruleName = this.rule.name;
      this.ruleDescription = this.rule.description;
      this.priority = this.rule.priority;
      this.enabled = this.rule.enabled;
      this.conditions.set([...this.rule.conditions]);
      this.actions.set([...this.rule.actions]);
    }
  }

  getFieldOptions(dataSource: 'master' | 'project'): SelectOption[] {
    const fields = dataSource === 'master' ? this.masterDataFields : this.projectDataFields;
    return fields.map(field => ({ value: field, label: field }));
  }

  toggleSection(section: string) {
    if (this.expandedSections.has(section)) {
      this.expandedSections.delete(section);
    } else {
      this.expandedSections.add(section);
    }
  }

  addCondition() {
    const newCondition: RuleCondition = {
      id: `condition_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      dataSource: 'master',
      logicalOperator: this.conditions().length > 0 ? 'AND' : undefined
    };
    this.conditions.update(conditions => [...conditions, newCondition]);
  }

  updateCondition(id: string, updates: Partial<RuleCondition>) {
    this.conditions.update(conditions => 
      conditions.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  }

  removeCondition(id: string) {
    this.conditions.update(conditions => conditions.filter(c => c.id !== id));
  }

  addAction() {
    const newAction: RuleAction = {
      id: `action_${Date.now()}`,
      type: 'set_value',
      target: '',
      value: '',
      dataSource: 'project'
    };
    this.actions.update(actions => [...actions, newAction]);
  }

  updateAction(id: string, updates: Partial<RuleAction>) {
    this.actions.update(actions => 
      actions.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  }

  removeAction(id: string) {
    this.actions.update(actions => actions.filter(a => a.id !== id));
  }

  handleSave() {
    if (!this.ruleName.trim()) {
      alert('Rule name is required');
      return;
    }

    if (this.conditions().length === 0) {
      alert('At least one condition is required');
      return;
    }

    if (this.actions().length === 0) {
      alert('At least one action is required');
      return;
    }

    const newRule: Rule = {
      id: this.rule?.id || `rule_${Date.now()}`,
      name: this.ruleName,
      description: this.ruleDescription,
      conditions: this.conditions(),
      actions: this.actions(),
      priority: this.priority,
      enabled: this.enabled
    };

    this.onSave.emit(newRule);
  }

  handleTest() {
    // Mock rule testing logic
    const mockResult: TestResults = {
      passed: Math.random() > 0.3,
      executionTime: Math.floor(Math.random() * 50) + 10,
      conditionsEvaluated: this.conditions().length,
      actionsExecuted: Math.floor(Math.random() * this.actions().length) + 1,
      output: {
        triggered: true,
        matchedConditions: this.conditions().slice(0, Math.floor(Math.random() * this.conditions().length) + 1),
        executedActions: this.actions().slice(0, Math.floor(Math.random() * this.actions().length) + 1)
      }
    };
    
    this.testResults.set(mockResult);
    alert('Rule test completed');
  }
}