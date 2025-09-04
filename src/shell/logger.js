(function(){
  const logBox = document.getElementById("logContent");
  function write(msg, type="log") {
    if (!logBox) return;
    const line = document.createElement("div");
    line.textContent = `[${type.toUpperCase()}] ${msg}`;
    line.style.color = (type === "error") ? "red" : (type === "warn" ? "yellow" : "#0f0");
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  const rawLog = console.log;
  console.log = function(...args) {
    rawLog.apply(console, args);
    write(args.join(" "), "log");
  };

  const rawErr = console.error;
  console.error = function(...args) {
    rawErr.apply(console, args);
    write(args.join(" "), "error");
  };

  const rawWarn = console.warn;
  console.warn = function(...args) {
    rawWarn.apply(console, args);
    write(args.join(" "), "warn");
  };
})();

if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "sw-log") {
      const logEvent = new CustomEvent("swLog", { detail: event.data.message });
      window.dispatchEvent(logEvent);
    }
  });
}
window.addEventListener("swlog", (e) => {
  const SWmsg = '[SW] ${e.detail}';
  console.log(SWmsg);
});
  
