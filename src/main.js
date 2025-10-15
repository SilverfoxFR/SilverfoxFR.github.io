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



console.log("main.js running!");

