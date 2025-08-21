import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      data-slot="table-container"
      class="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        [class]="'w-full caption-bottom text-sm ' + (class || '')"
      >
        <ng-content></ng-content>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  @Input() class: string = '';
}

@Component({
  selector: 'ui-table-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <thead
      data-slot="table-header"
      [class]="'[&_tr]:border-b ' + (class || '')"
    >
      <ng-content></ng-content>
    </thead>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableHeaderComponent {
  @Input() class: string = '';
}

@Component({
  selector: 'ui-table-body',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tbody
      data-slot="table-body"
      [class]="'[&_tr:last-child]:border-0 ' + (class || '')"
    >
      <ng-content></ng-content>
    </tbody>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableBodyComponent {
  @Input() class: string = '';
}

@Component({
  selector: 'ui-table-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tr
      data-slot="table-row"
      [class]="'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors ' + (class || '')"
    >
      <ng-content></ng-content>
    </tr>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableRowComponent {
  @Input() class: string = '';
}

@Component({
  selector: 'ui-table-head',
  standalone: true,
  imports: [CommonModule],
  template: `
    <th
      data-slot="table-head"
      [class]="'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ' + (class || '')"
    >
      <ng-content></ng-content>
    </th>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableHeadComponent {
  @Input() class: string = '';
}

@Component({
  selector: 'ui-table-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <td
      data-slot="table-cell"
      [class]="'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ' + (class || '')"
    >
      <ng-content></ng-content>
    </td>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellComponent {
  @Input() class: string = '';
}