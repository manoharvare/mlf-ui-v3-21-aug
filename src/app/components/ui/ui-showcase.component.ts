import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  LucideAngularModule,
  Plus,
  Download,
  Save,
  RotateCcw,
  Mail,
  Lock,
  Search,
  User,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  BarChart3,
  Layout,
  MousePointer,
  Type,
  Tag,
  Play,
  ChevronDown,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Palette,
  Zap,
  Info,
  Grid,
  Navigation,
  Loader,
  Eye,
  ChevronRight,
  Calendar,
  Upload,
  Settings
} from 'lucide-angular';
import { 
  ButtonComponent, 
  InputComponent, 
  CardComponent, 
  CardHeaderComponent, 
  CardTitleComponent, 
  CardDescriptionComponent, 
  CardContentComponent, 
  CardFooterComponent,
  BadgeComponent,
  SelectComponent,
  CheckboxComponent,
  RadioGroupComponent,
  SwitchComponent,
  ModalComponent,
  ToastContainerComponent,
  ProgressComponent,
  CircularProgressComponent,
  TabsComponent,
  TabPanelComponent,
  AccordionComponent,
  TooltipComponent,
  SpinnerComponent,
  DropdownComponent,
  DataTableComponent,
  PaginationComponent,
  BreadcrumbComponent,
  AvatarComponent,
  AvatarGroupComponent,
  SkeletonComponent,
  SkeletonCardComponent,
  SkeletonTableComponent,
  SkeletonListComponent,
  DatePickerComponent,
  FileUploadComponent,
  SearchComponent,
  SliderComponent,
  TextareaComponent,
  SeparatorComponent,
  SeparatorWithTextComponent,
  LabelComponent,
  FieldLabelComponent,
  PopoverComponent,
  CommandComponent,
  CommandDialogComponent,
  CollapsibleComponent,
  CollapsibleGroupComponent,
  ToggleGroupComponent,
  DialogComponent,
  ConfirmationDialogComponent,
  FormComponent,
  FormFieldComponent,
  CalendarComponent,
  type SelectOption,
  type RadioOption,
  type ToastData,
  type TabItem,
  type AccordionItem,
  type DropdownItem,
  type TableColumn,
  type TableAction,
  type BreadcrumbItem,
  type SearchResult,
  type UploadedFile,
  type TextareaSize,
  type TextareaResize,
  type SeparatorOrientation,
  type SeparatorVariant,
  type SeparatorSize,
  type LabelSize,
  type LabelVariant,
  type PopoverPlacement,
  type CommandItem,
  type ToggleOption,
  type PopoverTrigger,
  type CommandGroup,
  type CollapsibleSize,
  type ToggleGroupSize,
  type ToggleGroupVariant,
  type ToggleGroupType,
  type DialogSize,
  type DialogType,
  type ConfirmationConfig,
  type FormFieldError,
  type FormSize,
  type FormLayout,
  type CalendarMode,
  type CalendarSize,
  type CalendarDate
} from './index';

