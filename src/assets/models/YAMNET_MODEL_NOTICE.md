# YAMNet audio classifier

- Model file: `yamnet_pet_sound_classifier.tflite`
- Upstream model: official TensorFlow Lite Task Library YAMNet mobile classifier
- Source: https://storage.googleapis.com/download.tensorflow.org/models/tflite/task_library/audio_classification/android/lite-model_yamnet_classification_tflite_1.tflite
- Architecture and label map: https://github.com/tensorflow/models/tree/master/research/audioset/yamnet
- Input: 15,600 mono `float32` samples at 16 kHz
- Output: 521 AudioSet class scores
- SHA-256: `10C95EA3EB9A7BB4CB8BDDF6FEB023250381008177AC162CE169694D05C317DE`
- Upstream repository license: Apache License 2.0

The scores are independent model scores and are not calibrated probabilities. The application uses only the pet-related AudioSet classes and describes the later mood interpretation as a playful guess.
