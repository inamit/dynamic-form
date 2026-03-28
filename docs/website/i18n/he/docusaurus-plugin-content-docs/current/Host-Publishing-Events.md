# אירועי Host מפרסם (Host Publishing Events)

אירועים אלה מתפרסמים על ידי ה-host application שלך כדי להורות ל-microfrontend לבצע פעולה.

## פקודות רשימה (List Commands)

### `entity.loadList`
מורה ל-`<mfe-entity-list>` (או לרכיב ה-React של `EntityList`) לטעון רשימה של ישויות (entities).

**מטען (Payload):**
- `entity` (string): שם הישות שיש לטעון.

**דוגמה:**
```javascript
postal.publish({
  channel: 'dynamic_form',
  topic: 'entity.loadList',
  data: { entity: 'person' }
});
```

## פקודות טופס (Form Commands)

### `entity.loadForm`
מורה ל-`<mfe-entity-form>` (או לרכיב ה-React של `EntityForm`) לטעון את הטופס ליצירה או עריכה של ישות.

**מטען (Payload):**
- `entity` (string): שם הישות.
- `id` (string | number | undefined): מזהה הישות (ID) במידה וזה במצב עריכה. השאר ריק עבור ישות חדשה.
- `gridTemplate` (string | undefined): תבנית Grid CSS מותאמת אישית אופציונלית עבור פריסת הטופס.
- `presetId` (number | undefined): מזהה פריסה מוגדר מראש אופציונלי.
- `defaultCoordinateFormat` (string | undefined): תבנית קואורדינטות ברירת מחדל אופציונלית ('UTM'/'WGS84').

**דוגמה:**
```javascript
postal.publish({
  channel: 'dynamic_form',
  topic: 'entity.loadForm',
  data: { entity: 'candy', id: '123' }
});
```

### `map.locationSelected`
אם ה-host application שלך מכיל בורר מפה, פרסם (publish) אירוע זה כאשר המשתמש בוחר מיקום.

**מטען (Payload):**
- `field` (string): שם שדה הקואורדינטה שמעודכן.
- `location` (Array&lt;number&gt;): מערך ה-`[longitude, latitude]`.

**דוגמה:**
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