import { Component, ChangeDetectorRef, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import 'postal';
const postal = (window as any).postal;
import { loadWebComponents } from './load-web-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <nav style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc;">
        <h2>Dynamic Form Sandbox (Angular Host)</h2>
        <div style="display: flex; gap: 10px;">
          <a routerLink="/person/list">Persons (REST)</a>
          <a routerLink="/candy/list">Candies (REST)</a>
          <a routerLink="/store/list">Stores (GraphQL)</a>
        </div>
      </nav>

      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  constructor() {
    loadWebComponents();
  }
}

@Component({
  selector: 'app-entity-list',
  standalone: true,
  template: `
    <mfe-entity-list></mfe-entity-list>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EntityListComponent implements OnInit, OnDestroy {
  entity = '';
  private subs: any[] = [];

  get props() {
    return {
      entity: this.entity
    };
  }

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {
    this.route.params.subscribe(params => {
      this.entity = params['entity'];

      (postal as any).publish({
        channel: 'dynamic_form',
        topic: 'entity.loadList',
        data: { entity: this.entity }
      });

      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.ready',
        callback: (data: any) => {
          if (data.type === 'list') {
            (postal as any).publish({
              channel: 'dynamic_form',
              topic: 'entity.loadList',
              data: { entity: this.entity }
            });
          }
        }
      })
    );

    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.create',
        callback: (data: any) => {
          if (data.entity === this.entity) {
            this.router.navigate([`/${this.entity}/form`]);
          }
        }
      })
    );
    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.edit',
        callback: (data: any) => {
          if (data.entity === this.entity) {
            this.router.navigate([`/${this.entity}/form/${data.id}`]);
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}

@Component({
  selector: 'app-entity-form',
  standalone: true,
  template: `
    <mfe-entity-form></mfe-entity-form>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EntityFormComponent implements OnInit, OnDestroy {
  entity = '';
  id?: string;
  private subs: any[] = [];

  get props() {
    return {
      entity: this.entity,
      id: this.id
    };
  }

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {
    this.route.params.subscribe(params => {
      this.entity = params['entity'];
      this.id = params['id'];

      (postal as any).publish({
        channel: 'dynamic_form',
        topic: 'entity.loadForm',
        data: { entity: this.entity, id: this.id }
      });

      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.ready',
        callback: (data: any) => {
          if (data.type === 'form') {
            (postal as any).publish({
              channel: 'dynamic_form',
              topic: 'entity.loadForm',
              data: { entity: this.entity, id: this.id }
            });
          }
        }
      })
    );

    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.saved',
        callback: (data: any) => {
          if (data.entity === this.entity) {
            alert('Saved successfully!');
            this.router.navigate([`/${this.entity}/list`]);
          }
        }
      })
    );
    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.error',
        callback: (data: any) => {
          if (data.entity === this.entity) {
            alert('An error occurred while saving.');
            console.error(data.error);
          }
        }
      })
    );
    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'entity.cancel',
        callback: (data: any) => {
          if (data.entity === this.entity) {
            this.router.navigate([`/${this.entity}/list`]);
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
