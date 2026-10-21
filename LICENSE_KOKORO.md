# Kokoro licensing and Android integration notes

This project includes the design and storage pattern for a Kokoro TTS integration, but does not bundle a pre-trained Kokoro model binary or a redistribution of the upstream Python package.

## Source repository
- Official repository: https://github.com/hexgrad/kokoro
- The integration is intended to follow the upstream project’s Android-compatible model usage pattern, while keeping the model local on the device and only downloading it once when missing.

## Model and package licensing
- The upstream Kokoro repository must be checked for the exact licenses of the model assets, voices, and package distributions used in the selected Android implementation.
- Licensing can vary by model checkpoint, voice pack, and any third-party package or ONNX conversion package used by an Android port.
- This app intentionally avoids assuming that all Kokoro models or voice packages share identical licenses.

## Current project behavior
- The app stores the model in the private app files directory under the `kokoro` folder and only downloads it if the local model is absent or corrupted.
- The app does not ship a model file in source control and does not hardcode model downloads into the APK.
- The configured model URL must be set in `local.properties` as `KOKORO_MODEL_URL` before runtime use.

## Important note
- You must verify the license terms of the actual model file, ONNX conversion, and any Android runtime dependency you choose before shipping to production or redistributing the model.
- This project keeps the model out of source control and validates local existence before using it to reduce unnecessary downloads and accidental redistribution.
