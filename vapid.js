const webpush = require('web-push');
const fs = require('fs');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID keys generated:\n', vapidKeys);
fs.writeFileSync('vapid.json', JSON.stringify(vapidKeys, null, 2));
console.log('Saved to vapid.json. Put these into .env or secrets.');
