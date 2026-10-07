# DEPLOYMENT CHECKLIST & RELEASE PROCEDURES (LỚP HỌC TƯƠNG TÁC)

## 1. PRE-DEPLOYMENT VERIFICATION
- [ ] Code base up to date: `git pull origin main`
- [ ] No secrets or service account keys in repository: verify `.env.production` contains no private keys.
- [ ] Run production build locally: `npm run build` (Must exit code 0).
- [ ] Run linter checks: `npm run lint` (0 critical errors).
- [ ] Security rules review: verify `firestore.rules` is in sync with schema.
- [ ] Environment variable verification: `VITE_APP_ENV=production`, `VITE_DATA_MODE=firebase`.

## 2. FIREBASE PROJECT ALIAS SELECTION
- [ ] Select development target: `firebase use dev`
- [ ] Select production target: `firebase use prod`

## 3. DEPLOYMENT EXECUTION
### Development Project Deployment:
```bash
npm run build
firebase use dev
firebase deploy --only hosting,firestore:rules
```

### Production Project Deployment:
```bash
npm run build
firebase use prod
firebase deploy --only hosting,firestore:rules
```

## 4. POST-DEPLOYMENT SMOKE TEST (PRODUCTION VERIFICATION)
1. Open production domain (`https://lophoctuongtac.web.app`).
2. Teacher Login flow check.
3. Class creation & QR Code generation check.
4. Open student tab on real device (or mobile browser) via QR URL.
5. Publish 1 live question & submit answer.
6. Verify live result chart & session summary.
7. Confirm PWA install prompt / app shell loaded cleanly.

## 5. ROLLBACK PROCEDURE (HOSTING & RULES)
If a critical production error is detected:
```bash
# Rollback Firebase Hosting release to previous deployment version
firebase hosting:clone lophoctuongtac-prod:PREVIOUS_RELEASE_ID lophoctuongtac-prod:live
```
*Note: Firestore schema is designed to be backward-compatible. Never attempt schema rollbacks by dropping live data.*
