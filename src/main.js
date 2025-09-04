function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  } else {
    console.warn('registerSW has gone wrong !')
  }
}

// call it first thing
registerSW();

// rest of your main.js
import { initShell } from './shell/homeUI.js';
console.log("main.js running!");
console.log("Hi ! If you see this, then this means a PWA \trefreshes one/all files from Internet connection :D");
initShell();
