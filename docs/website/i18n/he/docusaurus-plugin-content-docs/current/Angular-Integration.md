# שילוב Angular

כדי לשלב את ה-Dynamic Form microfrontend בתוך אפליקציית Angular, אנו משתמשים ב-**Web Components** החשופים מה-microfrontend אשר אינם תלויים במסגרת עבודה (framework-agnostic).

ה-microfrontend מספק סקריפט בשם `./WebComponents` שרושם אוטומטית שני רכיבים מותאמים אישית (custom elements) בדפדפן: `<mfe-entity-list>` ו-`<mfe-entity-form>`.

## 1. דרישות מוקדמות

ראשית, ודא ש-`postal.js` ו-`lodash.js` כלולים באופן גלובלי ב-`index.html` של ה-host application שלך. ניתן להוסיף אותם דרך CDNs:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

לחלופין, ניתן להתקין אותם דרך npm ולייבא אותם לסגנונות הגלובליים (global styles) או להגדרות הבנייה (build configuration) בהתאם לסביבה שלך:

```bash
npm install postal lodash
```

## 2. Standalone לעומת Modules

הדוגמאות להלן משתמשות ב-**Standalone Components** שהוצגו ב-Angular 14. אם אתה משתמש בארכיטקטורת `NgModule` מסורתית, המושגים זהים, אך במקום להשתמש ב-`standalone: true`, תצהיר על רכיבי העטיפה (wrapper) שלך ותוסיף `CUSTOM_ELEMENTS_SCHEMA` בתוך דקורטור ה-`@NgModule` של המודול שלך:

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [EntityListComponent, EntityFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

## 3. עוזר יבוא דינמי (Dynamic Import Helper)

מכיוון ש-Angular אינו משתמש באופן טבעי ב-Vite Module Federation באותו אופן שבו React עושה זאת, אנו צריכים פונקציית עזר (helper) כדי להזריק באופן דינמי את תגית הסקריפט של ה-microfrontend ולטעון את מודול הרשת בזמן ריצה (runtime).

צור קובץ עזר (utility) בשם `load-remote.ts`.

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

*הערה: מימוש היבוא הדינמי המדויק ישתנה בהתאם להגדרת ה-module bundler שלך (לדוגמה, Webpack 5 לעומת Vite).*

לאחר מכן, טען את ה-Web Components ברכיב האפליקציה הראשי שלך או בשירות אתחול (initialization service) ייעודי.

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

## 4. שילוב רשימת הישויות (Entity List Integration)

צור רכיב Angular כדי לעטוף את ה-custom element `<mfe-entity-list>`. עליך להוסיף את ה-`CUSTOM_ELEMENTS_SCHEMA` כדי לומר ל-Angular לא לזרוק שגיאות לגבי תגיות HTML לא ידועות.

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

## 5. שילוב טופס הישות (Entity Form Integration)

באופן דומה, צור רכיב Angular עבור ה-web component `<mfe-entity-form>` כדי לטפל ביצירה ועריכה של טפסים.

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