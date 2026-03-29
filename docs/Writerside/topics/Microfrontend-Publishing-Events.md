# Microfrontend Publishing Events

These events are published by the microfrontend to notify your host application of an action or state change.

## Lifecycle Events

### `entity.ready`
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

## List Events

### `entity.create`
Fired from the EntityList component when the user clicks the "Create New" button. The host application should listen for this and navigate to the form creation route.

**Payload:**
- `entity` (string): The name of the entity.

### `entity.edit`
Fired from the EntityList component when the user clicks the "Edit" button on a specific row.

**Payload:**
- `entity` (string): The name of the entity.
- `id` (string | number): The ID of the entity to edit.

## Form Events

### `entity.saved`
Fired from the EntityForm component when the user successfully saves a form.

**Payload:**
- `entity` (string): The name of the entity.

### `entity.error`
Fired from the EntityForm component when a save operation fails.

**Payload:**
- `entity` (string): The name of the entity.
- `error` (any): The error object or message.

### `entity.cancel`
Fired from the EntityForm component when the user clicks the "Cancel" button.

**Payload:**
- `entity` (string): The name of the entity.

### `map.selectLocation`
Fired from the EntityForm component when the user clicks the location picker button for a specific field.

**Payload:**
- `field` (string): The name of the field that requires a location.
