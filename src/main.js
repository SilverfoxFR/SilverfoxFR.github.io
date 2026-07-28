const root = document.getElementById('root');
const HEADER_HTML = `
  <header class="row">
      <strong>Silver's Projects</strong>
  </header>
`;
const FOOTER_HTML = `
  <footer class="row">
      <span>A collection of my random projects, experiments and tools.</span>
  </footer>
`;
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
function findIcon(name) {
  return new Promise(resolve => {
    let i = 0;
    function tryNext() {
      if (i >= IMAGE_EXTS.length) { resolve(null); return; }
      const ext = IMAGE_EXTS[i++];
      const url = `./packs/${encodeURIComponent(name)}.${ext}`;
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = tryNext;
      img.src = url;
    }
    tryNext();
  });
}
async function tryFetchManifest() {
  try {
    const res = await fetch('./packs/manifest.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
async function tryDirectoryListing() {
  try {
    const res = await fetch('./packs/', { cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links = [...doc.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href'))
      .filter(href => href && href.toLowerCase().endsWith('.html'));
    if (!links.length) return null;
    return [...new Set(
      links.map(href => decodeURIComponent(href.replace(/^.*\//, '')).replace(/\.html$/i, ''))
    )];
  } catch {
    return null;
  }
}
function makeCell(name, iconUrl) {
  const a = document.createElement('a');
  a.className = 'pack-cell';
  a.href = `#/pack/${encodeURIComponent(name)}`;
  a.innerHTML = `
    <div class="pack-icon">${iconUrl ? `<img src="${iconUrl}" alt="">` : ''}</div>
    <div class="pack-label">${name}</div>
  `;
  return a;
}
function renderProjectsView() {
  root.innerHTML = `
    ${HEADER_HTML}
    <main id="appMain">
      <div class="card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
          <h3 style="margin:0;">Projects</h3>
        </div>
        <div id="projectsGrid" class="pack-grid"></div>
      </div>
    </main>
    ${FOOTER_HTML}
  `;
  loadPacks();
}
async function loadPacks() {
  const grid = document.getElementById('projectsGrid');
  let names = await tryFetchManifest();
  if (!names) names = await tryDirectoryListing();
  if (!names || !names.length) {
    grid.innerHTML = '<p style="opacity:.6">No packs found. Add a ./packs/manifest.json (e.g. ["demo","tool2"]) or enable directory listing on your server.</p>';
    return;
  }
  grid.innerHTML = '';
  names.sort((a, b) => a.localeCompare(b));
  for (const name of names) {
    const iconUrl = await findIcon(name);
    grid.appendChild(makeCell(name, iconUrl));
  }
}
function renderPackView(html) {
  root.innerHTML = `
    <div class="pack-toolbar">
      <button id="backBtn" class="back-btn">&larr; Back to Projects</button>
    </div>
    <div id="packContent" class="pack-content"></div>
  `;
  document.getElementById('backBtn').addEventListener('click', () => { location.hash = ''; });
  const container = document.getElementById('packContent');
  container.innerHTML = html;
  // innerHTML doesn't execute <script> tags — recreate them so pack JS actually runs
  container.querySelectorAll('script').forEach(oldScript => {
    const newScript = document.createElement('script');
    for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
    newScript.textContent = oldScript.textContent;
    oldScript.replaceWith(newScript);
  });
}
async function loadPack(name) {
  try {
    const res = await fetch(`./packs/${encodeURIComponent(name)}.html`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    renderPackView(html);
  } catch (err) {
    root.innerHTML = `
      <main id="appMain">
        <div class="card">
          <p style="color:#f66;">Could not load pack "${name}": ${err.message}</p>
          <button id="backBtn" class="back-btn">&larr; Back to Projects</button>
        </div>
      </main>
    `;
    document.getElementById('backBtn').addEventListener('click', () => { location.hash = ''; });
  }
}
function setPortfolioState(active) {
  window.__portfolioActive = active;
  window.dispatchEvent(new CustomEvent('pack-view-change', {
    detail: { portfolio: active }
  }));
}

function route() {
  const match = location.hash.match(/^#\/pack\/(.+)$/);
  if (match) {
    const name = decodeURIComponent(match[1]);
    setPortfolioState(name.toLowerCase() === 'cv');
    loadPack(name);
  } else {
    setPortfolioState(false);
    renderProjectsView();
  }
}
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);