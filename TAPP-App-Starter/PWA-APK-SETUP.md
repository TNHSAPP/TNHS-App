# TAPP: PWA + Android APK setup

This starter is based on the supplied TAPP project files. It adds installable-PWA metadata, icons, and an app-shell service worker without changing the existing TAPP interface or Firebase project configuration.

## Important project notes

- Firebase project in `firebase-config.js`: `tapp-ec8ca`.
- The web app currently uses Firebase Authentication through the Firebase Web SDK.
- Reports, announcements, contacts, and forum content are still stored in browser `localStorage`; this PWA starter does not migrate them to Firestore.
- The service worker caches only the app shell and same-origin static assets. It does not cache Google/Firebase requests and does not make sign-in or cloud data available offline.

## Part A — Publish the PWA

1. Make a backup of the current GitHub repository.
2. Copy these updated files/folders into the repository root, preserving the existing file names:
   - `index.html`
   - `firebase-config.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `icons/`
3. Commit and push the changes to the branch used by the website deployment.
4. Wait for the existing GitHub Pages or Cloudflare Pages deployment to finish.
5. Open the HTTPS website on an Android phone using Chrome.
6. Open Chrome's menu and choose **Install app** or **Add to Home screen**. The exact wording depends on Chrome version and device.
7. Launch TAPP from the home screen and test the existing sign-in flow while online.

The site must be served over HTTPS (localhost is allowed for development). The manifest includes the required app name, 192px and 512px icons, `start_url`, and standalone display mode.

## Part B — Prepare to build an Android APK with Capacitor

Do this after the PWA is published and tested. Keep a clean backup of the website repository.

### Install the tools

1. Install Node.js 22 or later.
2. Install Android Studio and its Android SDK.
3. Open Android Studio once and complete its first-run SDK setup.

### Add Capacitor

From the TAPP repository folder, open Terminal / PowerShell and run:

```bash
npm init -y
npm install @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli
npx cap init TAPP ph.tnhs.tapp --web-dir=www
```

Use `ph.tnhs.tapp` as the package ID only if you are happy to keep it permanently. Android package IDs should be chosen carefully before you register the Android app in Firebase.

### Create the local web bundle folder

Capacitor expects a web asset folder such as `www` with `index.html` at its root. Create `www`, then copy the TAPP web files into it:

```text
www/
  index.html
  firebase-config.js
  manifest.webmanifest
  service-worker.js
  icons/
```

Then run:

```bash
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio, choose a connected Android device or emulator and run the app to test its layout.

### Important: Google Sign-In must be adapted for the native APK

Do not distribute the first wrapper build to students yet. The current TAPP login code calls Firebase Web Auth popup/redirect methods. A Capacitor Android app needs a native Google sign-in flow, with the native credential passed into the Firebase JavaScript Auth session. The Capawesome `@capacitor-firebase/authentication` plugin documents this approach.

Before using Google sign-in in the APK:

1. Add an Android app to Firebase project `tapp-ec8ca` using the exact package ID from `capacitor.config.*`.
2. Download the Android `google-services.json` file and place it where the Capacitor Firebase setup instructions require.
3. Configure Google Sign-In for Android and add the Android signing certificate SHA-1 fingerprint(s) to the Firebase Android app settings.
4. Install and configure `@capacitor-firebase/authentication` (plugin 8.x for Capacitor 8), then update the TAPP sign-in handler to use native Google credentials and `signInWithCredential` for the web Firebase Auth session.
5. Test sign-in, sign-out, app restart, and account switching on a physical Android phone before sharing the APK.

Native Google sign-in setup guide: https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/setup-google.md
Firebase JS SDK bridge guide: https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/firebase-js-sdk.md

## Update workflow

When web files change, copy the latest `index.html`, `firebase-config.js`, manifest, service worker, and icons into `www`, then run `npx cap sync android` again before rebuilding the APK.
