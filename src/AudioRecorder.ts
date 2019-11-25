import { NativeModules } from 'react-native';

// @TODO type THIS
const RCTAudioRecorder = NativeModules.AudioRecorder;

class AudioRecorder {
  status = 'not'

  toggleRecording = () => {
    console.log(this.status);

    if (this.status == 'not') {
      this.status = 'recording';
      RCTAudioRecorder.start();
    } else {
      this.status = 'not';
      RCTAudioRecorder.stop();
    }
  };
}

export default AudioRecorder;
