import { NativeModules } from 'react-native';

// @TODO type THIS
const RCTAudioRecorder = NativeModules.AudioRecorder;

class AudioRecorder {
  toggle = () => {
    RCTAudioRecorder.start();
  };
}

export default AudioRecorder;
