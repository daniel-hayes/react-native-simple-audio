import { NativeModules } from 'react-native';
import Audio from './Audio';

const RCTAudioRecorder: NativeRecorder = NativeModules.AudioRecorder;

class AudioRecorder extends Audio {
  fileName: string;
  status: RecordingStatus;
  private timeCounter!: NodeJS.Timer;

  constructor(
    fileName: string,
    statusHandler: StatusHandler
  ) {
    super(statusHandler)

    this.timeCounter;

    this.fileName = fileName;

    this.status = {
      ready: false,
      recording: false,
      currentTime: this.formatTime(0)
    };
  }

  setStatus(changes: RecordingStatus) {
    this.status = {
      ...this.status,
      ...changes
    };

    this.statusHandler(this.status);
  }

  private startTimer() {
    // takes a second to fire so start with 1
    let time = 1;
    this.timeCounter = setInterval(() => {
      this.setStatus({
        currentTime: this.formatTime(time++)
      });
    }, 1000);
  }

  private clearTimer() {
    clearInterval(this.timeCounter);
    this.setStatus({
      currentTime: this.formatTime(0)
    });
  }

  prepare = async () => {
    try {
      const success = await RCTAudioRecorder.prepare(this.fileName);
      this.setStatus({ ready: success });
    } catch (e) {
      console.error(e);
      this.setStatus({ ready: false });
    }
  };

  toggleRecording = () => {
    if (!this.status.recording) {
      RCTAudioRecorder.start();
      // @TODO should these be promise based so timing is ok ^?
      this.setStatus({ recording: true });
      this.startTimer();
    } else {
      RCTAudioRecorder.stop();
      this.setStatus({ recording: false });
      this.clearTimer();
    }
  };
}

export default AudioRecorder;
