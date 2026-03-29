# Event Bus API

The `dynamic_form` microfrontend uses **postal.js** to communicate with the host application. This means you do not need to pass traditional React or Angular props to the component. Instead, you publish commands to the `dynamic_form` channel, and the component subscribes to them. Similarly, the component publishes events when the user performs an action (such as saving a form), and the host application subscribes to these events to respond appropriately (like navigating to another route).

All communication occurs on the `dynamic_form` postal channel.

```javascript
// Access the global postal object
const postal = window.postal;
```

Some event are published from the microfrontend to the host application, while others are published from the host application to the microfrontend. Continue to next chapters for a detailed list of available events.