@Component({
  selector: 'ui-showcase',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent, 
    InputComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardTitleComponent, 
    CardDescriptionComponent, 
    CardContentComponent, 
    CardFooterComponent,
    BadgeComponent,
    SelectComponent,
    CheckboxComponent,
    RadioGroupComponent,
    SwitchComponent,
    ModalComponent,
    ToastContainerComponent,
    ProgressComponent,
    CircularProgressComponent,
    TabsComponent,
    TabPanelComponent,
    AccordionComponent,
    TooltipComponent,
    SpinnerComponent,
    DropdownComponent,
    DataTableComponent,
    PaginationComponent,
    BreadcrumbComponent,
    AvatarComponent,
    AvatarGroupComponent,
    SkeletonComponent,
    SkeletonCardComponent,
    SkeletonTableComponent,
    SkeletonListComponent,
    DatePickerComponent,
    FileUploadComponent,
    SearchComponent,
    SliderComponent,
    TextareaComponent,
    SeparatorComponent,
    SeparatorWithTextComponent,
    LabelComponent,
    FieldLabelComponent,
    PopoverComponent,
    CommandComponent,
    CommandDialogComponent,
    CollapsibleComponent,
    CollapsibleGroupComponent,
    ToggleGroupComponent,
    DialogComponent,
    ConfirmationDialogComponent,
    FormComponent,
    FormFieldComponent,
    CalendarComponent
  ],
  template: `
    <div class="p-8 space-y-8 bg-background min-h-screen">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">UI Components Showcase</h1>
        
        <!-- Buttons Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="MousePointer">Button Components</ui-card-title>
            <ui-card-description>Various button styles and states</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-4">
              <!-- Button Variants -->
              <div>
                <h4 class="text-sm font-medium mb-3">Variants</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-button variant="primary" (clicked)="onButtonClick('Primary')">Primary</ui-button>
                  <ui-button variant="secondary" (clicked)="onButtonClick('Secondary')">Secondary</ui-button>
                  <ui-button variant="outline" (clicked)="onButtonClick('Outline')">Outline</ui-button>
                  <ui-button variant="ghost" (clicked)="onButtonClick('Ghost')">Ghost</ui-button>
                  <ui-button variant="destructive" (clicked)="onButtonClick('Destructive')">Destructive</ui-button>
                </div>
              </div>
              
              <!-- Button Sizes -->
              <div>
                <h4 class="text-sm font-medium mb-3">Sizes</h4>
                <div class="flex flex-wrap items-center gap-3">
                  <ui-button size="sm">Small</ui-button>
                  <ui-button size="md">Medium</ui-button>
                  <ui-button size="lg">Large</ui-button>
                </div>
              </div>
              
              <!-- Button with Icons -->
              <div>
                <h4 class="text-sm font-medium mb-3">With Icons</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-button [leftIcon]="Plus">Add New</ui-button>
                  <ui-button [rightIcon]="Download">Download</ui-button>
                  <ui-button [leftIcon]="Save" [rightIcon]="ArrowRight">Save & More</ui-button>
                </div>
              </div>
              
              <!-- Button States -->
              <div>
                <h4 class="text-sm font-medium mb-3">States</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-button [disabled]="true">Disabled</ui-button>
                  <ui-button [loading]="true">Loading</ui-button>
                  <ui-button [loading]="true" [showTextWhileLoading]="true">Loading with text</ui-button>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>
        
        <!-- Inputs Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Type">Input Components</ui-card-title>
            <ui-card-description>Form input fields with various configurations</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ui-input 
                label="Basic Input" 
                placeholder="Enter text here..."
                [(ngModel)]="inputValue1">
              </ui-input>
              
              <ui-input 
                label="Email Input" 
                type="email"
                placeholder="Enter your email"
                [leftIcon]="Mail"
                [(ngModel)]="inputValue2">
              </ui-input>
              
              <ui-input 
                label="Password Input" 
                type="password"
                placeholder="Enter password"
                [leftIcon]="Lock"
                helperText="Password must be at least 8 characters"
                [(ngModel)]="inputValue3">
              </ui-input>
              
              <ui-input 
                label="Search Input" 
                type="search"
                placeholder="Search..."
                [leftIcon]="Search"
                [clearable]="true"
                [(ngModel)]="inputValue4">
              </ui-input>
              
              <ui-input 
                label="Required Field" 
                placeholder="This field is required"
                [required]="true"
                errorMessage="This field is required"
                [(ngModel)]="inputValue5">
              </ui-input>
              
              <ui-input 
                label="Disabled Input" 
                placeholder="This is disabled"
                [disabled]="true"
                [(ngModel)]="inputValue6">
              </ui-input>
            </div>
          </ui-card-content>
        </ui-card>
        
        <!-- Select Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="ChevronDown">Select Components</ui-card-title>
            <ui-card-description>Dropdown selection components</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ui-select 
                label="Basic Select"
                placeholder="Choose an option"
                [options]="basicOptions"
                [(ngModel)]="selectValue1">
              </ui-select>
              
              <ui-select 
                label="Select with Icons"
                placeholder="Choose a status"
                [options]="statusOptions"
                [(ngModel)]="selectValue2">
              </ui-select>
              
              <ui-select 
                label="Searchable Select"
                placeholder="Search and select"
                [options]="searchableOptions"
                [searchable]="true"
                [(ngModel)]="selectValue3">
              </ui-select>
              
              <ui-select 
                label="Required Select"
                placeholder="This is required"
                [options]="basicOptions"
                [required]="true"
                errorMessage="Please select an option"
                [(ngModel)]="selectValue4">
              </ui-select>
            </div>
          </ui-card-content>
        </ui-card>
        
        <!-- Badges Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Tag">Badge Components</ui-card-title>
            <ui-card-description>Status indicators and labels</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-4">
              <!-- Badge Variants -->
              <div>
                <h4 class="text-sm font-medium mb-3">Variants</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-badge variant="default">Default</ui-badge>
                  <ui-badge variant="secondary">Secondary</ui-badge>
                  <ui-badge variant="outline">Outline</ui-badge>
                  <ui-badge variant="destructive">Destructive</ui-badge>
                  <ui-badge variant="success">Success</ui-badge>
                  <ui-badge variant="warning">Warning</ui-badge>
                  <ui-badge variant="info">Info</ui-badge>
                </div>
              </div>
              
              <!-- Badge Sizes -->
              <div>
                <h4 class="text-sm font-medium mb-3">Sizes</h4>
                <div class="flex flex-wrap items-center gap-3">
                  <ui-badge size="sm">Small</ui-badge>
                  <ui-badge size="md">Medium</ui-badge>
                  <ui-badge size="lg">Large</ui-badge>
                </div>
              </div>
              
              <!-- Badge with Icons -->
              <div>
                <h4 class="text-sm font-medium mb-3">With Icons</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-badge [leftIcon]="CheckCircle" variant="success">Completed</ui-badge>
                  <ui-badge [leftIcon]="Clock" variant="warning">Pending</ui-badge>
                  <ui-badge [leftIcon]="XCircle" variant="destructive">Failed</ui-badge>
                  <ui-badge [rightIcon]="ArrowRight">Next</ui-badge>
                  <ui-badge [dot]="true" variant="info">New</ui-badge>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>
        
        <!-- Cards Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Layout">Card Components</ui-card-title>
            <ui-card-description>Content containers with various layouts</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Basic Card -->
              <ui-card>
                <ui-card-header>
                  <ui-card-title>Basic Card</ui-card-title>
                  <ui-card-description>This is a basic card with header and content</ui-card-description>
                </ui-card-header>
                <ui-card-content>
                  <p class="text-sm text-muted-foreground">Card content goes here. This is a simple card layout.</p>
                </ui-card-content>
              </ui-card>
              
              <!-- Card with Icon -->
              <ui-card>
                <ui-card-header>
                  <ui-card-title [icon]="BarChart3" size="lg">Analytics</ui-card-title>
                  <ui-card-description>View your analytics data</ui-card-description>
                </ui-card-header>
                <ui-card-content>
                  <div class="text-2xl font-bold">1,234</div>
                  <p class="text-xs text-muted-foreground">+20.1% from last month</p>
                </ui-card-content>
              </ui-card>
              
              <!-- Card with Footer -->
              <ui-card>
                <ui-card-header>
                  <ui-card-title>Project Status</ui-card-title>
                  <ui-card-description>Current project information</ui-card-description>
                </ui-card-header>
                <ui-card-content>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm">Progress</span>
                      <span class="text-sm font-medium">75%</span>
                    </div>
                    <div class="w-full bg-secondary rounded-full h-2">
                      <div class="bg-primary h-2 rounded-full" style="width: 75%"></div>
                    </div>
                  </div>
                </ui-card-content>
                <ui-card-footer>
                  <ui-button size="sm" variant="outline" class="w-full">View Details</ui-button>
                </ui-card-footer>
              </ui-card>
            </div>
          </ui-card-content>
        </ui-card>
        
        <!-- Form Controls Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="CheckCircle">Form Controls</ui-card-title>
            <ui-card-description>Checkboxes, radio buttons, and switches</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <!-- Checkboxes -->
              <div>
                <h4 class="text-sm font-medium mb-3">Checkboxes</h4>
                <div class="space-y-3">
                  <ui-checkbox 
                    label="Accept terms and conditions" 
                    [(ngModel)]="checkboxValue1">
                  </ui-checkbox>
                  <ui-checkbox 
                    label="Subscribe to newsletter" 
                    helperText="Get updates about new features"
                    [(ngModel)]="checkboxValue2">
                  </ui-checkbox>
                  <ui-checkbox 
                    label="Disabled checkbox" 
                    [disabled]="true"
                    [(ngModel)]="checkboxValue3">
                  </ui-checkbox>
                </div>
              </div>
              
              <!-- Radio Buttons -->
              <div>
                <h4 class="text-sm font-medium mb-3">Radio Buttons</h4>
                <ui-radio-group
                  label="Choose your plan"
                  [options]="planOptions"
                  [(ngModel)]="radioValue1">
                </ui-radio-group>
              </div>
              
              <!-- Switches -->
              <div>
                <h4 class="text-sm font-medium mb-3">Switches</h4>
                <div class="space-y-4">
                  <ui-switch 
                    label="Enable notifications" 
                    description="Receive push notifications"
                    [(ngModel)]="switchValue1">
                  </ui-switch>
                  <ui-switch 
                    label="Dark mode" 
                    [(ngModel)]="switchValue2">
                  </ui-switch>
                  <ui-switch 
                    label="Disabled switch" 
                    [disabled]="true"
                    [(ngModel)]="switchValue3">
                  </ui-switch>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Progress Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="BarChart3">Progress Indicators</ui-card-title>
            <ui-card-description>Progress bars and circular progress</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <!-- Linear Progress -->
              <div>
                <h4 class="text-sm font-medium mb-3">Linear Progress</h4>
                <div class="space-y-4">
                  <ui-progress 
                    [value]="progressValue" 
                    label="Upload Progress"
                    [showLabel]="true"
                    [showPercentage]="true">
                  </ui-progress>
                  <ui-progress 
                    [value]="75" 
                    variant="success"
                    size="sm">
                  </ui-progress>
                  <ui-progress 
                    [value]="45" 
                    variant="warning"
                    [showStripes]="true">
                  </ui-progress>
                </div>
              </div>
              
              <!-- Circular Progress -->
              <div>
                <h4 class="text-sm font-medium mb-3">Circular Progress</h4>
                <div class="flex gap-6">
                  <ui-circular-progress 
                    [value]="progressValue"
                    [size]="100">
                  </ui-circular-progress>
                  <ui-circular-progress 
                    [value]="85"
                    variant="success"
                    label="Success"
                    [size]="80">
                  </ui-circular-progress>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Tabs Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Layout">Tabs</ui-card-title>
            <ui-card-description>Tabbed content organization</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <ui-tabs [tabs]="tabItems" [(activeTab)]="activeTabId">
              <ui-tab-panel id="overview">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold">Overview</h3>
                  <p class="text-muted-foreground">This is the overview tab content. Here you can display general information about your application or feature.</p>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-muted rounded-lg">
                      <div class="text-2xl font-bold">1,234</div>
                      <div class="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div class="p-4 bg-muted rounded-lg">
                      <div class="text-2xl font-bold">567</div>
                      <div class="text-sm text-muted-foreground">Active Sessions</div>
                    </div>
                    <div class="p-4 bg-muted rounded-lg">
                      <div class="text-2xl font-bold">89%</div>
                      <div class="text-sm text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </ui-tab-panel>
              
              <ui-tab-panel id="analytics">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold">Analytics</h3>
                  <p class="text-muted-foreground">Analytics and reporting data would be displayed here.</p>
                  <ui-progress [value]="75" label="Data Processing" [showLabel]="true" [showPercentage]="true"></ui-progress>
                </div>
              </ui-tab-panel>
              
              <ui-tab-panel id="settings">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold">Settings</h3>
                  <p class="text-muted-foreground">Configuration options and preferences.</p>
                  <div class="space-y-3">
                    <ui-switch label="Enable notifications" [(ngModel)]="settingsNotifications"></ui-switch>
                    <ui-switch label="Auto-save" [(ngModel)]="settingsAutoSave"></ui-switch>
                  </div>
                </div>
              </ui-tab-panel>
            </ui-tabs>
          </ui-card-content>
        </ui-card>

        <!-- Modal Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Layout">Modal Dialogs</ui-card-title>
            <ui-card-description>Modal dialogs and overlays</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="flex gap-3">
              <ui-button (clicked)="openModal('basic')">Basic Modal</ui-button>
              <ui-button variant="outline" (clicked)="openModal('form')">Form Modal</ui-button>
              <ui-button variant="destructive" (clicked)="openModal('confirm')">Confirm Modal</ui-button>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Toast Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="CheckCircle">Toast Notifications</ui-card-title>
            <ui-card-description>Toast messages and notifications</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="flex flex-wrap gap-3">
              <ui-button (clicked)="showToast('success')">Success Toast</ui-button>
              <ui-button variant="outline" (clicked)="showToast('info')">Info Toast</ui-button>
              <ui-button variant="destructive" (clicked)="showToast('error')">Error Toast</ui-button>
              <ui-button variant="secondary" (clicked)="showToast('warning')">Warning Toast</ui-button>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Accordion Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="ChevronDown">Accordion</ui-card-title>
            <ui-card-description>Collapsible content sections</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <ui-accordion [items]="accordionItems" type="single" [collapsible]="true">
            </ui-accordion>
          </ui-card-content>
        </ui-card>

        <!-- Tooltip Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Info">Tooltips</ui-card-title>
            <ui-card-description>Helpful hints and information</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="flex flex-wrap gap-4">
              <ui-tooltip content="This is a tooltip on top" position="top">
                <ui-button variant="outline">Hover me (Top)</ui-button>
              </ui-tooltip>
              <ui-tooltip content="This is a tooltip on the right" position="right">
                <ui-button variant="outline">Hover me (Right)</ui-button>
              </ui-tooltip>
              <ui-tooltip content="This is a tooltip on the bottom" position="bottom">
                <ui-button variant="outline">Hover me (Bottom)</ui-button>
              </ui-tooltip>
              <ui-tooltip content="This is a tooltip on the left" position="left">
                <ui-button variant="outline">Hover me (Left)</ui-button>
              </ui-tooltip>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Spinner Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="RotateCcw">Loading Spinners</ui-card-title>
            <ui-card-description>Loading indicators and spinners</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Spinner Sizes</h4>
                <div class="flex items-center gap-4">
                  <ui-spinner size="xs" label="XS"></ui-spinner>
                  <ui-spinner size="sm" label="SM"></ui-spinner>
                  <ui-spinner size="md" label="MD"></ui-spinner>
                  <ui-spinner size="lg" label="LG"></ui-spinner>
                  <ui-spinner size="xl" label="XL"></ui-spinner>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Spinner Variants</h4>
                <div class="flex items-center gap-4">
                  <ui-spinner variant="default" label="Default"></ui-spinner>
                  <ui-spinner variant="primary" label="Primary"></ui-spinner>
                  <ui-spinner variant="secondary" label="Secondary"></ui-spinner>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Dropdown Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="MoreHorizontal">Dropdown Menus</ui-card-title>
            <ui-card-description>Context menus and dropdown actions</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="flex gap-4">
              <ui-dropdown 
                [items]="dropdownItems" 
                triggerText="Actions"
                [showChevron]="true"
                (itemSelected)="onDropdownItemSelected($event)">
              </ui-dropdown>
              <ui-dropdown 
                [items]="dropdownItems" 
                [triggerIcon]="MoreHorizontal"
                [showChevron]="false"
                position="bottom-end"
                (itemSelected)="onDropdownItemSelected($event)">
              </ui-dropdown>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Data Table Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Grid">Data Table</ui-card-title>
            <ui-card-description>Feature-rich data table with sorting, filtering, and pagination</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <ui-data-table
              [data]="tableData"
              [columns]="tableColumns"
              [actions]="tableActions"
              [pagination]="tablePagination"
              [loading]="tableLoading"
              (actionClick)="onTableAction($event)"
              (sortChange)="onTableSort($event)"
              (pageChange)="onTablePageChange($event)"
            ></ui-data-table>
          </ui-card-content>
        </ui-card>

        <!-- Breadcrumb Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Navigation">Breadcrumbs</ui-card-title>
            <ui-card-description>Navigation breadcrumbs for hierarchical content</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium mb-2">Basic Breadcrumb</h4>
                <ui-breadcrumb [items]="breadcrumbItems"></ui-breadcrumb>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-2">With Home Icon</h4>
                <ui-breadcrumb [items]="breadcrumbItems" [showHome]="true"></ui-breadcrumb>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Avatar Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="User">Avatars</ui-card-title>
            <ui-card-description>User profile pictures and placeholders</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Sizes</h4>
                <div class="flex items-center gap-4">
                  <ui-avatar size="xs" name="John Doe"></ui-avatar>
                  <ui-avatar size="sm" name="Jane Smith"></ui-avatar>
                  <ui-avatar size="md" name="Bob Johnson"></ui-avatar>
                  <ui-avatar size="lg" name="Alice Brown"></ui-avatar>
                  <ui-avatar size="xl" name="Charlie Wilson"></ui-avatar>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">With Status</h4>
                <div class="flex items-center gap-4">
                  <ui-avatar name="Online User" status="online"></ui-avatar>
                  <ui-avatar name="Away User" status="away"></ui-avatar>
                  <ui-avatar name="Busy User" status="busy"></ui-avatar>
                  <ui-avatar name="Offline User" status="offline"></ui-avatar>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">With Badges</h4>
                <div class="flex items-center gap-4">
                  <ui-avatar name="User One" [badge]="3"></ui-avatar>
                  <ui-avatar name="User Two" [badge]="12"></ui-avatar>
                  <ui-avatar name="User Three" [badge]="99"></ui-avatar>
                  <ui-avatar name="User Four" [badge]="150"></ui-avatar>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Avatar Group</h4>
                <ui-avatar-group [max]="3" [totalCount]="8">
                  <ui-avatar name="User 1"></ui-avatar>
                  <ui-avatar name="User 2"></ui-avatar>
                  <ui-avatar name="User 3"></ui-avatar>
                  <ui-avatar name="User 4"></ui-avatar>
                  <ui-avatar name="User 5"></ui-avatar>
                </ui-avatar-group>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Skeleton Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Loader">Skeleton Loading</ui-card-title>
            <ui-card-description>Loading placeholders for better UX</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Card Skeleton</h4>
                <ui-skeleton-card [showImage]="true" [showActions]="true"></ui-skeleton-card>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">List Skeleton</h4>
                <ui-skeleton-list [items]="3"></ui-skeleton-list>
              </div>
              <div class="lg:col-span-2">
                <h4 class="text-sm font-medium mb-3">Table Skeleton</h4>
                <ui-skeleton-table [rows]="4"></ui-skeleton-table>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Pagination Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="ChevronRight">Pagination</ui-card-title>
            <ui-card-description>Navigate through pages of content</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <ui-pagination
              [currentPage]="paginationDemo.currentPage"
              [totalPages]="paginationDemo.totalPages"
              [totalItems]="paginationDemo.totalItems"
              [itemsPerPage]="paginationDemo.itemsPerPage"
              (pageChange)="onPaginationChange($event)"
            ></ui-pagination>
          </ui-card-content>
        </ui-card>

        <!-- Date Picker Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Calendar">Date Picker</ui-card-title>
            <ui-card-description>Date selection components</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Sizes</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ui-date-picker label="Small" size="sm" [(ngModel)]="dateDemo.small"></ui-date-picker>
                  <ui-date-picker label="Medium" size="md" [(ngModel)]="dateDemo.medium"></ui-date-picker>
                  <ui-date-picker label="Large" size="lg" [(ngModel)]="dateDemo.large"></ui-date-picker>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">With Constraints</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ui-date-picker 
                    label="Start Date" 
                    [max]="dateDemo.endDate"
                    [(ngModel)]="dateDemo.startDate">
                  </ui-date-picker>
                  <ui-date-picker 
                    label="End Date" 
                    [min]="dateDemo.startDate"
                    [(ngModel)]="dateDemo.endDate">
                  </ui-date-picker>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- File Upload Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Upload">File Upload</ui-card-title>
            <ui-card-description>File upload components with different variants</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Dropzone Variant</h4>
                <ui-file-upload
                  label="Upload Documents"
                  variant="dropzone"
                  [multiple]="true"
                  accept=".pdf,.doc,.docx,.txt"
                  [maxSize]="5242880"
                  (filesSelected)="onFilesSelected($event)">
                </ui-file-upload>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Button Variant</h4>
                <ui-file-upload
                  label="Upload Images"
                  variant="button"
                  [multiple]="true"
                  accept="image/*"
                  buttonText="Choose Images"
                  (filesSelected)="onFilesSelected($event)">
                </ui-file-upload>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Search Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Search">Search</ui-card-title>
            <ui-card-description>Search components with autocomplete</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Search</h4>
                <ui-search
                  placeholder="Search users..."
                  [results]="searchResults"
                  (searchChange)="onSearchChange($event)"
                  (resultSelected)="onSearchResultSelected($event)">
                </ui-search>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Search Sizes</h4>
                <div class="space-y-3">
                  <ui-search size="sm" placeholder="Small search..."></ui-search>
                  <ui-search size="md" placeholder="Medium search..."></ui-search>
                  <ui-search size="lg" placeholder="Large search..."></ui-search>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Slider Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Settings">Slider</ui-card-title>
            <ui-card-description>Range input sliders</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Sliders</h4>
                <div class="space-y-4">
                  <ui-slider
                    label="Volume"
                    [min]="0"
                    [max]="100"
                    [step]="1"
                    unit="%"
                    [(ngModel)]="sliderDemo.volume">
                  </ui-slider>
                  <ui-slider
                    label="Price Range"
                    [min]="0"
                    [max]="1000"
                    [step]="10"
                    unit="$"
                    [showMinMax]="true"
                    [(ngModel)]="sliderDemo.price">
                  </ui-slider>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Slider Sizes</h4>
                <div class="space-y-4">
                  <ui-slider label="Small" size="sm" [(ngModel)]="sliderDemo.small"></ui-slider>
                  <ui-slider label="Medium" size="md" [(ngModel)]="sliderDemo.medium"></ui-slider>
                  <ui-slider label="Large" size="lg" [(ngModel)]="sliderDemo.large"></ui-slider>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Interactive Demo -->
        <ui-card>
          <ui-card-header>
            <ui-card-title [icon]="Play">Interactive Demo</ui-card-title>
            <ui-card-description>Test the components interactively</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ui-input 
                  label="Your Name" 
                  placeholder="Enter your name"
                  [leftIcon]="User"
                  [(ngModel)]="demoName">
                </ui-input>
                
                <ui-select 
                  label="Your Role"
                  placeholder="Select your role"
                  [options]="roleOptions"
                  [(ngModel)]="demoRole">
                </ui-select>
              </div>
              
              <div class="flex gap-3">
                <ui-button 
                  [leftIcon]="Save" 
                  (clicked)="saveDemoData()"
                  [disabled]="!demoName || !demoRole">
                  Save
                </ui-button>
                <ui-button 
                  variant="outline" 
                  [leftIcon]="RotateCcw"
                  (clicked)="resetDemoData()">
                  Reset
                </ui-button>
              </div>
              
              <div *ngIf="demoMessage" class="p-4 bg-muted rounded-md">
                <p class="text-sm">{{ demoMessage }}</p>
              </div>
            </div>
          </ui-card-content>
        </ui-card>
      </div>
      
      <!-- Toast Container -->
      <ui-toast-container 
        [toasts]="toasts" 
        position="top-right"
        (toastRemoved)="removeToast($event)">
      </ui-toast-container>
      
      <!-- Modals -->
      <ui-modal 
        [(isOpen)]="modals.basic" 
        title="Basic Modal"
        description="This is a basic modal example">
        <p>This is the modal content. You can put any content here.</p>
        <div slot="footer">
          <ui-button variant="outline" (clicked)="closeModal('basic')">Cancel</ui-button>
          <ui-button (clicked)="closeModal('basic')">OK</ui-button>
        </div>
      </ui-modal>
      
      <ui-modal 
        [(isOpen)]="modals.form" 
        title="Form Modal"
        size="lg">
        <div class="space-y-4">
          <ui-input label="Name" placeholder="Enter your name" [(ngModel)]="formData.name"></ui-input>
          <ui-input label="Email" type="email" placeholder="Enter your email" [(ngModel)]="formData.email"></ui-input>
          <ui-radio-group 
            label="Preferred contact method"
            [options]="contactOptions"
            [(ngModel)]="formData.contact">
          </ui-radio-group>
        </div>
        <div slot="footer">
          <ui-button variant="outline" (clicked)="closeModal('form')">Cancel</ui-button>
          <ui-button (clicked)="submitForm()">Submit</ui-button>
        </div>
      </ui-modal>
      
      <ui-modal 
        [(isOpen)]="modals.confirm" 
        title="Confirm Action"
        [icon]="AlertTriangle"
        size="sm">
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div slot="footer">
          <ui-button variant="outline" (clicked)="closeModal('confirm')">Cancel</ui-button>
          <ui-button variant="destructive" (clicked)="confirmAction()">Delete</ui-button>
        </div>
      </ui-modal>

        <!-- Textarea Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Type">Textarea</ui-card-title>
            <ui-card-description>Multi-line text input components</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Sizes</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ui-textarea label="Small" size="sm" placeholder="Small textarea..." [(ngModel)]="textareaDemo.small"></ui-textarea>
                  <ui-textarea label="Medium" size="md" placeholder="Medium textarea..." [(ngModel)]="textareaDemo.medium"></ui-textarea>
                  <ui-textarea label="Large" size="lg" placeholder="Large textarea..." [(ngModel)]="textareaDemo.large"></ui-textarea>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Resize Options</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ui-textarea label="No Resize" resize="none" placeholder="Cannot be resized..." [(ngModel)]="textareaDemo.noResize"></ui-textarea>
                  <ui-textarea label="Vertical" resize="vertical" placeholder="Resize vertically..." [(ngModel)]="textareaDemo.vertical"></ui-textarea>
                  <ui-textarea label="Both" resize="both" placeholder="Resize both ways..." [(ngModel)]="textareaDemo.both"></ui-textarea>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Separator Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="MoreHorizontal">Separator</ui-card-title>
            <ui-card-description>Visual dividers for content sections</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Separators</h4>
                <div class="space-y-4">
                  <div>Content above</div>
                  <ui-separator></ui-separator>
                  <div>Content below</div>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">With Text</h4>
                <div class="space-y-4">
                  <div>Section 1</div>
                  <ui-separator-with-text text="OR"></ui-separator-with-text>
                  <div>Section 2</div>
                  <ui-separator-with-text text="AND ALSO"></ui-separator-with-text>
                  <div>Section 3</div>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Vertical</h4>
                <div class="flex items-center gap-4 h-12">
                  <span>Left</span>
                  <ui-separator orientation="vertical"></ui-separator>
                  <span>Center</span>
                  <ui-separator orientation="vertical"></ui-separator>
                  <span>Right</span>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Label Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Tag">Labels</ui-card-title>
            <ui-card-description>Form labels and field labels</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Labels</h4>
                <div class="space-y-4">
                  <ui-label text="Default Label" for="input1"></ui-label>
                  <ui-label text="Required Label" for="input2" [required]="true"></ui-label>
                  <ui-label text="Large Label" for="input3" size="lg"></ui-label>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Field Labels</h4>
                <div class="space-y-4">
                  <ui-field-label label="Username" [required]="true" helperText="Choose a unique username">
                    <ui-input placeholder="Enter username"></ui-input>
                  </ui-field-label>
                  <ui-field-label label="Email" errorMessage="Please enter a valid email">
                    <ui-input type="email" placeholder="Enter email"></ui-input>
                  </ui-field-label>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Popover Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Info">Popover</ui-card-title>
            <ui-card-description>Contextual popup content</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Popover</h4>
                <ui-popover>
                  <ui-button>Click me</ui-button>
                  <div slot="content" class="p-4">
                    <h4 class="font-medium mb-2">Popover Title</h4>
                    <p class="text-sm text-muted-foreground">This is the popover content. It can contain any HTML.</p>
                  </div>
                </ui-popover>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Different Placements</h4>
                <div class="flex gap-4">
                  <ui-popover placement="top">
                    <ui-button variant="outline">Top</ui-button>
                    <div slot="content" class="p-3">
                      <p class="text-sm">Top placement</p>
                    </div>
                  </ui-popover>
                  <ui-popover placement="bottom">
                    <ui-button variant="outline">Bottom</ui-button>
                    <div slot="content" class="p-3">
                      <p class="text-sm">Bottom placement</p>
                    </div>
                  </ui-popover>
                  <ui-popover placement="left">
                    <ui-button variant="outline">Left</ui-button>
                    <div slot="content" class="p-3">
                      <p class="text-sm">Left placement</p>
                    </div>
                  </ui-popover>
                  <ui-popover placement="right">
                    <ui-button variant="outline">Right</ui-button>
                    <div slot="content" class="p-3">
                      <p class="text-sm">Right placement</p>
                    </div>
                  </ui-popover>
                </div>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Command Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Search">Command Palette</ui-card-title>
            <ui-card-description>Searchable command interface</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Command</h4>
                <ui-command 
                  placeholder="Type a command..."
                  [items]="commandItems"
                  (itemSelected)="onCommandSelected($event)">
                </ui-command>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Command Dialog</h4>
                <ui-button (clicked)="openCommandDialog()">Open Command Dialog</ui-button>
                <ui-command-dialog
                  [isOpen]="commandDialogOpen"
                  (openChange)="commandDialogOpen = $event"
                  placeholder="Search commands..."
                  [items]="commandItems"
                  (itemSelected)="onCommandSelected($event)">
                </ui-command-dialog>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Collapsible Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="ChevronDown">Collapsible</ui-card-title>
            <ui-card-description>Expandable content sections</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Collapsible</h4>
                <ui-collapsible 
                  title="Click to expand" 
                  [isOpen]="collapsibleDemo.basic"
                  (openChange)="collapsibleDemo.basic = $event">
                  <p>This content can be collapsed and expanded. It's useful for hiding detailed information that users can reveal when needed.</p>
                </ui-collapsible>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Collapsible Group</h4>
                <ui-collapsible-group [allowMultiple]="false">
                  <ui-collapsible 
                    *ngFor="let item of collapsibleItems" 
                    [title]="item.title"
                    [isOpen]="item.isOpen"
                    (openChange)="item.isOpen = $event">
                    <p>{{ item.content }}</p>
                  </ui-collapsible>
                </ui-collapsible-group>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Toggle Group Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Grid">Toggle Group</ui-card-title>
            <ui-card-description>Grouped toggle buttons</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Single Selection</h4>
                <ui-toggle-group 
                  [options]="toggleOptions"
                  type="single"
                  [(ngModel)]="toggleDemo.single">
                </ui-toggle-group>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Multiple Selection</h4>
                <ui-toggle-group 
                  [options]="toggleOptions"
                  type="multiple"
                  [(ngModel)]="toggleDemo.multiple">
                </ui-toggle-group>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">With Icons</h4>
                <ui-toggle-group 
                  [options]="toggleIconOptions"
                  type="single"
                  [(ngModel)]="toggleDemo.icons">
                </ui-toggle-group>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Dialog Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Layout">Dialog</ui-card-title>
            <ui-card-description>Modal dialogs and confirmations</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Basic Dialog</h4>
                <ui-button (clicked)="openDialog('basic')">Open Dialog</ui-button>
                <ui-dialog
                  [isOpen]="dialogDemo.basic"
                  (openChange)="dialogDemo.basic = $event"
                  title="Basic Dialog"
                  description="This is a basic dialog example">
                  <p>Dialog content goes here. You can put any content inside.</p>
                  <div slot="footer">
                    <ui-button variant="outline" (clicked)="closeDialog('basic')">Cancel</ui-button>
                    <ui-button (clicked)="closeDialog('basic')">OK</ui-button>
                  </div>
                </ui-dialog>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Confirmation Dialog</h4>
                <ui-button variant="destructive" (clicked)="openConfirmation()">Delete Item</ui-button>
                <ui-confirmation-dialog
                  [isOpen]="confirmationDemo.isOpen"
                  [config]="confirmationDemo.config"
                  (confirmed)="onConfirmationConfirmed()"
                  (cancelled)="onConfirmationCancelled()"
                  (closed)="confirmationDemo.isOpen = false">
                </ui-confirmation-dialog>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Form Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Edit">Form Components</ui-card-title>
            <ui-card-description>Form wrapper and field components</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Form with Validation</h4>
                <ui-form
                  [formGroup]="demoForm"
                  title="User Information"
                  description="Please fill out your information"
                  [showDefaultActions]="true"
                  (submitted)="onFormSubmitted($event)"
                  (cancelled)="onFormCancelled()">
                  
                  <ui-form-field label="Full Name" [required]="true">
                    <ui-input formControlName="name" placeholder="Enter your full name"></ui-input>
                  </ui-form-field>
                  
                  <ui-form-field label="Email Address" [required]="true">
                    <ui-input type="email" formControlName="email" placeholder="Enter your email"></ui-input>
                  </ui-form-field>
                  
                  <ui-form-field label="Bio" helperText="Tell us about yourself">
                    <ui-textarea formControlName="bio" placeholder="Write a short bio..."></ui-textarea>
                  </ui-form-field>
                </ui-form>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Calendar Section -->
        <ui-card class="mb-8">
          <ui-card-header>
            <ui-card-title [icon]="Calendar">Calendar</ui-card-title>
            <ui-card-description>Full calendar component</ui-card-description>
          </ui-card-header>
          <ui-card-content>
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-medium mb-3">Single Date Selection</h4>
                <ui-calendar
                  mode="single"
                  size="md"
                  [(ngModel)]="calendarDemo.single">
                </ui-calendar>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-3">Date Range Selection</h4>
                <ui-calendar
                  mode="range"
                  size="md"
                  [(ngModel)]="calendarDemo.range">
                </ui-calendar>
              </div>
            </div>
          </ui-card-content>
        </ui-card>
        
      </div>
      
      <!-- Toast Container -->
      <ui-toast-container 
        [toasts]="toasts" 
        position="top-right"
        (toastRemoved)="removeToast($event)">
      </ui-toast-container>
      
      <!-- Modals -->
      <ui-modal 
        [(isOpen)]="modals.basic" 
        title="Basic Modal"
        description="This is a basic modal example">
        <p>This is the modal content. You can put any content here.</p>
        <div slot="footer">
          <ui-button variant="outline" (clicked)="closeModal('basic')">Cancel</ui-button>
          <ui-button (clicked)="closeModal('basic')">OK</ui-button>
        </div>
      </ui-modal>
      
      <ui-modal 
        [(isOpen)]="modals.form" 
        title="Form Modal"
        size="lg">
        <div class="space-y-4">
          <ui-input label="Name" placeholder="Enter your name" [(ngModel)]="formData.name"></ui-input>
          <ui-input label="Email" type="email" placeholder="Enter your email" [(ngModel)]="formData.email"></ui-input>
          <ui-radio-group 
            label="Preferred contact method"
            [options]="contactOptions"
            [(ngModel)]="formData.contact">
          </ui-radio-group>
        </div>
        <div slot="footer">
          <ui-button variant="outline" (clicked)="closeModal('form')">Cancel</ui-button>
          <ui-button (clicked)="submitForm()">Submit</ui-button>
        </div>
      </ui-modal>
      
      <ui-modal 
        [(isOpen)]="modals.confirm" 
        title="Confirm Action"
        [icon]="AlertTriangle"
        size="sm">
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div slot="footer">
          <ui-button variant="outline" (clicked)="closeModal('confirm')">Cancel</ui-button>
          <ui-button variant="destructive" (clicked)="confirmAction()">Delete</ui-button>
        </div>
      </ui-modal>
  `
})
export class UiShowcaseComponent {
  // Icon references for template
  Plus = Plus;
  Download = Download;
  Save = Save;
  RotateCcw = RotateCcw;
  Mail = Mail;
  Lock = Lock;
  Search = Search;
  User = User;
  Shield = Shield;
  Eye = Eye;
  CheckCircle = CheckCircle;
  Clock = Clock;
  XCircle = XCircle;
  ArrowRight = ArrowRight;
  BarChart3 = BarChart3;
  Layout = Layout;
  MousePointer = MousePointer;
  Type = Type;
  Tag = Tag;
  Play = Play;
  ChevronDown = ChevronDown;
  AlertTriangle = AlertTriangle;
  MoreHorizontal = MoreHorizontal;
  Edit = Edit;
  Trash2 = Trash2;
  Copy = Copy;
  Palette = Palette;
  Zap = Zap;
  Info = Info;
  Grid = Grid;
  Navigation = Navigation;
  Loader = Loader;
  ChevronRight = ChevronRight;
  Calendar = Calendar;
  Upload = Upload;
  Settings = Settings;

