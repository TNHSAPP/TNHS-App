TAPP PWA upload pack

Files to add to the repository root (same folder as index.html):
- manifest.webmanifest
- service-worker.js
- tapp-180.png
- tapp-192.png
- tapp-512.png
- tapp-512-maskable.png

Then edit index.html:
1. Add the lines in INDEX-HEAD-SNIPPET.txt inside <head>.
2. Add the code in INDEX-BEFORE-BODY-SNIPPET.txt before </body> only if no service worker registration is already present.

Commit all changes to main. Cloudflare Pages should deploy the commit.

Verify after deployment:
https://tnhs-app.pages.dev/manifest.webmanifest
https://tnhs-app.pages.dev/service-worker.js
https://tnhs-app.pages.dev/tapp-192.png

The service worker uses network-first behavior for same-origin files, so ordinary website changes pushed to GitHub should be loaded after the Cloudflare deployment. It does not cache Firebase data or make localStorage data synchronize between devices.
