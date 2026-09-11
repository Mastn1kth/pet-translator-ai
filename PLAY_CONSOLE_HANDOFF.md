# Google Play handoff

## Release artifact

- Signed Android App Bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- Local install APK: `android/app/build/outputs/apk/release/app-release.apk`
- Universal install APK helper output: `PetTranslatorAI-release.apk` after running `BUILD_APK.bat`
- Package: `com.pettranslator.ai`
- Version: `1.0.2`
- Version code: `3`
- Android target SDK in merged release manifest: `36`
- Upload keystore: `C:/Users/user/.android/pet-translator-ai-upload.jks`
- Local signing config: `android/keystore.properties` (ignored by git)

Back up the upload keystore and `android/keystore.properties`. If this upload key is lost after the first Play upload, future updates become harder and may require a Play key reset flow.

## Permissions to declare

Release manifest contains:

- `CAMERA`: capturing pet photos/videos through the image picker camera flow.
- `RECORD_AUDIO`: recording real-time PCM pet sounds for local on-device sound classification.
- `MODIFY_AUDIO_SETTINGS`: required by `expo-audio` for audio recording/session handling.
- `READ_EXTERNAL_STORAGE` with `maxSdkVersion=32`: legacy Android media access for selecting photos/videos on older devices.
- `WRITE_EXTERNAL_STORAGE` with `maxSdkVersion=32`: legacy file/media compatibility from media picker/share dependencies on older devices.
- `INTERNET` and `ACCESS_NETWORK_STATE`: opening external share/deep links and normal Expo/React Native networking capability.
- `VIBRATE`: haptic feedback.
- `WAKE_LOCK`: dependency/runtime support.

Not used in this build:

- Real payments / Google Billing.
- Real ads / AdMob / AppLovin.
- Phone state permission `READ_PHONE_STATE` is explicitly removed.
- Overlay permission `SYSTEM_ALERT_WINDOW` is explicitly removed.

## Data Safety draft

Current build has no backend account system and no audio upload pipeline. Microphone PCM is classified locally with the bundled YAMNet TFLite model and is not stored as an audio file. Pet profiles, translations, and app state are stored locally through AsyncStorage. User-selected media stays local to the device unless the user explicitly shares content through the system share flow.

This build does include Yandex AppMetrica analytics and crash reporting through `@appmetrica/react-native-analytics`. AppMetrica is activated from the API key in `app.json -> expo.extra.appMetricaApiKey` and reports app events plus native/JS crashes.

Suggested Data Safety answers for this build:

- Data collected: Yes, because AppMetrica analytics/crash reporting is active. Declare the applicable analytics, diagnostics, crash logs, device/app info, and identifiers according to the AppMetrica SDK behavior and your Yandex AppMetrica settings.
- Data shared: Yes for data sent to AppMetrica/Yandex for analytics and diagnostics. User-selected media is shared only through explicit user-initiated share actions.
- Data encrypted in transit: Yes for AppMetrica network transport if the SDK uses HTTPS. Verify this against the current AppMetrica SDK documentation before final submission.
- Data deletion: Local data can be cleared by app reinstall/app storage clearing. Add an in-app delete/reset option later if you want a stronger answer.

If real ads, billing, backend AI, additional analytics, or remote logging are added later, this section must be rewritten before Play submission.

## Privacy Policy checklist

Policy should state:

- App is entertainment, not a literal animal-language translator or veterinary diagnostic tool.
- Microphone is used for local pet-sound classification; recognized sound classes inform a separate playful mood guess.
- Photo/video picker is used when the user chooses media for entertainment analysis.
- Data is stored locally unless the user shares it.
- AppMetrica is used for analytics and crash reporting.
- No real payments or third-party ads are active in this build.
- Contact email for privacy requests.
- How users can delete local app data.

## Manual Play Console tasks

- Create app, choose app/game category, default language, free/paid.
- Upload `app-release.aab` to internal testing first.
- Complete App content:
  - Privacy Policy URL.
  - Data Safety.
  - Ads: No ads in this build.
  - App access: no login required.
  - Content rating questionnaire.
  - Target audience.
  - News apps / government / financial features: no, unless Play asks based on text.
- Store listing:
  - App name, short description, full description.
  - Screenshots for phone.
  - App icon/feature graphic.
  - Entertainment disclaimer in description.
- Test on a real Android device from internal testing before production.
