import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');
const assetFiles = fs.readdirSync(assetsDir);

const cssFile = assetFiles.find((f) => f.endsWith('.css'));
const jsFile = assetFiles.find((f) => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  throw new Error('Could not find built CSS or JS files in dist/assets');
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
const jsContent = fs
  .readFileSync(path.join(assetsDir, jsFile), 'utf8')
  .replace(/<\/script>/gi, '<\\/script>');

// 1. Standalone Chrome Preview HTML (with interactive Site + Admin Switcher Bar)
const chromePreviewHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lil Debbie Birthday Website & Admin — Chrome Preview</title>
    <meta
      name="description"
      content="Standalone Google Chrome preview for the Lil Debbie Private Birthday Website and Owner Administration Dashboard."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Changa+One:ital@0;1&family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
${cssContent}

      /* Standalone Chrome Preview Bar Styles */
      #chrome-preview-bar {
        position: sticky;
        top: 0;
        z-index: 9999;
        background: #2B1E1A;
        color: #FFF3D1;
        border-bottom: 3px solid #FFC928;
        padding: 8px 14px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }
      #chrome-preview-bar .preview-nav-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      #chrome-preview-bar button.preview-pill {
        background: #FFF3D1;
        color: #2B1E1A;
        border: 2px solid #FFC928;
        border-radius: 9999px;
        padding: 4px 11px;
        font-weight: 700;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      #chrome-preview-bar button.preview-pill:hover {
        background: #FFC928;
        transform: translateY(-1px);
      }
      #chrome-preview-bar button.preview-pill.admin-pill {
        background: #F15B48;
        color: #FFFFFF;
        border-color: #FFF3D1;
      }
      #chrome-preview-bar button.preview-pill.admin-pill:hover {
        background: #FF8A32;
      }
      #chrome-preview-restore {
        position: fixed;
        bottom: 14px;
        left: 14px;
        z-index: 9999;
        background: #2B1E1A;
        color: #FFC928;
        border: 2px solid #FFC928;
        border-radius: 9999px;
        padding: 6px 12px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: none;
        box-shadow: 3px 3px 0px #F15B48;
      }
    </style>
  </head>
  <body class="bg-[#FFF3D1] text-[#2B1E1A] antialiased selection:bg-[#FFC928] selection:text-[#2B1E1A]">
    <!-- Interactive Chrome Preview Switcher Bar (Preview Both Visitor Site & Owner Admin Side) -->
    <div id="chrome-preview-bar">
      <div class="preview-nav-group">
        <span style="font-weight:800;color:#FFC928;margin-right:4px;">🎂 CHROME PREVIEW SWITCHER:</span>
        <button type="button" class="preview-pill" onclick="window.dispatchEvent(new CustomEvent('lil-debbie-preview-nav', { detail: { targetStage: 'gate' } }))">
          🔒 1. Password Gate
        </button>
        <button type="button" class="preview-pill" onclick="window.dispatchEvent(new CustomEvent('lil-debbie-preview-nav', { detail: { targetStage: 'home' } }))">
          🎈 2. Homepage
        </button>
        <button type="button" class="preview-pill" onclick="window.dispatchEvent(new CustomEvent('lil-debbie-preview-nav', { detail: { targetStage: 'bro' } }))">
          💛 3. Bro Section
        </button>
        <button type="button" class="preview-pill" onclick="window.dispatchEvent(new CustomEvent('lil-debbie-preview-nav', { detail: { targetStage: 'friend' } }))">
          😜 4. Friend Section
        </button>
        <button type="button" class="preview-pill" onclick="window.dispatchEvent(new CustomEvent('lil-debbie-preview-nav', { detail: { targetStage: 'surprise' } }))">
          💌 5. Final Surprise
        </button>
        <button type="button" class="preview-pill admin-pill" onclick="window.dispatchEvent(new CustomEvent('lil-debbie-preview-nav', { detail: { targetStage: 'admin' } }))">
          🛠️ 6. Owner Admin Side
        </button>
      </div>
      <div class="preview-nav-group">
        <span style="font-size:11px;background:#3E2C26;padding:3px 8px;border-radius:999px;border:1px solid #FFC928/40;">
          Visitor Passcode: <strong style="color:#FFC928;">062026</strong>
        </span>
        <span style="font-size:11px;background:#3E2C26;padding:3px 8px;border-radius:999px;border:1px solid #F15B48;">
          Admin: <strong style="color:#FFC928;">kayodeoluwabunmi2@gmail.com</strong> / <strong style="color:#FFC928;">252026</strong>
        </span>
        <button
          type="button"
          style="background:transparent;color:#FFF3D1;border:1px solid #FFF3D1;border-radius:999px;padding:3px 8px;font-size:10px;cursor:pointer;"
          onclick="document.getElementById('chrome-preview-bar').style.display='none';document.getElementById('chrome-preview-restore').style.display='block';"
        >
          Hide Bar ✕
        </button>
      </div>
    </div>
    <button
      id="chrome-preview-restore"
      type="button"
      onclick="document.getElementById('chrome-preview-bar').style.display='flex';this.style.display='none';"
    >
      🎂 Show Preview Switcher
    </button>

    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.resolve('lil-debbie-preview.html'), chromePreviewHtml, 'utf8');
fs.writeFileSync(path.join(distDir, 'lil-debbie-preview.html'), chromePreviewHtml, 'utf8');

console.log('Generated standalone Chrome preview file: lil-debbie-preview.html');
