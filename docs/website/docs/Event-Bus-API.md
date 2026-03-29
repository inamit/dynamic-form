---
sidebar_position: 2
---

# Event Bus API

The `dynamic_form` microfrontend uses **postal.js** to communicate with the host application. This means you do not need to pass traditional React or Angular props to the component. Instead, you publish commands to the `dynamic_form` channel, and the component subscribes to them. Similarly, the component publishes events when the user performs an action (such as saving a form), and the host application subscribes to these events to respond appropriately (like navigating to another route).

All communication occurs on the `dynamic_form` postal channel.

```javascript
// Access the global postal object
const postal = window.postal;
```

Some event are published from the microfrontend to the host application, while others are published from the host application to the microfrontend. Continue to next chapters for a detailed list of available events.

## Host Publishing Events

These events are published by your host application to instruct the microfrontend to perform an action.

### List Commands

#### `entity.loadList`
Instructs the `<mfe-entity-list>` (or `EntityList` React component) to load a list of entities.

**Payload:**
- `entity` (string): The name of the entity to load.

**Example:**
```javascript
postal.publish({
  channel: 'dynamic_form',
  topic: 'entity.loadList',
  data: { entity: 'person' }
});
```

### Form Commands

#### `entity.loadForm`
Instructs the `<mfe-entity-form>` (or `EntityForm` React component) to load the form for creating or editing an entity.

**Payload:**
- `entity` (string): The name of the entity.
- `id` (string | number | undefined): The ID of the entity if editing. Leave undefined for a new entity.
- `gridTemplate` (string | undefined): An optional custom CSS grid template for the form layout.
- `presetId` (number | undefined): An optional preset layout ID.
- `defaultCoordinateFormat` (string | undefined): An optional default coordinate format ('UTM'/'WGS84').

**Example:**
```javascript
postal.publish({
  channel: 'dynamic_form',
  topic: 'entity.loadForm',
  data: { entity: 'candy', id: '123' }
});
```

#### `map.locationSelected`
If your host application contains a map picker, publish this event when the user selects a location.

**Payload:**
- `field` (string): The name of the coordinate field being updated.
- `location` (Array&lt;number&gt;): The `[longitude, latitude]` array.

**Example:**
```javascript
postal.publish({
  channel: 'dynamic_form',
  topic: 'map.locationSelected',
  data: {
    field: 'location',
    location: [34.7818, 32.0853]
  }
});
```

## Microfrontend Publishing Events

These events are published by the microfrontend to notify your host application of an action or state change.

### Lifecycle Events

#### `entity.ready`
Fired when the microfrontend component has mounted and is ready to receive commands. This is crucial because the host application might try to send a command (like `entity.loadList`) before the microfrontend is fully loaded.

**Payload:**
- `type` (string): `'list'` or `'form'`, indicating which component is ready.

**Example:**
```javascript
postal.subscribe({
  channel: 'dynamic_form',
  topic: 'entity.ready',
  callback: (data) => {
    if (data.type === 'list') {
      // Safely publish entity.loadList now
    }
  }
});
```

### List Events

#### `entity.create`
Fired from the EntityList component when the user clicks the "Create New" button. The host application should listen for this and navigate to the form creation route.

**Payload:**
- `entity` (string): The name of the entity.

#### `entity.edit`
Fired from the EntityList component when the user clicks the "Edit" button on a specific row.

**Payload:**
- `entity` (string): The name of the entity.
- `id` (string | number): The ID of the entity to edit.

### Form Events

#### `entity.saved`
Fired from the EntityForm component when the user successfully saves a form.

**Payload:**
- `entity` (string): The name of the entity.

#### `entity.error`
Fired from the EntityForm component when a save operation fails.

**Payload:**
- `entity` (string): The name of the entity.
- `error` (any): The error object or message.

#### `entity.cancel`
Fired from the EntityForm component when the user clicks the "Cancel" button.

**Payload:**
- `entity` (string): The name of the entity.

#### `map.selectLocation`
Fired from the EntityForm component when the user clicks the location picker button for a specific field.

**Payload:**
- `field` (string): The name of the field that requires a location.
