# Host Publishing Events

These events are published by your host application to instruct the microfrontend to perform an action.

## List Commands

### `entity.loadList`
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

## Form Commands

### `entity.loadForm`
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

### `map.locationSelected`
If your host application contains a map picker, publish this event when the user selects a location.

**Payload:**
- `field` (string): The name of the coordinate field being updated.
- `location` (Array<number>): The `[longitude, latitude]` array.

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