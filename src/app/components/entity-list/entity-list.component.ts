import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EntityApiService } from '../../services/entity-config.service';
import { Entity } from '../../models';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Entity Configuration</h1>
        <button mat-raised-button color="primary" (click)="addEntity()">
          <mat-icon>add</mat-icon>
          Add Entity
        </button>
      </div>

      @if (loading()) {
        <div class="spinner-wrapper">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (entities().length === 0) {
        <mat-card>
          <mat-card-content>
            <p class="empty-state">No entities configured yet. Click "Add Entity" to get started.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        @for (entity of entities(); track entity.id) {
          <mat-card class="entity-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ entity.icon || 'description' }}</mat-icon>
              <mat-card-title>{{ entity.displayName }}</mat-card-title>
              <mat-card-subtitle>API Name: {{ entity.apiName }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (entity.description) {
                <p>{{ entity.description }}</p>
              }
              <p class="field-count"><strong>Fields:</strong> {{ entity.fields.length }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="viewForm(entity)">
                <mat-icon>visibility</mat-icon>
                View Form
              </button>
              <button mat-button (click)="editEntity(entity)">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button color="warn" (click)="confirmDelete(entity)">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .entity-card {
      margin-bottom: 16px;
    }
    .empty-state {
      text-align: center;
      color: #666;
      padding: 24px;
    }
    .field-count {
      margin-top: 8px;
    }
    .spinner-wrapper {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }
  `],
})
export class EntityListComponent implements OnInit {
  private readonly apiService = inject(EntityApiService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly entities = signal<Entity[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading.set(true);
    this.apiService.getEntities().subscribe({
      next: (data) => {
        this.entities.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load entities', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  addEntity(): void {
    this.router.navigate(['/entities/new']);
  }

  editEntity(entity: Entity): void {
    this.router.navigate(['/entities', entity.id, 'edit']);
  }

  viewForm(entity: Entity): void {
    this.router.navigate(['/entities', entity.id, 'form']);
  }

  confirmDelete(entity: Entity): void {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { name: entity.displayName },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.apiService.deleteEntity(entity.id).subscribe({
          next: () => {
            this.snackBar.open('Entity deleted', 'Close', { duration: 2000 });
            this.loadEntities();
          },
          error: () => {
            this.snackBar.open('Failed to delete entity', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Delete Entity</h2>
    <mat-dialog-content>
      Are you sure you want to delete <strong>{{ data.name }}</strong>? This action cannot be undone.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {
  readonly data = inject<{ name: string }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteConfirmDialogComponent>);
}
