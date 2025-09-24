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

