## Lessons Learned

### Web preview needs the exact installed React version (2026-07-28)
- **Symptom**: Expo web opened a blank page with a React/ReactDOM version mismatch.
- **Cause**: The project is Android-first and does not pin web packages; a temporary `react-dom` version differed from the React version resolved in `node_modules`.
- **Fix**: Restore dependencies with `npm ci` and validate this project with `npm run verify` plus `expo export --platform android`.
- **Lesson**: Before enabling a temporary web preview, compare the installed React version and avoid changing the project dependency tree only for visual QA.

### Expo audio metering is not pitch or speech recognition (2026-07-28)
- **Symptom**: Loudness-derived values were presented as low/high frequency, and an empty recording could still receive a confident pet “translation.”
- **Cause**: `expo-audio` metering provides a decibel envelope only. It does not expose PCM samples, pitch, spectrum, timbre, or semantic meaning. The first sample also mixed `Date.now()` with relative `durationMillis`.
- **Fix**: Use one relative millisecond timeline, derive only envelope features (volume, pauses, bursts, rhythm), reject low-quality/silent recordings, and describe the result as a playful guess.
- **Lesson**: Never infer pitch or literal meaning from metering. A real sound classifier requires decoded PCM/spectral features and a separately validated model.

### Pet-sound recognition must be a hard gate, not decoration (2026-07-28)
- **Symptom**: A loudness-only flow could produce a pet “translation” for silence, speech, music, or the wrong animal, while a quiet continuous purr could fail a burst detector.
- **Cause**: Loudness-envelope heuristics and semantic sound classification answer different questions. YAMNet scores are class scores, not calibrated probabilities, and quiet continuous sounds do not necessarily create distinct envelope bursts.
- **Fix**: Capture mono float PCM with `useAudioStream`, classify 0.975-second windows locally with the bundled YAMNet TFLite model, and only continue when the expected species has a recognized sound class. Keep “recognized sound” separate from the playful state guess, and do not apply the old burst-quality gate after a positive model result.
- **Lesson**: Gate the sound flow on an explicit classifier status (`recognized`, `low_confidence`, `no_pet_sound`, or `wrong_species`), never invent a fallback result, and calibrate thresholds on labeled recordings from real target devices before claiming production accuracy.
