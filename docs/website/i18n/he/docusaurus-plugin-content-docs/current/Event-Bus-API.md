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