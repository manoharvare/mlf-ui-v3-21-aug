import { Type } from '@angular/core';

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  icon: any; // We'll use Angular's icon components
  color: string;
  isReadOnly?: boolean;
}

export interface PageConfig {
  title: string;
  subtitle: string;
  component: Type<any>;
}

export interface PageConfigMap {
  [key: string]: PageConfig;
}