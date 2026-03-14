import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EntityConfigService, EntityInput } from '../../services/entity-config.service';
import { FieldType } from '../../models/field-type.enum';
import { Field } from '../../models/field.model';
import { HttpMethod } from '../../models/data-source.model';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEditMode ? 'Edit Entity' : 'Add Entity' }}</h1>
        <button mat-button (click)="cancel()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Entity Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Display Name</mat-label>
                <input matInput formControlName="displayName" placeholder="e.g., Customer" />
                @if (form.get('displayName')?.hasError('required')) {
                  <mat-error>Display name is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>API Name</mat-label>
                <input matInput formControlName="apiName" placeholder="e.g., customer" />
                @if (form.get('apiName')?.hasError('required')) {
                  <mat-error>API name is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Optional description"></textarea>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Icon (Material icon name)</mat-label>
                <input matInput formControlName="icon" placeholder="e.g., person" />
                <mat-icon matSuffix>{{ form.get('icon')?.value || 'description' }}</mat-icon>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card style="margin-top: 16px">
          <mat-card-header>
            <mat-card-title>Data Source</mat-card-title>
          </mat-card-header>
          <mat-card-content formGroupName="dataSource">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Base URL</mat-label>
                <input matInput formControlName="url" placeholder="https://api.example.com" />
                @if (form.get('dataSource.url')?.hasError('required')) {
                  <mat-error>URL is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>HTTP Method</mat-label>
                <mat-select formControlName="method">
                  @for (method of httpMethods; track method) {
                    <mat-option [value]="method">{{ method }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider style="margin: 16px 0"></mat-divider>
            <div class="endpoints-header">
              <h3>Endpoints</h3>
              <button mat-button type="button" (click)="addEndpoint()">
                <mat-icon>add</mat-icon>
                Add Endpoint
              </button>
            </div>

            <div formArrayName="endpoints">
              @for (endpoint of endpointsArray.controls; track $index) {
                <div [formGroupName]="$index" class="endpoint-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Name</mat-label>
                    <input matInput formControlName="name" placeholder="e.g., list" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Path</mat-label>
                    <input matInput formControlName="path" placeholder="/customers" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Method</mat-label>
                    <mat-select formControlName="method">
                      @for (method of httpMethods; track method) {
                        <mat-option [value]="method">{{ method }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-icon-button color="warn" type="button" (click)="removeEndpoint($index)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card style="margin-top: 16px">
          <mat-card-header>
            <mat-card-title>Fields</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="fields">
              @for (field of fieldsArray.controls; track $index) {
                <div [formGroupName]="$index" class="field-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Display Name</mat-label>
                    <input matInput formControlName="displayName" placeholder="e.g., First Name" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>API Name</mat-label>
                    <input matInput formControlName="apiName" placeholder="e.g., firstName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Field Type</mat-label>
                    <mat-select formControlName="fieldType">
                      @for (type of fieldTypes; track type) {
                        <mat-option [value]="type">{{ type }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-icon-button color="warn" type="button" (click)="removeField($index)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>
            <button mat-button type="button" (click)="addField()">
              <mat-icon>add</mat-icon>
              Add Field
            </button>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <button mat-button type="button" (click)="cancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEditMode ? 'Update' : 'Create' }} Entity
          </button>
        </div>
      </form>
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
    .form-row {
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .endpoints-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .endpoint-row, .field-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      margin-bottom: 24px;
    }
  `],
})
export class EntityFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly entityService = inject(EntityConfigService);

  isEditMode = false;
  entityId?: string;

  readonly httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  readonly fieldTypes = Object.values(FieldType);

  form = this.fb.group({
    displayName: ['', Validators.required],
    apiName: ['', Validators.required],
    description: [''],
    icon: [''],
    dataSource: this.fb.group({
      url: ['', Validators.required],
      method: ['GET' as HttpMethod],
      endpoints: this.fb.array([]),
    }),
    fields: this.fb.array([]),
  });

  get endpointsArray(): FormArray {
    return this.form.get('dataSource.endpoints') as FormArray;
  }

  get fieldsArray(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.entityId = id;
      const entity = this.entityService.getEntityById(id);
      if (entity) {
        this.form.patchValue({
          displayName: entity.displayName,
          apiName: entity.apiName,
          description: entity.description ?? '',
          icon: entity.icon ?? '',
          dataSource: {
            url: entity.dataSource.url,
            method: entity.dataSource.method,
          },
        });
        entity.dataSource.endpoints.forEach((ep) => {
          this.endpointsArray.push(
            this.fb.group({ name: ep.name, path: ep.path, method: ep.method })
          );
        });
        entity.fields.forEach((f) => {
          this.fieldsArray.push(
            this.fb.group({ id: f.id, displayName: f.displayName, apiName: f.apiName, fieldType: f.fieldType })
          );
        });
      }
    }
  }

  addEndpoint(): void {
    this.endpointsArray.push(
      this.fb.group({ name: [''], path: [''], method: ['GET'] })
    );
  }

  removeEndpoint(index: number): void {
    this.endpointsArray.removeAt(index);
  }

  addField(): void {
    this.fieldsArray.push(
      this.fb.group({
        id: [''],
        displayName: ['', Validators.required],
        apiName: ['', Validators.required],
        fieldType: [FieldType.STRING],
      })
    );
  }

  removeField(index: number): void {
    this.fieldsArray.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();

    type RawField = { apiName: string; displayName: string; fieldType: FieldType };
    type RawEndpoint = { name: string; path: string; method: string };

    const fields: Omit<Field, 'id'>[] = ((value.fields ?? []) as RawField[]).map((f) => ({
      apiName: f.apiName,
      displayName: f.displayName,
      fieldType: f.fieldType,
    }));

    const entityData: EntityInput = {
      apiName: value.apiName!,
      displayName: value.displayName!,
      description: value.description ?? undefined,
      icon: value.icon ?? undefined,
      dataSource: {
        url: value.dataSource!.url!,
        method: value.dataSource!.method as HttpMethod,
        endpoints: ((value.dataSource!.endpoints ?? []) as RawEndpoint[]).map((ep) => ({
          name: ep.name,
          path: ep.path,
          method: ep.method as HttpMethod,
        })),
      },
      fields,
    };

    if (this.isEditMode && this.entityId) {
      this.entityService.updateEntity(this.entityId, entityData);
    } else {
      this.entityService.addEntity(entityData);
    }

    this.router.navigate(['/entities']);
  }

  cancel(): void {
    this.router.navigate(['/entities']);
  }
}
