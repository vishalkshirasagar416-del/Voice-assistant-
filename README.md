# Priya

Priya is an Android Kotlin voice assistant built with Jetpack Compose, Hilt,
Gemini/OpenRouter provider fallback, local voice features, and an optional
offline VRM avatar.

## Project Structure

- `app/src/main/java/com/priya/app/domain`: provider contracts and domain models
- `app/src/main/java/com/priya/app/data`: providers, repositories, storage, and services
- `app/src/main/java/com/priya/app/presentation`: Compose screens, navigation, and ViewModels
- `app/src/main/java/com/priya/app/avatar`: reusable Android WebView avatar host
- `app/src/main/assets/avatar`: offline Three.js/VRM renderer
- `app/src/main/assets/models/priya.vrm`: bundled VRM model

## AI Configuration

On first launch, Priya opens the AI provider setup screen. Gemini, OpenRouter,
and optional ElevenLabs keys are encrypted with Android Keystore-backed AES-GCM
storage. The app module does not inject these keys through `BuildConfig`, source
files, resources, or the manifest.

Keys can be updated or removed from `Settings -> AI provider`. The selected
provider is tried first and the other configured provider remains the fallback.

`local.properties` is reserved for non-secret build configuration such as the
local Kokoro model URL and is ignored by Git.

## Offline Avatar

The VRM renderer is fully bundled under `app/src/main/assets/avatar`. It does
not use CDN URLs or network requests to load the model. `PriyaAvatarView` exposes
the Kotlin bridge for expressions, speaking state, mouth openness, emotion,
reset, pause, resume, and disposal.

## Verification

```powershell
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :app:lintDebug
```

Before release, test first-launch setup, single-provider operation, fallback,
key removal, app restart, and VRM rendering on a physical or emulator device.
