import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EntityConfigService } from '../../services/entity-config.service';
import { Entity } from '../../models';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatDialogModule, MatIconModule, MatListModule, MatTooltipModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Entity Configuration</h1>
        <button mat-raised-button color="primary" (click)="addEntity()">
          <mat-icon>add</mat-icon>
          Add Entity
        </button>
      </div>

      @if (entities().length === 0) {
        <mat-card>
          <mat-card-content>
            <p class="empty-state">No entities configured yet. Click "Add Entity" to get started.</p>
          </mat-card-content>
        </mat-card>
      }

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
  `],
})
export class EntityListComponent {
  private readonly entityService = inject(EntityConfigService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly entities = this.entityService.entities;

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
    const confirmed = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { name: entity.displayName },
    });
    confirmed.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.entityService.deleteEntity(entity.id);
      }
    });
  }
}

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
