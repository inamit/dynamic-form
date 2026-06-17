---
slug: /
sidebar_position: 1
---

# Overview

Welcome to the documentation for the Dynamic Form Microfrontend. This guide provides detailed instructions on how to integrate the dynamic form components into your host applications.

## Microfrontend Architecture

The application exposes its components using `@originjs/vite-plugin-federation`. This allows you to dynamically load React components or standard Web Components into your existing applications without recompiling them.

The microfrontend exposes the following artifacts:
- **`./EntityList`**: A React component for displaying a list of entities.
- **`./EntityForm`**: A React component for editing or creating entities.
- **`./WebComponents`**: A script that registers the above components as framework-agnostic Web Components (`<mfe-entity-list>` and `<mfe-entity-form>`).

## Event-Driven Communication

Because the microfrontend needs to operate independently of the host framework (React, Angular, or Iframe), it relies heavily on an event bus for communication. We use **postal.js** to manage these events.

Both the host application and the microfrontend publish and subscribe to a shared `dynamic_form` channel. This allows the host to instruct the microfrontend to load specific data, and the microfrontend to notify the host when an action (like a save or an error) occurs.

### Prerequisites

To use the microfrontend, your host application must include `postal.js` globally on the `window` object before the microfrontend is loaded.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

For more details on the available events, see the [Event Bus API](Event-Bus-API.md).
