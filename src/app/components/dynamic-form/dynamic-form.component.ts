import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EntityApiService } from '../../services/entity-config.service';
import { Entity } from '../../models/entity.model';
import { Field } from '../../models/field.model';
import { FieldType } from '../../models/field-type.enum';

@Component({
    selector: 'app-dynamic-form',
    imports: [
        ReactiveFormsModule,
        JsonPipe,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSnackBarModule,
    ],
    template: `
    @if (loadingEntity) {
      <div class="spinner-wrapper">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    } @else if (entity) {
      <div class="container">
        <div class="header">
          <div class="title-row">
            <mat-icon>{{ entity.icon || 'description' }}</mat-icon>
            <h1>{{ entity.displayName }}</h1>
          </div>
          <button mat-button (click)="back()">
            <mat-icon>arrow_back</mat-icon>
            Back
          </button>
        </div>

        @if (entity.description) {
          <p class="description">{{ entity.description }}</p>
        }

        <mat-card>
          <mat-card-content>
            <form [formGroup]="dynamicForm" (ngSubmit)="submit()">
              @for (field of entity.fields; track field.id) {
                <div class="field-wrapper">
                  @switch (field.fieldType) {
                    @case (FieldType.STRING) {
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ field.displayName }}</mat-label>
                        <input matInput [formControlName]="field.apiName" />
                        @if (isRequired(field) && dynamicForm.get(field.apiName)?.hasError('required')) {
                          <mat-error>{{ field.displayName }} is required</mat-error>
                        }
                      </mat-form-field>
                    }
                    @case (FieldType.NUMBER) {
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ field.displayName }}</mat-label>
                        <input matInput type="number" [formControlName]="field.apiName" />
                        @if (isRequired(field) && dynamicForm.get(field.apiName)?.hasError('required')) {
                          <mat-error>{{ field.displayName }} is required</mat-error>
                        }
                      </mat-form-field>
                    }
                    @case (FieldType.DROPDOWN) {
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ field.displayName }}</mat-label>
                        <mat-select [formControlName]="field.apiName">
                          @for (option of field.options ?? []; track option.value) {
                            <mat-option [value]="option.value">{{ option.label }}</mat-option>
                          }
                        </mat-select>
                        @if (isRequired(field) && dynamicForm.get(field.apiName)?.hasError('required')) {
                          <mat-error>{{ field.displayName }} is required</mat-error>
                        }
                      </mat-form-field>
                    }
                    @case (FieldType.POINT) {
                      <div class="geo-field">
                        <p class="geo-label">{{ field.displayName }}</p>
                        <div class="coordinates">
                          <mat-form-field appearance="outline">
                            <mat-label>Latitude</mat-label>
                            <input matInput type="number" [formControlName]="field.apiName + '_lat'" />
                          </mat-form-field>
                          <mat-form-field appearance="outline">
                            <mat-label>Longitude</mat-label>
                            <input matInput type="number" [formControlName]="field.apiName + '_lng'" />
                          </mat-form-field>
                        </div>
                      </div>
                    }
                    @case (FieldType.POLYGON) {
                      <div class="geo-field">
                        <p class="geo-label">{{ field.displayName }}</p>
                        <div class="polygon-input">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Coordinates (JSON array of [lat, lng] pairs)</mat-label>
                            <textarea matInput [formControlName]="field.apiName" rows="4"
                              placeholder='[[40.7128, -74.0060], [34.0522, -118.2437]]'></textarea>
                          </mat-form-field>
                        </div>
                      </div>
                    }
                  }
                </div>
              }

              <div class="form-actions">
                <button mat-button type="button" (click)="reset()">Reset</button>
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="dynamicForm.invalid || submitting">
                  @if (submitting) {
                    <mat-spinner diameter="20" style="display:inline-block"></mat-spinner>
                  } @else {
                    Submit
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        @if (responseData !== null) {
          <mat-card style="margin-top: 16px">
            <mat-card-header>
              <mat-card-title>Response</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <pre>{{ responseData | json }}</pre>
            </mat-card-content>
          </mat-card>
        }

        <div style="margin-top: 16px">
          <button mat-button (click)="back()">
            <mat-icon>arrow_back</mat-icon>
            Back to Entities
          </button>
        </div>
      </div>
    }
  `,
    styles: [`
    .container {
      max-width: 700px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .description {
      color: #666;
      margin-bottom: 16px;
    }
    .field-wrapper {
      margin-bottom: 8px;
    }
    .full-width {
      width: 100%;
    }
    .geo-field {
      margin-bottom: 16px;
    }
    .geo-label {
      font-size: 14px;
      color: rgba(0,0,0,0.6);
      margin-bottom: 8px;
    }
    .coordinates {
      display: flex;
      gap: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .spinner-wrapper {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }
    pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow: auto;
      font-size: 12px;
    }
  `]
})
export class DynamicFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(EntityApiService);
  private readonly snackBar = inject(MatSnackBar);

  entity: Entity | undefined;
  dynamicForm!: FormGroup;
  loadingEntity = false;
  submitting = false;
  responseData: unknown = null;
  readonly FieldType = FieldType;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadingEntity = true;
      this.apiService.getEntity(id).subscribe({
        next: (entity) => {
          this.entity = entity;
          this.buildForm();
          this.loadingEntity = false;
        },
        error: () => {
          this.snackBar.open('Failed to load entity', 'Close', { duration: 3000 });
          this.loadingEntity = false;
          this.router.navigate(['/entities']);
        },
      });
    }
  }

  private buildForm(): void {
    const controls: Record<string, unknown[]> = {};
    this.entity?.fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      if (field.fieldType === FieldType.POINT) {
        controls[field.apiName + '_lat'] = [null, validators];
        controls[field.apiName + '_lng'] = [null, validators];
      } else {
        controls[field.apiName] = [null, validators];
      }
    });
    this.dynamicForm = this.fb.group(controls);
  }

  isRequired(field: Field): boolean {
    return field.required === true;
  }

  submit(): void {
    if (this.dynamicForm.invalid || !this.entity) return;

    const formValue = this.dynamicForm.value as Record<string, unknown>;
    this.submitting = true;
    this.responseData = null;

    this.apiService.executeForm(this.entity.id, formValue).subscribe({
      next: (response) => {
        this.responseData = response;
        this.submitting = false;
        this.snackBar.open('Form submitted successfully', 'Close', { duration: 2000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.snackBar.open(
          err?.error?.message ?? 'Form submission failed',
          'Close',
          { duration: 4000 }
        );
        this.submitting = false;
      },
    });
  }

  reset(): void {
    this.dynamicForm.reset();
    this.responseData = null;
  }

  back(): void {
    this.router.navigate(['/entities']);
  }
}
