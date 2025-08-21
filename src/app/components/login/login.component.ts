import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoleService } from '../../services/user-role.service';
import { UserRole } from '../../models/user-role.model';
import { Router } from '@angular/router';
import { 
  LucideAngularModule,
  Shield,
  UserCheck,
  User,
  CheckCircle,
  BarChart3,
  Eye,
  CheckSquare
} from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  availableRoles = signal<UserRole[]>([]);
  
  // Icon references for template
  Shield = Shield;
  UserCheck = UserCheck;
  User = User;
  CheckCircle = CheckCircle;
  BarChart3 = BarChart3;
  Eye = Eye;
  CheckSquare = CheckSquare;
  
  // Permission name mapping
  permissionNames: { [key: string]: string } = {
    'home': 'Home Dashboard',
    'monthly-forecast': 'Monthly Forecast',
    'master-data-configurations': 'Master Data Configurations',
    'project-configurations': 'Project Setup & Config',
    'manage-mlf-rules': 'Manage MLF Rules',
    'forecast-approvals': 'Forecast Approvals',
    'mlf-variance-report': 'MLF Variance Report',
    'power-bi-reports': 'Power BI Reports',
    'user-management': 'User Management'
  };

  // Icon mapping for roles
  roleIcons: { [key: string]: any } = {
    'super-admin': Shield,
    'mlf-admin': UserCheck,
    'planner': User,
    'approver': CheckCircle,
    'fab-management': BarChart3,
    'view-only-user': Eye
  };

  constructor(
    private userRoleService: UserRoleService,
    private router: Router
  ) {
    this.availableRoles.set(this.userRoleService.getAvailableRoles()());
  }

  onLogin(role: UserRole): void {
    this.userRoleService.setCurrentUserRole(role);
    this.router.navigate(['/app']);
  }

  getIconForRole(roleId: string): any {
    return this.roleIcons[roleId] || this.User;
  }
}