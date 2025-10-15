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

window.addEventListener('keydown', (e) => {
  // Check if the key is an arrow key
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault(); // stops the browser from scrolling
    // Your site’s JS can still detect the arrow keys
    console.log('Arrow key pressed:', e.key);
  }
}, { passive: false }); // passive: false is important for preventDefault to work


