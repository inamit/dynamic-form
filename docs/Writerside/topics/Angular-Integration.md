# Angular Integration

To integrate the Dynamic Form microfrontend into an Angular application, we utilize the framework-agnostic **Web Components** exposed by the microfrontend.

The microfrontend provides a script named `./WebComponents` that automatically registers two custom elements in the browser: `<mfe-entity-list>` and `<mfe-entity-form>`.

## 1. Prerequisites

First, ensure `postal.js` and `lodash.js` are included globally in your host application's `index.html`.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

## 2. Dynamic Import Helper

Since Angular doesn't natively use Vite Module Federation in the same way React does, we need a helper to dynamically inject the microfrontend's script tag and load the remote module at runtime.

Create a `load-remote.ts` utility file.

```typescript
export function loadRemoteComponent(url: string, scope: string, module: string) {
  return new Promise<void>((resolve, reject) => {
    const scriptId = `remote-script-${scope}`;
    if (document.getElementById(scriptId)) {
      resolve(loadModule(scope, module));
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'module';
    script.id = scriptId;
    script.onload = () => resolve(loadModule(scope, module));
    script.onerror = () => reject(new Error(`Failed to load script ${url}`));
    document.head.appendChild(script);
  });
}

async function loadModule(scope: string, module: string) {
  await __webpack_init_sharing__('default');
  const container = (window as any)[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await window[scope].get(module);
  factory();
}
```

*Note: The exact dynamic import implementation will vary based on your module bundler setup (e.g., Webpack 5 vs. Vite).*

Then, load the web components in your main app component or a dedicated initialization service.

```typescript
import { loadRemoteComponent } from './load-remote';

export async function loadWebComponents() {
  try {
    // Point to your microfrontend URL
    await loadRemoteComponent('http://<your-microfrontend-url>/assets/remoteEntry.js', 'dynamic_form', './WebComponents');
  } catch (err) {
    console.error('Failed to load WebComponents:', err);
  }
}
```

## 3. Entity List Integration

Create an Angular component to wrap the `<mfe-entity-list>` custom element. You must add the `CUSTOM_ELEMENTS_SCHEMA` to tell Angular not to throw errors about unknown HTML tags.

```typescript
import { Component, ChangeDetectorRef, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const postal = (window as any).postal;

@Component({
  selector: 'app-entity-list',
  standalone: true,
  template: `<mfe-entity-list></mfe-entity-list>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EntityListComponent implements OnInit, OnDestroy {
  entity = '';
  private subs: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {
    this.route.params.subscribe(params => {
      this.entity = params['entity'];

      postal.publish({
        channel: 'dynamic_form',
        topic: 'entity.loadList',
        data: { entity: this.entity }
      });

      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.subs.push(
      postal.subscribe({
        channel: 'dynamic_form',
        topic: 'entity.ready',
        callback: (data: any) => {
          if (data.type === 'list') {
            postal.publish({
              channel: 'dynamic_form',
              topic: 'entity.loadList',
              data: { entity: this.entity }
            });
          }
        }
      })
    );

    this.subs.push(
      postal.subscribe({
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
      postal.subscribe({
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
```

## 4. Entity Form Integration

Similarly, create an Angular component for the `<mfe-entity-form>` web component to handle creating and editing forms.

```typescript
import { Component, ChangeDetectorRef, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const postal = (window as any).postal;

@Component({
  selector: 'app-entity-form',
  standalone: true,
  template: `<mfe-entity-form></mfe-entity-form>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EntityFormComponent implements OnInit, OnDestroy {
  entity = '';
  id?: string;
  private subs: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {
    this.route.params.subscribe(params => {
      this.entity = params['entity'];
      this.id = params['id'];

      postal.publish({
        channel: 'dynamic_form',
        topic: 'entity.loadForm',
        data: { entity: this.entity, id: this.id }
      });

      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.subs.push(
      postal.subscribe({
        channel: 'dynamic_form',
        topic: 'entity.ready',
        callback: (data: any) => {
          if (data.type === 'form') {
            postal.publish({
              channel: 'dynamic_form',
              topic: 'entity.loadForm',
              data: { entity: this.entity, id: this.id }
            });
          }
        }
      })
    );

    this.subs.push(
      postal.subscribe({
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
      postal.subscribe({
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
```