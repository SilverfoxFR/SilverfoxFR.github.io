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

document.getElementById('flushCacheBtn')?.addEventListener('click', async () => {
  try {

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches deleted');

  
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
      console.log('🧹 Service worker unregistered');
    }

    // 🔹 3. Reload the page to start clean
    window.location.reload(true);

  } catch (err) {
    console.error('Error flushing cache:', err);
  }
});


console.log("main.js running!");