  // Form group for reactive forms demo
  demoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['']
    });
  }

  // Input values
  inputValue1 = '';
  inputValue2 = '';
  inputValue3 = '';
  inputValue4 = '';
  inputValue5 = '';
  inputValue6 = 'Disabled value';
  
  // Select values
  selectValue1 = '';
  selectValue2 = '';
  selectValue3 = '';
  selectValue4 = '';
  
  // Form control values
  checkboxValue1 = false;
  checkboxValue2 = true;
  checkboxValue3 = false;
  radioValue1 = '';
  switchValue1 = true;
  switchValue2 = false;
  switchValue3 = false;
  
  // Progress values
  progressValue = 65;
  
  // Tab values
  activeTabId = 'overview';
  settingsNotifications = true;
  settingsAutoSave = false;
  
  // Modal states
  modals = {
    basic: false,
    form: false,
    confirm: false
  };
  
  // Form data
  formData = {
    name: '',
    email: '',
    contact: ''
  };
  
  // Toast data
  toasts: ToastData[] = [];
  
  // Demo values
  demoName = '';
  demoRole = '';
  demoMessage = '';
  
  // New component demo values
  dateDemo = {
    small: '',
    medium: '',
    large: '',
    startDate: '',
    endDate: ''
  };
  
  sliderDemo = {
    volume: 50,
    price: 250,
    small: 25,
    medium: 50,
    large: 75
  };
  
  searchResults: SearchResult[] = [
    { id: '1', title: 'John Doe', description: 'Software Engineer', category: 'Users' },
    { id: '2', title: 'Jane Smith', description: 'Product Manager', category: 'Users' },
    { id: '3', title: 'Bob Johnson', description: 'Designer', category: 'Users' },
    { id: '4', title: 'Alice Brown', description: 'Data Analyst', category: 'Users' }
  ];

  // New component demo values
  textareaDemo = {
    small: '',
    medium: '',
    large: '',
    noResize: '',
    vertical: '',
    both: ''
  };

  collapsibleDemo = {
    basic: false
  };

  toggleDemo = {
    single: '',
    multiple: [],
    icons: ''
  };

  dialogDemo = {
    basic: false
  };

  confirmationDemo = {
    isOpen: false,
    config: {
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'error' as any,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }
  };

  calendarDemo = {
    single: null,
    range: null
  };

  commandDialogOpen = false;
  
  // Select options
  basicOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true }
  ];
  
  statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active', icon: this.CheckCircle },
    { value: 'pending', label: 'Pending', icon: this.Clock },
    { value: 'inactive', label: 'Inactive', icon: this.XCircle }
  ];
  
  searchableOptions: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' }
  ];
  
  roleOptions: SelectOption[] = [
    { value: 'admin', label: 'Administrator', icon: this.Shield },
    { value: 'user', label: 'User', icon: this.User },
    { value: 'viewer', label: 'Viewer', icon: this.Eye }
  ];
  
  planOptions: RadioOption[] = [
    { value: 'basic', label: 'Basic Plan', helperText: '$9/month - Essential features' },
    { value: 'pro', label: 'Pro Plan', helperText: '$19/month - Advanced features' },
    { value: 'enterprise', label: 'Enterprise Plan', helperText: '$49/month - All features' }
  ];
  
  contactOptions: RadioOption[] = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' }
  ];
  
  tabItems: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: this.BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: this.BarChart3, badge: '2' },
    { id: 'settings', label: 'Settings', icon: this.User }
  ];
  
  accordionItems: AccordionItem[] = [
    { 
      id: 'item-1', 
      title: 'Is it accessible?', 
      content: 'Yes. It adheres to the WAI-ARIA design pattern and is fully keyboard navigable.',
      icon: this.CheckCircle 
    },
    { 
      id: 'item-2', 
      title: 'Is it styled?', 
      content: 'Yes. It comes with default styles that match the other components aesthetic.',
      icon: this.Palette 
    },
    { 
      id: 'item-3', 
      title: 'Is it animated?', 
      content: 'Yes. It includes smooth animations and transitions for a polished user experience.',
      icon: this.Zap 
    }
  ];
  
  dropdownItems: DropdownItem[] = [
    { id: 'edit', label: 'Edit', icon: this.Edit, shortcut: '⌘E' },
    { id: 'copy', label: 'Copy', icon: this.Copy, shortcut: '⌘C' },
    { id: 'separator-1', label: '', separator: true },
    { id: 'delete', label: 'Delete', icon: this.Trash2, destructive: true, shortcut: '⌘⌫' }
  ];

  // New component options
  toggleOptions: ToggleOption[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];

  toggleIconOptions: ToggleOption[] = [
    { value: 'bold', label: 'Bold', icon: this.Edit },
    { value: 'italic', label: 'Italic', icon: this.Type },
    { value: 'underline', label: 'Underline', icon: this.MoreHorizontal }
  ];

  commandItems: CommandItem[] = [
    { id: 'new', label: 'New File', icon: this.Plus, shortcut: ['⌘', 'N'] },
    { id: 'open', label: 'Open File', icon: this.Upload, shortcut: ['⌘', 'O'] },
    { id: 'save', label: 'Save', icon: this.Save, shortcut: ['⌘', 'S'] },
    { id: 'settings', label: 'Settings', icon: this.Settings, shortcut: ['⌘', ','] }
  ];

  collapsibleItems: any[] = [
    {
      id: 'item1',
      title: 'What is Angular?',
      content: 'Angular is a platform and framework for building single-page client applications using HTML and TypeScript.',
      icon: this.Info,
      isOpen: false
    },
    {
      id: 'item2',
      title: 'What is TypeScript?',
      content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
      icon: this.Type,
      isOpen: false
    },
    {
      id: 'item3',
      title: 'What is Tailwind CSS?',
      content: 'Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces.',
      icon: this.Palette,
      isOpen: false
    }
  ];
  
  // Table data
  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', lastLogin: '2024-01-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active', lastLogin: '2024-01-16' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active', lastLogin: '2024-01-13' }
  ];
  
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'role', label: 'Role', sortable: true, type: 'badge', badge: { variant: 'secondary', getValue: (value) => value } },
    { key: 'status', label: 'Status', sortable: true, type: 'badge', badge: { variant: 'success', getValue: (value) => value } },
    { key: 'lastLogin', label: 'Last Login', sortable: true, type: 'date' }
  ];
  
  tableActions: TableAction[] = [
    { id: 'view', label: 'View', icon: this.Eye },
    { id: 'edit', label: 'Edit', icon: this.Edit },
    { id: 'delete', label: 'Delete', icon: this.Trash2, variant: 'destructive' }
  ];
  
  tablePagination = {
    page: 1,
    pageSize: 10,
    total: 5,
    pageSizeOptions: [5, 10, 25, 50]
  };
  
  tableLoading = false;
  
  // Breadcrumb data
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/users' },
    { label: 'Profile', href: '/users/profile' },
    { label: 'Settings' }
  ];
  
  // Pagination demo data
  paginationDemo = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10
  };
  
  onButtonClick(variant: string): void {
    console.log(`${variant} button clicked!`);
  }
  
  saveDemoData(): void {
    this.demoMessage = `Hello ${this.demoName}! Your role is set to ${this.roleOptions.find(r => r.value === this.demoRole)?.label}.`;
  }
  
  resetDemoData(): void {
    this.demoName = '';
    this.demoRole = '';
    this.demoMessage = '';
  }
  
  // Modal methods
  openModal(type: 'basic' | 'form' | 'confirm'): void {
    this.modals[type] = true;
  }
  
  closeModal(type: 'basic' | 'form' | 'confirm'): void {
    this.modals[type] = false;
  }
  
  submitForm(): void {
    console.log('Form submitted:', this.formData);
    this.showToast('success');
    this.closeModal('form');
  }
  
  confirmAction(): void {
    console.log('Action confirmed');
    this.showToast('success');
    this.closeModal('confirm');
  }
  
  // Toast methods
  showToast(variant: 'success' | 'info' | 'error' | 'warning', customMessage?: { title: string; description: string }): void {
    const defaultMessages = {
      success: { title: 'Success!', description: 'Your action was completed successfully.' },
      info: { title: 'Information', description: 'Here is some useful information for you.' },
      error: { title: 'Error!', description: 'Something went wrong. Please try again.' },
      warning: { title: 'Warning!', description: 'Please review your input before proceeding.' }
    };
    
    const message = customMessage || defaultMessages[variant];
    const toast: ToastData = {
      id: `toast-${Date.now()}`,
      title: message.title,
      description: message.description,
      variant: variant === 'info' ? 'info' : variant,
      duration: 5000
    };
    
    this.toasts.push(toast);
  }
  
  removeToast(toastId: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== toastId);
  }
  
  onDropdownItemSelected(item: DropdownItem): void {
    console.log('Dropdown item selected:', item);
    this.showToast('info');
  }
  
  // Table methods
  onTableAction(event: {action: TableAction, row: any}): void {
    console.log('Table action:', event.action.id, 'on row:', event.row);
    this.showToast('info');
  }
  
  onTableSort(sortConfig: any): void {
    console.log('Table sort:', sortConfig);
  }
  
  onTablePageChange(page: number): void {
    console.log('Table page change:', page);
    this.tablePagination.page = page;
  }
  
  // Pagination methods
  onPaginationChange(page: number): void {
    console.log('Pagination change:', page);
    this.paginationDemo.currentPage = page;
  }
  
  // New component methods
  onFilesSelected(files: UploadedFile[]): void {
    console.log('Files selected:', files);
    this.showToast('success', {
      title: 'Files uploaded',
      description: `${files.length} file(s) selected successfully`
    });
  }
  
  onSearchChange(query: string): void {
    console.log('Search query:', query);
    // In a real app, you would filter the results based on the query
    // For demo purposes, we'll just show all results if there's a query
    if (query.length > 0) {
      this.searchResults = [
        { id: '1', title: 'John Doe', description: 'Software Engineer', category: 'Users' },
        { id: '2', title: 'Jane Smith', description: 'Product Manager', category: 'Users' },
        { id: '3', title: 'Bob Johnson', description: 'Designer', category: 'Users' },
        { id: '4', title: 'Alice Brown', description: 'Data Analyst', category: 'Users' }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.searchResults = [];
    }
  }

  // New component methods
  openCommandDialog(): void {
    this.commandDialogOpen = true;
  }

  onCommandSelected(item: CommandItem): void {
    console.log('Command selected:', item);
    this.commandDialogOpen = false;
    this.showToast('info', {
      title: 'Command executed',
      description: `${item.label} command was executed`
    });
  }

  openDialog(type: string): void {
    (this.dialogDemo as any)[type] = true;
  }

  closeDialog(type: string): void {
    (this.dialogDemo as any)[type] = false;
  }

  openConfirmation(): void {
    this.confirmationDemo.isOpen = true;
  }

  onConfirmationConfirmed(): void {
    console.log('Confirmation confirmed');
    this.showToast('success', {
      title: 'Item deleted',
      description: 'The item has been successfully deleted'
    });
  }

  onConfirmationCancelled(): void {
    console.log('Confirmation cancelled');
  }

  onFormSubmitted(formData: any): void {
    console.log('Form submitted:', formData);
    this.showToast('success', {
      title: 'Form submitted',
      description: 'Your information has been saved successfully'
    });
  }

  onFormCancelled(): void {
    console.log('Form cancelled');
    this.demoForm.reset();
  }
  
  onSearchResultSelected(result: SearchResult): void {
    console.log('Search result selected:', result);
    this.showToast('info', {
      title: 'User selected',
      description: `Selected ${result.title} - ${result.description}`
    });
  }
}