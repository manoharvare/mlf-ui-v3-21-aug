// Component interfaces for Master Data Configuration
export interface MasterDataTab {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  isRelational?: boolean;
  relatedFields?: string[];
}

export interface ColumnDefinition {
  id: string;
  name: string;
  type: 'text' | 'number';
}

export interface DataRow {
  id: string | number;
  [key: string]: any;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Master Data Entity interfaces (matching backend)
export interface GlobalActivityCodeEntity {
  id: number;
  activityCode: string;
  description: string;
  area: string;
  discipline: string;
  faceGrouping: string;
  progressGrouping: string;
  structure: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface StandardCraftEntity {
  id: number;
  jobDisciplineName: string;
  standardCraftName: string;
  craftGrouping: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface YardLocationEntity {
  id: number;
  code: string;
  name: string;
  region: string;
  capacity: number;
  status: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface ProjectTypeEntity {
  id: number;
  code: string;
  name: string;
  description: string;
  defaultStatus: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface StatusEntity {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface WorkTypeEntity {
  id: number;
  code: string;
  name: string;
  description: string;
  defaultCalculations: string;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

export interface RoleEntity {
  id: number;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  icon: string;
  color: string;
  isReadOnly: boolean;
  isActive: boolean;
  created: number;
  createdBy: string;
  modified?: number;
  modifiedBy?: string;
}

// Transformation functions to convert API entities to component DataRow format
export function transformGlobalActivityCode(entity: GlobalActivityCodeEntity): DataRow {
  return {
    id: entity.id,
    activityCode: entity.activityCode,
    description: entity.description,
    area: entity.area,
    discipline: entity.discipline,
    faceGrouping: entity.faceGrouping,
    progressGrouping: entity.progressGrouping,
    structure: entity.structure
  };
}

export function transformStandardCraft(entity: StandardCraftEntity): DataRow {
  return {
    id: entity.id,
    jobDisciplineName: entity.jobDisciplineName,
    standardCraftName: entity.standardCraftName,
    craftGrouping: entity.craftGrouping
  };
}

export function transformYardLocation(entity: YardLocationEntity): DataRow {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    region: entity.region,
    capacity: entity.capacity,
    status: entity.status
  };
}

export function transformProjectType(entity: ProjectTypeEntity): DataRow {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    defaultStatus: entity.defaultStatus
  };
}

export function transformStatus(entity: StatusEntity): DataRow {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    color: entity.color
  };
}

export function transformWorkType(entity: WorkTypeEntity): DataRow {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    defaultCalculations: entity.defaultCalculations
  };
}

// Reverse transformation functions to convert component DataRow to API entity format
export function transformToGlobalActivityCodeEntity(row: DataRow | { [key: string]: any }): Partial<GlobalActivityCodeEntity> {
  return {
    activityCode: row['activityCode'],
    description: row['description'],
    area: row['area'],
    discipline: row['discipline'],
    faceGrouping: row['faceGrouping'],
    progressGrouping: row['progressGrouping'],
    structure: row['structure']
  };
}

export function transformToStandardCraftEntity(row: DataRow | { [key: string]: any }): Partial<StandardCraftEntity> {
  return {
    jobDisciplineName: row['jobDisciplineName'],
    standardCraftName: row['standardCraftName'],
    craftGrouping: row['craftGrouping']
  };
}

export function transformToYardLocationEntity(row: DataRow | { [key: string]: any }): Partial<YardLocationEntity> {
  return {
    code: row['code'],
    name: row['name'],
    region: row['region'],
    capacity: row['capacity'],
    status: row['status']
  };
}

export function transformToProjectTypeEntity(row: DataRow | { [key: string]: any }): Partial<ProjectTypeEntity> {
  return {
    code: row['code'],
    name: row['name'],
    description: row['description'],
    defaultStatus: row['defaultStatus']
  };
}

export function transformToStatusEntity(row: DataRow | { [key: string]: any }): Partial<StatusEntity> {
  return {
    code: row['code'],
    name: row['name'],
    description: row['description'],
    color: row['color']
  };
}

export function transformToWorkTypeEntity(row: DataRow | { [key: string]: any }): Partial<WorkTypeEntity> {
  return {
    code: row['code'],
    name: row['name'],
    description: row['description'],
    defaultCalculations: row['defaultCalculations']
  };
}

export function transformRole(entity: RoleEntity): DataRow {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    permissions: entity.permissions.join(', '),
    icon: entity.icon,
    color: entity.color,
    isReadOnly: entity.isReadOnly ? 'Yes' : 'No'
  };
}

export function transformToRoleEntity(row: DataRow | { [key: string]: any }): Partial<RoleEntity> {
  return {
    code: row['code'],
    name: row['name'],
    description: row['description'],
    permissions: typeof row['permissions'] === 'string' ? row['permissions'].split(', ') : row['permissions'] || [],
    icon: row['icon'],
    color: row['color'],
    isReadOnly: row['isReadOnly'] === 'Yes' || row['isReadOnly'] === true
  };
}