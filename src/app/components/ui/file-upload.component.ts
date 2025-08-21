import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Upload,
  File,
  X,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  AlertCircle
} from 'lucide-angular';

export interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  error?: string;
}

export type FileUploadVariant = 'default' | 'dropzone' | 'button';
export type FileUploadSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-file-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-2">
      <!-- Label -->
      <label *ngIf="label" class="text-sm font-medium leading-none">
        {{ label }}
        <span *ngIf="required" class="text-destructive ml-1">*</span>
      </label>
      
      <!-- Upload Area -->
      <div [ngSwitch]="variant">
        <!-- Dropzone Variant -->
        <div
          *ngSwitchCase="'dropzone'"
          [class]="dropzoneClasses"
          (click)="triggerFileInput()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <div class="flex flex-col items-center justify-center space-y-2">
            <lucide-icon [name]="Upload" [size]="32" class="text-muted-foreground"></lucide-icon>
            <div class="text-center">
              <p class="text-sm font-medium">Drop files here or click to browse</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ acceptedTypesText }}
                <span *ngIf="maxSize"> • Max {{ formatFileSize(maxSize) }}</span>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Button Variant -->
        <button
          *ngSwitchCase="'button'"
          type="button"
          [class]="buttonClasses"
          [disabled]="disabled"
          (click)="triggerFileInput()"
        >
          <lucide-icon [name]="Upload" [size]="iconSize" class="mr-2"></lucide-icon>
          {{ buttonText }}
        </button>
        
        <!-- Default Variant -->
        <div
          *ngSwitchDefault
          [class]="defaultClasses"
          (click)="triggerFileInput()"
        >
          <lucide-icon [name]="Upload" [size]="iconSize" class="mr-2"></lucide-icon>
          <span>{{ buttonText }}</span>
        </div>
      </div>
      
      <!-- Hidden File Input -->
      <input
        #fileInput
        type="file"
        [multiple]="multiple"
        [accept]="accept"
        [disabled]="disabled"
        (change)="onFileSelect($event)"
        class="hidden"
      />
      
      <!-- File List -->
      <div *ngIf="files.length > 0" class="space-y-2">
        <div
          *ngFor="let file of files; trackBy: trackByFileId"
          class="flex items-center justify-between p-3 border border-border rounded-md bg-background"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <!-- File Icon -->
            <lucide-icon [name]="getFileIcon(file.type)" [size]="20" class="text-muted-foreground shrink-0"></lucide-icon>
            
            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
              
              <!-- Progress Bar -->
              <div *ngIf="file.progress !== undefined" class="w-full bg-secondary rounded-full h-1 mt-1">
                <div 
                  class="bg-primary h-1 rounded-full transition-all duration-300"
                  [style.width.%]="file.progress"
                ></div>
              </div>
              
              <!-- Error Message -->
              <p *ngIf="file.error" class="text-xs text-destructive mt-1 flex items-center">
                <lucide-icon [name]="AlertCircle" [size]="12" class="mr-1"></lucide-icon>
                {{ file.error }}
              </p>
            </div>
          </div>
          
          <!-- Remove Button -->
          <button
            type="button"
            class="p-1 hover:bg-secondary rounded-md transition-colors"
            (click)="removeFile(file.id)"
            [disabled]="disabled"
          >
            <lucide-icon [name]="X" [size]="16" class="text-muted-foreground"></lucide-icon>
          </button>
        </div>
      </div>
      
      <!-- Helper Text -->
      <div *ngIf="helperText && !errorMessage" class="mt-1">
        <p class="text-xs text-muted-foreground">{{ helperText }}</p>
      </div>
      
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mt-1">
        <p class="text-xs text-destructive">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  @Input() label = '';
  @Input() variant: FileUploadVariant = 'default';
  @Input() size: FileUploadSize = 'md';
  @Input() multiple = false;
  @Input() accept = '';
  @Input() maxSize = 0; // in bytes, 0 = no limit
  @Input() maxFiles = 0; // 0 = no limit
  @Input() disabled = false;
  @Input() required = false;
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() buttonText = 'Choose files';
  
  @Output() filesSelected = new EventEmitter<UploadedFile[]>();
  @Output() fileRemoved = new EventEmitter<UploadedFile>();
  @Output() filesChanged = new EventEmitter<UploadedFile[]>();

  // Icons
  Upload = Upload;
  File = File;
  X = X;
  FileText = FileText;
  Image = Image;
  FileVideo = FileVideo;
  FileAudio = FileAudio;
  Archive = Archive;
  AlertCircle = AlertCircle;

  files: UploadedFile[] = [];
  isDragOver = false;

  get acceptedTypesText(): string {
    if (!this.accept) return 'All file types';
    
    const types = this.accept.split(',').map(type => type.trim());
    if (types.length <= 3) {
      return types.join(', ');
    }
    return `${types.slice(0, 2).join(', ')} and ${types.length - 2} more`;
  }

  get dropzoneClasses(): string {
    const baseClasses = 'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:bg-accent/50';
    const sizeClasses = this.getDropzoneSizeClasses();
    const stateClasses = this.isDragOver 
      ? 'border-primary bg-primary/10' 
      : 'border-border';
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const variantClasses = 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
    const sizeClasses = this.getButtonSizeClasses();
    
    return `${baseClasses} ${variantClasses} ${sizeClasses}`;
  }

  get defaultClasses(): string {
    const baseClasses = 'flex items-center justify-center w-full p-4 border border-border rounded-md cursor-pointer transition-colors hover:bg-accent/50';
    return baseClasses;
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      default: return 16;
    }
  }

  private getDropzoneSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'p-4';
      case 'md': return 'p-6';
      case 'lg': return 'p-8';
      default: return 'p-6';
    }
  }

  private getButtonSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'h-8 px-3 text-xs';
      case 'md': return 'h-10 px-4 py-2';
      case 'lg': return 'h-12 px-6 text-base';
      default: return 'h-10 px-4 py-2';
    }
  }

  triggerFileInput(): void {
    if (!this.disabled) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files) {
      this.handleFiles(Array.from(files));
    }
    
    // Reset input value to allow selecting the same file again
    target.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private handleFiles(fileList: File[]): void {
    const validFiles: UploadedFile[] = [];
    
    for (const file of fileList) {
      // Check file count limit
      if (this.maxFiles > 0 && this.files.length + validFiles.length >= this.maxFiles) {
        break;
      }
      
      // Validate file
      const validation = this.validateFile(file);
      if (validation.isValid) {
        const uploadedFile: UploadedFile = {
          file,
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        };
        validFiles.push(uploadedFile);
      }
    }
    
    if (validFiles.length > 0) {
      if (this.multiple) {
        this.files = [...this.files, ...validFiles];
      } else {
        this.files = [validFiles[0]];
      }
      
      this.filesSelected.emit(validFiles);
      this.filesChanged.emit(this.files);
    }
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (this.maxSize > 0 && file.size > this.maxSize) {
      return {
        isValid: false,
        error: `File size exceeds ${this.formatFileSize(this.maxSize)}`
      };
    }
    
    // Check file type
    if (this.accept) {
      const acceptedTypes = this.accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
        }
        return file.type.match(acceptedType.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        return {
          isValid: false,
          error: 'File type not supported'
        };
      }
    }
    
    return { isValid: true };
  }

  removeFile(fileId: string): void {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if (fileIndex > -1) {
      const removedFile = this.files[fileIndex];
      
      // Revoke object URL to prevent memory leaks
      if (removedFile.url) {
        URL.revokeObjectURL(removedFile.url);
      }
      
      this.files.splice(fileIndex, 1);
      this.fileRemoved.emit(removedFile);
      this.filesChanged.emit(this.files);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): any {
    if (mimeType.startsWith('image/')) return this.Image;
    if (mimeType.startsWith('video/')) return this.FileVideo;
    if (mimeType.startsWith('audio/')) return this.FileAudio;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return this.Archive;
    if (mimeType.includes('text') || mimeType.includes('document')) return this.FileText;
    return this.File;
  }

  trackByFileId(index: number, file: UploadedFile): string {
    return file.id;
  }

  clearFiles(): void {
    // Revoke all object URLs
    this.files.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    this.files = [];
    this.filesChanged.emit(this.files);
  }
}