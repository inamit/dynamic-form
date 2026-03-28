# אירועי Microfrontend מפרסם (Microfrontend Publishing Events)

אירועים אלה מתפרסמים על ידי ה-microfrontend כדי להודיע ל-host application שלך על פעולה או שינוי מצב.

## אירועי מחזור חיים (Lifecycle Events)

### `entity.ready`
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

## אירועי רשימה (List Events)

### `entity.create`
מופעל מרכיב ה-EntityList כאשר המשתמש לוחץ על כפתור "Create New". ה-host application צריך להאזין לאירוע זה ולנווט לנתיב יצירת הטופס.

**מטען (Payload):**
- `entity` (string): שם הישות.

### `entity.edit`
מופעל מרכיב ה-EntityList כאשר המשתמש לוחץ על כפתור "Edit" בשורה מסוימת.

**מטען (Payload):**
- `entity` (string): שם הישות.
- `id` (string | number): מזהה הישות (ID) לעריכה.

## אירועי טופס (Form Events)

### `entity.saved`
מופעל מרכיב ה-EntityForm כאשר המשתמש שומר טופס בהצלחה.

**מטען (Payload):**
- `entity` (string): שם הישות.

### `entity.error`
מופעל מרכיב ה-EntityForm כאשר פעולת שמירה נכשלת.

**מטען (Payload):**
- `entity` (string): שם הישות.
- `error` (any): אובייקט או הודעת השגיאה.

### `entity.cancel`
מופעל מרכיב ה-EntityForm כאשר המשתמש לוחץ על כפתור "Cancel".

**מטען (Payload):**
- `entity` (string): שם הישות.

### `map.selectLocation`
מופעל מרכיב ה-EntityForm כאשר המשתמש לוחץ על כפתור בחירת המיקום עבור שדה ספציפי.

**מטען (Payload):**
- `field` (string): שם השדה הדורש מיקום.
