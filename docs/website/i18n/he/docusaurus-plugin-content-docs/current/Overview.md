---
slug: /
sidebar_position: 1
---

# סקירה כללית

ברוכים הבאים לתיעוד עבור ה-Dynamic Form Microfrontend. מדריך זה מספק הוראות מפורטות כיצד לשלב את רכיבי הטופס הדינמיים לתוך ה-host applications שלך.

## ארכיטקטורת Microfrontend

האפליקציה חושפת את הרכיבים שלה באמצעות `@originjs/vite-plugin-federation`. זה מאפשר לך לטעון באופן דינמי רכיבי React או Web Components סטנדרטיים לתוך האפליקציות הקיימות שלך ללא קימפול מחדש.

ה-microfrontend חושף את התוצרים הבאים:
- **`./EntityList`**: רכיב React להצגת רשימת ישויות (entities).
- **`./EntityForm`**: רכיב React לעריכה או יצירה של ישויות.
- **`./WebComponents`**: סקריפט שרושם את הרכיבים הנ"ל כ-Web Components ללא תלות במסגרת עבודה (`<mfe-entity-list>` ו-`<mfe-entity-form>`).

## תקשורת מבוססת אירועים (Event-Driven Communication)

מכיוון שה-microfrontend צריך לפעול ללא תלות במסגרת העבודה של המארח (React, Angular או Iframe), הוא מסתמך במידה רבה על אפיק אירועים (event bus) לתקשורת. אנו משתמשים ב-**postal.js** לניהול אירועים אלה.

גם ה-host application וגם ה-microfrontend מפרסמים (publish) ונרשמים (subscribe) לערוץ `dynamic_form` משותף. זה מאפשר למארח להורות ל-microfrontend לטעון נתונים ספציפיים, ול-microfrontend להודיע למארח כאשר מתרחשת פעולה (כמו שמירה או שגיאה).

### דרישות מוקדמות

כדי להשתמש ב-microfrontend, ה-host application שלך חייב לכלול את `postal.js` באופן גלובלי באובייקט ה-`window` לפני טעינת ה-microfrontend.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

לפרטים נוספים על האירועים הזמינים, עיין ב-[Event Bus API](Event-Bus-API.md).
