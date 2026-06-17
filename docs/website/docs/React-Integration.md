# React Integration

The Dynamic Form microfrontend is built with React and exported via `@originjs/vite-plugin-federation`. Integrating it into another React + Vite host application is straightforward and provides the best performance since both applications share dependencies like `react` and `react-dom`.

## 1. Prerequisites

First, ensure `postal.js` and `lodash.js` are included globally in your host application's `index.html`.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

## 2. Configure Vite

In your host application's `vite.config.ts`, install and configure the `@originjs/vite-plugin-federation` plugin.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host_app',
      remotes: {
        // Point to your microfrontend URL
        dynamic_form: 'http://<your-microfrontend-url>/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'axios']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

## 3. Creating the List Wrapper

To use the `EntityList` component, create a wrapper component in your host app that handles the routing and the `postal.js` event bus.

```tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntityList from 'dynamic_form/EntityList';
import 'postal';

const postal = (window as any).postal;

export default function ListWrapper() {
  const { entity } = useParams<{ entity: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for navigation events from the microfrontend
    const subCreate = postal.subscribe({
      channel: 'dynamic_form',
      topic: 'entity.create',
      callback: (data: any) => {
        if (data.entity === entity) navigate(`/${entity}/form`);
      }
    });

    const subEdit = postal.subscribe({
      channel: 'dynamic_form',
      topic: 'entity.edit',
      callback: (data: any) => {
        if (data.entity === entity) navigate(`/${entity}/form/${data.id}`);
      }
    });

    return () => {
      subCreate.unsubscribe();
      subEdit.unsubscribe();
    };
  }, [entity, navigate]);

  useEffect(() => {
    if (!entity) return;

    // Wait for the microfrontend to be ready before sending load instructions
    const subReady = postal.subscribe({
      channel: 'dynamic_form',
      topic: 'entity.ready',
      callback: (data: any) => {
        if (data.type === 'list') {
          postal.publish({
            channel: 'dynamic_form',
            topic: 'entity.loadList',
            data: { entity }
          });
        }
      }
    });

    // Fire immediately in case the component rendered before we subscribed
    postal.publish({
      channel: 'dynamic_form',
      topic: 'entity.loadList',
      data: { entity }
    });

    return () => subReady.unsubscribe();
  }, [entity]);

  if (!entity) return <p>No entity selected</p>;

  return <EntityList />;
}
```

## 4. Creating the Form Wrapper

Similarly, create a wrapper for the `EntityForm` component.

```tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntityForm from 'dynamic_form/EntityForm';
import 'postal';

const postal = (window as any).postal;

export default function FormWrapper() {
  const { entity, id } = useParams<{ entity: string, id?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const subSaved = postal.subscribe({
      channel: 'dynamic_form',
      topic: 'entity.saved',
      callback: (data: any) => {
        if (data.entity === entity) {
          alert('Saved successfully!');
          navigate(`/${entity}/list`);
        }
      }
    });

    const subCancel = postal.subscribe({
      channel: 'dynamic_form',
      topic: 'entity.cancel',
      callback: (data: any) => {
        if (data.entity === entity) {
          navigate(`/${entity}/list`);
        }
      }
    });

    return () => {
      subSaved.unsubscribe();
      subCancel.unsubscribe();
    };
  }, [entity, navigate]);

  useEffect(() => {
    if (!entity) return;

    const subReady = postal.subscribe({
      channel: 'dynamic_form',
      topic: 'entity.ready',
      callback: (data: any) => {
        if (data.type === 'form') {
          postal.publish({
            channel: 'dynamic_form',
            topic: 'entity.loadForm',
            data: { entity, id }
          });
        }
      }
    });

    postal.publish({
      channel: 'dynamic_form',
      topic: 'entity.loadForm',
      data: { entity, id }
    });

    return () => subReady.unsubscribe();
  }, [entity, id]);

  if (!entity) return <p>No entity selected</p>;

  return <EntityForm />;
}
```