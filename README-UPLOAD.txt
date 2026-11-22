TAPP PWA MANIFEST + ICON FIX

Upload all files in this folder to the ROOT of the GitHub repository:
https://github.com/TNHSAPP/TNHS-App

The root should contain these paths beside index.html and firebase-config.js:
- manifest.webmanifest (replace the existing one)
- service-worker.js (replace the existing one if present)
- tapp-180.png
- tapp-192.png
- tapp-512.png
- tapp-512-maskable.png

Do NOT upload this ZIP itself. Do NOT replace firebase-config.js.
Do NOT place these files inside an extra folder.
Commit the files to the main branch. Cloudflare Pages should deploy automatically.

After deployment, verify these URLs load image files (not the TAPP homepage):
https://tnhs-app.pages.dev/tapp-192.png
https://tnhs-app.pages.dev/tapp-512.png
https://tnhs-app.pages.dev/tapp-512-maskable.png

The manifest should open as JSON:
https://tnhs-app.pages.dev/manifest.webmanifest
