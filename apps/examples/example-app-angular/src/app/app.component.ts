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

import * as Cesium from 'cesium';

@Component({
  selector: 'app-map-picker',
  standalone: true,
  template: `
    <div style="height: 400px; width: 100%; margin-top: 20px; position: relative;">
      <div *ngIf="selectModeField" style="position: absolute; top: 10px; left: 10px; z-index: 1000; background: yellow; padding: 10px; border-radius: 4px; font-weight: bold;">
        Select location on map for field: {{selectModeField}}
      </div>
      <div id="cesiumContainer" style="height: 100%; width: 100%;" [style.cursor]="selectModeField ? 'crosshair' : 'grab'"></div>
    </div>
  `,
  imports: [CommonModule]
})
export class MapPickerComponent implements OnInit, OnDestroy {
  selectModeField: string | null = null;
  private subs: any[] = [];
  private viewer: Cesium.Viewer | null = null;
  private handler: Cesium.ScreenSpaceEventHandler | null = null;

  ngOnInit() {
    // Wait for the next tick to ensure the DOM element is ready
    setTimeout(() => {
      this.viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: undefined,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
      });

      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(34.7818, 32.0853, 100000)
      });

      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      this.handler.setInputAction((movement: any) => {
        if (this.selectModeField && this.viewer) {
          const cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);

            (postal as any).publish({
              channel: 'dynamic_form',
              topic: 'map.locationSelected',
              data: {
                field: this.selectModeField,
                location: [longitude, latitude]
              }
            });
            this.selectModeField = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, 0);

    this.subs.push(
      (postal as any).subscribe({
        channel: 'dynamic_form',
        topic: 'map.selectLocation',
        callback: (data: { field: string }) => {
          this.selectModeField = data.field;
        }
      })
    );
  }


  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    if (this.handler) {
      this.handler.destroy();
    }
    if (this.viewer) {
      this.viewer.destroy();
    }
  }
}

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [MapPickerComponent],
  template: `
    <div style="display: flex; gap: 20px;">
      <div style="flex: 1;">
        <mfe-entity-form></mfe-entity-form>
      </div>
      <div style="flex: 1;">
        <app-map-picker></app-map-picker>
      </div>
    </div>
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
        data: { entity: this.entity, id: this.id, defaultCoordinateFormat: 'UTM' }
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
              data: { entity: this.entity, id: this.id, defaultCoordinateFormat: 'UTM' }
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
