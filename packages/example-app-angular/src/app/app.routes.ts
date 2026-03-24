import { Routes } from '@angular/router';
import { EntityListComponent, EntityFormComponent } from './app.component';

export const routes: Routes = [
  { path: ':entity/list', component: EntityListComponent },
  { path: ':entity/form', component: EntityFormComponent },
  { path: ':entity/form/:id', component: EntityFormComponent },
  { path: '', redirectTo: '/person/list', pathMatch: 'full' }
];
