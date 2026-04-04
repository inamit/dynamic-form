# שילוב Iframe

ניתן לשלב את ה-Dynamic Form microfrontend לתוך כל אפליקציית רשת (web application) על ידי הטמעתו בתוך `iframe`. גישה זו מונעת תצורות מורכבות של bundlers כמו Vite Module Federation או Webpack 5.

## 1. דרישות מוקדמות

מכיוון ש-`iframe` פועל בהקשר (context) דפדפן מבודד, עליך להחליט כיצד ה-host application וה-iframe יתקשרו:

1.  **הקשר חלון משותף (Same Origin):** אם גם ה-host app וגם ה-iframe חולקים את אותו מקור (origin), ה-iframe יכול לגשת לאובייקט הגלובלי `window.postal` של ה-host app (דרך `window.parent.postal`).
2.  **API של `postMessage` (Cross-Origin):** אם ה-microfrontend מאוחסן בדומיין אחר (domain), עליך להקים גשר הודעות באמצעות ה-API המובנה `window.postMessage`.

להלן דוגמה לגישה השנייה, שהיא חזקה יותר.

ראשית, ודא ש-`postal.js` ו-`lodash.js` כלולים באופן גלובלי ב-`index.html` של ה-host application שלך.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/postal.js/2.0.5/postal.min.js"></script>
```

## 2. הגדרה בסיסית (Basic Setup)

ב-host application שלך, צור iframe המצביע ל-URL של ה-microfrontend העצמאי.

```html
<!-- Set the src to the standalone route of your microfrontend -->
<iframe id="mfe-iframe" src="http://<your-microfrontend-url>/" width="100%" height="800px" style="border: none;"></iframe>
```

## 3. גשר תקשורת (Communication Bridge)

כדי לגרום ל-iframe לעבוד עם אפיק האירועים של `postal.js`, עליך ליצור סקריפט ב-host application שלך שמתרגם אירועי `postMessage` להודעות `postal.js`, ולהיפך.

*הערה: הדבר מניח שאפליקציית ה-microfrontend הוגדרה להאזין ולשלוח אירועי `postMessage`.*

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

## 4. טיפול באירועי ניווט (Handling Navigation Events)

לאחר הקמת הגשר, ה-host application שלך יכול להגיב לאירועי ניווט בדיוק כפי שהיה עושה ביישומי React או Angular.

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