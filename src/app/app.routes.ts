import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'entities', pathMatch: 'full' },
  {
    path: 'entities',
    loadComponent: () =>
      import('./components/entity-list/entity-list.component').then(
        (m) => m.EntityListComponent
      ),
  },
  {
    path: 'entities/new',
    loadComponent: () =>
      import('./components/entity-form/entity-form.component').then(
        (m) => m.EntityFormComponent
      ),
  },
  {
    path: 'entities/:id/edit',
    loadComponent: () =>
      import('./components/entity-form/entity-form.component').then(
        (m) => m.EntityFormComponent
      ),
  },
  {
    path: 'entities/:id/form',
    loadComponent: () =>
      import('./components/dynamic-form/dynamic-form.component').then(
        (m) => m.DynamicFormComponent
      ),
  },
];
