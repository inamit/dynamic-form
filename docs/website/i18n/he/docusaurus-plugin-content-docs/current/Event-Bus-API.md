---
sidebar_position: 2
---

# Event Bus API

ה-`dynamic_form` microfrontend משתמש ב-**postal.js** כדי לתקשר עם ה-host application. משמעות הדבר היא שאינך צריך להעביר props מסורתיים של React או Angular לרכיב. במקום זאת, אתה מפרסם פקודות לערוץ ה-`dynamic_form`, והרכיב נרשם אליהן. בדומה, הרכיב מפרסם אירועים כאשר המשתמש מבצע פעולה (כגון שמירת טופס), וה-host application נרשם לאירועים אלו כדי להגיב בהתאם (למשל, ניווט לנתיב אחר).

כל התקשורת מתרחשת בערוץ `dynamic_form` של postal.

```javascript
// Access the global postal object
const postal = window.postal;
```

חלק מהאירועים מתפרסמים מה-microfrontend ל-host application, בעוד שאחרים מתפרסמים מה-host application אל ה-microfrontend. המשך לפרקים הבאים לרשימה מפורטת של האירועים הזמינים.

## אירועי Host מפרסם (Host Publishing Events)

אירועים אלה מתפרסמים על ידי ה-host application שלך כדי להורות ל-microfrontend לבצע פעולה.

### פקודות רשימה (List Commands)

#### `entity.loadList`
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

### פקודות טופס (Form Commands)

#### `entity.loadForm`
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

#### `map.locationSelected`
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

## אירועי Microfrontend מפרסם (Microfrontend Publishing Events)

אירועים אלה מתפרסמים על ידי ה-microfrontend כדי להודיע ל-host application שלך על פעולה או שינוי מצב.

### אירועי מחזור חיים (Lifecycle Events)

#### `entity.ready`
מופעל (Fired) כאשר רכיב ה-microfrontend עולה (mounted) ומוכן לקבל פקודות. זה חיוני מכיוון שה-host application עשוי לנסות לשלוח פקודה (כמו `entity.loadList`) לפני שה-microfrontend נטען במלואו.

**מטען (Payload):**
- `type` (string): `'list'` או `'form'`, המציין איזה רכיב מוכן.

**דוגמה:**
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

### אירועי רשימה (List Events)

#### `entity.create`
מופעל מרכיב ה-EntityList כאשר המשתמש לוחץ על כפתור "Create New". ה-host application צריך להאזין לאירוע זה ולנווט לנתיב יצירת הטופס.

**מטען (Payload):**
- `entity` (string): שם הישות.

#### `entity.edit`
מופעל מרכיב ה-EntityList כאשר המשתמש לוחץ על כפתור "Edit" בשורה מסוימת.

**מטען (Payload):**
- `entity` (string): שם הישות.
- `id` (string | number): מזהה הישות (ID) לעריכה.

### אירועי טופס (Form Events)

#### `entity.saved`
מופעל מרכיב ה-EntityForm כאשר המשתמש שומר טופס בהצלחה.

**מטען (Payload):**
- `entity` (string): שם הישות.

#### `entity.error`
מופעל מרכיב ה-EntityForm כאשר פעולת שמירה נכשלת.

**מטען (Payload):**
- `entity` (string): שם הישות.
- `error` (any): אובייקט או הודעת השגיאה.

#### `entity.cancel`
מופעל מרכיב ה-EntityForm כאשר המשתמש לוחץ על כפתור "Cancel".

**מטען (Payload):**
- `entity` (string): שם הישות.

#### `map.selectLocation`
מופעל מרכיב ה-EntityForm כאשר המשתמש לוחץ על כפתור בחירת המיקום עבור שדה ספציפי.

**מטען (Payload):**
- `field` (string): שם השדה הדורש מיקום.