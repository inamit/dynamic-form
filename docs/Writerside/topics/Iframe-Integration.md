# Iframe Integration

You can integrate the Dynamic Form microfrontend into any web application by embedding it inside an `iframe`. This approach avoids complicated bundler configurations like Vite Module Federation or Webpack 5.

## 1. Prerequisites

Because an `iframe` runs in an isolated browser context, you must decide how the host application and the iframe will communicate:

1.  **Shared Window Context (Same Origin):** If both the host app and the iframe share the same origin, the iframe can access the host app's global `window.postal` object (via `window.parent.postal`).
2.  **`postMessage` API (Cross-Origin):** If the microfrontend is hosted on a different domain, you must establish a messaging bridge using the native `window.postMessage` API.

Below is an example of the latter, more robust approach.

First, ensure `postal.js` and `lodash.js` are included globally in your host application's `index.html`.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

## 2. Basic Setup

In your host application, create an iframe pointing to the URL of the standalone microfrontend.

```html
<!-- Set the src to the standalone route of your microfrontend -->
<iframe id="mfe-iframe" src="http://<your-microfrontend-url>/" width="100%" height="800px" style="border: none;"></iframe>
```

## 3. Communication Bridge

To make the iframe work with the `postal.js` event bus, you need to create a script in your host application that translates `postMessage` events into `postal.js` messages, and vice versa.

*Note: This assumes the microfrontend application has been configured to listen for and dispatch `postMessage` events.*

```javascript
const iframe = document.getElementById('mfe-iframe');
const postal = window.postal;

// 1. Listen for messages FROM the iframe
window.addEventListener('message', (event) => {
  // Always verify the origin in a real application
  // if (event.origin !== 'http://<your-microfrontend-url>') return;

  const data = event.data;

  // Assume the iframe sends messages formatted like { type: 'postal', topic: 'entity.saved', data: { ... } }
  if (data && data.type === 'postal') {
    // Re-publish the message onto the host's postal bus
    postal.publish({
      channel: 'dynamic_form',
      topic: data.topic,
      data: data.data
    });
  }
});

// 2. Listen for messages on the host's postal bus and forward them TO the iframe
postal.subscribe({
  channel: 'dynamic_form',
  topic: '#', // Subscribe to all topics on this channel
  callback: (data, envelope) => {

    // Construct a message payload
    const message = {
      type: 'postal',
      topic: envelope.topic,
      data: data
    };

    // Post the message to the iframe window
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, 'http://<your-microfrontend-url>');
    }
  }
});
```

## 4. Handling Navigation Events

Once the bridge is established, your host application can respond to navigation events just as it would in the React or Angular implementations.

```javascript
postal.subscribe({
  channel: 'dynamic_form',
  topic: 'entity.create',
  callback: (data) => {
    console.log(`User wants to create a new ${data.entity}`);

    // Instruct the iframe to load the form
    postal.publish({
      channel: 'dynamic_form',
      topic: 'entity.loadForm',
      data: { entity: data.entity }
    });
  }
});

postal.subscribe({
  channel: 'dynamic_form',
  topic: 'entity.edit',
  callback: (data) => {
    console.log(`User wants to edit ${data.entity} with ID ${data.id}`);

    // Instruct the iframe to load the specific form
    postal.publish({
      channel: 'dynamic_form',
      topic: 'entity.loadForm',
      data: { entity: data.entity, id: data.id }
    });
  }
});

postal.subscribe({
  channel: 'dynamic_form',
  topic: 'entity.saved',
  callback: (data) => {
    alert(`Successfully saved ${data.entity}!`);

    // Return to the list view
    postal.publish({
      channel: 'dynamic_form',
      topic: 'entity.loadList',
      data: { entity: data.entity }
    });
  }
});
```