const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlayContent");

document.getElementById("openSettings").addEventListener("click", async () => {
    // Load local HTML snippet dynamically
    const response = await fetch("./src/shell/settings.html"); // your second HTML
    const html = await response.text();
    overlayContent.innerHTML = html;

    // Show overlay
    overlay.style.display = "flex";

    // Optional: add close button handler inside loaded HTML
    const closeBtn = overlayContent.querySelector("#closeOverlay");
    if (closeBtn) closeBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        overlayContent.innerHTML = ""; // clear content for next time
    });
});

const observer = new MutationObserver(() => {
  const btn = document.getElementById('flushCacheBtn');
  if (btn) {
    observer.disconnect(); // stop watching once found

    btn.addEventListener('click', async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('All caches deleted');

        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
          console.log('Service worker unregistered');
        }

        window.location.reload(true);
      } catch (err) {
        console.error('Error flushing cache:', err);
      }
    });

    console.log('flushCacheBtn found and listener attached!');
  }
});

observer.observe(document.body, { childList: true, subtree: true });





